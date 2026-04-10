import { Router, Request, Response } from 'express';
import database from '../services/database';
import logger from '../utils/logger';

const router = Router();

/**
 * Simple user authentication middleware
 * Extracts user ID from Bearer token
 */
function userAuth(req: Request, res: Response, next: Function) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Extract user ID from Bearer token
    const userId = authHeader.replace('Bearer ', '');

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }

    // Attach user ID to request
    (req as any).userId = userId;
    next();
  } catch (error) {
    logger.error('User auth middleware error', { error });
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

/**
 * GET /api/user/analytics
 * Get user-specific analytics
 */
router.get('/analytics', userAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const days = parseInt(req.query.days as string) || 30;

    logger.info('User analytics requested', { userId, days });

    const analytics = await database.getUserAnalytics(userId, days);
    const stats = await database.getUserStats(userId);
    const advancedStats = await database.getUserAdvancedStats(userId, days);

    res.json({
      success: true,
      analytics,
      stats,
      advancedStats,
    });
  } catch (error: any) {
    logger.error('Failed to get user analytics', { error });

    res.status(500).json({
      success: false,
      error: 'Failed to load analytics',
    });
  }
});

/**
 * GET /api/user/history
 * Get user's analysis history
 */
router.get('/history', userAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    logger.info('User history requested', { userId, limit, offset });

    const history = await database.getUserHistory(userId, limit, offset);

    res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    logger.error('Failed to get user history', { error });

    res.status(500).json({
      success: false,
      error: 'Failed to load history',
    });
  }
});

/**
 * GET /api/user/debug
 * Debug endpoint to check user data
 */
router.get('/debug', userAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    logger.info('Debug request', { userId });

    // Get all analyses for this user
    const allAnalyses = await database.getUserHistory(userId, 1000, 0);

    // Get recent analyses with any userId
    const recentAll = await database.getAllAnalyses(7);

    res.json({
      success: true,
      data: {
        yourUserId: userId,
        yourAnalysesCount: allAnalyses.length,
        yourRecentAnalyses: allAnalyses.slice(0, 5).map((a: any) => ({
          id: a.id,
          score: a.score,
          userId: a.userId,
          createdAt: a.createdAt,
          domain: a.domain,
        })),
        allRecentAnalyses: recentAll.slice(0, 10).map((a: any) => ({
          id: a.id,
          score: a.score,
          userId: a.userId,
          createdAt: a.createdAt,
          domain: a.domain,
        })),
      },
    });
  } catch (error: any) {
    logger.error('Debug failed', { error });

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/user/export
 * Export user's data as CSV
 */
router.get('/export', userAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const days = parseInt(req.query.days as string) || 30;

    logger.info('User export requested', { userId, days });

    const analytics = await database.getUserAnalytics(userId, days);
    const advancedStats = await database.getUserAdvancedStats(userId, days);
    const allAnalyses = await database.getUserHistory(userId, 1000, 0);

    // Generate CSV
    let csv = '# DISCERN Personal Analytics Export\n';
    csv += `# Generated: ${new Date().toISOString()}\n`;
    csv += `# Time Range: Last ${days} days\n\n`;

    // Summary Stats
    csv += '=== SUMMARY STATISTICS ===\n';
    csv += 'Metric,Value\n';
    csv += `Total Analyses,${analytics.totalAnalyses}\n`;
    csv += `Average Credibility Score,${analytics.averageScore.toFixed(2)}\n`;
    csv += `Low Credibility Count,${analytics.lowCredibilityCount}\n\n`;

    // Score Distribution
    csv += '=== SCORE DISTRIBUTION ===\n';
    csv += 'Category,Count\n';
    csv += `Low (0-49),${analytics.scoreDistribution.low}\n`;
    csv += `Medium (50-79),${analytics.scoreDistribution.medium}\n`;
    csv += `High (80-100),${analytics.scoreDistribution.high}\n\n`;

    // Content Type Breakdown
    csv += '=== CONTENT TYPE BREAKDOWN ===\n';
    csv += 'Type,Count\n';
    csv += `URL,${analytics.contentTypeBreakdown.url}\n`;
    csv += `Text,${analytics.contentTypeBreakdown.text}\n`;
    csv += `PDF,${analytics.contentTypeBreakdown.pdf}\n\n`;

    // Top Domains
    csv += '=== TOP ANALYZED DOMAINS ===\n';
    csv += 'Domain,Count,Average Score\n';
    analytics.topDomains.forEach((domain: any) => {
      csv += `${domain.domain},${domain.count},${domain.averageScore.toFixed(1)}\n`;
    });
    csv += '\n';

    // Detailed Analyses
    csv += '=== DETAILED ANALYSIS RECORDS ===\n';
    csv += 'Date,Type,Score,Confidence,Neutrality,Source,Evidence,Logic,Domain,Summary\n';
    allAnalyses.forEach((analysis: any) => {
      const date = new Date(analysis.createdAt).toISOString();
      const summary = (analysis.summary || '').replace(/,/g, ';').replace(/\n/g, ' ').substring(0, 200);
      csv += `${date},${analysis.contentType},${analysis.score},${analysis.confidence},${analysis.factors?.bias || 0},${analysis.factors?.source_reputation || 0},${analysis.factors?.evidence || 0},${analysis.factors?.logic || 0},${analysis.domain || 'N/A'},"${summary}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=discern-my-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error: any) {
    logger.error('Failed to export user data', { error });

    res.status(500).json({
      success: false,
      error: 'Failed to export data',
    });
  }
});

export default router;
