import TYPES from "@/config/inversify/types";
import { SystemErrorType } from "@/enums/ErrorTypes/SystemErrorType.enum";
import { IGetProblemService } from "@/services/problem/interfaces/getProblem.service.interface";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { GetProblemRequest, Problem } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { inject, injectable } from "inversify";


/**
 * Class for handling get problem document.
 * 
 * @class
 */
@injectable()
export class GrpcGetProblemHandler {

    #_getProblemService : IGetProblemService

    /**
     * 
     * @param getProblemService - The problem service.
     * @constructor
     */
    constructor(
        @inject(TYPES.IGetProblemService)
        getProblemService : IGetProblemService
    ){
        this.#_getProblemService = getProblemService
    }

    getProblem = async (
        call : ServerUnaryCall<GetProblemRequest,Problem>,
        callback : sendUnaryData<Problem>
    ) => {

        try {
            
            const req = call.request;

            const result = await this.#_getProblemService.execute({
                _id : req.Id,
                questionId : req.questionId,
                title : req.title
            })

            if(!result.success){
                callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null);
            }

            callback(null,result.data);

        } catch (error) {
            logger.error(SystemErrorType.InternalServerError,error);
            return callback({
                code : Status.INTERNAL,
                message : SystemErrorType.InternalServerError
            },null);
        }
    }

    /**
     * Returns the bound handler method for the gRPC service.
     *
     * @remarks
     * This method ensures that the `createProblem` handler maintains the correct `this` context
     * when passed to the gRPC server. This is especially important since gRPC handlers
     * are called with a different execution context.
     *
     * @returns {object} The bound login handler for gRPC wrapped in an object.
     */
    getServiceHandler() : object {
        return {
            getProblem : this.getProblem.bind(this)
        }
    }
}