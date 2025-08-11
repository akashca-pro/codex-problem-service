import { Difficulty } from "@/enums/difficulty.enum";
import { ICreateProblemRequestDTO } from "../problem/CreateProblemRequestDTO";
import { IListProblemsRequestDTO } from "../problem/listProblemsRequestDTO";

export const gRPCDifficultyFieldMapper = (difficulty : number) : Difficulty => {

        if (difficulty === 1) {
            return Difficulty.EASY;
        } else if (difficulty === 2) {
            return Difficulty.MEDIUM;
        } else if (difficulty === 3) {
            return Difficulty.HARD;
        } else {
            throw new Error('Invalid difficulty value');
        }   
}

export class ProblemMapper {
    
    static toCreateProblemService(body : ICreateProblemInput) : ICreateProblemRequestDTO {
        const difficulty = gRPCDifficultyFieldMapper(body.difficulty);

        return {
            title : body.title,
            description : body.description,
            difficulty : difficulty,
            questionId : body.questionId,
            tags : body.tags,
        }
    }

    static toListProblemService(body : IListProblemInput) : IListProblemsRequestDTO {

        let difficulty : Difficulty | undefined 

        if(body.difficulty){
            difficulty = gRPCDifficultyFieldMapper(body.difficulty);
        }

        return {
            limit : body.limit,
            page : body.page,
            active : body.active,
            difficulty : difficulty,
            questionId : body.questionId,
            search : body.search,
            tag : body.tag
        }
    }
}

export interface ICreateProblemInput {
    questionId : string;
    title : string;
    description : string;
    difficulty : number;
    tags : string[];
}

export interface IListProblemInput {
    page : number;
    limit : number;
    difficulty? : number;
    tag? : string;
    active? : boolean;
    search? : string;
    questionId? : string 
}