import TYPES from "@/config/inversify/types";
import { ProblemMapper } from "@/dtos/mappers/ProblemMapper";
import { SystemErrorType } from "@/enums/ErrorTypes/SystemErrorType.enum";
import { IProblem } from "@/infra/db/interface/problem.interface";
import { IListProblemService } from "@/services/problem/interfaces/ListProblem.service.interface";
import { ListProblemRequest, ListProblemResponse } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import logger from "@akashcapro/codex-shared-utils/dist/utils/logger";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { inject, injectable } from "inversify";

/**
 * Class for handling list paginated problem documents.
 * 
 * @class
 */
@injectable()
export class GrpcListProblemHandler {

    #_listProblemService : IListProblemService

    /**
     * 
     * @param listProblemService - The service for listing paginated problem documents.
     */
    constructor(
        @inject(TYPES.IListProblemService)
        listProblemService : IListProblemService
    ){
        this.#_listProblemService = listProblemService
    }

    listProblems = async(
        call : ServerUnaryCall<ListProblemRequest,ListProblemResponse>,
        callback : sendUnaryData<ListProblemResponse>
    ) => {

        try {
            
            const req = call.request;

            const result = await this.#_listProblemService.execute(ProblemMapper.toListProblemService(req));
            
            callback(null,{
                currentPage : result.currentPage,
                problems : result.body ,
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
     * This method ensures that the `createProblem` handler maintains the correct `this` context
     * when passed to the gRPC server. This is especially important since gRPC handlers
     * are called with a different execution context.
     *
     * @returns {object} The bound login handler for gRPC wrapped in an object.
     */
    getServiceHandler() : object {
        return {
            listProblems : this.listProblems.bind(this)
        }
    }
}