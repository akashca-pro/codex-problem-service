import mongoose from "mongoose";
import { config } from ".";
import logger from "@akashcapro/codex-shared-utils/utils/logger";

export const connectDB = () =>{
    mongoose.connect(config.DATABASE_URL)
    .then(()=> logger.info('Connected to MongoDB'))
    .catch((err)=>logger.error('MongoDB connection error',err));
}

