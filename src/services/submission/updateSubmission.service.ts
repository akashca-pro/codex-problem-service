import { inject } from "inversify";
import { IUpdateSubmissionService } from "./interfaces/updateSubmission.service.interface";
import TYPES from "@/config/inversify/types";
import { ISubmissionRepository } from "@/infra/repos/interfaces/submission.repository.interface";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { IUpdateSubmissionRequestDTO } from "@/dtos/submission/UpdateSubmissionRequestDTO";
import { SubmissionErrorType } from "@/enums/ErrorTypes/submissionErrorType.enum";

/**
 * Implementaion of update submission service.
 * 
 * @class
 * @implements {IUpdateSubmissionService}
 */
export class UpdateSubmissionService implements IUpdateSubmissionService {

    #_submissionRepo : ISubmissionRepository

    /**
     * Create an instance of CreateSubmissionService
     * 
     * @param submissionRepo - The submission repository.
     * @constructor
     */
    constructor(
        @inject(TYPES.ISubmissionRepository)
        submissionRepo : ISubmissionRepository
    ){
        this.#_submissionRepo = submissionRepo;
    }

    async execute(data: IUpdateSubmissionRequestDTO): Promise<ResponseDTO> {
        
        const submissionExist = await this.#_submissionRepo.findById(data._id);

        if(!submissionExist){
            return {
                data : null,
                success : false,
                errorMessage : SubmissionErrorType.SubmissionNotFound
            }
        }

        const updatedSubmission = await this.#_submissionRepo.update(data._id, {
            executionResult : data.executionResult,
            executionTime : data.executionTime,
            memoryUsage : data.memoryUsage
        });

        return {
            data : updatedSubmission,
            success : true
        }
    }
}