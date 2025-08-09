import { inject, injectable } from "inversify";
import { ICreateSubmissionService } from "./interfaces/createSubmission.service.interface";
import { ISubmissionRepository } from "@/infra/repos/interfaces/submission.repository.interface";
import TYPES from "@/config/inversify/types";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ICreateSubmissionRequestDTO } from "@/dtos/submission/CreateSubmissionRequestDTO";
import mongoose from "mongoose";
import { SubmissionErrorType } from "@/enums/ErrorTypes/submissionErrorType.enum";

/**
 * Implementaion of create submission service.
 * 
 * @class
 * @implements {ICreateSubmissionService}
 */
@injectable()
export class CreateSubmissionService implements ICreateSubmissionService {

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

    async execute(data: ICreateSubmissionRequestDTO): Promise<ResponseDTO> {
        
        const submissionAlreadyExist = await this.#_submissionRepo.findOne({ problemId : data.problemId });

        if(submissionAlreadyExist){
            return {
                data : null,
                success : false,
                errorMessage : SubmissionErrorType.SubmissionNotFound
            }
        }

        const submissionData = {
            ...data,
            problemId : new mongoose.Types.ObjectId(data.problemId),
        }

        const submission = await this.#_submissionRepo.create(submissionData)

        return {
            data : submission,
            success : true
        }
    }
}
