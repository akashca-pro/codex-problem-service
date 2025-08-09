import { SubmissionModel } from "../db/models/submission.model";
import { IExecutionResult, ISubmission } from "../db/interface/submission.interface";
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
        
        await this.update(submissionId,{
            $set : {
                executionResult : executionResult
            }
        })
    }
}