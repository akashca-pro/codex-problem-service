import { SubmissionModel } from "../db/models/submission.model";
import { IExecutionResult, ISubmission } from "../db/types/submission";
import { BaseRepository } from "./base.repository";
import { ISubmissionRepository } from "./interfaces/submission.repository.interface";

/**
 * This class implements the submission repository
 * 
 * @class
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
        
        const submission = await this.findById(submissionId);
        if(!submission) throw new Error(DbErrorType.SubmissionNotFound);

        await this.update(submissionId,{
            $set : {
                executionResult : executionResult
            }
        })
    }
}