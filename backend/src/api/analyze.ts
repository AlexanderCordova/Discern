import { Router, Request, Response } from 'express';
import claudeService from '../services/claude';
import pdfService from '../services/pdf';
import contentExtractor from '../services/contentExtractor';
import database from '../services/database';
import logger from '../utils/logger';
import { validateAnalysisRequest } from '@discern/shared/utils';
import { AnalysisRequest } from '@discern/shared/types';

const router = Router();

/**
 * POST /api/analyze
 * Main endpoint for content analysis
 */
router.post('/', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const request: AnalysisRequest = req.body;

    // Validate request
    const validation = validateAnalysisRequest(request);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const { type, content, demoMode, explainabilityMode, analysisMode } = request;

    // Check for admin API key (bypasses authentication and rate limiting)
    const apiKey = req.get('x-api-key');
    const isAdmin = apiKey && apiKey === process.env.ADMIN_API_KEY;

    // Extract user ID from request header (required for authentication unless admin)
    const userId = req.get('x-user-id');

    // Require authentication (unless admin key provided)
    if (!isAdmin && !userId) {
      logger.warn('Analysis request without authentication');
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in to analyze content.',
      });
    }

    logger.info('Analysis request received', {
      type,
      demoMode,
      explainabilityMode,
      analysisMode,
      contentLength: content.length,
      userId: userId || 'admin',
      isAdmin,
    });

    // Rate limit check (3 analyses per day per user, skip for admin)
    if (!isAdmin && userId) {
      const dailyLimit = 3;
      const analysisCount = await database.getUserAnalysisCountByUserId(userId);

      if (analysisCount >= dailyLimit) {
        logger.warn('Rate limit exceeded', { userId, count: analysisCount });
        return res.status(429).json({
          success: false,
          error: `Daily limit reached. You can analyze up to ${dailyLimit} articles per day. Try again tomorrow.`,
        });
      }
    } else if (isAdmin) {
      logger.info('Admin API key - skipping rate limit');
    }

    // Check cache first (if not in demo or explainability mode)
    if (!demoMode && !explainabilityMode) {
      try {
        const cached = await database.getCachedAnalysis(content);
        if (cached) {
          logger.info('Cache hit - saving to current user history');

          // Save cached result to current user's history
          const saveUserId = userId || (isAdmin ? 'admin' : undefined);
          logger.info('Cache hit - attempting to save to user history', {
            saveUserId,
            hasUserId: !!userId,
            isAdmin
          });
          if (saveUserId) {
            try {
              await database.saveAnalysis(type, content, cached, {
                demoMode: false,
                explainability: false,
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                domain: undefined, // Domain not extracted for cached results
                processingTime: 0,
                userId: saveUserId,
              });
              logger.info('Cached analysis saved to user history', { userId: saveUserId });
            } catch (saveError: any) {
              logger.error('Failed to save cached analysis', {
                error: saveError.message,
                code: saveError.code,
                userId: saveUserId
              });
            }
          }

          return res.json({
            success: true,
            data: cached,
            cached: true,
          });
        }
      } catch (error) {
        logger.warn('Cache check failed, continuing without cache');
      }
    }

    // Handle demo mode
    if (demoMode) {
      try {
        const demoContent = await database.getDemoContent();
        const demo = demoContent.find((d) => d.url === content || d.id === content);

        if (demo) {
          logger.info('Returning demo result', { demoId: demo.id });
          return res.json({
            success: true,
            data: demo.cachedResult,
            demo: true,
          });
        }
      } catch (error) {
        logger.warn('Demo content fetch failed, continuing with live analysis');
      }
    }

    let contentToAnalyze = content;
    let domain: string | undefined;

    // Process based on content type
    if (type === 'url') {
      const extracted = await contentExtractor.extractFromUrl(content);
      contentToAnalyze = `Title: ${extracted.title}\n\nDomain: ${extracted.domain}\n\n${extracted.content}`;
      domain = extracted.domain;
    } else if (type === 'pdf') {
      const buffer = pdfService.parseBase64(content);
      contentToAnalyze = await pdfService.extractText(buffer);
    }
    // 'text' type uses content as-is

    // Perform AI analysis
    const result = await claudeService.analyzeContent(
      contentToAnalyze,
      type,
      explainabilityMode || false,
      analysisMode || 'brief'
    );

    const processingTime = Date.now() - startTime;

    // Save to database (optional, continue if fails)
    // Use userId if present, otherwise 'admin' for admin key users
    const saveUserId = userId || (isAdmin ? 'admin' : undefined);

    logger.info('Attempting to save analysis', {
      saveUserId,
      hasUserId: !!userId,
      isAdmin
    });

    try {
      const analysisId = await database.saveAnalysis(type, content, result, {
        demoMode,
        explainability: explainabilityMode,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        domain,
        processingTime,
        userId: saveUserId,
      });
      result.id = analysisId;
      logger.info('Analysis saved successfully', { analysisId, userId: saveUserId });
    } catch (error: any) {
      logger.error('Failed to save to database', {
        error: error.message,
        code: error.code,
        userId: saveUserId
      });
      result.id = 'temp-' + Date.now();
    }

    logger.info('Analysis complete', {
      id: result.id,
      score: result.score,
      processingTime,
    });

    res.json({
      success: true,
      data: result,
      processingTime,
    });
  } catch (error: any) {
    logger.error('Analysis failed', {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed. Please try again.',
    });
  }
});

/**
 * GET /api/analyze/demo
 * Get available demo content
 */
router.get('/demo', async (req: Request, res: Response) => {
  try {
    const demoContent = await database.getDemoContent();

    res.json({
      success: true,
      data: demoContent.map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        category: item.category,
        expectedScore: item.expectedScore,
      })),
    });
  } catch (error: any) {
    logger.error('Failed to get demo content', { error });

    res.status(500).json({
      success: false,
      error: 'Failed to load demo content',
    });
  }
});

export default router;
