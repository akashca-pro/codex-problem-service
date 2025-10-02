import { type Difficulty } from "@/const/Difficulty.const";
import { IExample, IStarterCode } from "@/infra/db/interface/problem.interface";


export interface IUpdatedDataForBasicProblem {
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

/**
 * DTO (Data Tranfer Object) representing the data to update basic problem details.
 * 
 * @interface
 */
export interface IUpdateBasicProblemRequestDTO {
    _id : string;
    updatedData : IUpdatedDataForBasicProblem;
}