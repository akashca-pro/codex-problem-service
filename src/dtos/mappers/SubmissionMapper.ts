import { 
    Difficulty as GrpcDifficultyEnum, 
    Language as GrpcLanguageEnum } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { ICreateSubmissionRequestDTO } from "../submission/CreateSubmissionRequestDTO";
import { Difficulty } from "@/enums/difficulty.enum";
import { Language } from "@/enums/language.enum";

export class SubmissionMapper {

    static toCreateSubmissionService(body :ICreateSubmissionInputDTO) : ICreateSubmissionRequestDTO {
        return {
            problemId : body.problemId,
            userId : body.userId,
            battleId : body.battleId ? body.battleId : null,
            title : body.title,
            userCode : body.userCode,
            country : body.country ? body.country : null,
            difficulty : this._mapGrpcDifficultyEnum(body.difficulty),
            language : this._mapGrpcLanguageEnum(body.language)
        }
    }

    private static _mapGrpcDifficultyEnum(difficulty : GrpcDifficultyEnum) : Difficulty {
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

    private static _mapGrpcLanguageEnum(language : GrpcLanguageEnum) : Language {
        if(language === 1){
            return Language.JAVASCRIPT;
        } else if (language === 2){
            return Language.PYTHON
        } else {
            throw new Error('Invalid choosen language')
        }
    }

}

interface ICreateSubmissionInputDTO {
    problemId : string;
    userId : string;
    battleId? : string;
    country? : string;
    title : string;
    language : GrpcLanguageEnum;
    userCode : string;
    difficulty : GrpcDifficultyEnum
}