import { IListProblemsRequestDTO } from "@/dtos/problem/listProblemsRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the list problem service.
 * 
 * @interface
 */
export interface IListProblemService {

    /**
     * Executes the List problem service.
     * 
     * @async
     * @param data - The data includes page , limit and filters.
     * @returns {ResponseDTO} - The response data.
     */
    execute(data : IListProblemsRequestDTO) : Promise<ResponseDTO>

}