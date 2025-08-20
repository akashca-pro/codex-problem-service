import TYPES from "@/config/inversify/types";
import { SystemErrorType } from "@/enums/ErrorTypes/SystemErrorType.enum";
import { ICheckProblemTitleAvailService } from "@/services/problem/interfaces/checkProblemTitle.service.interface";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { CheckProblemTitleRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { inject, injectable } from "inversify";

/**
 * Class for handle checking problem title availability service in problem document.
 * 
 * @class
 */
@injectable()
export class GrpcCheckProblemTitleAvailHandler {

    #_checkTitleAvailService : ICheckProblemTitleAvailService

    constructor(
        @inject(TYPES.ICheckProblemTitleAvailService)
        checkTitleAvailService : ICheckProblemTitleAvailService
    ){
        this.#_checkTitleAvailService = checkTitleAvailService
    }

    checkProblemTitle = async (
        call : ServerUnaryCall<CheckProblemTitleRequest,Empty>,
        callback : sendUnaryData<Empty>
    ) => {

        try {
            const req = call.request;

            const result = await this.#_checkTitleAvailService.execute(req.title);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage!),
                    message : result.errorMessage
                },null)
            };

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
     * This method ensures that the `checkProblemTitle` handler maintains the correct `this` context
     * when passed to the gRPC server. This is especially important since gRPC handlers
     * are called with a different execution context.
     *
     * @returns {object} The bound login handler for gRPC wrapped in an object.
     */
    getServiceHandler() : object {
        return {
            checkProblemTitle : this.checkProblemTitle.bind(this)
        }
    }
}