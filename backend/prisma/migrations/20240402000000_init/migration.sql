-- Initial Schema Migration for DISCERN
-- Run this with: psql -U your_user -d discern -f migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Analyses Table
CREATE TABLE IF NOT EXISTS "Analysis" (
    "id" TEXT PRIMARY KEY,
    "contentType" TEXT NOT NULL,
    "contentHash" TEXT UNIQUE NOT NULL,
    "originalContent" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "confidence" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "citations" JSONB NOT NULL,
    "factors" JSONB NOT NULL,
    "warnings" JSONB,
    "processingSteps" JSONB,
    "demoMode" BOOLEAN DEFAULT false,
    "explainability" BOOLEAN DEFAULT false,
    "processingTime" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "domain" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analysis_content_hash ON "Analysis"("contentHash");
CREATE INDEX idx_analysis_domain ON "Analysis"("domain");
CREATE INDEX idx_analysis_created_at ON "Analysis"("createdAt");
CREATE INDEX idx_analysis_score ON "Analysis"("score");

-- Users Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE,
    "passwordHash" TEXT,
    "isAdmin" BOOLEAN DEFAULT false,
    "apiKey" TEXT UNIQUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_email ON "User"("email");
CREATE INDEX idx_user_api_key ON "User"("apiKey");

-- Analytics Cache Table
CREATE TABLE IF NOT EXISTS "AnalyticsCache" (
    "id" TEXT PRIMARY KEY,
    "metricType" TEXT NOT NULL,
    "metricDate" TIMESTAMP NOT NULL,
    "totalAnalyses" INTEGER DEFAULT 0,
    "averageScore" DECIMAL DEFAULT 0,
    "lowScoreCount" INTEGER DEFAULT 0,
    "mediumScoreCount" INTEGER DEFAULT 0,
    "highScoreCount" INTEGER DEFAULT 0,
    "urlCount" INTEGER DEFAULT 0,
    "textCount" INTEGER DEFAULT 0,
    "pdfCount" INTEGER DEFAULT 0,
    "topDomains" JSONB,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("metricType", "metricDate")
);

CREATE INDEX idx_analytics_metric_type ON "AnalyticsCache"("metricType");
CREATE INDEX idx_analytics_metric_date ON "AnalyticsCache"("metricDate");

-- Rate Limit Table
CREATE TABLE IF NOT EXISTS "RateLimit" (
    "id" TEXT PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestCount" INTEGER DEFAULT 1,
    "windowStart" TIMESTAMP NOT NULL,
    UNIQUE("identifier", "endpoint", "windowStart")
);

CREATE INDEX idx_rate_limit_identifier ON "RateLimit"("identifier");
CREATE INDEX idx_rate_limit_window_start ON "RateLimit"("windowStart");

-- Demo Content Table
CREATE TABLE IF NOT EXISTS "DemoContent" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT UNIQUE NOT NULL,
    "category" TEXT NOT NULL,
    "expectedScore" INTEGER NOT NULL,
    "cachedResult" JSONB NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_demo_content_category ON "DemoContent"("category");

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updatedAt
CREATE TRIGGER update_analysis_updated_at BEFORE UPDATE ON "Analysis"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_cache_updated_at BEFORE UPDATE ON "AnalyticsCache"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demo_content_updated_at BEFORE UPDATE ON "DemoContent"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
