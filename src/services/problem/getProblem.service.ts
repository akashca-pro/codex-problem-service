import { inject, injectable } from "inversify";
import { IGetProblemService } from "./interfaces/getProblem.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { IGetProblemRequestDTO } from "@/dtos/problem/getProblemRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";
import { ICacheProvider } from "@/libs/cache/ICacheProvider.interface";
import { config } from "@/config";
import { ProblemMapper } from "@/dtos/mappers/ProblemMapper";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";

/**
 * Implementaion of get problem service.
 * 
 * @class
 * @implements {IGetProblemService}
 */
@injectable()
export class GetProblemService implements IGetProblemService {

    #_problemRepo : IProblemRepository
    #_cacheProvider : ICacheProvider

    /**
     * Creates an instance of GetProblemService.
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
        this.#_problemRepo = problemRepo
        this.#_cacheProvider = cacheProvider
    }

    async execute(data: IGetProblemRequestDTO): Promise<ResponseDTO> {

        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${data._id}`;

        const cached = await this.#_cacheProvider.get(cacheKey);

        if(cached){
            return {
                data : cached,
                success : true
            }
        }
    
        const problem = await this.#_problemRepo.findByIdLean(data._id);

        if(!problem){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        const outDTO = ProblemMapper.toOutDTO(problem)

        await this.#_cacheProvider.set(
            cacheKey,
            outDTO,
            config.PROBLEM_DETAILS_CACHE_EXPIRY
        );

        return {
            data : outDTO,
            success : true
        }
    }
}

