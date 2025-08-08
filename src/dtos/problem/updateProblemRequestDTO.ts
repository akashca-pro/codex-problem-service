
/**
 * DTO (Data Tranfer Object) representing the structure of the update problem request.
 * 
 * @interface
 */
export interface IUpdateProblemRequestDTO {
    _id : string;
    questionId : string;
    title : string;
    description : string;
    difficuly : Difficulty;
    active : boolean;
    tags : string[];
}