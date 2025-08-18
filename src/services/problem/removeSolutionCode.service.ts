import { inject, injectable } from "inversify";
import { IRemoveSolutionCodeService } from "./interfaces/removeSolutionCode.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { IRemoveSolutionCodeRequestDTO } from "@/dtos/problem/solutionCodeRequestDTOs";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";
import { ICacheProvider } from "@/libs/cache/ICacheProvider.interface";

/**
 * Implementaion of remove solution code service.
 * 
 * @class
 * @implements {IRemoveSolutionCodeService}
 */
@injectable()
export class RemoveSolutionCodeService implements IRemoveSolutionCodeService {

    #_problemRepo : IProblemRepository
    #_cacheProvider : ICacheProvider

    /**
     * Creates an instance of RemoveSolutionCodeService.
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

    async execute(data: IRemoveSolutionCodeRequestDTO): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(data._id);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        const removed = await this.#_problemRepo.removeSolutionCode(
            data._id,
            data.solutionCodeId
        );

        if(!removed){
             return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.SolutionCodeNotFound
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
 