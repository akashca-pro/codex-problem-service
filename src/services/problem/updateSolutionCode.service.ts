import { inject, injectable } from "inversify";
import { IUpdateSolutionCodeService } from "./interfaces/updateSolutionCode.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { IUpdateSolutionCodeDTO, IUpdateSolutionCodeRequestDTO } from "@/dtos/problem/solutionCodeRequestDTOs";
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

        const solutionCode = await this.#_problemRepo.findOne({ _id : data._id,
            solutionCodes : { $elemMatch : { _id : data.solutionCodeId } }
         })

        if(!solutionCode){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.SolutionCodeNotFound
            }
        }

        const updatedQuery : IUpdateSolutionCodeDTO = {}
        if(data.solutionCode.code) updatedQuery.code = data.solutionCode.code;
        if(data.solutionCode.language) updatedQuery.language = data.solutionCode.language;
        if(data.solutionCode.executionTime) updatedQuery.executionTime = data.solutionCode.executionTime;
        if(data.solutionCode.memoryTaken) updatedQuery.memoryTaken = data.solutionCode.memoryTaken;
        
        await this.#_problemRepo.updateSolutionCode(
            data._id,
            data.solutionCodeId,
            updatedQuery);

        return {
            data : null,
            success : true,
        }
    }
}
 