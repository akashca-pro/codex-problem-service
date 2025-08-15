import { inject, injectable } from "inversify";
import { IRemoveTestCaseService } from "./interfaces/removeTestCase.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { IRemoveTestCaseRequestDTO } from "@/dtos/problem/testCaseRequestDTOs";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";

/**
 * Implementation of the remove test case service.
 * 
 * @class
 * @implements {IRemoveTestCaseService}
 */

@injectable()
export class RemoveTestCaseService implements IRemoveTestCaseService  {

    #_problemRepo : IProblemRepository

    /**
     * Creates an instance of RemoveTestCaseService.
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

    async execute(data: IRemoveTestCaseRequestDTO): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(data._id);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        const testCase = await this.#_problemRepo.findOne({ _id : data._id, 
            'testcaseCollection.run' : { $elemMatch : { _id : data.testCaseId } } });


        if(!testCase){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.TestCaseNotFound
            }
        }

        await this.#_problemRepo.removeTestCase(
            data._id,
            data.testCaseId,
            data.testCaseCollectionType);

        return {
            data : null,
            success : true
        }
    }
}