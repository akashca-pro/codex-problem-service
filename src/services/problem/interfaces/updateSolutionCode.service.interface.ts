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
     * @param {IUpdateSolutionCodeRequestDTO} data - The data for updating solution code with updated data.
     * @return {ResponseDTO}
     */
    execute(data : IUpdateSolutionCodeRequestDTO) : Promise<ResponseDTO>

}