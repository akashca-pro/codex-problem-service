import { IExecutionResult, ISubmission } from "@/db/interface/submission.interface";
import { BaseRepository } from "../base.repository";
import { IActivity, IRecentActivity, ISolvedByDifficulty } from "@/dtos/Activity.dto";

/**
 * Interface representing the structure of the submission repository.
 * 
 * @interface
 */
export interface ISubmissionRepository extends BaseRepository<ISubmission> {

    updateExecutionResult(
        submissionId : string,
        executionResult : IExecutionResult
    ) : Promise<void> 

    getDailyActivity(
        userId: string, 
        userTimezone: string
    ) : Promise<IActivity[]>

    getRecentActivities(
        userId: string, 
        limit: number
    ) : Promise<IRecentActivity[]>

    getProblemsSolvedCount(
        userId: string
    ) : Promise<number> 

    getProblemsSolvedByDifficulty(
        userId: string
    ) : Promise<ISolvedByDifficulty[]>

}