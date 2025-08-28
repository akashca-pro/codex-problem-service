import { PaginationDTO } from "@/dtos/PaginationDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { ICreateSubmissionRequestDTO } from "@/dtos/submission/CreateSubmissionRequestDTO";
import { IGetSubmissionRequestDTO } from "@/dtos/submission/getSubmissionRequestDTO";
import { IUpdateSubmissionRequestDTO } from "@/dtos/submission/UpdateSubmissionRequestDTO";

/**
 * Interface representing the structure of the submission service.
 * 
 * @interface
 */
export interface ISubmissionService {

    /**
     * Creates a new submission.
     * 
     * @async
     * @param data - data to create a new submission
     * @returns {ResponseDTO} - the response data
     */
    createSubmission(
        data : ICreateSubmissionRequestDTO
    ) : Promise<ResponseDTO>;

    /**
     * Fetches the details of submissions based on the provided filter.
     * 
     * @async
     * @param filter - filter to get submissions
     * @returns {PaginationDTO} - the paginated response data
     */
    getSubmission(
        filter : IGetSubmissionRequestDTO
    ) : Promise<PaginationDTO>;

    /**
     * Updates an existing submission.
     * 
     * @async
     * @param id - submission id to update
     * @param updatedData - data to update submission
     * @returns {ResponseDTO} - the response data
     */
    updateSubmission(
        id : string,
        updatedData : IUpdateSubmissionRequestDTO
    ) : Promise<ResponseDTO>

}