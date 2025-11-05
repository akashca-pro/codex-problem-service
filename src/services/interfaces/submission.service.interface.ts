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

    createSubmission(
        data : CreateSubmissionRequest
    ) : Promise<ResponseDTO>;

    getSubmission(
        filter : GetSubmissionsRequest
    ) : Promise<PaginationDTO>;

    listSubmissionByProblem(
        request : ListProblemSpecificSubmissionRequest
    ) : Promise<ResponseDTO>;

    updateSubmission(
        request : UpdateSubmissionRequest
    ) : Promise<ResponseDTO>

    listTopKGlobalLeaderboard(
        k : number
    ) : Promise<ResponseDTO>

    listTopKCountryLeaderboard(
        country : string,
        k : number
    ) : Promise<ResponseDTO>

    getDashboardStats(
        userId: string, 
        userTimezone: string
    ) : Promise<ResponseDTO>

}