import { IBulkUploadTestCaseRequestDTO } from "@/dtos/problem/addTestCaseRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the bulk uplpoad test case in problem document.
 * 
 * @interface
 */
export interface IBulkUploadTestCase {

    /**
     * Executes the bulk upload test case service.
     * 
     * @async
     * @param {IAddTestCaseRequestDTO} data - The data for adding testcase
     * @return {ResponseDTO}
     */
    execute(data : IBulkUploadTestCaseRequestDTO) : Promise<ResponseDTO>
}