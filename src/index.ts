import logger from '@/utils/pinoLogger';
import { connectDB } from './config/db';
import { startGrpcServer } from './transport/grpc/server';

const startServer = async () => {
    try {
        // Connect to MongoDB
        connectDB();
        // start gRPC server.
        startGrpcServer();

    } catch (error) {
        logger.error('Failed to start server : ',error);
        process.exit(1);
    }
}

startServer();