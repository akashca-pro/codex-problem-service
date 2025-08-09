import { IUpdateSolutionCodeRequestDTO } from "@/dtos/problem/solutionCodeRequestDTOs";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the update solution code service.
 * 
 * @interface
 */
export interface IUpdateSolutionCodeService {

    /**
     * Executes the update solution code service.
     * 
     * @async
     * @param {IUpdateSolutionCodeRequestDTO} data - The data for adding testcase
     * @return {ResponseDTO}
     */
    execute(data : IUpdateSolutionCodeRequestDTO) : Promise<ResponseDTO>

}