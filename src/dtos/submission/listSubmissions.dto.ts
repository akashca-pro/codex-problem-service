import { IExecutionResult, IHintsUsed } from "@/db/interface/submission.interface";
import { Language } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";

interface Submission {
    Id : string;
    status : string;
    language : Language;
    executionResult : IExecutionResult,
    userCode : string,
    hintsUsed : IHintsUsed[] | null;
    isAiAssisted : boolean;
    createdAt : string
}

export interface IListProblemSpecicSubmissionsDTO {
    submissions : Submission[]
    nextCursor : string;
    hasMore : boolean;
}