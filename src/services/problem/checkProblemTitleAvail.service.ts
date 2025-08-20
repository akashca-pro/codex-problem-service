import { inject, injectable } from "inversify";
import { ICheckProblemTitleAvailService } from "./interfaces/checkProblemTitle.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";

/**
 * Implementation of the check problem title service
 * 
 * @class
 * @implements {ICheckProblemTitleAvailService}
 */
@injectable()
export class CheckProblemTitleAvailService implements ICheckProblemTitleAvailService{

    #_problemRepo : IProblemRepository

    constructor(
        @inject(TYPES.IProblemRepository)
        problemRepo : IProblemRepository
    ){
        this.#_problemRepo = problemRepo
    }

    async execute(title: string): Promise<ResponseDTO> {
        
        const titleAlreadyExist = await this.#_problemRepo.findOne({
        title: { $regex: `^${title}$`, $options: "i" } 
        });


        if(titleAlreadyExist){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.TitleAlreadyExist
            }
        }

        return {
            data : null,
            success : true
        }
    }
}
