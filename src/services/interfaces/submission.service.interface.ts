import { PaginationDTO } from "@/dtos/PaginationDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { 
    CreateSubmissionRequest, 
    GetDashboardStatsRequest, 
    GetSubmissionsRequest, 
    ListProblemSpecificSubmissionRequest, 
    ListTopKCountryLeaderboardRequest, 
    ListTopKGlobalLeaderboardRequest, 
    RemoveUserRequest, 
    UpdateCountryRequest, 
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
       req : ListTopKGlobalLeaderboardRequest
    ) : Promise<ResponseDTO>

    listTopKCountryLeaderboard(
        req : ListTopKCountryLeaderboardRequest
    ) : Promise<ResponseDTO>

    getUserDashboardStats(
        req : GetDashboardStatsRequest
    ) : Promise<ResponseDTO>

    getProblemSubmissionStats() : Promise<ResponseDTO>

    updateCountryInLeaderboard(
        req : UpdateCountryRequest
    ) : Promise<ResponseDTO>

    removeUserInLeaderboard(
        req : RemoveUserRequest
    ) : Promise<ResponseDTO>

}