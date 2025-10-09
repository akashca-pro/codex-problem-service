import mongoose from "mongoose";
import { config } from ".";
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';

export const connectDB = () =>{
    mongoose.connect(config.PROBLEM_SERVICE_DATABASE_URL)
    .then(()=> logger.info('Connected to MongoDB'))
    .catch((err)=>logger.error('MongoDB connection error',err));
}

