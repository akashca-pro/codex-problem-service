import { inject, injectable } from "inversify";
import { IGetProblemPublicService } from "./interfaces/getProblemPublic.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ICacheProvider } from "@/libs/cache/ICacheProvider.interface";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";
import { ProblemMapper } from "@/dtos/mappers/ProblemMapper";
import { config } from "@/config";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";


/**
 * Implementaion of get problem public service.
 * 
 * @class
 * @implements {IGetProblemPublicService}
 */
@injectable()
export class GetProblemPublicService implements IGetProblemPublicService {

    #_problemRepo : IProblemRepository
    #_cacheProvider : ICacheProvider

    /**
     * Creates an instance of GetProblemPublicService.
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

    async execute(problemId: string): Promise<ResponseDTO> {
        
        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${problemId}`;

        const cached = await this.#_cacheProvider.get(cacheKey);

        if(cached){
            return {
                data : cached,
                success : true,
            }
        }

        const select = ['questionId','title','description','difficulty','constraints','tags','testcaseCollection','examples','starterCodes','updatedAt','createdAt']

        const problem = await this.#_problemRepo.findByIdLean(problemId,select);

        if(!problem){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        const outDTO = ProblemMapper.toOutPublicDTO(problem)

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