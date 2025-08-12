import TYPES from "@/config/inversify/types";
import { SubmissionMapper } from "@/dtos/mappers/SubmissionMapper";
import { SystemErrorType } from "@/enums/ErrorTypes/SystemErrorType.enum";
import { IUpdateSubmissionService } from "@/services/submission/interfaces/updateSubmission.service.interface";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { UpdateSubmissionRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { inject, injectable } from "inversify";

/**
 * Class for handling updation of submission document.
 * 
 * @class
 */
@injectable()
export class GrpcUpdateSubmissionHandler {

    #_updateSubmissionService : IUpdateSubmissionService

    /**
     * 
     * @param updateSubmissionService - The service for updating submission document.
     * @constructor
     */
    constructor(
        @inject(TYPES.IUpdateSubmissionService)
        updateSubmissionService : IUpdateSubmissionService
    ){
        this.#_updateSubmissionService = updateSubmissionService
    }

    updateSubmission = async (
        call : ServerUnaryCall<UpdateSubmissionRequest,Empty>,
        callback : sendUnaryData<Empty>
    ) => {

        try {

            const req = call.request;
            const dto = SubmissionMapper.toUpdateSubmissionService(req);
            const result = await this.#_updateSubmissionService.execute(dto);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null);
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
     * This method ensures that the `updateSubmission` handler maintains the correct `this` context
     * when passed to the gRPC server. This is especially important since gRPC handlers
     * are called with a different execution context.
     *
     * @returns {object} The bound login handler for gRPC wrapped in an object.
     */
    getServiceHandler() : object {
        return {
            updateSubmission : this.updateSubmission.bind(this)
        }
    }
}