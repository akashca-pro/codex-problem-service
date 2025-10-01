import TYPES from "@/config/inversify/types";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { inject, injectable } from "inversify";
import { ISubmissionService } from "./interfaces/submission.service.interface";
import { ICreateSubmissionRequestDTO } from "@/dtos/submission/CreateSubmissionRequestDTO";
import { ISubmissionRepository } from "@/infra/repos/interfaces/submission.repository.interface";
import { SubmissionErrorType } from "@/enums/ErrorTypes/submissionErrorType.enum";
import mongoose from "mongoose";
import { PaginationDTO } from "@/dtos/PaginationDTO";
import { IGetSubmissionRequestDTO } from "@/dtos/submission/getSubmissionRequestDTO";
import { IUpdateSubmissionRequestDTO } from "@/dtos/submission/UpdateSubmissionRequestDTO";

/**
 * Class representing the service for managing submissions.
 * 
 * @class
 */
@injectable()
export class SubmissionService implements ISubmissionService {

    #_submissionRepo : ISubmissionRepository;

    /**
     * Creates an instance of SubmissionService.
     * 
     * @param submissionRepo - The submission repository instance.
     * @constructor
     */
    constructor(
        @inject(TYPES.ISubmissionRepository) submissionRepo : ISubmissionRepository
    ){
        this.#_submissionRepo = submissionRepo;
    }

    async createSubmission(data: ICreateSubmissionRequestDTO): Promise<ResponseDTO> {
        const submissionExist = await this.#_submissionRepo.findOne({
            userId : data.userId, problemId : data.problemId
        })
        const submissionData = {
            ...data,
            isFirst : submissionExist ? false : true,
            problemId : new mongoose.Types.ObjectId(data.problemId),
        }
        const submission = await this.#_submissionRepo.create(submissionData)
        return {
            data : submission,
            success : true
        }
    }

    async getSubmission(filter: IGetSubmissionRequestDTO): Promise<PaginationDTO> {
        const updatingfilter : Record<string, any> = {};
        if(filter.problemId) updatingfilter.problemId = filter.problemId;
        if(filter.battleId) updatingfilter.battleId = filter.battleId;
        if(filter.userId) updatingfilter.userId = filter.userId;
        const skip = (filter.page - 1) * filter.limit;
        const [totalItems,submissions] = await Promise.all([
            await this.#_submissionRepo.countDocuments(updatingfilter),
            await this.#_submissionRepo.findPaginated(updatingfilter,skip,filter.limit)
        ]);
        const totalPages = Math.ceil(totalItems/ filter.limit);
        return {
            body : submissions,
            currentPage : filter.page,
            totalItems,
            totalPages
        }

    }

    async updateSubmission(id: string, updatedData: IUpdateSubmissionRequestDTO): Promise<ResponseDTO> {
        const submissionExist = await this.#_submissionRepo.findById(id);
        if(!submissionExist){
            return {
                data : null,
                success : false,
                errorMessage : SubmissionErrorType.SubmissionNotFound
            }
        }
        const updatedSubmission = await this.#_submissionRepo.update(id, {
            executionResult : updatedData.executionResult,
            status : updatedData.status
        });
        return {
            data : updatedSubmission,
            success : true
        }
    }
}