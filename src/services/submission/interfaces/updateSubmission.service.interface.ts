import { ResponseDTO } from "@/dtos/ResponseDTO";
import { IUpdateSubmissionRequestDTO } from "@/dtos/submission/UpdateSubmissionRequestDTO";

/**
 * Interface representing the structure of update submission service
 * 
 * @interface
 */
export interface IUpdateSubmissionService {

    /**
     * Executes the Update submission service.
     * 
     * @param data - The data to update submission document.
     */
    execute(data : IUpdateSubmissionRequestDTO ) : Promise<ResponseDTO>

}