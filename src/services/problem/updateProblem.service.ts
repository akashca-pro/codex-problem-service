import { inject, injectable } from "inversify";
import TYPES from "@/config/inversify/types";
import { IUpdateBasicProblemDetailsService } from "./interfaces/updateProblem.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import { IUpdateBasicProblemRequestDTO } from "@/dtos/problem/updateProblemRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * The implementation of the update problem service.
 * 
 * @class
 * @implements {IUpdateBasicProblemDetailsService}
 */
@injectable()
export class UpdateProblemService implements IUpdateBasicProblemDetailsService {

    #_problemRepo : IProblemRepository

    /**
     * Creates an instance of the update problem service.
     * 
     * @param problemRepo - The problem repository.
     * @constructor
     */
    constructor(
        @inject(TYPES.IProblemRepository)
        problemRepo : IProblemRepository
    ){
        this.#_problemRepo = problemRepo
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

        const updatedProblem = await this.#_problemRepo.update(problemId,updatedQuery);

        if(!updatedProblem){
            return {
                data : null,
                success : false
            }
        }

        return {
            data : null,
            success : true,
        }
    }
}
