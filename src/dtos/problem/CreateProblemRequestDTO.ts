
/**
 * DTO (Data Tranfer Object) representing the structure of the create problem request.
 * 
 * @interface
 */
export interface ICreateProblemRequestDTO {
    title : string;
    description : string;
    difficulty : Difficulty;
    tags : string[];
}