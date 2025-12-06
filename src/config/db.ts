import mongoose from "mongoose";
import { config } from ".";
import logger from '@/utils/pinoLogger';

export const connectDB = async () => {
    try {
        // 2. Await the connection
        await mongoose.connect(config.PROBLEM_SERVICE_DATABASE_URL);
        logger.info('Connected to MongoDB');
    } catch (err) {
        logger.error('MongoDB connection error', err);
        throw err;
    }
}
