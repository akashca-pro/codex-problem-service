
/**
 * DTO (Data Tranfer Object) representing the structure of the list Problem request.
 * 
 * @interface
 */
export interface IListProblemsRequestDTO {

    page : number;
    limit : number;
    difficulty? : Difficulty;
    tag? : string;
    active? : boolean;
    search? : string;
    questionId? : string 
}