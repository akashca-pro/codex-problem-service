import { inject, injectable } from "inversify";
import TYPES from "@/config/inversify/types";
import { IUpdateBasicProblemDetailsService } from "./interfaces/updateBasicProblemDetails.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import { IUpdateBasicProblemRequestDTO } from "@/dtos/problem/updateProblemRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";
import { extractDup, isDupKeyError } from "@/utils/mongoError";
import { ICacheProvider } from "@/libs/cache/ICacheProvider.interface";

/**
 * The implementation of the update problem service.
 * 
 * @class
 * @implements {IUpdateBasicProblemDetailsService}
 */
@injectable()
export class UpdateProblemService implements IUpdateBasicProblemDetailsService {

    #_problemRepo : IProblemRepository
    #_cacheProvider : ICacheProvider

    /**
     * Creates an instance of the update problem service.
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

    async execute(
        problemId : string,
        updatedData: IUpdateBasicProblemRequestDTO
    ): Promise<ResponseDTO> {

        const problemExist = await this.#_problemRepo.findById(problemId);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }
        
        const updatedQuery : IUpdateBasicProblemRequestDTO = {};

        if(updatedData.title) updatedQuery.title = updatedData.title;
        if(updatedData.description) updatedQuery.description = updatedData.description;
        if(updatedData.difficulty) updatedQuery.difficulty = updatedData.difficulty;
        if(updatedData.tags) updatedQuery.tags = updatedData.tags;
        if(updatedData.constraints) updatedQuery.constraints = updatedData.constraints;
        if(updatedData.questionId) updatedQuery.questionId = updatedData.questionId;
        if(updatedData.examples) updatedQuery.examples = updatedData.examples;
        if(updatedData.starterCodes) updatedQuery.starterCodes = updatedData.starterCodes;
        if(updatedData.active) updatedQuery.active = updatedData.active;

        try {
            const updatedProblem = await this.#_problemRepo.update(problemId,updatedQuery);

            if(!updatedProblem){
                return {
                    data : null,
                    success : false
                }
            }

            const cacheKey = `problem:details:${updatedProblem._id}`;
            await this.#_cacheProvider.del(cacheKey);

            return {
                data : null,
                success : true,
            }

        } catch (error : unknown) {

            if(isDupKeyError(error)){
                const { field } = extractDup(error as any);
                return {
                    data : null,
                    success : false,
                    errorMessage : `${field} ${ProblemErrorType.ProblemFieldAlreadyExist}`
                }
            }
            throw error;
        }
    }
}
