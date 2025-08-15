import TYPES from "@/config/inversify/types";
import { ProblemMapper } from "@/dtos/mappers/ProblemMapper";
import { SystemErrorType } from "@/enums/ErrorTypes/SystemErrorType.enum";
import { IRemoveTestCaseService } from "@/services/problem/interfaces/removeTestCase.service.interface";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { RemoveTestCaseRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { inject, injectable } from "inversify";

/**
 * Class for handling removing test case in a problem document.
 * 
 * @class
 */
@injectable()
export class GrpcRemoveTestCaseHandler {

    #_removeTestCaseService : IRemoveTestCaseService

    /**
     * 
     * @param removeTestCaseService - The service for removing test case.
     * @constructor
     */
    constructor(
        @inject(TYPES.IRemoveTestCaseService)
        removeTestCaseService : IRemoveTestCaseService
    ){
        this.#_removeTestCaseService = removeTestCaseService
    }

    removeTestCase = async (
        call : ServerUnaryCall<RemoveTestCaseRequest,Empty>,
        callback : sendUnaryData<Empty>
    ) => {

        try {
            const req = call.request;
            const dto = ProblemMapper.toRemoveTestCaseService(req);
            const result = await this.#_removeTestCaseService.execute(dto);
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
     * This method ensures that the `removeTestCase` handler maintains the correct `this` context
     * when passed to the gRPC server. This is especially important since gRPC handlers
     * are called with a different execution context.
     *
     * @returns {object} The bound login handler for gRPC wrapped in an object.
     */
    getServiceHandler() : object {
        return {
            removeTestCase : this.removeTestCase.bind(this)
        }
    }
}