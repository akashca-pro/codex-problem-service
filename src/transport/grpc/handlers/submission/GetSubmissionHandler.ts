import TYPES from "@/config/inversify/types";
import { SubmissionMapper } from "@/dtos/mappers/SubmissionMapper";
import { SystemErrorType } from "@/enums/ErrorTypes/SystemErrorType.enum";
import { IGetSubmissionsService } from "@/services/submission/interfaces/getSubmissions.service.interface";
import { GetSubmissionsRequest, GetSubmissionsResponse } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { inject, injectable } from "inversify";

/**
 * Class for handling retrieving submission detail.
 * 
 * @class
 */
@injectable()
export class GrpcGetSubmissionsHandler {

    #_getSubmissionService : IGetSubmissionsService

    /**
     * 
     * @param getSubmissionService - The service for retrieving submission document.
     * @constructor
     */
    constructor(
        @inject(TYPES.IGetSubmissionsService)
        getSubmissionService : IGetSubmissionsService
    ){
        this.#_getSubmissionService = getSubmissionService
    }

    getSubmissions = async (
        call : ServerUnaryCall<GetSubmissionsRequest,GetSubmissionsResponse>,
        callback : sendUnaryData<GetSubmissionsResponse>
    ) => {

        try {
            
            const req = call.request;
            const dto = SubmissionMapper.toGetSubmissionsService(req);
            const result = await this.#_getSubmissionService.execute(dto);

            const outDTO = result.body.map(SubmissionMapper.toOutDTO);

            return callback(null,{
                submissions : outDTO,
                currentPage : result.currentPage,
                totalItems : result.totalItems,
                totalPage : result.totalPages
            })

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
     * This method ensures that the `getSubmissions` handler maintains the correct `this` context
     * when passed to the gRPC server. This is especially important since gRPC handlers
     * are called with a different execution context.
     *
     * @returns {object} The bound login handler for gRPC wrapped in an object.
     */
    getServiceHandler() : object {
        return {
            getSubmissions : this.getSubmissions.bind(this)
        }
    }
}