import TYPES from "@/config/inversify/types";
import { ProblemMapper } from "@/dtos/mappers/ProblemMapper";
import { SystemErrorType } from "@/enums/ErrorTypes/SystemErrorType.enum";
import { ICreateProblemService, } from "@/services/problem/interfaces/createProblem.service.interface";
import { mapMessageToGrpcStatus } from "@/utils/mapMessageToGrpcCode";
import { CreateProblemRequest, Problem } from '@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem'
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { inject, injectable } from "inversify";

/**
 * Class for handling creation of problem document.
 * 
 * @class
 */
@injectable()
export class GrpcCreateProblemHandler {

    #_createProblemService : ICreateProblemService

    /**
     * @param createProblemService - The service for creating a new problem.
     * @constructor
     */
    constructor(
        @inject(TYPES.ICreateProblemService)
        createProblemService : ICreateProblemService
    ){
        this.#_createProblemService = createProblemService
    }

    createProblem = async (
        call : ServerUnaryCall<CreateProblemRequest,Problem>,
        callback : sendUnaryData<Problem>
    ) : Promise<void> => {

        try {
            const req = call.request;
            const inDTO = ProblemMapper.toCreateProblemService(req)
            const result = await this.#_createProblemService.execute(inDTO);

            if(!result.success){
                return callback({
                    code : mapMessageToGrpcStatus(result.errorMessage as string),
                    message : result.errorMessage
                },null)
            }

            const outDTO = ProblemMapper.toOutDTO(result.data);

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
     * This method ensures that the `createProblem` handler maintains the correct `this` context
     * when passed to the gRPC server. This is especially important since gRPC handlers
     * are called with a different execution context.
     *
     * @returns {object} The bound login handler for gRPC wrapped in an object.
     */
    getServiceHandler() : object {
        return {
            createProblem : this.createProblem.bind(this)
        }
    }
}