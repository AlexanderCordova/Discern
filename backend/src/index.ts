import dotenv from 'dotenv';
// Load environment variables FIRST, before any other imports
dotenv.config();

// Debug: Check if API key is loaded
console.log('API Key loaded:', process.env.ANTHROPIC_API_KEY ? 'YES (length: ' + process.env.ANTHROPIC_API_KEY.length + ')' : 'NO');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Import routes
import analyzeRoutes from './api/analyze';
import adminRoutes from './api/admin';
import userRoutes from './api/user';
import healthRoutes from './api/health';
import feedbackRoutes from './api/feedback';

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from:
    // 1. Frontend URL
    // 2. Chrome/Firefox extensions (chrome-extension://* or moz-extension://*)
    // 3. No origin (for local testing)
    const allowedOrigins = [FRONTEND_URL];

    if (!origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('chrome-extension://') ||
        origin.startsWith('moz-extension://')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/feedback', feedbackRoutes);

// Error handling
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 DISCERN Backend running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🌐 Frontend URL: ${FRONTEND_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
