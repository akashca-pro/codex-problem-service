import TYPES from "@/config/inversify/types";
import { ProblemMapper } from "@/dtos/mappers/ProblemMapper";
import { SystemErrorType } from "@/enums/ErrorTypes/SystemErrorType.enum";
import { IBulkUploadTestCaseService } from "@/services/problem/interfaces/bulkUploadTestCase.service.interface";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { BulkUploadTestCasesRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Empty } from "@akashcapro/codex-shared-utils/dist/proto/compiled/google/protobuf/empty";
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { inject, injectable } from "inversify";

/**
 * Class for handling bulk uploading test case to a problem document.
 * 
 * @class
 */
@injectable()
export class GrpcBulkUploadTestCaseHandler {

    #_bulkUploadTestCaseService : IBulkUploadTestCaseService

    /**
     * 
     * @param bulkUploadTestCaseService - The service for bulk uploading test cases.
     * @constructor
     */
    constructor(
        @inject(TYPES.IBulkUploadTestCaseService)
        bulkUploadTestCaseService : IBulkUploadTestCaseService
    ){
        this.#_bulkUploadTestCaseService = bulkUploadTestCaseService
    }

    bulkUploadTestCases = async (
        call : ServerUnaryCall<BulkUploadTestCasesRequest,Empty>,
        callback : sendUnaryData<Empty>
    ) => {

        try {

            const req = call.request;

            const dto = ProblemMapper.toBulkUploadTestCaseService(req);

            const result = await this.#_bulkUploadTestCaseService.execute(dto);

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
     * This method ensures that the `bulkUploadTestCases` handler maintains the correct `this` context
     * when passed to the gRPC server. This is especially important since gRPC handlers
     * are called with a different execution context.
     *
     * @returns {object} The bound login handler for gRPC wrapped in an object.
     */
    getServiceHandler() : object {
        return {
            bulkUploadTestCases : this.bulkUploadTestCases.bind(this)
        }
    }
}