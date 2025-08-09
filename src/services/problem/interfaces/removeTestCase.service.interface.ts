import { IRemoveTestCaseRequestDTO } from "@/dtos/problem/testCaseRequestDTOs";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the remove test case service.
 * 
 * @interface
 */
export interface IRemoveTestCaseService {

    /**
     * Executes the remove test case service.
     * 
     * @async
     * @param {IRemoveTestCaseRequestDTO} data - The data for identifiy testcase
     * @return {ResponseDTO} - The response data.
     */
    execute(data : IRemoveTestCaseRequestDTO) : Promise<ResponseDTO>

}