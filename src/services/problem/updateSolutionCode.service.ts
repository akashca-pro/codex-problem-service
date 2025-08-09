import { inject, injectable } from "inversify";
import { IUpdateSolutionCodeService } from "./interfaces/updateSolutionCode.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { IUpdateSolutionCodeRequestDTO } from "@/dtos/problem/solutionCodeRequestDTOs";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";

/**
 * Implementaion of update solutioncode service.
 * 
 * @class
 * @implements {IUpdateSolutionCodeService}
 */
@injectable()
export class UpdateSolutionCodeService implements IUpdateSolutionCodeService {

    #_problemRepo : IProblemRepository

    /**
     * Creates an instance of the UpdateSolutionCodeService.
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

    async execute(data: IUpdateSolutionCodeRequestDTO): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(data._id);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        await this.#_problemRepo.updateSolutionCode(
            data._id,
            data.solutionCodeId,
            data.solutionCode
        );

        return {
            data : null,
            success : true,
        }
    }
}
 