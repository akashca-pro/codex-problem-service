import { IAddSolutionCodeRequestDTO } from "@/dtos/problem/solutionCodeRequestDTOs";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the add solution code service.
 * 
 * @interface
 */
export interface IAddSolutionCodeService {

    /**
     * Executes the add solution code service.
     * 
     * @async
     * @param {IAddSolutionCodeRequestDTO} data - The data for adding testcase
     * @return {ResponseDTO}
     */
    execute(data : IAddSolutionCodeRequestDTO) : Promise<ResponseDTO>

}