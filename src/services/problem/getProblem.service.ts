import { inject, injectable } from "inversify";
import { IGetProblemService } from "./interfaces/getProblem.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { IGetProblemRequestDTO } from "@/dtos/problem/getProblemRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { IProblem } from "@/infra/db/interface/problem.interface";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";

/**
 * Implementaion of get problem service.
 * 
 * @class
 * @implements {IGetProblemService}
 */
@injectable()
export class GetProblemService implements IGetProblemService {

    #_problemRepo : IProblemRepository

    /**
     * Creates an instance of GetProblemService.
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

    async execute(data: IGetProblemRequestDTO): Promise<ResponseDTO> {
        
        let problem : IProblem | null = null;

        if(data._id){
            problem = await this.#_problemRepo.findById(data._id);
        }else if(data.questionId){
            problem = await this.#_problemRepo.findOne({ questionId : data.questionId });
        }else if(data.title){
            problem = await this.#_problemRepo.findByTitle(data.title);
        }

        if(!problem){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        return {
            data : problem,
            success : true
        }
    }
}

