import { IAiHintUsage } from "@/db/interface/aiHintUsages.interface";
import { BaseRepository } from "./base.repository";
import { IAiHintUsageRepository } from "./interfaces/aiHintUsage.repository.interface";
import { AiHintUsageModel } from "@/db/models/aiHintUsage.model";
import logger from '@/utils/pinoLogger';

export class AiHintUsageRepository extends BaseRepository<IAiHintUsage> implements IAiHintUsageRepository {
    constructor(){
        super(AiHintUsageModel)
    }

    async getUsedHintsByUserForProblem(
        userId : string,
        problemId : string
    ): Promise<IAiHintUsage | null> {
        const startTime = Date.now();
        const operation = 'getUsedHintsByUserAndProblem';
        try {
            logger.debug(`[REPO] Executing ${operation}`, { userId, problemId });
            const result = await this._model.findOne({ 
                userId, 
                problemId,
                submissionId: { $exists: false }
            });
            const found = !!result;
            logger.info(`[REPO] ${operation} successful`, { found, userId, problemId, duration: Date.now() - startTime });
            return result;
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error, duration: Date.now() - startTime });
            throw error;
        }
    }

    async getAllUsedHintsByUser(
        userId: string
    ): Promise<IAiHintUsage[]> {
        const startTime = Date.now();
        const operation = 'getAllUsedHintsByUser';
        try {
            logger.debug(`[REPO] Executing ${operation}`, { userId });
            const result = await this._model.find({ userId })
            const found = !!result;
            logger.info(`[REPO] ${operation} successful`, { found, userId, duration: Date.now() - startTime });
            return result;
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error, duration: Date.now() - startTime });
            throw error;
        }
    }
}