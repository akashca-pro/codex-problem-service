import TYPES from "@/config/inversify/types";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { inject, injectable } from "inversify";
import { ISubmissionService } from "./interfaces/submission.service.interface";
import { ISubmissionRepository } from "@/infra/repos/interfaces/submission.repository.interface";
import mongoose from "mongoose";
import { PaginationDTO } from "@/dtos/PaginationDTO";
import { CreateSubmissionRequest, GetSubmissionsRequest, ListProblemSpecificSubmissionRequest, UpdateSubmissionRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import { PROBLEM_ERROR_MESSAGES, SUBMISSION_ERROR_MESSAGES } from "@/const/ErrorType.const"
import { SubmissionMapper } from "@/dtos/mappers/SubmissionMapper";

/**
 * Class representing the service for managing submissions.
 * 
 * @class
 */
@injectable()
export class SubmissionService implements ISubmissionService {

    #_submissionRepo : ISubmissionRepository;
    #_problemRepo : IProblemRepository;

    /**
     * Creates an instance of SubmissionService.
     * 
     * @param submissionRepo - The submission repository instance.
     * @constructor
     */
    constructor(
        @inject(TYPES.ISubmissionRepository) submissionRepo : ISubmissionRepository,
        @inject(TYPES.IProblemRepository) problemRepo : IProblemRepository
    ){
        this.#_submissionRepo = submissionRepo;
        this.#_problemRepo = problemRepo
    }

    async createSubmission(data: CreateSubmissionRequest): Promise<ResponseDTO> {
        const submissionExist = await this.#_submissionRepo.findOne({
            userId : data.userId, problemId : data.problemId
        })
        const dto = SubmissionMapper.toCreateSubmissionService(data);
        const submissionData = {
            ...dto,
            isFirst : submissionExist ? false : true,
            problemId : new mongoose.Types.ObjectId(data.problemId),
        }
        const submission = await this.#_submissionRepo.create(submissionData)
        const outDTO = SubmissionMapper.toOutDTO(submission);
        return {
            data : outDTO,
            success : true
        }
    }

    async getSubmission(filter: GetSubmissionsRequest): Promise<PaginationDTO> {
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
        const outDTO = submissions.map(SubmissionMapper.toOutDTO);
        return {
            body : outDTO,
            currentPage : filter.page,
            totalItems,
            totalPages
        }
    }

    async updateSubmission(request : UpdateSubmissionRequest): Promise<ResponseDTO> {
        const updatedData = SubmissionMapper.toUpdateSubmissionService(request);
        const submissionExist = await this.#_submissionRepo.findById(request.Id);
        if(!submissionExist){
            return {
                data : null,
                success : false,
                errorMessage : SUBMISSION_ERROR_MESSAGES.SUBMISSION_NOT_FOUND
            }
        }
        const updatedSubmission = await this.#_submissionRepo.update(request.Id, {
            executionResult : updatedData.executionResult,
            status : updatedData.status
        });
        return {
            data : updatedSubmission,
            success : true
        }
    }

    async listSubmissionByProblem(
        request: ListProblemSpecificSubmissionRequest
    ): Promise<ResponseDTO> {

        const problem = await this.#_problemRepo.findByIdLean(request.problemId);
        if(!problem){
            return {
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.PROBLEM_NOT_FOUND
            }
        }
        let filter: Record<string, any> = {};
        filter.problemId = problem._id;
        filter.userId = request.userId;
        if(request.nextCursor){
            filter.createdAt = { $lt: new Date(request.nextCursor) }
        }
        const select = ['status','language','executionResult','problemId','userId','createdAt']
        const submissions = await this.#_submissionRepo.findPaginatedLean(
            filter,
            0,          
            request.limit,
            select,
            { createdAt: -1 }
        );
        let nextCursor: string | null = null;
        if (submissions.length === request.limit) {
            nextCursor = submissions[submissions.length - 1].createdAt.toISOString();
        }
        const hasMore = submissions.length === request.limit
        const outDTO = SubmissionMapper.toListProblemSpecificSubmissions(
            submissions,
            nextCursor ?? '',
            hasMore
        )
        return {
            data : outDTO,
            success : true,
        }
    }
}