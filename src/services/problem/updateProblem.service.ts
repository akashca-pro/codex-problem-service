import { inject, injectable } from "inversify";
import TYPES from "@/config/inversify/types";
import { IUpdateProblemService } from "./interfaces/updateProblem.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import { IUpdateProblemRequestDTO } from "@/dtos/problem/updateProblemRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * The implementation of the update problem service.
 * 
 * @class
 * @implements {IUpdateProblemService}
 */
@injectable()
export class UpdateProblemService implements IUpdateProblemService {

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

    /**
     * Executes the update problem service.
     * 
     * @async
     * @param {IUpdateProblemRequestDTO} data - The data to be update
     */
    async execute(data: IUpdateProblemRequestDTO): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(data._id);

        if(!problemExist){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        const updatingData = {
            questionId : data.questionId,
            title : data.title,
            description : data.description,
            difficuly : data.difficuly,
            active : data.active,
            tags : data.tags
        }

        await this.#_problemRepo.update(data._id,updatingData);

        return {
            data : null,
            success : true,
        }
    }
}
