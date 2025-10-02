import TYPES from "@/config/inversify/types";
import { ISubmissionService } from "@/services/interfaces/submission.service.interface";
import { withGrpcErrorHandler } from "@/utils/errorHandler";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { CreateSubmissionRequest, GetSubmissionsRequest, GetSubmissionsResponse, ListProblemSpecificSubmissionRequest, ListProblemSpecificSubmissionResponse, Submission, UpdateSubmissionRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import { inject, injectable } from "inversify";

/**
 * Class Responsible for handling gRPC submissions requests.
 * 
 * @class
 */
@injectable()
export class SubmissionHandler {

    #_submissionService : ISubmissionService;

    /**
     * Creates an instance of SubmissionHandler.
     * 
     * @param submissionService - The submission service instance.
     * @constructor
     */
    constructor(
        @inject(TYPES.ISubmissionService) submissionService : ISubmissionService
    ){
        this.#_submissionService = submissionService;
    }

    createSubmission = withGrpcErrorHandler<CreateSubmissionRequest, Submission>(
        async (call, callback) => {
            const req = call.request;
            const result = await this.#_submissionService.createSubmission(req);
            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            };
            return callback(null,result.data);
        }
    );

    updateSubmission = withGrpcErrorHandler<UpdateSubmissionRequest, Empty>(
        async (call, callback) => {
            const req = call.request;
            const result = await this.#_submissionService.updateSubmission(req);
            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null);
            }
            return callback(null,{});
        }
    );

    getSubmissions = withGrpcErrorHandler<GetSubmissionsRequest, GetSubmissionsResponse>(
        async (call, callback) => {
            const req = call.request;
            const result = await this.#_submissionService.getSubmission(req);
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
            const req = call.request;
            const result = await this.#_submissionService.listSubmissionByProblem(req);
            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            }
            return callback(null,result.data);
        }
    )

    /**
     * Gets the service handlers for gRPC.
     * 
     * @returns {Record<string, Function>} - An object containing the bound handler methods for the gRPC service.
     */
    getServiceHandler() : Record<string, Function> {
        return {
            createSubmission : this.createSubmission,
            getSubmissions : this.getSubmissions,
            updateSubmission : this.updateSubmission,
            listProblemSpecificSubmission : this.listProblemSpecificSubmission,
        }
    }
}