import { inject, injectable } from "inversify";
import { IAddSolutionCodeService } from "./interfaces/addSolutionCode.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { IAddSolutionCodeRequestDTO } from "@/dtos/problem/solutionCodeRequestDTOs";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";
import { ICacheProvider } from "@/libs/cache/ICacheProvider.interface";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";

/**
 * Implementaion of Add solution code service.
 * 
 * @class
 * @implements {IAddSolutionCodeService}
 */
@injectable()
export class AddSolutionCodeService implements IAddSolutionCodeService {

    #_problemRepo : IProblemRepository
    #_cacheProvider : ICacheProvider

    /**
     * Creates an instance of AddTestCaseService.
     * 
     * @param problemRepo - The problem repository.
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


    async execute(data: IAddSolutionCodeRequestDTO): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(data._id);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        await this.#_problemRepo.addSolutionCode(
            data._id,
            data.solutionCode);
        
        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${data._id}`;
        await this.#_cacheProvider.del(cacheKey);

        return {
            data : null,
            success : true
        }
    }
}
