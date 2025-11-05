import TYPES from "@/config/inversify/types";
import { ISubmissionService } from "@/services/interfaces/submission.service.interface";
import { withGrpcErrorHandler } from "@/utils/errorHandler";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { CreateSubmissionRequest, GetDashboardStatsRequest, GetDashboardStatsResponse, GetSubmissionsRequest, GetSubmissionsResponse, ListProblemSpecificSubmissionRequest, ListProblemSpecificSubmissionResponse, ListTopKCountryLeaderboardRequest, ListTopKCountryLeaderboardResponse, RemoveUserRequest, Submission, UpdateCountryRequest, UpdateSubmissionRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import { inject, injectable } from "inversify";
import logger from '@/utils/pinoLogger';

/**
 * Class Responsible for handling gRPC submissions requests.
 * * @class
 */
@injectable()
export class SubmissionHandler {

    #_submissionService : ISubmissionService;

    /**
     * Creates an instance of SubmissionHandler.
     * * @param submissionService - The submission service instance.
     * @constructor
     */
    constructor(
        @inject(TYPES.ISubmissionService) submissionService : ISubmissionService
    ){
        this.#_submissionService = submissionService;
    }

    createSubmission = withGrpcErrorHandler<CreateSubmissionRequest, Submission>(
        async (call, callback) => {
            const method = 'createSubmission';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { userId: req.userId, problemId: req.problemId, language: req.language });
            
            const result = await this.#_submissionService.createSubmission(req);
            
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { userId: req.userId, problemId: req.problemId });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            };
            
            logger.info(`[gRPC] ${method} completed successfully`, { submissionId: result.data?.submissionId, userId: req.userId });
            return callback(null,result.data);
        }
    );

    updateSubmission = withGrpcErrorHandler<UpdateSubmissionRequest, Empty>(
        async (call, callback) => {
            const method = 'updateSubmission';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { submissionId: req.Id, status: req.status });

            const result = await this.#_submissionService.updateSubmission(req);
            
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { submissionId: req.Id });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null);
            }
            
            logger.info(`[gRPC] ${method} completed successfully`, { submissionId: req.Id, status: req.status });
            return callback(null,{});
        }
    );

    getSubmissions = withGrpcErrorHandler<GetSubmissionsRequest, GetSubmissionsResponse>(
        async (call, callback) => {
            const method = 'getSubmissions';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { page: req.page, limit: req.limit, userId: req.userId });

            const result = await this.#_submissionService.getSubmission(req);
            
            logger.info(`[gRPC] ${method} completed successfully`, { userId: req.userId, totalItems: result.totalItems });

            return callback(null,{
                submissions : result.body,
                currentPage : result.currentPage,
                totalItems : result.totalItems,
                totalPage : result.totalPages
            })
        }
    );

    listProblemSpecificSubmission = withGrpcErrorHandler<ListProblemSpecificSubmissionRequest, ListProblemSpecificSubmissionResponse>(
        async (call, callback) => {
            const method = 'listProblemSpecificSubmission';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { problemId: req.problemId, userId: req.userId });

            const result = await this.#_submissionService.listSubmissionByProblem(req);
            
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { problemId: req.problemId });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            }
            
            logger.info(`[gRPC] ${method} completed successfully`, { problemId: req.problemId, count: result.data?.submissions?.length });
            return callback(null,result.data);
        }
    )

    listTopKGlobalLeaderboard = withGrpcErrorHandler<ListTopKCountryLeaderboardRequest, ListTopKCountryLeaderboardResponse>(
        async (call, callback) => {
            const method = 'listTopKGlobalLeaderboard';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { k: req.k });
            const result = await this.#_submissionService.listTopKGlobalLeaderboard(req.k);
            logger.info(`[gRPC] ${method} completed successfully`, { k: req.k });
            return callback(null,result.data);
        }
    )

    listTopKCountryLeaderboard = withGrpcErrorHandler<ListTopKCountryLeaderboardRequest, ListTopKCountryLeaderboardResponse>(
        async (call, callback) => {
            const method = 'listTopKCountryLeaderboard';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { country: req.country, k: req.k });
            const result = await this.#_submissionService.listTopKCountryLeaderboard(req.country, req.k); 
            logger.info(`[gRPC] ${method} completed successfully`, { country: req.country, k: req.k });
            return callback(null,result.data);
        }
    )

    getDashboardStats = withGrpcErrorHandler<GetDashboardStatsRequest, GetDashboardStatsResponse>(
        async (call, callback) => {
            const method = 'getDashboardStats';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { userId: req.userId });
            const result = await this.#_submissionService.getDashboardStats(req.userId, req.userTimezone);
            return callback(null, result.data)
        }
    )

    updateCountryInLeaderboard = withGrpcErrorHandler<UpdateCountryRequest, Empty>(
        async (call, callback) => {
            const method = 'updateCountryInLeaderboard';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { userId: req.userId, country: req.country });
            const result = await this.#_submissionService.updateCountryInLeaderboard(req.userId, req.country);
            return callback(null, result.data)
        }
    )

    removeUserInLeaderboard = withGrpcErrorHandler<RemoveUserRequest, Empty>(
        async (call, callback) => {
            const method = 'removeUserInLeaderboard';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { userId: req.userId });
            const result = await this.#_submissionService.removeUserInLeaderboard(req.userId);
            return callback(null, result.data)
        }
    )

    /**
     * Gets the service handlers for gRPC.
     * * @returns {Record<string, Function>} - An object containing the bound handler methods for the gRPC service.
     */
    getServiceHandler() : Record<string, Function> {
        return {
            createSubmission : this.createSubmission,
            getSubmissions : this.getSubmissions,
            updateSubmission : this.updateSubmission,
            listProblemSpecificSubmission : this.listProblemSpecificSubmission,
            listTopKGlobalLeaderboard : this.listTopKGlobalLeaderboard,
            listTopKCountryLeaderboard : this.listTopKCountryLeaderboard,
            getDashboardStats : this.getDashboardStats,
            updateCountryInLeaderboard : this.updateCountryInLeaderboard,
            removeUserInLeaderboard : this.removeUserInLeaderboard,
        }
    }
}