import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import { IAddTestCaseService } from "./interfaces/addTestCase.service.interface";
import { inject, injectable } from "inversify";
import TYPES from "@/config/inversify/types";
import { IAddTestCaseRequestDTO } from "@/dtos/problem/addTestCaseRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Implementaion of Add test case service.
 * 
 * @class
 * @implements {IAddTestCaseService}
 */
@injectable()
export class AddTestCaseService implements IAddTestCaseService {

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

    async execute(data: IAddTestCaseRequestDTO): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(data._id);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        await this.#_problemRepo.addTestCase(data._id,data.testCaseCollectionType,data.testCase);

        return {
            data : null,
            success : true
        }
    }
}
