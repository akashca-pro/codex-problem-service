import { IExecutionResult } from "@/infra/db/interface/submission.interface";

/**
 * Interface representing the structure of the submission repository.
 * 
 * @interface
 */
export interface ISubmissionRepository {

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