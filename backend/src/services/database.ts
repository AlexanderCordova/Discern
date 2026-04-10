import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import {
  Analysis,
  AnalysisResult,
  ContentType,
  AnalyticsMetrics,
} from '@discern/shared/types';
import { generateContentHash } from '@discern/shared/utils';

const prisma = new PrismaClient();

/**
 * Database Service for DISCERN
 * Handles all database operations
 */
export class DatabaseService {
  /**
   * Save analysis result to database
   * Stores complete analysis with metadata
   */
  async saveAnalysis(
    contentType: ContentType,
    originalContent: string,
    result: AnalysisResult,
    metadata: {
      demoMode?: boolean;
      explainability?: boolean;
      ipAddress?: string;
      userAgent?: string;
      domain?: string;
      processingTime?: number;
      userId?: string;
    }
  ): Promise<string> {
    try {
      const contentHash = generateContentHash(originalContent);

      const analysis = await prisma.analysis.create({
        data: {
          contentType,
          contentHash,
          originalContent,
          score: result.score,
          confidence: result.confidence,
          summary: result.summary,
          citations: result.citations as any,
          factors: result.factors as any,
          warnings: (result.warnings || []) as any,
          processingSteps: (result.processingSteps || []) as any,
          demoMode: metadata.demoMode || false,
          explainability: metadata.explainability || false,
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          domain: metadata.domain,
          processingTime: metadata.processingTime,
          userId: metadata.userId,
        },
      });

      logger.info('Analysis saved to database', { id: analysis.id });

      return analysis.id;
    } catch (error) {
      logger.error('Failed to save analysis', { error });
      throw error;
    }
  }

  /**
   * Get cached analysis by content hash
   */
  async getCachedAnalysis(content: string): Promise<AnalysisResult | null> {
    try {
      // Generate hash for cache lookup
      const contentHash = generateContentHash(content);

      const analysis = await prisma.analysis.findUnique({
        where: { contentHash },
      });

      if (!analysis) {
        return null;
      }

      // Check if cache is recent (within 1 hour)
      const cacheAge = Date.now() - analysis.createdAt.getTime();
      const oneHour = 3600000;

      if (cacheAge > oneHour) {
        logger.info('Cache expired', { contentHash });
        return null;
      }

      logger.info('Cache hit', { contentHash });

      return {
        id: analysis.id,
        score: analysis.score,
        confidence: analysis.confidence as any,
        summary: analysis.summary,
        citations: analysis.citations as any,
        factors: analysis.factors as any,
        warnings: analysis.warnings as any,
        processingSteps: analysis.processingSteps as any,
      };
    } catch (error) {
      logger.error('Failed to get cached analysis', { error });
      return null;
    }
  }

  /**
   * Get analytics metrics for admin dashboard
   */
  async getAnalytics(days: number = 30): Promise<AnalyticsMetrics> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const analyses = await prisma.analysis.findMany({
        where: {
          createdAt: { gte: since },
        },
      });

      const totalAnalyses = analyses.length;
      const averageScore = totalAnalyses > 0
        ? analyses.reduce((sum: number, a: any) => sum + a.score, 0) / totalAnalyses
        : 0;

      // Score distribution
      const lowScoreCount = analyses.filter((a: any) => a.score < 50).length;
      const mediumScoreCount = analyses.filter((a: any) => a.score >= 50 && a.score < 80).length;
      const highScoreCount = analyses.filter((a: any) => a.score >= 80).length;

      // Content type breakdown
      const urlCount = analyses.filter((a: any) => a.contentType === 'url').length;
      const textCount = analyses.filter((a: any) => a.contentType === 'text').length;
      const pdfCount = analyses.filter((a: any) => a.contentType === 'pdf').length;

      // Top domains
      const domainMap = new Map<string, { count: number; totalScore: number }>();
      analyses.forEach((a: any) => {
        if (a.domain) {
          const existing = domainMap.get(a.domain) || { count: 0, totalScore: 0 };
          domainMap.set(a.domain, {
            count: existing.count + 1,
            totalScore: existing.totalScore + a.score,
          });
        }
      });

