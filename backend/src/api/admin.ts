import { Router, Request, Response } from 'express';
import database from '../services/database';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/admin/analytics
 * Get analytics dashboard data
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    logger.info('Admin analytics requested', { days });

    const analytics = await database.getAnalytics(days);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    logger.error('Failed to get analytics', { error });

    res.status(500).json({
      success: false,
      error: 'Failed to load analytics',
    });
  }
});

/**
 * GET /api/admin/stats
 * Get quick stats for dashboard
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const analytics = await database.getAnalytics(7); // Last 7 days

    const stats = {
      totalScans: analytics.totalAnalyses,
      averageScore: analytics.averageScore,
      lowCredibilityPercentage: analytics.totalAnalyses > 0
        ? Math.round((analytics.lowCredibilityCount / analytics.totalAnalyses) * 100)
        : 0,
      topFlaggedSource: analytics.topDomains[0]?.domain || 'N/A',
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Failed to get stats', { error });

    res.status(500).json({
      success: false,
      error: 'Failed to load stats',
    });
  }
});

/**
 * GET /api/admin/advanced-stats
 * Get advanced statistical analysis
 */
router.get('/advanced-stats', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;

    logger.info('Advanced stats requested', { days });

    const advancedStats = await database.getAdvancedStats(days);

    res.json({
      success: true,
      data: advancedStats,
    });
  } catch (error: any) {
    logger.error('Failed to get advanced stats', { error });

    res.status(500).json({
      success: false,
      error: 'Failed to load advanced statistics',
    });
  }
});

export default router;
