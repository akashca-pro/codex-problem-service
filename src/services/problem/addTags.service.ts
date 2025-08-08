import { inject, injectable } from "inversify";
import { IAddTagsService } from "./interfaces/addTags.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Implementaion of Add tags service.
 * 
 * @class
 * @implements {IAddTagsService}
 */
@injectable()
export class AddTagsService implements IAddTagsService {

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

    async execute(_id: string, tags: string[]): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(_id);

        if(!problemExist){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        await this.#_problemRepo.addTag(_id,tags);

        return {
            data : null,
            success : true,
        }
    }
}
