import { IExecutionResult } from "@/db/interface/submission.interface";
import { Language } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";

interface Submission {
    Id : string;
    status : string;
    language : Language;
    executionResult : IExecutionResult,
    userCode : string,
    hintsUsed : number;
    isAiAssisted : boolean;
    createdAt : string
}

export interface IListProblemSpecicSubmissionsDTO {
    submissions : Submission[]
    nextCursor : string;
    hasMore : boolean;
}