import TYPES from "@/config/inversify/types";
import { SystemErrorType } from "@/enums/ErrorTypes/SystemErrorType.enum";
import { IGetProblemPublicService } from "@/services/problem/interfaces/getProblemPublic.service.interface";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { GetProblemPublicResponse, GetProblemRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { inject, injectable } from "inversify";


/**
 * Class for handling get problem document for public.
 * 
 * @class
 */
@injectable()
export class GrpcGetProblemPublicHandler {

    #_getProblemPublicService : IGetProblemPublicService

    /**
     * 
     * @param getProblemService - The get problem public service.
     * @constructor
     */
    constructor(
        @inject(TYPES.IGetProblemPublicService)
        getProblemPublicService : IGetProblemPublicService
    ){
        this.#_getProblemPublicService = getProblemPublicService
    }

    getProblemForPublic = async (
        call : ServerUnaryCall<GetProblemRequest,GetProblemPublicResponse>,
        callback : sendUnaryData<GetProblemPublicResponse>
    ) => {

        try {

            const req = call.request;
            const result = await this.#_getProblemPublicService.execute(req.Id);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null);
            }

            return callback(null,result.data);
            
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
     * This method ensures that the `getProblemForPublic` handler maintains the correct `this` context
     * when passed to the gRPC server. This is especially important since gRPC handlers
     * are called with a different execution context.
     *
     * @returns {object} The bound login handler for gRPC wrapped in an object.
     */
    getServiceHandler() : object {
        return {
            getProblemForPublic : this.getProblemForPublic.bind(this)
        }
    }
}