
/**
 * DTO (Data Tranfer Object) representing the data to get a problem document.
 * 
 * @interface
 */
export interface IGetProblemRequestDTO {
    _id : string;
    title? : string;
    questionId? : string;
}
