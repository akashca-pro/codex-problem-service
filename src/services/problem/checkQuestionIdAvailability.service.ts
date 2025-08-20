import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import { ICheckQuestionIdAvailablityService } from "./interfaces/checkQuestionId.service.interface";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";
import { inject, injectable } from "inversify";
import TYPES from "@/config/inversify/types";

/**
 * Implementation of check question id available service
 * 
 * @class
 * @implements {ICheckQuestionIdAvailablityService}
 */
@injectable()
export class CheckQuestionIdAvailabiliyService implements ICheckQuestionIdAvailablityService {

    #_problemRepo : IProblemRepository

    constructor(
        @inject(TYPES.IProblemRepository)
        problemRepo : IProblemRepository
    ){
        this.#_problemRepo = problemRepo
    }

    async execute(questionId: string): Promise<ResponseDTO> {
        
        const questionIdAlreadyExist = await this.#_problemRepo.findOne({ questionId });

        if(questionIdAlreadyExist){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.QuestionIdAlreadyExist
            }
        }

        return {
            data : null,
            success : true
        }
    }   
}
