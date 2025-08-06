import express from 'express';
import logger from '@akashcapro/codex-shared-utils/utils/logger';
import { globalErrorHandler } from '@/utils/errorHandler';
import { config } from '@/config';
import { startMetricsServer } from '@/config/metrics/metrics-server';
import { connectDB } from './config/db';

const app = express();

// Global error handling.
app.use(globalErrorHandler);

const startServer = () => {
    try {
        // Connect to MongoDB
        connectDB();

        // Start prometheus metrics server.
        startMetricsServer(config.METRICS_PORT);

    } catch (error) {
        logger.error('Failed to start server : ',error);
        process.exit(1);
    }
}

startServer();