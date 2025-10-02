import { PaginationDTO } from "@/dtos/PaginationDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { 
    CreateSubmissionRequest, 
    GetSubmissionsRequest, 
    ListProblemSpecificSubmissionRequest, 
    UpdateSubmissionRequest 
} from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";

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
        data : CreateSubmissionRequest
    ) : Promise<ResponseDTO>;

    /**
     * Fetches the details of submissions based on the provided filter.
     * 
     * @async
     * @param filter - filter to get submissions
     * @returns {PaginationDTO} - the paginated response data
     */
    getSubmission(
        filter : GetSubmissionsRequest
    ) : Promise<PaginationDTO>;

    /**
     * list submission for specific problem.
     * 
     * @async
     * @param request - request to list submissions
     */
    listSubmissionByProblem(
        request : ListProblemSpecificSubmissionRequest
    ) : Promise<ResponseDTO>;

    /**
     * Updates an existing submission.
     * 
     * @async
     * @param id - submission id to update
     * @param updatedData - data to update submission
     * @returns {ResponseDTO} - the response data
     */
    updateSubmission(
        request : UpdateSubmissionRequest
    ) : Promise<ResponseDTO>

}