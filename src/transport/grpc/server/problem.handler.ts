import TYPES from "@/config/inversify/types";
import { IProblemService } from "@/services/interfaces/problem.service.interface";
import { withGrpcErrorHandler } from "@/utils/errorHandler";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { AddTestCaseRequest, BulkUploadTestCasesRequest, CreateProblemRequest, 
    GetProblemPublicResponse, GetProblemRequest, ListProblemRequest, 
    ListProblemResponse, Problem, UpdateBasicProblemDetailsRequest, 
    RemoveTestCaseRequest, 
    CheckQuestionIdRequest,
    CheckProblemTitleRequest,
    UpdateTemplateCodeRequest,
} from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import { inject, injectable } from "inversify";
import logger from '@/utils/pinoLogger'; // Import the logger
import { UntypedServiceImplementation } from "@grpc/grpc-js";

/**
 * Class Responsible for handling problem-related gRPC requests.
 * 
 * @class
 */
@injectable()
export class ProblemHandler {

    #_problemService : IProblemService;

    constructor(
        @inject(TYPES.IProblemService) problemService : IProblemService
    ){
        this.#_problemService = problemService;
    }

    createProblem = withGrpcErrorHandler<CreateProblemRequest, Problem>(
        async (call, callback) => {
            const method = 'createProblem';
            logger.info(`[gRPC] ${method} started`, { title: call.request.title, questionId: call.request.questionId });
            
            const result = await this.#_problemService.createProblem(call.request);
            
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { questionId: call.request.questionId });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            }
            logger.info(`[gRPC] ${method} completed successfully`, { problemId: result.data?.problemId });
            return callback(null, result.data);
        }
    );

    getProblem = withGrpcErrorHandler<GetProblemRequest, Problem>(
        async (call, callback) => {
            const method = 'getProblem';
            logger.info(`[gRPC] ${method} started`, { problemId: call.request.Id });

            const result = await this.#_problemService.getProblem(call.request);
            
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { problemId: call.request.Id });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }
            logger.info(`[gRPC] ${method} completed successfully`, { problemId: call.request.Id });
            return callback(null,result.data);
    });

    getProblemForPublic = withGrpcErrorHandler<GetProblemRequest, GetProblemPublicResponse>(
        async (call, callback) => {
            const method = 'getProblemForPublic';
            logger.info(`[gRPC] ${method} started`, { problemId: call.request.Id, questionId: call.request.questionId });

            const result = await this.#_problemService.getProblemPublic(call.request);
            
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { problemId: call.request.Id });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null);
            }
            logger.info(`[gRPC] ${method} completed successfully`, { problemId: call.request.Id });
            return callback(null,result.data);
        }
    );

    listProblems = withGrpcErrorHandler<ListProblemRequest, ListProblemResponse>(
        async (call, callback) => {
            const method = 'listProblems';
            logger.info(`[gRPC] ${method} started`, { page: call.request.page, limit: call.request.limit, difficulty: call.request.difficulty });
            
            const result = await this.#_problemService.listProblems(call.request);

            logger.info(`[gRPC] ${method} completed successfully`, { totalItems: result.totalItems, currentPage: result.currentPage });
            
            return callback(null,{
                currentPage : result.currentPage,
                problems : result.body,
                totalItems : result.totalItems,
                totalPage : result.totalPages
            })
        }
    )

    updateBasicProblemDetails = withGrpcErrorHandler<UpdateBasicProblemDetailsRequest, Empty>(
        async (call, callback) => {
            const method = 'updateBasicProblemDetails';
            logger.info(`[gRPC] ${method} started`, { problemId: call.request.Id });

            const result = await this.#_problemService.updateBasicProblemDetails(call.request);
            
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { problemId: call.request.Id });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            }
            logger.info(`[gRPC] ${method} completed successfully`, { problemId: call.request.Id });
            return callback(null,{});
        }
    )

    addTestCase = withGrpcErrorHandler<AddTestCaseRequest, Empty>(
        async (call, callback) => {
            const method = 'addTestCase';
            logger.info(`[gRPC] ${method} started`, { problemId: call.request.Id });

            const result = await this.#_problemService.addTestCase(call.request);
            
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { problemId: call.request.Id });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            }
            logger.info(`[gRPC] ${method} completed successfully`, { problemId: call.request.Id });
            return callback(null,{});
        }
    );

    bulkUploadTestCases = withGrpcErrorHandler<BulkUploadTestCasesRequest, Empty>(
        async (call, callback) => {
            const method = 'bulkUploadTestCases';
            logger.info(`[gRPC] ${method} started`, { problemId: call.request.Id, count: call.request.testCase?.length });

            const result = await this.#_problemService.bulkUploadTestCases(call.request);
            
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { problemId: call.request.Id });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            }
            logger.info(`[gRPC] ${method} completed successfully`, { problemId: call.request.Id, uploadedCount: call.request.testCase?.length });
            return callback(null,{});
        }
    )

    removeTestCase = withGrpcErrorHandler<RemoveTestCaseRequest, Empty>(
        async (call, callback) => {
            const method = 'removeTestCase';
            logger.info(`[gRPC] ${method} started`, { problemId: call.request.Id, testCaseId: call.request.testCaseId });

            const result = await this.#_problemService.removeTestCase(call.request);
            
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { problemId: call.request.Id, testCaseId: call.request.testCaseId });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            }
            logger.info(`[gRPC] ${method} completed successfully`, { problemId: call.request.Id, testCaseId: call.request.testCaseId });
            return callback(null,{});
        }
    )

    checkQuestionIdAvailability = withGrpcErrorHandler<CheckQuestionIdRequest, Empty>(
        async (call, callback) => {
            const method = 'checkQuestionIdAvailability';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { questionId: req.questionId });

            const result = await this.#_problemService.checkQuestionIdAvailability(req.questionId);
            
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { questionId: req.questionId });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            }
            logger.info(`[gRPC] ${method} completed successfully (Available)`, { questionId: req.questionId });
            callback(null,{});
        }
    )

    checkProblemTitle = withGrpcErrorHandler<CheckProblemTitleRequest, Empty>(
        async (call, callback) => {
            const method = 'checkProblemTitle';
            const req = call.request;
            logger.info(`[gRPC] ${method} started`, { title: req.title });

            const result = await this.#_problemService.checkProblemTitleAvailability(req.title);
            
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { title: req.title });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            };
            logger.info(`[gRPC] ${method} completed successfully (Available)`, { title: req.title });
            return callback(null,{});
        }
    )

    updateTemplateCode = withGrpcErrorHandler<UpdateTemplateCodeRequest, Empty>(
        async (call, callback) => {
            const method = 'updateTemplateCode';
            logger.info(`[gRPC] ${method} started`, { problemId: call.request.Id });

            const result = await this.#_problemService.updateTemplateCode(call.request);
            
            if(!result.success){
                logger.warn(`[gRPC] ${method} failed: ${result.errorMessage}`, { problemId: call.request.Id });
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            };
            logger.info(`[gRPC] ${method} completed successfully`, { problemId: call.request.Id });
            return callback(null, {});
        }
    )

    getServerHandlers() : UntypedServiceImplementation {
        return {
            createProblem : this.createProblem,
            getProblem : this.getProblem,
            getProblemForPublic : this.getProblemForPublic,
            listProblems : this.listProblems,
            updateBasicProblemDetails : this.updateBasicProblemDetails,
            addTestCase : this.addTestCase,
            bulkUploadTestCases : this.bulkUploadTestCases,
            removeTestCase : this.removeTestCase,
            checkQuestionIdAvailability : this.checkQuestionIdAvailability,
            checkProblemTitle : this.checkProblemTitle,
            updateTemplateCode : this.updateTemplateCode,
        }
    }
}