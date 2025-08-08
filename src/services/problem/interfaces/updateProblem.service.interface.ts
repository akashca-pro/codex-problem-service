import { IUpdateProblemRequestDTO } from "@/dtos/problem/updateProblemRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the update problem service.
 * 
 * @interface
 */
export interface IUpdateProblemService {

    /**
     * 
     * @param {IUpdateProblemRequestDTO} data - The updated data for problem from user.
     * @returns {ResponseDTO} - The response data.
     */
    execute(data : IUpdateProblemRequestDTO ) : Promise<ResponseDTO>

}