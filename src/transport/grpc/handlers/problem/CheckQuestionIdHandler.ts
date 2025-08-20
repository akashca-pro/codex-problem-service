import TYPES from "@/config/inversify/types";
import { SystemErrorType } from "@/enums/ErrorTypes/SystemErrorType.enum";
import { ICheckQuestionIdAvailablityService } from "@/services/problem/interfaces/checkQuestionId.service.interface";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { CheckQuestionIdRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { inject, injectable } from "inversify";

/**
 * Class for checking question id availability in problem document.
 * 
 * @class
 */
@injectable()
export class GrpcCheckQuestionIdAvailabilityHandler {

    #_CheckQuestionIdAvailabilityService : ICheckQuestionIdAvailablityService

    constructor(
        @inject(TYPES.ICheckQuestionIdAvailability)
        checkQuestionIdAvailabilityService : ICheckQuestionIdAvailablityService
    ){
        this.#_CheckQuestionIdAvailabilityService = checkQuestionIdAvailabilityService
    }

    checkQuestionIdAvailability = async (
        call : ServerUnaryCall<CheckQuestionIdRequest,Empty>,
        callback : sendUnaryData<Empty>
    ) => {
        try {
            const req = call.request;

            const result = await this.#_CheckQuestionIdAvailabilityService.execute(req.questionId);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            }

            callback(null,{});

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
     * This method ensures that the `checkQuestionIdAvailability` handler maintains the correct `this` context
     * when passed to the gRPC server. This is especially important since gRPC handlers
     * are called with a different execution context.
     *
     * @returns {object} The bound login handler for gRPC wrapped in an object.
     */
    getServiceHandler() : object {
        return {
            checkQuestionIdAvailability : this.checkQuestionIdAvailability.bind(this)
        }
    }

}