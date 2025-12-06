import './config/tracing'
import logger from '@/utils/pinoLogger';
import { connectDB } from './config/db';
import { startGrpcServer } from './transport/grpc/server';
import container from './config/inversify/container';
import { ILeaderboard } from './libs/leaderboard/leaderboard.interface';
import TYPES from './config/inversify/types';

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        // start gRPC server.
        startGrpcServer();
        // resync leaderboard.
        const leaderboard = container.get<ILeaderboard>(TYPES.ILeaderboard);
        await leaderboard.init();

    } catch (error) {
        logger.error('Failed to start server : ',error);
        process.exit(1);
    }
}

startServer();