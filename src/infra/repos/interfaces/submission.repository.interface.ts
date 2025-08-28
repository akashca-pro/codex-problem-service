import { IExecutionResult, ISubmission } from "@/infra/db/interface/submission.interface";
import { BaseRepository } from "../base.repository";

/**
 * Interface representing the structure of the submission repository.
 * 
 * @interface
 */
export interface ISubmissionRepository extends BaseRepository<ISubmission> {

    /**
     * 
     * @async
     * @param submissionId - The id of the submission data.
     * @param executionResult - The execution result to be updated.
     */
    updateExecutionResult(
        submissionId : string,
        executionResult : IExecutionResult
    ) : Promise<void> 

}