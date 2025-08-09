import { Difficulty } from "@/enums/difficulty.enum";
import { IExample, IStarterCode } from "@/infra/db/interface/problem.interface";

/**
 * DTO (Data Tranfer Object) representing the data to update basic problem details.
 * 
 * @interface
 */
export interface IUpdateBasicProblemRequestDTO {
    questionId? : string;
    title? : string;
    description? : string;
    difficulty? : Difficulty;
    active? : boolean;
    tags? : string[];
    constraints? : string[];
    examples? : IExample[];
    starterCodes? : IStarterCode[];
}