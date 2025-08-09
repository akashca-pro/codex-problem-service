import { inject, injectable } from "inversify";
import { ICreateProblemService } from "./interfaces/createProblem.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { ICreateProblemRequestDTO } from "@/dtos/problem/CreateProblemRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Implementaion of Create problem service.
 * 
 * @class
 * @implements {ICreateProblemService}
 */
@injectable()
export class CreateProblemService implements ICreateProblemService {

    #_problemRepo : IProblemRepository

    /**
     * Creates an instance of CreateProblemService.
     * 
     * @param problemRepo - The problem repository.
     * @constructor
     */
    constructor(
        @inject(TYPES.IProblemRepository)
        problemRepo  : IProblemRepository
    ){
        this.#_problemRepo = problemRepo
    }

    /**
     * Executes the create problem service.
     * 
     * @param {ICreateProblemRequestDTO} data - The data from user to update a problem.
     * @returns {ResponseDTO} - The response data.
     */
    async execute(data: ICreateProblemRequestDTO): Promise<ResponseDTO> {
        
        const problemAlreadyExist = await this.#_problemRepo.findByTitle(data.title);

        if(problemAlreadyExist){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemAlreadyExists
            }
        }

        const result = await this.#_problemRepo.create(data);

        return {
            data : result,
            success : true
        }
    }
}

