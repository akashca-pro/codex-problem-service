import TYPES from "@/config/inversify/types";
import { ProblemMapper } from "@/dtos/mappers/ProblemMapper";
import { SystemErrorType } from "@/enums/ErrorTypes/SystemErrorType.enum";
import { IUpdateBasicProblemDetailsService } from "@/services/problem/interfaces/updateBasicProblemDetails.service.interface";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { UpdateBasicProblemDetailsRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { inject, injectable } from "inversify";

/**
 * Class for handling updating problem document.
 * 
 * @class
 */
@injectable()
export class GrpcUpdateBasicProblemDetailsHandler {

    #_updateBasicProblemDetailsService : IUpdateBasicProblemDetailsService

    /**
     * 
     * @param updateBasicProblemDetailsService - The service for updating basic details of the problem.
     * @constructor
     */
    constructor(
        @inject(TYPES.IUpdateBasicProblemDetailsService)
        updateBasicProblemDetailsService : IUpdateBasicProblemDetailsService
    ){
        this.#_updateBasicProblemDetailsService = updateBasicProblemDetailsService
    }

    updateBasicProblemDetails = async (
        call : ServerUnaryCall<UpdateBasicProblemDetailsRequest, Empty>,
        callback : sendUnaryData<Empty>
    ) => {

        try {
            
            const req = call.request;

            const dto = ProblemMapper.toUpdateBasicProblemDetailsServive(req);

            const result = await this.#_updateBasicProblemDetailsService.execute(req.Id,dto);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null)
            }

            return callback(null,{});

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
            updateBasicProblemDetails : this.updateBasicProblemDetails.bind(this)
        }
    }
}