import { SubmissionModel } from "@/db/models/submission.model";
import { IExecutionResult, ISubmission } from "@/db/interface/submission.interface";
import { BaseRepository } from "./base.repository";
import { ISubmissionRepository } from "./interfaces/submission.repository.interface";
import logger from '@/utils/pinoLogger';
import { 
    IActivity, 
    IAdminDashboardSubmissionStats, 
    IRecentActivity, 
    ISolvedByDifficulty 
} from "@/dtos/dashboard.dto";

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
        const startTime = Date.now();
        const operation = 'getDailyActivity';
        logger.debug(`[REPO] Executing ${operation}`, { userId, userTimezone });

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        try {
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

            logger.info(`[REPO] ${operation} successful. Found ${activity.length} days of activity.`, { userId, duration: Date.now() - startTime });
            return activity;
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error, userId, userTimezone, duration: Date.now() - startTime });
            throw error;
        }
    }
    
    async getRecentActivities(
        userId: string, 
        limit: number = 5
    ): Promise<IRecentActivity[]> {
        const startTime = Date.now();
        const operation = 'getRecentActivities';
        logger.debug(`[REPO] Executing ${operation}`, { userId, limit });
        
        try {
            const activities = await this._model.aggregate<IRecentActivity>([
                {
                    $match: { userId }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: "problems",
                        localField: "problemId",
                        foreignField: "_id",
                        as: "problem"
                    }
                },
                {
                    $unwind: "$problem"
                },
                {
                    $project: {
                        _id: 0,
                        title: "$problem.title",
                        difficulty: "$problem.difficulty",
                        status: "$status",
                        createdAt: 1
                    }
                }
            ]);
            
            logger.info(`[REPO] ${operation} successful. Returned ${activities.length} recent activities.`, { userId, limit, duration: Date.now() - startTime });
            return activities;
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error, userId, limit, duration: Date.now() - startTime });
            throw error;
        }
    }

    async getProblemsSolvedCount(
        userId: string
    ): Promise<number> {
        const startTime = Date.now();
        const operation = 'getProblemsSolvedCount';
        logger.debug(`[REPO] Executing ${operation}`, { userId });

        try {
            const solvedProblems = await this._model.aggregate([
                {
                    $match: { userId, status: 'accepted' }
                },
                {
                    $group : { 
                        _id : "$problemId",
                    }
                },
                {
                    $count : "count"
                }
            ])
            logger.info(`[REPO] ${operation} successful`, { userId, duration: Date.now() - startTime });
            return solvedProblems.length;
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error, userId, duration: Date.now() - startTime });
            throw error;
        }
    }

    async getProblemsSolvedByDifficulty(
        userId : string
    ) : Promise<ISolvedByDifficulty[]> {
        const startTime = Date.now();
        const operation = 'getProblemsSolvedByDifficulty';
        logger.debug(`[REPO] Executing ${operation}`, { userId });

        try {
            const solvedProblems = await this._model.aggregate<ISolvedByDifficulty>([
                {
                    $match: {
                        userId,
                        status: 'accepted'
                    }
                },
                {
                    $group: {
                        _id: {
                            userId: '$userId',
                            problemId: '$problemId'
                        },
                        difficulty: { $first: '$difficulty' }
                    }
                },
                {
                    $group: {
                        _id: '$difficulty',
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        difficulty: '$_id',
                        count: 1
                    }
                }
            ]);
            return solvedProblems;
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error, userId, duration: Date.now() - startTime });
            throw error;
        }
    }
    
    async getAdminSubmissionStats(): Promise<IAdminDashboardSubmissionStats> {
        const startTime = Date.now()
        const operation = 'getAdminSubmissionStats'
        logger.debug(`[REPO] Executing ${operation}`)

        try {
            const startOfToday = new Date()
            startOfToday.setHours(0, 0, 0, 0)

            const [result] = await this._model.aggregate([
                {
                    $facet: {
                    // --- Total submissions ---
                    totalSubmissions: [{ $count: 'count' }],

                    // --- Today's submissions ---
                    todaysSubmissions: [
                        {
                            $match: {
                                createdAt: { $gte: startOfToday },
                            },
                        },
                        { $count: 'count' },
                    ],

                    // --- Language-wise submissions ---
                    languageWise: [
                        {
                            $group: {
                                _id: '$language',
                                count: { $sum: 1 },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                language: '$_id',
                                count: 1,
                            },
                        },
                    ],
                    },
                },
                {
                    // Normalize results to avoid missing fields when counts = 0
                    $project: {
                        totalSubmissions: {
                            $ifNull: [{ $arrayElemAt: ['$totalSubmissions.count', 0] }, 0],
                        },
                        todaysSubmissions: {
                            $ifNull: [{ $arrayElemAt: ['$todaysSubmissions.count', 0] }, 0],
                        },
                        languageWise: 1,
                    },
                },
            ])

            const stats = {
                totalSubmissions: result.totalSubmissions ?? 0,
                todaysSubmissions: result.todaysSubmissions ?? 0,
                languageWise: result.languageWise ?? [],
            }

            logger.info(`[REPO] ${operation} successful`, {
                duration: Date.now() - startTime,
                ...stats,
            })
            return stats
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, {
                error,
                duration: Date.now() - startTime,
            })
            throw error
        }
    }
}