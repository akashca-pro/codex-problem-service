import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';
import { config } from '@/config';
import { startMetricsServer } from '@/config/metrics/metrics-server';
import { connectDB } from './config/db';
import { startGrpcServer } from './transport/grpc/server';

const startServer = () => {
    try {
        // Connect to MongoDB
        connectDB();

        // Start prometheus metrics server.
        startMetricsServer(config.METRICS_PORT);

        // start gRPC server.
        startGrpcServer();

    } catch (error) {
        logger.error('Failed to start server : ',error);
        process.exit(1);
    }
}

startServer();