
/**
 * Data Transfer Object (DTO) representing data to create submission document.
 *
 * @interface
 */
export interface ICreateSubmissionRequestDTO {

    problemId : string;
    userId : string;
    battleId? : string;
    country? : string;
    title : string;
    language : Language;
    userCode : string;
    difficulty : Difficulty
}
