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

    logger.info('Analysis request received', {
      type,
      demoMode,
      explainabilityMode,
      analysisMode,
      contentLength: content.length,
    });

    // Rate limit check for non-admin users (10 analyses per day)
    // Skip rate limiting for admin users
    const isAdmin = req.headers.authorization === process.env.ADMIN_PASSWORD ||
                    req.headers.authorization === 'admin-authenticated';

    if (!isAdmin) {
      const userIp = req.ip || 'unknown';
      const dailyLimit = parseInt(process.env.DAILY_ANALYSIS_LIMIT || '10');
      const analysisCount = await database.getUserAnalysisCount(userIp);

      if (analysisCount >= dailyLimit) {
        logger.warn('Rate limit exceeded', { ip: userIp, count: analysisCount });
        return res.status(429).json({
          success: false,
          error: `Daily limit reached. You can analyze up to ${dailyLimit} articles per day. Try again tomorrow or contact admin for increased access.`,
        });
      }
    } else {
      logger.info('Admin user - skipping rate limit');
    }

    // Check cache first (if not in demo or explainability mode)
    if (!demoMode && !explainabilityMode) {
      try {
        const cached = await database.getCachedAnalysis(content);
        if (cached) {
          logger.info('Returning cached result');
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

    // Extract user ID from request header (if user is logged in)
    const userId = req.get('x-user-id') || undefined;

    // Save to database (optional, continue if fails)
    try {
      const analysisId = await database.saveAnalysis(type, content, result, {
        demoMode,
        explainability: explainabilityMode,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        domain,
        processingTime,
        userId,
      });
      result.id = analysisId;
    } catch (error) {
      logger.warn('Failed to save to database, continuing without saving');
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