      const topDomains = Array.from(domainMap.entries())
        .map(([domain, data]) => ({
          domain,
          count: data.count,
          averageScore: data.totalScore / data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Daily analyses
      const dailyMap = new Map<string, number>();
      analyses.forEach((a: any) => {
        const date = a.createdAt.toISOString().split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
      });

      const dailyAnalyses = Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalAnalyses,
        averageScore: Math.round(averageScore * 10) / 10,
        scoreDistribution: {
          low: lowScoreCount,
          medium: mediumScoreCount,
          high: highScoreCount,
        },
        contentTypeBreakdown: {
          url: urlCount,
          text: textCount,
          pdf: pdfCount,
        },
        topDomains,
        dailyAnalyses,
        lowCredibilityCount: lowScoreCount,
      };
    } catch (error) {
      logger.error('Failed to get analytics', { error });
      throw error;
    }
  }

  /**
   * Get demo content
   */
  async getDemoContent(): Promise<any[]> {
    try {
      const demoContent = await prisma.demoContent.findMany({
        where: { isActive: true },
      });

      return demoContent.map((item: any) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        category: item.category,
        expectedScore: item.expectedScore,
        cachedResult: item.cachedResult,
      }));
    } catch (error) {
      logger.error('Failed to get demo content', { error });
      return [];
    }
  }

  /**
   * Get advanced statistical analysis for admin dashboard
   */
  async getAdvancedStats(days: number = 30): Promise<any> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const analyses = await prisma.analysis.findMany({
        where: {
          createdAt: { gte: since },
        },
      });

      if (analyses.length === 0) {
        return null;
      }

      const scores = analyses.map((a: any) => a.score);
      const biasScores = analyses.map((a: any) => (a.factors as any)?.bias || 0);
      const sourceScores = analyses.map((a: any) => (a.factors as any)?.source_reputation || 0);
      const evidenceScores = analyses.map((a: any) => (a.factors as any)?.evidence || 0);
      const logicScores = analyses.map((a: any) => (a.factors as any)?.logic || 0);

      // Helper functions for statistics
      const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      const median = (arr: number[]) => {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      };
      const mode = (arr: number[]) => {
        const freq: Record<number, number> = {};
        arr.forEach(n => freq[n] = (freq[n] || 0) + 1);
        const maxFreq = Math.max(...Object.values(freq));
        return Object.keys(freq).find(k => freq[+k] === maxFreq) ? +Object.keys(freq).find(k => freq[+k] === maxFreq)! : 0;
      };
      const variance = (arr: number[]) => {
        const avg = mean(arr);
        return arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
      };
      const stdDev = (arr: number[]) => Math.sqrt(variance(arr));
      const correlation = (x: number[], y: number[]) => {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
        return (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      };

      const scoreMean = mean(scores);
      const scoreMedian = median(scores);
      const scoreMode = mode(scores);
      const scoreStdDev = stdDev(scores);
      const scoreVariance = variance(scores);

      // Quartiles
      const sortedScores = [...scores].sort((a, b) => a - b);
      const q1 = sortedScores[Math.floor(sortedScores.length * 0.25)];
      const q3 = sortedScores[Math.floor(sortedScores.length * 0.75)];
      const iqr = q3 - q1;

      // 95% Confidence Interval for mean
      const marginOfError = 1.96 * (scoreStdDev / Math.sqrt(scores.length));
      const confidenceInterval = {
        lower: scoreMean - marginOfError,
        upper: scoreMean + marginOfError,
      };

      // Correlation matrix between factors
      const correlationMatrix = {
        bias_source: correlation(biasScores, sourceScores),
        bias_evidence: correlation(biasScores, evidenceScores),
        bias_logic: correlation(biasScores, logicScores),
        source_evidence: correlation(sourceScores, evidenceScores),
        source_logic: correlation(sourceScores, logicScores),
        evidence_logic: correlation(evidenceScores, logicScores),
      };

      // Factor correlation with overall score
      const factorCorrelations = {
        bias: correlation(biasScores, scores),
        source_reputation: correlation(sourceScores, scores),
        evidence: correlation(evidenceScores, scores),
        logic: correlation(logicScores, scores),
      };

      // Multiple R-squared (how well do the 4 factors predict the score)
      const predictedScores = analyses.map((a: any) => {
        const factors = a.factors as any;
        return (factors?.bias || 0) + (factors?.source_reputation || 0) +
               (factors?.evidence || 0) + (factors?.logic || 0);
      });
      const rSquared = Math.pow(correlation(predictedScores, scores), 2);

      // Hypothesis test: URL vs Text scores (t-test approximation)
      const urlAnalyses = analyses.filter((a: any) => a.contentType === 'url');
      const textAnalyses = analyses.filter((a: any) => a.contentType === 'text');

      let urlVsTextTest = null;
      if (urlAnalyses.length > 0 && textAnalyses.length > 0) {
        const urlScores = urlAnalyses.map((a: any) => a.score);
        const textScores = textAnalyses.map((a: any) => a.score);
        const urlMean = mean(urlScores);
        const textMean = mean(textScores);
        const diff = Math.abs(urlMean - textMean);
        const pooledStdDev = Math.sqrt(
          ((urlScores.length - 1) * variance(urlScores) + (textScores.length - 1) * variance(textScores)) /
          (urlScores.length + textScores.length - 2)
        );
        const tStatistic = diff / (pooledStdDev * Math.sqrt(1/urlScores.length + 1/textScores.length));
        urlVsTextTest = {
          urlMean: urlMean.toFixed(2),
          textMean: textMean.toFixed(2),
          difference: diff.toFixed(2),
          tStatistic: tStatistic.toFixed(2),
          significant: tStatistic > 1.96, // rough 95% confidence
        };
      }

      // Skewness (measure of asymmetry)
      const skewness = scores.reduce((sum: number, x: number) => sum + Math.pow((x - scoreMean) / scoreStdDev, 3), 0) / scores.length;

      // Z-scores for outlier detection
      const outliers = analyses
        .map((a: any, i: number) => ({
          id: a.id,
          score: a.score,
          zScore: (a.score - scoreMean) / scoreStdDev,
          domain: a.domain,
        }))
        .filter((a: any) => Math.abs(a.zScore) > 2) // Outliers are |z| > 2
        .sort((a: any, b: any) => Math.abs(b.zScore) - Math.abs(a.zScore))
        .slice(0, 10);

      return {
        descriptiveStats: {
          mean: +scoreMean.toFixed(2),
          median: +scoreMedian.toFixed(2),
          mode: scoreMode,
          stdDev: +scoreStdDev.toFixed(2),
          variance: +scoreVariance.toFixed(2),
          min: Math.min(...scores),
          max: Math.max(...scores),
          range: Math.max(...scores) - Math.min(...scores),
          q1: +q1.toFixed(2),
          q3: +q3.toFixed(2),
          iqr: +iqr.toFixed(2),
          skewness: +skewness.toFixed(2),
        },
        confidenceInterval95: {
          lower: +confidenceInterval.lower.toFixed(2),
          upper: +confidenceInterval.upper.toFixed(2),
          marginOfError: +marginOfError.toFixed(2),
        },
        factorAverages: {
          neutrality: +mean(biasScores).toFixed(2),
          sourceReputation: +mean(sourceScores).toFixed(2),
          evidence: +mean(evidenceScores).toFixed(2),
          logic: +mean(logicScores).toFixed(2),
        },
        factorStdDev: {
          neutrality: +stdDev(biasScores).toFixed(2),
          sourceReputation: +stdDev(sourceScores).toFixed(2),
          evidence: +stdDev(evidenceScores).toFixed(2),
          logic: +stdDev(logicScores).toFixed(2),
        },
        correlationMatrix,
        factorCorrelations,
        rSquared: +rSquared.toFixed(3),
        hypothesisTests: {
          urlVsText: urlVsTextTest,
        },
        outliers,
        sampleSize: analyses.length,
      };
    } catch (error) {
      logger.error('Failed to get advanced stats', { error });
      throw error;
    }
  }

  /**
   * Get user's analysis count in last 24 hours (for rate limiting)
   */
  async getUserAnalysisCount(ipAddress: string): Promise<number> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const count = await prisma.analysis.count({
        where: {
          ipAddress,
          createdAt: { gte: oneDayAgo },
          demoMode: false,
        },
      });

      return count;
    } catch (error) {
      logger.error('Failed to get user analysis count', { error, ipAddress });
      return 0; // Fail open - allow analysis if count check fails
    }
  }

  /**
   * Get all analyses for export
   */
  async getAllAnalyses(days: number = 30): Promise<any[]> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const analyses = await prisma.analysis.findMany({
        where: {
          createdAt: { gte: since },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return analyses;
    } catch (error) {
      logger.error('Failed to get all analyses', { error });
      return [];
    }
  }

  /**
   * Get analytics for a specific user
   */
  async getUserAnalytics(userId: string, days: number = 30): Promise<AnalyticsMetrics> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const analyses = await prisma.analysis.findMany({
        where: {
          userId,
          createdAt: { gte: since },
        },
      });

      return this.processAnalyticsData(analyses);
    } catch (error) {
      logger.error('Failed to get user analytics', { error, userId });
      throw error;
    }
  }

  /**
   * Get quick stats for a user
   */
  async getUserStats(userId: string): Promise<any> {
    try {
      const analyses = await prisma.analysis.findMany({
        where: { userId },
      });

      const totalScans = analyses.length;
      const averageScore = totalScans > 0
        ? analyses.reduce((sum: number, a: any) => sum + a.score, 0) / totalScans
        : 0;

      const lowCredibilityCount = analyses.filter((a: any) => a.score < 50).length;
      const lowCredibilityPercentage = totalScans > 0
        ? Math.round((lowCredibilityCount / totalScans) * 100)
        : 0;

      // Find most analyzed domain
      const domainMap = new Map<string, number>();
      analyses.forEach((a: any) => {
        if (a.domain) {
          domainMap.set(a.domain, (domainMap.get(a.domain) || 0) + 1);
        }
      });

      const topSource = domainMap.size > 0
        ? Array.from(domainMap.entries()).sort((a, b) => b[1] - a[1])[0][0]
        : 'N/A';

      return {
        totalScans,
        averageScore: Math.round(averageScore * 10) / 10,
        lowCredibilityPercentage,
        topSource,
      };
    } catch (error) {
      logger.error('Failed to get user stats', { error, userId });
      throw error;
    }
  }

  /**
   * Get advanced stats for a user
   */
  async getUserAdvancedStats(userId: string, days: number = 30): Promise<any> {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const analyses = await prisma.analysis.findMany({
        where: {
          userId,
          createdAt: { gte: since },
        },
      });

      if (analyses.length < 2) {
        return null; // Need at least 2 for meaningful stats
      }

      // Re-use the same advanced stats logic but for user-specific data
      return this.calculateAdvancedStats(analyses);
    } catch (error) {
      logger.error('Failed to get user advanced stats', { error, userId });
      throw error;
    }
  }

  /**
   * Get user's analysis history
   */
  async getUserHistory(userId: string, limit: number = 100, offset: number = 0): Promise<any[]> {
    try {
      const analyses = await prisma.analysis.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      });

      return analyses;
    } catch (error) {
      logger.error('Failed to get user history', { error, userId });
      return [];
    }
  }

  /**
   * Helper method to process analytics data (extracted to reuse for both admin and user analytics)
   */
  private processAnalyticsData(analyses: any[]): AnalyticsMetrics {
    const totalAnalyses = analyses.length;
    const averageScore = totalAnalyses > 0
      ? analyses.reduce((sum: number, a: any) => sum + a.score, 0) / totalAnalyses
      : 0;

    // Score distribution
    const lowScoreCount = analyses.filter((a: any) => a.score < 50).length;
    const mediumScoreCount = analyses.filter((a: any) => a.score >= 50 && a.score < 80).length;
    const highScoreCount = analyses.filter((a: any) => a.score >= 80).length;

    // Content type breakdown
    const urlCount = analyses.filter((a: any) => a.contentType === 'url').length;
    const textCount = analyses.filter((a: any) => a.contentType === 'text').length;
    const pdfCount = analyses.filter((a: any) => a.contentType === 'pdf').length;

    // Top domains
    const domainMap = new Map<string, { count: number; totalScore: number }>();
    analyses.forEach((a: any) => {
      if (a.domain) {
        const existing = domainMap.get(a.domain) || { count: 0, totalScore: 0 };
        domainMap.set(a.domain, {
          count: existing.count + 1,
          totalScore: existing.totalScore + a.score,
        });
      }
    });

    const topDomains = Array.from(domainMap.entries())
      .map(([domain, data]) => ({
        domain,
        count: data.count,
        averageScore: data.totalScore / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Daily analyses
    const dailyMap = new Map<string, number>();
    analyses.forEach((a: any) => {
      const date = a.createdAt.toISOString().split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });

    const dailyAnalyses = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalAnalyses,
      averageScore: Math.round(averageScore * 10) / 10,
      scoreDistribution: {
        low: lowScoreCount,
        medium: mediumScoreCount,
        high: highScoreCount,
      },
      contentTypeBreakdown: {
        url: urlCount,
        text: textCount,
        pdf: pdfCount,
      },
      topDomains,
      dailyAnalyses,
      lowCredibilityCount: lowScoreCount,
    };
  }

  /**
   * Helper method to calculate advanced stats (extracted to reuse for both admin and user)
   */
  private calculateAdvancedStats(analyses: any[]): any {
    const scores = analyses.map((a: any) => a.score);
    const biasScores = analyses.map((a: any) => (a.factors as any)?.bias || 0);
    const sourceScores = analyses.map((a: any) => (a.factors as any)?.source_reputation || 0);
    const evidenceScores = analyses.map((a: any) => (a.factors as any)?.evidence || 0);
    const logicScores = analyses.map((a: any) => (a.factors as any)?.logic || 0);

    // Helper functions for statistics
    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const median = (arr: number[]) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    };
    const mode = (arr: number[]) => {
      const freq: Record<number, number> = {};
      arr.forEach(n => freq[n] = (freq[n] || 0) + 1);
      const maxFreq = Math.max(...Object.values(freq));
      return Object.keys(freq).find(k => freq[+k] === maxFreq) ? +Object.keys(freq).find(k => freq[+k] === maxFreq)! : 0;
    };
    const variance = (arr: number[]) => {
      const avg = mean(arr);
      return arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
    };
    const stdDev = (arr: number[]) => Math.sqrt(variance(arr));
    const correlation = (x: number[], y: number[]) => {
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
      const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
      return (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    };

    const scoreMean = mean(scores);
    const scoreMedian = median(scores);
    const scoreMode = mode(scores);
    const scoreStdDev = stdDev(scores);
    const scoreVariance = variance(scores);

    // Quartiles
    const sortedScores = [...scores].sort((a, b) => a - b);
    const q1 = sortedScores[Math.floor(sortedScores.length * 0.25)];
    const q3 = sortedScores[Math.floor(sortedScores.length * 0.75)];
    const iqr = q3 - q1;

    // 95% Confidence Interval for mean
    const marginOfError = 1.96 * (scoreStdDev / Math.sqrt(scores.length));
    const confidenceInterval = {
      lower: scoreMean - marginOfError,
      upper: scoreMean + marginOfError,
    };

    // Correlation matrix between factors
    const correlationMatrix = {
      bias_source: correlation(biasScores, sourceScores),
      bias_evidence: correlation(biasScores, evidenceScores),
      bias_logic: correlation(biasScores, logicScores),
      source_evidence: correlation(sourceScores, evidenceScores),
      source_logic: correlation(sourceScores, logicScores),
      evidence_logic: correlation(evidenceScores, logicScores),
    };

    // Factor correlation with overall score
    const factorCorrelations = {
      bias: correlation(biasScores, scores),
      source_reputation: correlation(sourceScores, scores),
      evidence: correlation(evidenceScores, scores),
      logic: correlation(logicScores, scores),
    };

    // Multiple R-squared
    const predictedScores = analyses.map((a: any) => {
      const factors = a.factors as any;
      return (factors?.bias || 0) + (factors?.source_reputation || 0) +
             (factors?.evidence || 0) + (factors?.logic || 0);
    });
    const rSquared = Math.pow(correlation(predictedScores, scores), 2);

    // Hypothesis test: URL vs Text scores
    const urlAnalyses = analyses.filter((a: any) => a.contentType === 'url');
    const textAnalyses = analyses.filter((a: any) => a.contentType === 'text');

    let urlVsTextTest = null;
    if (urlAnalyses.length > 0 && textAnalyses.length > 0) {
      const urlScores = urlAnalyses.map((a: any) => a.score);
      const textScores = textAnalyses.map((a: any) => a.score);
      const urlMean = mean(urlScores);
      const textMean = mean(textScores);
      const diff = Math.abs(urlMean - textMean);
      const pooledStdDev = Math.sqrt(
        ((urlScores.length - 1) * variance(urlScores) + (textScores.length - 1) * variance(textScores)) /
        (urlScores.length + textScores.length - 2)
      );
      const tStatistic = diff / (pooledStdDev * Math.sqrt(1/urlScores.length + 1/textScores.length));
      urlVsTextTest = {
        urlMean: urlMean.toFixed(2),
        textMean: textMean.toFixed(2),
        difference: diff.toFixed(2),
        tStatistic: tStatistic.toFixed(2),
        significant: tStatistic > 1.96,
      };
    }

    // Skewness
    const skewness = scores.reduce((sum: number, x: number) => sum + Math.pow((x - scoreMean) / scoreStdDev, 3), 0) / scores.length;

    return {
      descriptiveStats: {
        mean: +scoreMean.toFixed(2),
        median: +scoreMedian.toFixed(2),
        mode: scoreMode,
        stdDev: +scoreStdDev.toFixed(2),
        variance: +scoreVariance.toFixed(2),
        min: Math.min(...scores),
        max: Math.max(...scores),
        range: Math.max(...scores) - Math.min(...scores),
        q1: +q1.toFixed(2),
        q3: +q3.toFixed(2),
        iqr: +iqr.toFixed(2),
        skewness: +skewness.toFixed(2),
      },
      confidenceInterval95: {
        lower: +confidenceInterval.lower.toFixed(2),
        upper: +confidenceInterval.upper.toFixed(2),
        marginOfError: +marginOfError.toFixed(2),
      },
      factorAverages: {
        neutrality: +mean(biasScores).toFixed(2),
        sourceReputation: +mean(sourceScores).toFixed(2),
        evidence: +mean(evidenceScores).toFixed(2),
        logic: +mean(logicScores).toFixed(2),
      },
      factorStdDev: {
        neutrality: +stdDev(biasScores).toFixed(2),
        sourceReputation: +stdDev(sourceScores).toFixed(2),
        evidence: +stdDev(evidenceScores).toFixed(2),
        logic: +stdDev(logicScores).toFixed(2),
      },
      correlationMatrix,
      factorCorrelations,
      rSquared: +rSquared.toFixed(3),
      hypothesisTests: {
        urlVsText: urlVsTextTest,
      },
      sampleSize: analyses.length,
    };
  }

  /**
   * Close database connection
   */
  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}

export default new DatabaseService();
