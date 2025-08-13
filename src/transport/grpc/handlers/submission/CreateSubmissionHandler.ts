import TYPES from "@/config/inversify/types";
import { SubmissionMapper } from "@/dtos/mappers/SubmissionMapper";
import { SystemErrorType } from "@/enums/ErrorTypes/SystemErrorType.enum";
import { ICreateSubmissionService } from "@/services/submission/interfaces/createSubmission.service.interface";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { CreateSubmissionRequest, Submission } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { inject, injectable } from "inversify";

/**
 * Class for handling creation of submission document.
 * 
 * @class
 */
@injectable()
export class GrpcCreateSubmissionhandler {

    #_createSubmissionService : ICreateSubmissionService

    /**
     * 
     * @param createSubmissionService - The service for creating new submission document.
     * @constructor
     */
    constructor(
        @inject(TYPES.ICreateSubmissionService)
        createSubmissionService : ICreateSubmissionService
    ){
        this.#_createSubmissionService = createSubmissionService
    }

    createSubmission = async (
        call : ServerUnaryCall<CreateSubmissionRequest,Submission>,
        callback : sendUnaryData<Submission>
    ) => {

        try {

            const req = call.request;
            const dto = SubmissionMapper.toCreateSubmissionService(req);
            const result = await this.#_createSubmissionService.execute(dto);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null)
            };

            const outDTO = SubmissionMapper.toOutDTO(result.data);

            return callback(null,outDTO);
            
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
     * This method ensures that the `createSubmission` handler maintains the correct `this` context
     * when passed to the gRPC server. This is especially important since gRPC handlers
     * are called with a different execution context.
     *
     * @returns {object} The bound login handler for gRPC wrapped in an object.
     */
    getServiceHandler() : object {
        return {
            createSubmission : this.createSubmission.bind(this)
        }
    }
}