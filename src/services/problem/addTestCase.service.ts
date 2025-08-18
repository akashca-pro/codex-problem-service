import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import { IAddTestCaseService } from "./interfaces/addTestCase.service.interface";
import { inject, injectable } from "inversify";
import TYPES from "@/config/inversify/types";
import { IAddTestCaseRequestDTO } from "@/dtos/problem/testCaseRequestDTOs";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";
import { ICacheProvider } from "@/libs/cache/ICacheProvider.interface";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";

/**
 * Implementaion of Add test case service.
 * 
 * @class
 * @implements {IAddTestCaseService}
 */
@injectable()
export class AddTestCaseService implements IAddTestCaseService {

    #_problemRepo : IProblemRepository
    #_cacheProvider : ICacheProvider

    /**
     * Creates an instance of AddTestCaseService.
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

    async execute(data: IAddTestCaseRequestDTO): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(data._id);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        await this.#_problemRepo.addTestCase(data._id,data.testCaseCollectionType,data.testCase);

        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${data._id}`;
        await this.#_cacheProvider.del(cacheKey);

        return {
            data : null,
            success : true
        }
    }
}
