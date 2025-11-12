import { ProblemModel } from "@/db/models/problem.model";
import { IProblem, ITemplateCode, ITestCase } from "@/db/interface/problem.interface";
import { BaseRepository } from "./base.repository";
import { IProblemRepository } from "./interfaces/problem.repository.interface";
import { type TestcaseType } from "@/const/TestcaseType.const";
import logger from '@/utils/pinoLogger'; // Import the logger
import { IAdminDashboardProblemStats } from "@/dtos/dashboard.dto";

/**
 * This class implements the problem repository.
 * * @class
 * @extends {BaseRepository}
 * @implements {IProblemRepository}
 */
export class ProblemRepository extends BaseRepository<IProblem> implements IProblemRepository {

    constructor(){
        super(ProblemModel)
    }

    async findByTitle(
        title: string
    ): Promise<IProblem | null> {
        const startTime = Date.now();
        const operation = 'findByTitle';
        try {
            logger.debug(`[REPO] Executing ${operation}`, { title });
            const result = await this._model.findOne({ title })
            const found = !!result;
            logger.info(`[REPO] ${operation} successful`, { found, title, duration: Date.now() - startTime });
            return result;
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error, title, duration: Date.now() - startTime });
            throw error;
        }
    }

    async addTestCase(
        problemId: string, 
        testCaseCollectionType: TestcaseType, 
        testCase: ITestCase
    ): Promise<void> {
        const startTime = Date.now();
        const operation = 'addTestCase';
        try {
            logger.debug(`[REPO] Executing ${operation}`, { problemId, collectionType: testCaseCollectionType });
            await this.update( problemId, { $push : { [`testcaseCollection.${testCaseCollectionType}`] : testCase } } );
            logger.info(`[REPO] ${operation} successful`, { problemId, collectionType: testCaseCollectionType, duration: Date.now() - startTime });
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error, problemId, collectionType: testCaseCollectionType, duration: Date.now() - startTime });
            throw error;
        }
    }

    async removeTestCase(
        problemId: string, 
        testCaseId: string, 
        testCaseCollectionType: TestcaseType
    ): Promise<boolean> {
        const startTime = Date.now();
        const operation = 'removeTestCase';
        try {
            logger.debug(`[REPO] Executing ${operation}`, { problemId, testCaseId, collectionType: testCaseCollectionType });
            const result = await this._model.updateOne({ _id : problemId }, {
                $pull : {
                    [`testcaseCollection.${testCaseCollectionType}`]: { _id: testCaseId }
                }
            })
            const modified = result.modifiedCount > 0
            logger.info(`[REPO] ${operation} successful`, { problemId, testCaseId, modified, duration: Date.now() - startTime });
            return modified;
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error, problemId, testCaseId, duration: Date.now() - startTime });
            throw error;
        }
    }

    async bulkUploadTestCase(
        problemId: string, 
        testCaseCollectionType: TestcaseType,
        testCases : ITestCase[]
    ): Promise<void> {
        const startTime = Date.now();
        const operation = 'bulkUploadTestCase';
        try {
            logger.debug(`[REPO] Executing ${operation}`, { problemId, collectionType: testCaseCollectionType, count: testCases.length });
            await this.update(problemId, {
                $push: {
                    [`testcaseCollection.${testCaseCollectionType}`]: {
                        $each: testCases,
                    },
                },
            });
            logger.info(`[REPO] ${operation} successful`, { problemId, count: testCases.length, duration: Date.now() - startTime });
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error, problemId, count: testCases.length, duration: Date.now() - startTime });
            throw error;
        }
    }

    async updateTemplateCode(
        problemId : string,
        templateCodeId : string,
        updatedTemplateCode : Partial<ITemplateCode>
    ) : Promise<void> {
        const startTime = Date.now();
        const operation = 'updateTemplateCode';
        try {
            logger.debug(`[REPO] Executing ${operation}`, { problemId, templateCodeId, updatedKeys: Object.keys(updatedTemplateCode) });
            const set: Record<string, unknown> = {};
            if(updatedTemplateCode.language !== undefined) set["templateCodes.$.language"] = updatedTemplateCode.language;
            if(updatedTemplateCode.submitWrapperCode !== undefined) set["templateCodes.$.submitWrapperCode"] = updatedTemplateCode.submitWrapperCode;
            if(updatedTemplateCode.runWrapperCode !== undefined) set["templateCodes.$.runWrapperCode"] = updatedTemplateCode.runWrapperCode;
            
            const result = await this._model.updateOne(
                { _id : problemId, "templateCodes._id" : templateCodeId },
                { $set : set }
            );

            const modified = result.modifiedCount > 0;
            logger.info(`[REPO] ${operation} successful`, { problemId, templateCodeId, modified, duration: Date.now() - startTime });
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error, problemId, templateCodeId, duration: Date.now() - startTime });
            throw error;
        }
    }

    async getAdminProblemStats(): Promise<IAdminDashboardProblemStats> {
        const startTime = Date.now();
        const operation = 'getAdminProblemStats';
        logger.debug(`[REPO] Executing ${operation}`);

        try {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const [result] = await this._model.aggregate([
                {
                    $facet: {
                    // --- Total problems ---
                    totalProblems: [{ $count: "count" }],

                    // --- Today's problems ---
                    todaysProblems: [
                        {
                            $match: {
                                createdAt: { $gte: startOfToday },
                            },
                        },
                        { $count: "count" },
                    ],

                    // --- Difficulty-wise problems ---
                        difficultyWise: [
                            {
                                $group: {
                                    _id: "$difficulty",
                                    count: { $sum: 1 },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    difficulty: "$_id",
                                    count: 1,
                                },
                            },
                        ],
                    },
                },
                {
                    // Normalize results to always have valid fields
                    $project: {
                        totalProblems: {
                            $ifNull: [{ $arrayElemAt: ["$totalProblems.count", 0] }, 0],
                        },
                        todaysProblems: {
                            $ifNull: [{ $arrayElemAt: ["$todaysProblems.count", 0] }, 0],
                        },
                        difficultyWise: 1,
                    },
                },
            ]);

            const stats: IAdminDashboardProblemStats = {
                totalProblems: result.totalProblems ?? 0,
                todaysProblems: result.todaysProblems ?? 0,
                difficultyWise: result.difficultyWise ?? [],
            };

            logger.info(`[REPO] ${operation} successful`, {
                duration: Date.now() - startTime,
                ...stats,
            });

            return stats;
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, {
                error,
                duration: Date.now() - startTime,
            });
            throw error;
        }
    }
}