import { Router, Request, Response } from 'express';
import database from '../services/database';
import logger from '../utils/logger';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

/**
 * GET /api/admin/analytics
 * Get analytics dashboard data
 * Requires admin authentication
 */
router.get('/analytics', adminAuth, async (req: Request, res: Response) => {
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
 * Requires admin authentication header
 */
router.get('/stats', adminAuth, async (req: Request, res: Response) => {
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
 * Requires admin authentication
 */
router.get('/advanced-stats', adminAuth, async (req: Request, res: Response) => {
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

/**
 * GET /api/admin/export
 * Export analytics data as CSV
 * Accepts token via URL parameter for browser downloads
 */
router.get('/export', async (req: Request, res: Response) => {
  try {
    // Check token from query parameter (for browser downloads)
    const token = req.query.token as string;

    if (!token || (token !== 'admin-authenticated' && token !== process.env.ADMIN_PASSWORD)) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const days = parseInt(req.query.days as string) || 30;

    const analytics = await database.getAnalytics(days);
    const advancedStats = await database.getAdvancedStats(days);
    const allAnalyses = await database.getAllAnalyses(days);

    // Generate comprehensive CSV
    let csv = '# DISCERN Analytics Export\n';
    csv += `# Generated: ${new Date().toISOString()}\n`;
    csv += `# Time Range: Last ${days} days\n\n`;

    // Summary Stats
    csv += '=== SUMMARY STATISTICS ===\n';
    csv += 'Metric,Value\n';
    csv += `Total Analyses,${analytics.totalAnalyses}\n`;
    csv += `Average Credibility Score,${analytics.averageScore.toFixed(2)}\n`;
    csv += `Low Credibility Count,${analytics.lowCredibilityCount}\n`;
    csv += `Low Credibility Percentage,${analytics.totalAnalyses > 0 ? ((analytics.lowCredibilityCount / analytics.totalAnalyses) * 100).toFixed(1) : 0}%\n\n`;

    // Score Distribution
    csv += '=== SCORE DISTRIBUTION ===\n';
    csv += 'Category,Count,Percentage\n';
    csv += `Low (0-49),${analytics.scoreDistribution.low},${analytics.totalAnalyses > 0 ? ((analytics.scoreDistribution.low / analytics.totalAnalyses) * 100).toFixed(1) : 0}%\n`;
    csv += `Medium (50-79),${analytics.scoreDistribution.medium},${analytics.totalAnalyses > 0 ? ((analytics.scoreDistribution.medium / analytics.totalAnalyses) * 100).toFixed(1) : 0}%\n`;
    csv += `High (80-100),${analytics.scoreDistribution.high},${analytics.totalAnalyses > 0 ? ((analytics.scoreDistribution.high / analytics.totalAnalyses) * 100).toFixed(1) : 0}%\n\n`;

    // Content Type Breakdown
    csv += '=== CONTENT TYPE BREAKDOWN ===\n';
    csv += 'Type,Count,Percentage\n';
    csv += `URL,${analytics.contentTypeBreakdown.url},${analytics.totalAnalyses > 0 ? ((analytics.contentTypeBreakdown.url / analytics.totalAnalyses) * 100).toFixed(1) : 0}%\n`;
    csv += `Text,${analytics.contentTypeBreakdown.text},${analytics.totalAnalyses > 0 ? ((analytics.contentTypeBreakdown.text / analytics.totalAnalyses) * 100).toFixed(1) : 0}%\n`;
    csv += `PDF,${analytics.contentTypeBreakdown.pdf},${analytics.totalAnalyses > 0 ? ((analytics.contentTypeBreakdown.pdf / analytics.totalAnalyses) * 100).toFixed(1) : 0}%\n\n`;

    // Daily Analyses Trend
    csv += '=== DAILY ANALYSES TREND ===\n';
    csv += 'Date,Count\n';
    analytics.dailyAnalyses.forEach((item) => {
      csv += `${item.date},${item.count}\n`;
    });
    csv += '\n';

    // Top Domains
    csv += '=== TOP ANALYZED DOMAINS ===\n';
    csv += 'Domain,Count,Average Score\n';
    analytics.topDomains.forEach((domain) => {
      csv += `${domain.domain},${domain.count},${domain.averageScore.toFixed(1)}\n`;
    });
    csv += '\n';

    // Advanced Stats
    if (advancedStats) {
      csv += '=== FACTOR ANALYSIS ===\n';
      csv += 'Factor,Average Score,Standard Deviation\n';
      csv += `Neutrality,${advancedStats.factorAverages?.neutrality?.toFixed(2) || 'N/A'},${advancedStats.factorStdDev?.neutrality?.toFixed(2) || 'N/A'}\n`;
      csv += `Source Reputation,${advancedStats.factorAverages?.sourceReputation?.toFixed(2) || 'N/A'},${advancedStats.factorStdDev?.sourceReputation?.toFixed(2) || 'N/A'}\n`;
      csv += `Evidence Quality,${advancedStats.factorAverages?.evidence?.toFixed(2) || 'N/A'},${advancedStats.factorStdDev?.evidence?.toFixed(2) || 'N/A'}\n`;
      csv += `Logic,${advancedStats.factorAverages?.logic?.toFixed(2) || 'N/A'},${advancedStats.factorStdDev?.logic?.toFixed(2) || 'N/A'}\n\n`;
    }

    // Individual Analyses (detailed)
    csv += '=== DETAILED ANALYSIS RECORDS ===\n';
    csv += 'ID,Date,Type,Score,Confidence,Neutrality,Source Rep,Evidence,Logic,Domain,Has Warnings,Citation Count,Summary\n';
    allAnalyses.forEach((analysis: any) => {
      const date = new Date(analysis.createdAt).toISOString();
      const summary = (analysis.summary || '').replace(/,/g, ';').replace(/\n/g, ' ').substring(0, 200);
      csv += `${analysis.id},${date},${analysis.contentType},${analysis.score},${analysis.confidence},${analysis.factors?.bias || 0},${analysis.factors?.source_reputation || 0},${analysis.factors?.evidence || 0},${analysis.factors?.logic || 0},${analysis.domain || 'N/A'},${analysis.warnings?.length > 0 ? 'Yes' : 'No'},${analysis.citations?.length || 0},"${summary}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=discern-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error: any) {
    logger.error('Failed to export data', { error });

    res.status(500).json({
      success: false,
      error: 'Failed to export data',
    });
  }
});

/**
 * POST /api/admin/login
 * Admin login (simple password-based for demo)
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (password === process.env.ADMIN_PASSWORD) {
      // In production, use JWT tokens
      res.json({
        success: true,
        data: {
          token: 'admin-authenticated', // Simplified for demo
          message: 'Admin access granted',
        },
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }
  } catch (error: any) {
    logger.error('Admin login failed', { error });

    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

export default router;
