import { IExample, IStarterCode } from "@/infra/db/interface/problem.interface";

/**
 * DTO (Data Tranfer Object) representing the structure of the update problem request.
 * 
 * @interface
 */
export interface IUpdateProblemRequestDTO {
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