import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ICreateSubmissionRequestDTO } from "@/dtos/submission/CreateSubmissionRequestDTO";

/**
 * Interface representing the structure of create submission service
 * 
 * @interface
 */
export interface ICreateSubmissionService {

    /**
     * Executes the create submission service.
     * 
     * @param data - The data to create new submission document.
     */
    execute(data : ICreateSubmissionRequestDTO ) : Promise<ResponseDTO>

}