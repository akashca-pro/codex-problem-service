import { IFirstSubmission } from "@/db/interface/firstSubmission.interface";
import { BaseRepository } from "./base.repository";
import { ICountryScores, IFirstSubmissionRepository, IGlobalProblemsSolved, IGlobalScore, IUserCountries, IUsernames } from "./interfaces/firstSubmission.repository.interface";
import { FirstSubmissionModel } from "@/db/models/firstSubmission.model";
import logger from "@/utils/pinoLogger";

export class FirstSubmissionRepository extends BaseRepository<IFirstSubmission> implements IFirstSubmissionRepository {
    constructor(){
        super(FirstSubmissionModel)    
    }
    
    async getGlobalScores(): Promise<IGlobalScore[]> {
        const startTime = Date.now();
        const operation = 'Get Global Scores';
        try {
            logger.debug(`[REPO] Executing ${operation}`);
            const result = await this._model.aggregate<IGlobalScore>([
                {
                    $group : {
                        _id : "$userId",
                        totalScore : { $sum : "$score" }
                    }
                }
            ]);
            
            logger.info(`[REPO] ${operation} successful`, { duration: Date.now() - startTime });
            return result;
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error });
            throw error; 
        }
    }

    async getUserCountries(): Promise<IUserCountries[]> {
        const startTime = Date.now();
        const operation = 'Get User Countries';
        try {
            logger.debug(`[REPO] Executing ${operation}`);
            const result = await this._model.aggregate<IUserCountries>([
                { $sort : { createdAt : -1 } },
                {
                    $group: {
                        _id: "$userId",
                        entity: { $first: "$country" } 
                    }
                }
            ])
            logger.info(`[REPO] ${operation} successful`, { duration: Date.now() - startTime });
            return result;
        } catch (error) {
           logger.error(`[REPO] ${operation} failed`, { error });
           throw error; 
        }
    }

    async getCountryScores(): Promise<ICountryScores[]> {
        const startTime = Date.now();
        const operation = 'Get Country Scores';
        try {
            logger.debug(`[REPO] Executing ${operation}`);
            const result = await this._model.aggregate<ICountryScores>([
            { $match: { country: { $ne: null, $exists: true } } }, // Only submissions with a country
            {
                $group: {
                    _id: { userId: "$userId", country: "$country" },
                    totalScore: { $sum: "$score" }
                }
            }
            ])
            logger.info(`[REPO] ${operation} successful`, { duration: Date.now() - startTime });
            return result;
        } catch (error) {
           logger.error(`[REPO] ${operation} failed`, { error });
           throw error;
        }            
    }

    async getGlobalProblemsSolved(): Promise<IGlobalProblemsSolved[]> {
        const operation = 'Get Global Problems Solved Count';
        try {
            logger.debug(`[REPO] Executing ${operation}`);
            const result = await this._model.aggregate<IGlobalProblemsSolved>([
                {
                    $group: {
                        _id: "$userId",
                        count: { $sum: 1 }
                    }
                }
            ]);
            logger.info(`[REPO] ${operation} successful`);
            return result;
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error });
            throw error;
        }
    }

    async getUsernames(): Promise<IUsernames[]> {
        const operation = 'Get Usernames';
        try {
            logger.debug(`[REPO] Executing ${operation}`);
            const result = await this._model.aggregate<IUsernames>([
                { $sort : { createdAt : -1 } },
                {
                    $group: {
                        _id: "$userId",
                        username: { $first: "$username" }
                    }
                }
            ]);
            logger.info(`[REPO] ${operation} successful`);
            return result;
        } catch (error) {
            logger.error(`[REPO] ${operation} failed`, { error });
            throw error; 
        }
    }

}   
