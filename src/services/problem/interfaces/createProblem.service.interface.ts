import { ICreateProblemRequestDTO } from "@/dtos/problem/CreateProblemRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the create problem service.
 * 
 * @interface
 */
export interface ICreateProblemService {

    /**
     * Executes the create problem method.
     * 
     * @async
     * @param data {ICreateProblemRequestDTO} - The data from user to create a new problem.
     * @returns {ResponseDTO} - The response data.
     */
    execute(data : ICreateProblemRequestDTO ) : Promise<ResponseDTO>

}