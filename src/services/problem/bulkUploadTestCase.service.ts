import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import { IBulkUploadTestCase } from "./interfaces/bulkUploadTestCase.service.interface";
import { inject, injectable } from "inversify";
import TYPES from "@/config/inversify/types";
import { IBulkUploadTestCaseRequestDTO } from "@/dtos/problem/testCaseRequestDTOs";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";

/**
 * Implementaion of bulk upload test case service.
 * 
 * @class
 * @implements {IBulkUploadTestCase}
 */
@injectable()
export class BulkUploadTestCase implements IBulkUploadTestCase {

    #_problemRepo : IProblemRepository

    /**
     * Creates an instance of BulkUploadTestCase.
     * 
     * @param problemRepo - The problem repository.
     * @constructor
     */
    constructor(
        @inject(TYPES.IProblemRepository)
        problemRepo : IProblemRepository
    ){
        this.#_problemRepo = problemRepo;
    }


    async execute(data: IBulkUploadTestCaseRequestDTO): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(data._id);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        await this.#_problemRepo.bulkUploadTestCase(
            data._id,
            data.testCaseCollectionType,
            data.testCase);

        return {
            data : null,
            success : true
        }
    }
}
