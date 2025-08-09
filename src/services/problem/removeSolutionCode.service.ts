import { inject, injectable } from "inversify";
import { IRemoveSolutionCodeService } from "./interfaces/removeSolutionCode.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { IRemoveSolutionCodeRequestDTO } from "@/dtos/problem/solutionCodeRequestDTOs";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";

/**
 * Implementaion of remove solution code service.
 * 
 * @class
 * @implements {IRemoveSolutionCodeService}
 */
@injectable()
export class RemoveSolutionCodeService implements IRemoveSolutionCodeService {

    #_problemRepo : IProblemRepository

    /**
     * Creates an instance of RemoveSolutionCodeService.
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

    async execute(data: IRemoveSolutionCodeRequestDTO): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(data._id);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        await this.#_problemRepo.removeSolutionCode(
            data._id,
            data.solutionCodeId
        );

        return {
            data : null,
            success : true
        }
    }
}
 