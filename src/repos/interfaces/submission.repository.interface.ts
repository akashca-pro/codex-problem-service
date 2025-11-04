import { IExecutionResult, ISubmission } from "@/db/interface/submission.interface";
import { BaseRepository } from "../base.repository";
import { IActivity } from "@/dtos/Activity.dto";

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

}