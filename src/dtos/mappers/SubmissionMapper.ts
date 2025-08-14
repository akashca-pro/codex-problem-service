import { 
    ExecutionResult as IGrpcExecutionResult,
    Stats as IGrpcStats,
    FailedTestCase as IGrpcFailedTestCase,
    Difficulty as GrpcDifficultyEnum, 
    Language as GrpcLanguageEnum, 
    Submission} from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { ICreateSubmissionRequestDTO } from "../submission/CreateSubmissionRequestDTO";
import { Difficulty } from "@/enums/difficulty.enum";
import { Language } from "@/enums/language.enum";
import { IUpdateSubmissionRequestDTO } from "../submission/UpdateSubmissionRequestDTO";
import { IExecutionResult, IFailedTestCase, IStats, ISubmission } from "@/infra/db/interface/submission.interface";
import { IGetSubmissionRequestDTO } from "../submission/getSubmissionRequestDTO";

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

    static toUpdateSubmissionService(body : IUpdateSubmissionInputDTO) : IUpdateSubmissionRequestDTO {
        if(!body.executionResult) throw new Error('Execution result is missing for updating submission.')
        return {
             _id : body.Id,
             executionResult : this._mapGrpcExecutionResult(body.executionResult),
             executionTime : body.executionTime,
             memoryUsage : body.memoryUsage
        }
    }

    static toGetSubmissionsService(body : IGetSubmissionInputDTO) : IGetSubmissionRequestDTO {
        if(!body.battleId && !body.problemId && !body.userId){
            throw new Error('Atleast one id is required to retrieve submissions');
        }
        return {
            page : body.page,
            limit : body.limit,
            battleId : body.battleId,
            problemId : body.problemId,
            userId : body.userId
        }   
    }

    static toOutDTO(body : ISubmission) : Submission {
        return {
            Id : body.id,
            problemId : body.problemId.toString(),
            userId : body.userId,
            country : body.country ?? '',
            title : body.title,
            ...(body.battleId ? {battleId : body.battleId} : {}),
            score : body.score,
            language : this._mapServiceLanguageEnum(body.language),
            userCode : body.userCode,
            ...(body.executionResult 
            ? {
                executionResult : {
                    ...(body.executionResult.failedTestCase
                        ? { failedTestCase : body.executionResult.failedTestCase }
                        : {}),
                    stats : body.executionResult.stats
                }
            } 
            : {}),
            difficulty : this._mapServiceDifficulyEnum(body.difficulty),
            ...(body.executionTime ? { executionTime : body.executionTime} : {}),
            ...(body.memoryUsage ? { memoryUsage : body.memoryUsage } : {}),
            isFirst : body.isFirst,
            updatedAt : body.updatedAt.toISOString(),
            createdAt : body.createdAt.toISOString()
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

    private static _mapServiceDifficulyEnum(difficulty : Difficulty) : GrpcDifficultyEnum {
        if (difficulty === Difficulty.EASY) {
            return 1;
        } else if (difficulty === Difficulty.MEDIUM) {
            return 2;
        } else if (difficulty === Difficulty.HARD) {
            return 3;
        } else {
            throw new Error('Invalid difficulty value mapping from service');
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

    private static _mapServiceLanguageEnum(language : Language) : GrpcLanguageEnum {
        if(language === Language.JAVASCRIPT){
            return 1;
        } else if (language === Language.PYTHON){
            return 2;
        } else {
            throw new Error('Invalid choosen language mapping from service');
        }
    }

    private static _mapGrpcExecutionResult(executionResult : IGrpcExecutionResult) : IExecutionResult {
        return {
            failedTestCase : executionResult.failedTestCase ? this._mapGrpcFailedTestCase(executionResult.failedTestCase) : null,
            stats : this._mapGrpcStats(executionResult.stats as IGrpcStats)
        }
    }

    private static _mapGrpcStats(stats : IGrpcStats) : IStats {
        return {
            failedTestCase : stats.failedTestCase,
            passedTestCase : stats.passedTestCase,
            totalTestCase : stats.totalTestCase
        }
    }
    
    private static _mapGrpcFailedTestCase(failedTestCase : IGrpcFailedTestCase) : IFailedTestCase {
        return {
            index : failedTestCase.index,
            input : failedTestCase.input,
            output : failedTestCase.output,
            expectedOutput : failedTestCase.expectedOutput
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

interface IUpdateSubmissionInputDTO {
    Id : string;
    executionResult? : IGrpcExecutionResult;
    executionTime : number;
    memoryUsage : number;
}

interface IGetSubmissionInputDTO {
    page : number;
    limit : number;
    problemId? : string;
    battleId? : string;
    userId? : string;
}