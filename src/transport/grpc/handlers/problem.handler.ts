import TYPES from "@/config/inversify/types";
import { ProblemMapper } from "@/dtos/mappers/ProblemMapper";
import { IProblemService } from "@/services/interfaces/problem.service.interface";
import { withGrpcErrorHandler } from "@/utils/errorHandler";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { AddTestCaseRequest, BulkUploadTestCasesRequest, CreateProblemRequest, 
    GetProblemPublicResponse, GetProblemRequest, ListProblemRequest, 
    ListProblemResponse, Problem, UpdateBasicProblemDetailsRequest, 
    RemoveTestCaseRequest, 
    AddSolutionCodeRequest,
    UpdateSolutionCodeRequest,
    RemoveSolutionCodeRequest,
    CheckQuestionIdRequest,
    CheckProblemTitleRequest} from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import { inject, injectable } from "inversify";

/**
 * Class Responsible for handling problem-related gRPC requests.
 * 
 * @class
 */
@injectable()
export class ProblemHandler {

    #_problemService : IProblemService;

    /**
     * Creates an instance of ProblemHandler.
     * 
     * @param problemService - Instance of IProblemService
     * @constructor
     */
    constructor(
        @inject(TYPES.IProblemService) problemService : IProblemService
    ){
        this.#_problemService = problemService;
    }

    createProblem = withGrpcErrorHandler<CreateProblemRequest, Problem>(
        async (call, callback) => {
            const req = call.request;
            const inDTO = ProblemMapper.toCreateProblemService(req)
            const result = await this.#_problemService.createProblem(inDTO);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null)
            }

            const outDTO = ProblemMapper.toOutDTO(result.data);
            return callback(null,outDTO);
        }
    );

    getProblem = withGrpcErrorHandler<GetProblemRequest, Problem>(
        async (call, callback) => {
            const req = call.request;
            const dto = ProblemMapper.toGetProblemDetails(req);
            const result = await this.#_problemService.getProblem(dto._id);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null);
            }

            return callback(null,result.data);
    });

    getProblemForPublic = withGrpcErrorHandler<GetProblemRequest, GetProblemPublicResponse>(
        async (call, callback) => {
            const req = call.request;
            const result = await this.#_problemService.getProblemPublic(req.Id);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null);
            }

            return callback(null,result.data);
        }
    );

    listProblems = withGrpcErrorHandler<ListProblemRequest, ListProblemResponse>(
        async (call, callback) => {
            const req = call.request;
            const dto = ProblemMapper.toListProblemService(req);
            const result = await this.#_problemService.listProblems(dto);
            const outDTO = result.body.map(p=>ProblemMapper.toOutListDTO(p)); 

            return callback(null,{
                currentPage : result.currentPage,
                problems : outDTO,
                totalItems : result.totalItems,
                totalPage : result.totalPages
            })
        }
    )

    updateBasicProblemDetails = withGrpcErrorHandler<UpdateBasicProblemDetailsRequest, Empty>(
        async (call, callback) => {
            const req = call.request;
            const dto = ProblemMapper.toUpdateBasicProblemDetailsServive(req);
            const result = await this.#_problemService.updateBasicProblemDetails(req.Id,dto);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null)
            }

            return callback(null,{});
        }
    )

    addTestCase = withGrpcErrorHandler<AddTestCaseRequest, Empty>(
        async (call, callback) => {
            const req = call.request;

            const dto = ProblemMapper.toAddTestCaseService(req)

            const result = await this.#_problemService.addTestCase(
                dto._id,
                dto.testCaseCollectionType,
                dto.testCase
            );

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null)
            }

            return callback(null,{});
        }
    );

    bulkUploadTestCases = withGrpcErrorHandler<BulkUploadTestCasesRequest, Empty>(
        async (call, callback) => {
            const req = call.request;
            const dto = ProblemMapper.toBulkUploadTestCaseService(req);
            const result = await this.#_problemService.bulkUploadTestCases(
                dto._id,
                dto.testCaseCollectionType,
                dto.testCase
            );

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null)
            }

            return callback(null,{});
        }
    )

    removeTestCase = withGrpcErrorHandler<RemoveTestCaseRequest, Empty>(
        async (call, callback) => {
            const req = call.request;
            const dto = ProblemMapper.toRemoveTestCaseService(req);
            const result = await this.#_problemService.removeTestCase(
                dto._id,
                dto.testCaseId,
                dto.testCaseCollectionType
            );
            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null)
            }

            return callback(null,{});
        }
    )

    addSolutionCode = withGrpcErrorHandler<AddSolutionCodeRequest, Empty>(
        async (call, callback) => {
            const req = call.request;
            const dto = ProblemMapper.toAddSolutionCodeService(req);
            const result = await this.#_problemService.addSolutionCode(
                dto._id,
                dto.solutionCode
            );

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null)
            }

            return callback(null,{});
        }
    )

    updateSolutionCode = withGrpcErrorHandler<UpdateSolutionCodeRequest, Empty>(
        async (call, callback) => {
            const req = call.request;
            const dto = ProblemMapper.toUpdateSolutionCodeService(req);
            const result = await this.#_problemService.updateSolutionCode(
                dto._id,
                dto.solutionCodeId,
                dto.solutionCode
            );

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null);
            }

            return callback(null,{});
        }
    )

    removeSolutionCode = withGrpcErrorHandler<RemoveSolutionCodeRequest, Empty>(
        async (call, callback) => {
            const req = call.request;
            const dto = ProblemMapper.toRemoveSolutionCodeService(req);
            const result = await this.#_problemService.removeSolutionCode(
                dto._id,
                dto.solutionCodeId
            );

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null);
            }

            return callback(null,{});
        }
    );

    checkQuestionIdAvailability = withGrpcErrorHandler<CheckQuestionIdRequest, Empty>(
        async (call, callback) => {
            const req = call.request;

            const result = await this.#_problemService.checkQuestionIdAvailability(req.questionId);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            }

            callback(null,{});
        }
    )

    checkProblemTitle = withGrpcErrorHandler<CheckProblemTitleRequest, Empty>(
        async (call, callback) => {
            const req = call.request;

            const result = await this.#_problemService.checkProblemTitleAvailability(req.title);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            };

            return callback(null,{});
        }
    )

    /**
     * 
     * @returns {Record<string, Function>} - An object containing the bound handler methods for the gRPC service.
     */
    getServerHandlers() : Record<string,Function> {
        return {
            createProblem : this.createProblem,
            getProblem : this.getProblem,
            getProblemForPublic : this.getProblemForPublic,
            listProblems : this.listProblems,
            updateBasicProblemDetails : this.updateBasicProblemDetails,
            addTestCase : this.addTestCase,
            bulkUploadTestCases : this.bulkUploadTestCases,
            removeTestCase : this.removeTestCase,
            addSolutionCode : this.addSolutionCode,
            updateSolutionCode : this.updateSolutionCode,
            removeSolutionCode : this.removeSolutionCode,
            checkQuestionIdAvailability : this.checkQuestionIdAvailability,
            checkProblemTitleAvail : this.checkProblemTitle,
        }
    }
}