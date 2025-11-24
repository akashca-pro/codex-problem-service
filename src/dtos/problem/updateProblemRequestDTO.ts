import { type Difficulty } from "@/const/Difficulty.const";
import { IExample, IStarterCode } from "@/db/interface/problem.interface";
import { SolutionRoadmap } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";


export interface IUpdatedDataForBasicProblem {
    questionId? : string;
    title? : string;
    description? : string;
    difficulty? : Difficulty;
    active? : boolean;
    tags? : string[];
    constraints? : string[];
    examples? : IExample[];
    solutionRoadmap? : SolutionRoadmap[];
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