import { PaginationDTO } from "@/dtos/PaginationDTO";
import { IGetSubmissionRequestDTO } from "@/dtos/submission/getSubmissionRequestDTO";

/**
 * Interface representing the structure of get submissions service.
 * 
 * @interface
 */
export interface IGetSubmissionsService {

    /**
     * Executes the get submission service.
     * 
     * @param data - The data to get submissions.
     * @returns {PaginationDTO} - The paginated response.
     */
    execute(data : IGetSubmissionRequestDTO) : Promise<PaginationDTO>

}