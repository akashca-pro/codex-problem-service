import { IUpdateProblemRequestDTO } from "@/dtos/problem/updateProblemRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the update problem service.
 * 
 * @interface
 */
export interface IUpdateBasicProblemDetailsService {

    /**
     * Executes the Update basic problem details service.
     * 
     * @param problemId - The id of the problem document.
     * @param {IUpdateProblemRequestDTO} updatedData - The updated data for problem from user.
     * @returns {ResponseDTO} - The response data.
     */
    execute(problemId : string ,updatedData : IUpdateProblemRequestDTO ) : Promise<ResponseDTO>

}