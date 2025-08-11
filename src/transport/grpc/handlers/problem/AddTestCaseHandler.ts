import TYPES from "@/config/inversify/types";
import { ProblemMapper } from "@/dtos/mappers/ProblemMapper";
import { SystemErrorType } from "@/enums/ErrorTypes/SystemErrorType.enum";
import { IAddTestCaseService } from "@/services/problem/interfaces/addTestCase.service.interface";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { AddTestCaseRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { inject, injectable } from "inversify";


/**
 * Class for handling adding test case to a problem document.
 * 
 * @class
 */
@injectable()
export class GrpcAddTestCaseHandler {

    #_addTestCaseService : IAddTestCaseService

    constructor(
        @inject(TYPES.IAddTestCaseService)
        addTestCaseService : IAddTestCaseService
    ){
        this.#_addTestCaseService = addTestCaseService
    }

    addTestCase = async (
        call : ServerUnaryCall<AddTestCaseRequest,Empty>,
        callback : sendUnaryData<Empty>
    ) => {

        try {
            
            const req = call.request;

            const dto = ProblemMapper.toAddTestCaseService(req)

            const result = await this.#_addTestCaseService.execute(dto);

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
            addTestCase : this.addTestCase.bind(this)
        }
    }
}