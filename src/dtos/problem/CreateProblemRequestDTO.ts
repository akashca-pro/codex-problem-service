import { type Difficulty } from "@/const/Difficulty.const";

/**
 * DTO (Data Tranfer Object) representing the data to create a problem.
 * 
 * @interface
 */
export interface ICreateProblemRequestDTO {
    questionId : string;
    title : string;
    description : string;
    difficulty : Difficulty;
    tags : string[];
}