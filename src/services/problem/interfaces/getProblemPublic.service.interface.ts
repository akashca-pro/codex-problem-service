import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the get public problem response for service.
 * 
 * @interface
 */
export interface IGetProblemPublicService {

    /**
     * Executes the getProblemPublic.
     * 
     * @async 
     * @param problemId - The id of the problem document.
     * @returns {ResponseDTO} - The response data.
     */
    execute(problemId : string) : Promise<ResponseDTO>

}