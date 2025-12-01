import TYPES from "@/config/inversify/types";
import { ISubmissionService } from "@/services/interfaces/submission.service.interface";
import { withGrpcErrorHandler } from "@/utils/errorHandler";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { CreateSubmissionRequest, GetDashboardStatsRequest, GetDashboardStatsResponse, GetPreviousHintsRequest, GetPreviousHintsResponse, GetProblemSubmissionStatsResponse, GetSubmissionsRequest, GetSubmissionsResponse, ListProblemSpecificSubmissionRequest, ListProblemSpecificSubmissionResponse, ListTopKCountryLeaderboardRequest, ListTopKCountryLeaderboardResponse, ListTopKGlobalLeaderboardRequest, ListTopKGlobalLeaderboardResponse, RemoveUserRequest, RequestFullSolutionRequest, RequestFullSolutionResponse, RequestHintRequest, RequestHintResponse, Submission, UpdateCountryRequest, UpdateSubmissionRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import { inject, injectable } from "inversify";
import logger from '@/utils/pinoLogger';
import { UntypedServiceImplementation } from "@grpc/grpc-js";

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

    listTopKGlobalLeaderboard = withGrpcErrorHandler<ListTopKGlobalLeaderboardRequest, ListTopKGlobalLeaderboardResponse>(
        async (call, callback) => {
            const method = 'listTopKGlobalLeaderboard';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { k: req.k });
            const result = await this.#_submissionService.listTopKGlobalLeaderboard(req);
            logger.info(`[gRPC] ${method} completed successfully`, { k: req.k });
            return callback(null,result.data);
        }
    )

    listTopKCountryLeaderboard = withGrpcErrorHandler<ListTopKCountryLeaderboardRequest, ListTopKCountryLeaderboardResponse>(
        async (call, callback) => {
            const method = 'listTopKCountryLeaderboard';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { country: req.country, k: req.k });
            const result = await this.#_submissionService.listTopKCountryLeaderboard(req); 
            logger.info(`[gRPC] ${method} completed successfully`, { country: req.country, k: req.k });
            return callback(null,result.data);
        }
    )

    getDashboardStats = withGrpcErrorHandler<GetDashboardStatsRequest, GetDashboardStatsResponse>(
        async (call, callback) => {
            const method = 'getDashboardStats';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { userId: req.userId });
            const result = await this.#_submissionService.getUserDashboardStats(req);
            logger.info(`[gRPC] ${method} completed successfully`);
            return callback(null, result.data)
        }
    )

    getProblemSubmissionStats = withGrpcErrorHandler<Empty, GetProblemSubmissionStatsResponse>(
        async (call, callback) => {
            const method = 'getAdminDashboardStats';
            logger.info(`[gRPC] ${method} started`);
            const result = await this.#_submissionService.getProblemSubmissionStats();
            logger.info(`[gRPC] ${method} completed successfully`);
            return callback(null, result.data)
        }
    )

    updateCountryInLeaderboard = withGrpcErrorHandler<UpdateCountryRequest, Empty>(
        async (call, callback) => {
            const method = 'updateCountryInLeaderboard';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { userId: req.userId, country: req.country });
            const result = await this.#_submissionService.updateCountryInLeaderboard(req);
            logger.info(`[gRPC] ${method} completed successfully`);
            return callback(null, result.data)
        }
    )

    removeUserInLeaderboard = withGrpcErrorHandler<RemoveUserRequest, Empty>(
        async (call, callback) => {
            const method = 'removeUserInLeaderboard';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { userId: req.userId });
            const result = await this.#_submissionService.removeUserInLeaderboard(req);
            logger.info(`[gRPC] ${method} completed successfully`);
            return callback(null, result.data)
        }
    )

    getPreviousHints = withGrpcErrorHandler<GetPreviousHintsRequest, GetPreviousHintsResponse>(
        async (call, callback) => {
            const method = 'getPreviousHints';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { problemId : req.problemId, userId : req.userId });
            const result = await this.#_submissionService.getPreviousHints(req);
            logger.info(`[gRPC] ${method} completed successfully`, { problemId : req.problemId, userId : req.userId });
            return callback(null,result.data);
        }
    )

    requestHint = withGrpcErrorHandler<RequestHintRequest, RequestHintResponse>(
        async (call, callback) => {
            const method = 'requestHint';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { problemId : req.problemId, userId : req.userId });
            const result = await this.#_submissionService.requestAiHint(req);
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { problemId: req.problemId });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            }
            logger.info(`[gRPC] ${method} completed successfully`, { problemId : req.problemId, userId : req.userId });
            return callback(null,result.data);
        }
    )

    requestFullSolution = withGrpcErrorHandler<RequestFullSolutionRequest, RequestFullSolutionResponse>(
        async (call, callback) => {
            const method = 'requestFullSolution';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { problemId : req.problemId, userId : req.userId});
            const result = await this.#_submissionService.requestFullSolution(req);
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { problemId: req.problemId });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            }
            logger.info(`[gRPC] ${method} completed successfully`, { problemId : req.problemId, userId : req.userId });
            return callback(null,result.data);
        }
    )

    getServiceHandler() : UntypedServiceImplementation {
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
            getProblemSubmissionStats : this.getProblemSubmissionStats,
            getPreviousHints : this.getPreviousHints,
            requestHint : this.requestHint,
            requestFullSolution : this.requestFullSolution,
        }
    }
}