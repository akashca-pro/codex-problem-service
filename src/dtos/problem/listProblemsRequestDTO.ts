import { Difficulty } from "@/enums/difficulty.enum";

/**
 * DTO (Data Tranfer Object) representing the data to list all problems.
 * 
 * @interface
 */
export interface IListProblemsRequestDTO {

    page : number;
    limit : number;
    difficulty? : Difficulty;
    tags? : string[];
    active? : boolean;
    search? : string;
    questionId? : string;
    sort?: string; 
}