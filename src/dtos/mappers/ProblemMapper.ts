import { ICreateProblemRequestDTO } from "../problem/CreateProblemRequestDTO";


export class ProblemMapper {
    
    static toCreateProblemService(body : ICreateProblemInput) : ICreateProblemRequestDTO {
        let difficulty: Difficulty;

        if (body.difficulty === 1) {
            difficulty = Difficulty.EASY;
        } else if (body.difficulty === 2) {
            difficulty = Difficulty.MEDIUM;
        } else if (body.difficulty === 3) {
            difficulty = Difficulty.HARD;
        } else {
            throw new Error('Invalid difficulty value');
  }

        return {
            title : body.title,
            description : body.description,
            difficulty : difficulty,
            questionId : body.questionId,
            tags : body.tags,
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