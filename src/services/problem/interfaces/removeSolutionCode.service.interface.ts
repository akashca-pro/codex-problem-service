import { IRemoveSolutionCodeRequestDTO } from "@/dtos/problem/solutionCodeRequestDTOs";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the remove solution code service.
 * 
 * @interface
 */
export interface IRemoveSolutionCodeService {

    /**
     * Executes the remove solution code service.
     * 
     * @async
     * @param {IRemoveSolutionCodeRequestDTO} data - The data for identifying the removing solution code.
     * @return {ResponseDTO}
     */
    execute(data : IRemoveSolutionCodeRequestDTO ) : Promise<ResponseDTO>

}