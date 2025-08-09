import { IAddTestCaseRequestDTO } from "@/dtos/problem/testCaseRequestDTOs";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the add test case in problem document service.
 * 
 * @interface
 */
export interface IAddTestCaseService {

    /**
     * Executes the add test case service.
     * 
     * @async
     * @param {IAddTestCaseRequestDTO} data - The data for adding testcase
     * @return {ResponseDTO}
     */
    execute(data : IAddTestCaseRequestDTO ) : Promise<ResponseDTO>

}