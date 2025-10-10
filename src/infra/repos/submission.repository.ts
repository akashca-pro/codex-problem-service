import { SubmissionModel } from "../db/models/submission.model";
import { IExecutionResult, ISubmission } from "../db/interface/submission.interface";
import { BaseRepository } from "./base.repository";
import { ISubmissionRepository } from "./interfaces/submission.repository.interface";
import logger from '@/utils/pinoLogger'; // Import the logger

/**
 * This class implements the submission repository
 * * @class
 * @extends {BaseRepository}
 * @implements {ISubmissionRepository}
 */
export class SubmissionRepository 
    extends BaseRepository<ISubmission> 
        implements ISubmissionRepository {

        constructor(){
            super(SubmissionModel)
        }

    async updateExecutionResult(
        submissionId: string,
        executionResult : IExecutionResult
    ): Promise<void> {
        const startTime = Date.now();
        const operation = 'updateExecutionResult';
        try {
            logger.debug(`[REPO] Executing ${operation}`, { submissionId });
            
            await this.update(submissionId,{
                $set : {
                    executionResult : executionResult
                }
            })

            logger.info(`[REPO] ${operation} successful`, { submissionId, duration: Date.now() - startTime });
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error, submissionId, duration: Date.now() - startTime });
            throw error;
        }
    }
}