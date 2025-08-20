import { inject, injectable } from "inversify";
import { IRemoveTestCaseService } from "./interfaces/removeTestCase.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { IRemoveTestCaseRequestDTO } from "@/dtos/problem/testCaseRequestDTOs";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";
import { ICacheProvider } from "@/libs/cache/ICacheProvider.interface";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";

/**
 * Implementation of the remove test case service.
 * 
 * @class
 * @implements {IRemoveTestCaseService}
 */

@injectable()
export class RemoveTestCaseService implements IRemoveTestCaseService  {

    #_problemRepo : IProblemRepository
    #_cacheProvider : ICacheProvider

    /**
     * Creates an instance of RemoveTestCaseService.
     * 
     * @param problemRepo - The problem repository.
     * @param cacheProvider - The cache provider.
     * @constructor
     */
    constructor(
        @inject(TYPES.IProblemRepository)
        problemRepo : IProblemRepository,

        @inject(TYPES.ICacheProvider)
        cacheProvider : ICacheProvider
    ){
        this.#_problemRepo = problemRepo;
        this.#_cacheProvider = cacheProvider;
    }

    async execute(data: IRemoveTestCaseRequestDTO): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(data._id);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }
        
        const removed = await this.#_problemRepo.removeTestCase(
            data._id,
            data.testCaseId,
            data.testCaseCollectionType);

        if(!removed){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.TestCaseNotFound
            }
        }

        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${data._id}`;
        await this.#_cacheProvider.del(cacheKey);

        return {
            data : null,
            success : true
        }
    }
}