import { 
    ExecutionResult as IGrpcExecutionResult,
    HintsUsed as IGrpcHintsUsed,
    Stats as IGrpcStats,
    FailedTestCase as IGrpcFailedTestCase,
    Difficulty as GrpcDifficultyEnum, 
    Language as GrpcLanguageEnum,
    Submission,
    CreateSubmissionRequest, 
} from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { ICreateSubmissionRequestDTO } from "../submission/CreateSubmissionRequestDTO";
import { type Difficulty, DIFFICULTY } from "@/const/Difficulty.const";
import { Language } from "@/enums/language.enum";
import { IUpdateSubmissionRequestDTO } from "../submission/UpdateSubmissionRequestDTO";
import { IExecutionResult, IFailedTestCase, IHintsUsed, IStats, ISubmission } from "@/db/interface/submission.interface";
import { IGetSubmissionRequestDTO } from "../submission/getSubmissionRequestDTO";
import { LeanDocument } from "mongoose";
import { IListProblemSpecicSubmissionsDTO } from "../submission/listSubmissions.dto";
export class SubmissionMapper {

    static toCreateSubmissionService(body : CreateSubmissionRequest) : ICreateSubmissionRequestDTO {

        return {
            problemId : body.problemId,
            userId : body.userId,
            username : body.username,
            battleId : body.battleId ? body.battleId : null,
            title : body.title,
            userCode : body.userCode,
            country : body.country ? body.country : null,
            difficulty : SubmissionMapper._mapGrpcDifficultyEnum(body.difficulty),
            language : SubmissionMapper._mapGrpcLanguageEnum(body.language)
        }
    }

    static toUpdateSubmissionService(body : IUpdateSubmissionInputDTO) : IUpdateSubmissionRequestDTO {
        if(!body.executionResult) throw new Error('Execution result is missing for updating submission.')
        return {
             executionResult : SubmissionMapper._mapGrpcExecutionResult(body.executionResult),
             status : body.status
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
            username : body.username,
            country : body.country ?? '',
            title : body.title,
            ...(body.battleId ? {battleId : body.battleId} : {}),
            score : body.score,
            language : SubmissionMapper._mapServiceLanguageEnum(body.language),
            userCode : body.userCode,
            ...(body.executionResult && body.executionResult.stats.totalTestCase
            ? {
                executionResult : {
                    ...(body.executionResult.failedTestCase
                        ? { failedTestCase : body.executionResult.failedTestCase }
                        : {}),
                    stats : body.executionResult.stats
                }
            } 
            : {}),
            difficulty : SubmissionMapper._mapServiceDifficulyEnum(body.difficulty),
            isFirst : body.isFirst,
            hintsUsed : body.hintsUsed?.map(SubmissionMapper._mapServiceHintsUsed) ?? [],
            isAiAssisted : body.isAiAssisted,
            status : body.status,
            updatedAt : body.updatedAt.toISOString(),
            createdAt : body.createdAt.toISOString()
        }
    }

    static toListProblemSpecificSubmissions(
        body: LeanDocument<ISubmission>[],
        nextCursor: string,
        hasMore: boolean
    ): IListProblemSpecicSubmissionsDTO {
        return {
            submissions: body.map((sub) => {
                const rawStats: Partial<IExecutionResult['stats']> = sub.executionResult?.stats ?? {};
                const stats: IExecutionResult['stats'] = {
                    totalTestCase: rawStats.totalTestCase ?? 0,
                    passedTestCase: rawStats.passedTestCase ?? 0,
                    failedTestCase: rawStats.failedTestCase ?? 0,
                    executionTimeMs: rawStats.executionTimeMs ?? 0,
                    memoryMB: rawStats.memoryMB ?? 0,
                };

                const rawFailed: Partial<IExecutionResult['failedTestCase']> = sub.executionResult?.failedTestCase ?? {};
                const failedTestCase: IExecutionResult['failedTestCase'] = {
                    index: rawFailed.index ?? 0,
                    input: rawFailed.input ?? '',
                    output: rawFailed.output ?? '',
                    expectedOutput: rawFailed.expectedOutput ?? '',
                };

                return {
                    Id: sub._id,
                    status: sub.status,
                    language: SubmissionMapper._mapServiceLanguageEnum(sub.language),
                    executionResult: {
                        stats,
                        failedTestCase,
                    },
                    userCode : sub.userCode,
                    hintsUsed : sub.hintsUsed?.length ? sub.hintsUsed : [],
                    isAiAssisted : sub.isAiAssisted,
                    createdAt : sub.createdAt.toISOString(),
                };
            }),
            nextCursor,
            hasMore,
        };
    }

    static _mapServiceHintsUsed(h : IHintsUsed) : IGrpcHintsUsed {
        return { Id : h._id!, level : h.level, hint : h.hint, createdAt : h.createdAt}
    }

    static _mapGrpcDifficultyEnum(difficulty : GrpcDifficultyEnum) : Difficulty {
        if (difficulty === 1) {
            return DIFFICULTY.EASY;
        } else if (difficulty === 2) {
            return DIFFICULTY.MEDIUM;
        } else if (difficulty === 3) {
            return DIFFICULTY.HARD;
        } else {
            throw new Error('Invalid difficulty value');
        }   
    }

    static _mapServiceDifficulyEnum(difficulty : Difficulty) : GrpcDifficultyEnum {
        if (difficulty === DIFFICULTY.EASY) {
            return 1;
        } else if (difficulty === DIFFICULTY.MEDIUM) {
            return 2;
        } else if (difficulty === DIFFICULTY.HARD) {
            return 3;
        } else {
            throw new Error('Invalid difficulty value mapping from service');
        }   
    }

    static _mapGrpcLanguageEnum(language : GrpcLanguageEnum) : Language {
        switch(language) {
            case 1: return Language.JAVASCRIPT;
            case 2: return Language.PYTHON;
            case 3: return Language.GO;
            default: throw new Error("Invalid language mapping from grpc");
        }
    }

    static _mapServiceLanguageEnum(language : Language) : GrpcLanguageEnum {
        switch(language) {
            case Language.JAVASCRIPT: return 1;
            case Language.PYTHON: return 2;
            case Language.GO: return 3;
            default: throw new Error("Invalid language mapping from service");
        }
    }

    static _mapGrpcExecutionResult(executionResult : IGrpcExecutionResult) : IExecutionResult {
        return {
            failedTestCase : executionResult.failedTestCase ? SubmissionMapper._mapGrpcFailedTestCase(executionResult.failedTestCase) : null,
            stats : SubmissionMapper._mapGrpcStats(executionResult.stats as IGrpcStats)
        }
    }

    static _mapGrpcStats(stats : IGrpcStats) : IStats {
        return {
            failedTestCase : stats.failedTestCase,
            passedTestCase : stats.passedTestCase,
            totalTestCase : stats.totalTestCase,
            executionTimeMs : stats.executionTimeMs,
            memoryMB : stats.memoryMB
        }
    }
    
    static _mapGrpcFailedTestCase(failedTestCase : IGrpcFailedTestCase) : IFailedTestCase {
        return {
            index : failedTestCase.index,
            input : failedTestCase.input,
            output : failedTestCase.output,
            expectedOutput : failedTestCase.expectedOutput
        }
    }
}

interface IUpdateSubmissionInputDTO {
    Id : string;
    executionResult? : IGrpcExecutionResult;
    status : string;
}

interface IGetSubmissionInputDTO {
    page : number;
    limit : number;
    problemId? : string;
    battleId? : string;
    userId? : string;
}