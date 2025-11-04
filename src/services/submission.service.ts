import TYPES from "@/config/inversify/types";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { inject, injectable } from "inversify";
import { ISubmissionService } from "./interfaces/submission.service.interface";
import { ISubmissionRepository } from "@/repos/interfaces/submission.repository.interface";
import mongoose from "mongoose";
import { PaginationDTO } from "@/dtos/PaginationDTO";
import { CreateSubmissionRequest, GetSubmissionsRequest, ListProblemSpecificSubmissionRequest, UpdateSubmissionRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { IProblemRepository } from "@/repos/interfaces/problem.repository.interface";
import { PROBLEM_ERROR_MESSAGES, SUBMISSION_ERROR_MESSAGES } from "@/const/ErrorType.const"
import { SubmissionMapper } from "@/dtos/mappers/SubmissionMapper";
import logger from '@/utils/pinoLogger';
import { IFirstSubmissionRepository } from "@/repos/interfaces/firstSubmission.repository.interface";
import { ILeaderboard } from "@/libs/leaderboard/leaderboard.interface";
import { SCORE_MAP } from "@/const/ScoreMap.const";

/**
 * Class representing the service for managing submissions.
 * * @class
 */
@injectable()
export class SubmissionService implements ISubmissionService {

    #_submissionRepo : ISubmissionRepository;
    #_problemRepo : IProblemRepository;
    #_firstSubmissionRepo : IFirstSubmissionRepository;
    #_leaderboard : ILeaderboard;

    constructor(
        @inject(TYPES.ISubmissionRepository) submissionRepo : ISubmissionRepository,
        @inject(TYPES.IProblemRepository) problemRepo : IProblemRepository,
        @inject(TYPES.IFirstSubmissionRepository) firstSubmissionRepo : IFirstSubmissionRepository,
        @inject(TYPES.ILeaderboard) leaderboard : ILeaderboard
    ){
        this.#_submissionRepo = submissionRepo;
        this.#_problemRepo = problemRepo;
        this.#_firstSubmissionRepo = firstSubmissionRepo;
        this.#_leaderboard = leaderboard;
    }

    async createSubmission(data: CreateSubmissionRequest): Promise<ResponseDTO> {
        const method = 'createSubmission';
        logger.info(`[SERVICE] ${method} started`, { userId: data.userId, problemId: data.problemId, language: data.language });
        
        // Check for existing submission by user for this problem
        const submissionExist = await this.#_submissionRepo.findOne({
            userId : data.userId, problemId : data.problemId
        })
        
        const dto = SubmissionMapper.toCreateSubmissionService(data);
        const submissionData = {
            ...dto,
            isFirst : submissionExist ? false : true,
            problemId : new mongoose.Types.ObjectId(data.problemId),
        }
        
        logger.debug(`[SERVICE] ${method}: isFirst=${submissionData.isFirst}`, { userId: data.userId, problemId: data.problemId });

        const submission = await this.#_submissionRepo.create(submissionData)
        const outDTO = SubmissionMapper.toOutDTO(submission);
        
        logger.info(`[SERVICE] ${method} completed successfully`, { submissionId: submission._id.toString(), isFirst: submissionData.isFirst });
        
        return {
            data : outDTO,
            success : true
        }
    }

    async getSubmission(filter: GetSubmissionsRequest): Promise<PaginationDTO> {
        const method = 'getSubmission (Paginated List)';
        logger.info(`[SERVICE] ${method} started`, { page: filter.page, limit: filter.limit, userId: filter.userId, problemId: filter.problemId });

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
        
        logger.info(`[SERVICE] ${method} completed successfully`, { totalItems, currentPage: filter.page });

        return {
            body : outDTO,
            currentPage : filter.page,
            totalItems,
            totalPages
        }
    }

    async updateSubmission(request : UpdateSubmissionRequest): Promise<ResponseDTO> {
        const method = 'updateSubmission';
        logger.info(`[SERVICE] ${method} started`, { submissionId: request.Id, status: request.status });

        const updatedData = SubmissionMapper.toUpdateSubmissionService(request);
        const submissionId = request.Id;
        
        const submissionExist = await this.#_submissionRepo.findById(submissionId);
        if(!submissionExist){
            logger.warn(`[SERVICE] ${method} failed: Submission not found`, { submissionId });
            return {
                data : null,
                success : false,
                errorMessage : SUBMISSION_ERROR_MESSAGES.SUBMISSION_NOT_FOUND
            }
        }
        
        const updatedSubmission = await this.#_submissionRepo.update(submissionId, {
            executionResult : updatedData.executionResult,
            status : updatedData.status
        });

        if (updatedSubmission && updatedSubmission.status === 'accepted' && submissionExist.isFirst) {
            
            logger.info(`[SERVICE] ${method}: First accepted submission detected`, { submissionId, userId: updatedSubmission.userId });
            const score = SCORE_MAP[updatedSubmission.difficulty];

            if (score > 0) {
                try {
                    await Promise.all([
                        this.#_firstSubmissionRepo.create(updatedSubmission),
                        this.#_leaderboard.incrementScore(
                            updatedSubmission.userId,
                            updatedSubmission.country ?? '',
                            score
                        ),
                        this.#_leaderboard.incrementProblemsSolved(updatedSubmission.userId)
                    ])
                    logger.info(`[SERVICE] ${method}: Leaderboard score incremented and problems solved updated`, { userId: updatedSubmission.userId, score });

                } catch (leaderboardError) {
                    logger.error(`[SERVICE] ${method}: Failed to update FirstSubmission or Leaderboard`, { 
                        submissionId, 
                        userId: updatedSubmission.userId, 
                        error: leaderboardError 
                    });
                }
            } else {
                logger.warn(`[SERVICE] ${method}: No score found for difficulty ${updatedSubmission.difficulty}`, { submissionId });
            }
        }
        
        logger.info(`[SERVICE] ${method} completed successfully`, { submissionId, newStatus: request.status });

        return {
            data : updatedSubmission,
            success : true
        }
    }

    async listSubmissionByProblem(
        request: ListProblemSpecificSubmissionRequest
    ): Promise<ResponseDTO> {
        const method = 'listSubmissionByProblem';
        logger.info(`[SERVICE] ${method} started`, { problemId: request.problemId, userId: request.userId, cursor: request.nextCursor, limit: request.limit });

        const problem = await this.#_problemRepo.findByIdLean(request.problemId);
        if(!problem){
            logger.warn(`[SERVICE] ${method} failed: Problem not found`, { problemId: request.problemId });
            return {
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.PROBLEM_NOT_FOUND
            }
        }
        
        let filter: Record<string, any> = {};
        filter.problemId = problem._id;
        filter.status = { $nin: ['pending'] };
        filter.userId = request.userId;
        
        if(request.nextCursor){
            filter.createdAt = { $lt: new Date(request.nextCursor) }
            logger.debug(`[SERVICE] ${method}: Applied cursor filter`, { createdAtLt: request.nextCursor });
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
        
        logger.info(`[SERVICE] ${method} completed successfully`, { count: submissions.length, hasMore, nextCursor });

        return {
            data : outDTO,
            success : true,
        }
    }

    async listTopKGlobalLeaderboard(
        k: number
    ): Promise<ResponseDTO> {
        const method = 'listTopKGlobalLeaderboard';
        logger.info(`[SERVICE] ${method} started`, { k });
        const globalLeaderboard = await this.#_leaderboard.getTopKGlobal(k);
        logger.info(`[SERVICE] ${method} completed successfully`, { k });
        return {
            data : globalLeaderboard,
            success : true
        }
    }

    async listTopKCountryLeaderboard(
        country: string, 
        k: number
    ): Promise<ResponseDTO> {
        const method = 'listTopKCountryLeaderboard';
        logger.info(`[SERVICE] ${method} started`, { country, k });
        const countryLeaderboard = await this.#_leaderboard.getTopKEntity(country, k)

        logger.info(`[SERVICE] ${method} completed successfully`, { country, k });
        return {
            data : countryLeaderboard,
            success : true
        }
    }

    async getLeaderboardDetailsForUser(
        userId: string
    ): Promise<ResponseDTO> {
        const method = 'getLeaderboardDetails';
        logger.info(`[SERVICE] ${method} started`, { userId });
        const leaderboardDetails = await this.#_leaderboard.getUserLeaderboardData(userId);
        logger.info(`[SERVICE] ${method} completed successfully`, { userId });
        return {
            data : leaderboardDetails,
            success : true
        }
    }
}