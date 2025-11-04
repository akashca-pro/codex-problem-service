import { SubmissionModel } from "@/db/models/submission.model";
import { IExecutionResult, ISubmission } from "@/db/interface/submission.interface";
import { BaseRepository } from "./base.repository";
import { ISubmissionRepository } from "./interfaces/submission.repository.interface";
import logger from '@/utils/pinoLogger'; // Import the logger
import { IActivity } from "@/dtos/Activity.dto";

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

    async getDailyActivity(
        userId: string, 
        userTimezone: string
    ): Promise<IActivity[]> {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const activity = await this._model.aggregate<IActivity>([
            {
                // 1. Find all accepted submissions for this user in the last year
                $match: {
                    userId: userId,
                    status: 'accepted',
                    createdAt: { $gte: oneYearAgo }
                }
            },
            {
                // 2. Group them by their "local date" using their timezone
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d", // "YYYY-MM-DD"
                            date: "$createdAt",
                            timezone: userTimezone 
                        }
                    },
                    count: { $sum: 1 } // Count submissions per day
                }
            },
            {
                // 3. Sort by date descending (most recent first)
                $sort: {
                    _id: -1
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: "$count"
                }
            }
        ]);

        return activity;
    }
}