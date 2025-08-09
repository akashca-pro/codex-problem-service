
/**
 * Data Transfer Object (DTO) representing data to get submissions.
 * 
 * @interface
 */
export interface IGetSubmissionRequestDTO {
    page : number;
    limit : number;
    problemId? : string;
    battleId? : string;
    userId? : string;
}