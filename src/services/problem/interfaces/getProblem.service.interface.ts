import { IGetProblemRequestDTO } from "@/dtos/problem/getProblemRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the get problem service.
 * 
 * @interface
 */
export interface IGetProblemService {

    /**
     * Executes the get problem service.
     * 
     * @async
     * @param data - The data can be either be id , title or questionId of the problem.
     * @return {ResponseDTO} - The response data.
     * 
     * @remarks
     * By using this method user can request problem details by providing title.
     */
    execute(data : IGetProblemRequestDTO) : Promise<ResponseDTO>

}