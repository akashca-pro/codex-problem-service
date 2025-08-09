import { inject, injectable } from "inversify";
import { IAddSolutionCodeService } from "./interfaces/addSolutionCode.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { IAddSolutionCodeRequestDTO } from "@/dtos/problem/addSolutionCodeRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Implementaion of Add test case service.
 * 
 * @class
 * @implements {IAddSolutionCodeService}
 */
@injectable()
export class AddSolutionCodeService implements IAddSolutionCodeService {

    #_problemRepo : IProblemRepository

    /**
     * Creates an instance of AddTestCaseService.
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

    async execute(data: IAddSolutionCodeRequestDTO): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(data._id);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        await this.#_problemRepo.addSolutionCode(
            data._id,
            data.solutionCode);

        return {
            data : null,
            success : true
        }
    }
}
