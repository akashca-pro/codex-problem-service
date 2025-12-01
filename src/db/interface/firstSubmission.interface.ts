import { SubmissionStatus } from "@/const/SubmissionStatus.const";
import { Language } from "@/enums/language.enum";
import { Document, Types } from "mongoose";
import { IExecutionResult } from "./submission.interface";
import { Difficulty } from "@/const/Difficulty.const";

export interface IFirstSubmission extends Document {
    problemId : Types.ObjectId;
    submissionId : Types.ObjectId;
    userId : string;
    username : string;
    country : string | null;
    battleId : string | null;
    title : string;
    status : SubmissionStatus;
    score : number;
    language : Language;
    userCode : string;
    hintsUsed : number;
    executionResult : IExecutionResult | null;
    difficulty : Difficulty;
    isAiAssisted : boolean;
    isFirst : boolean;
    createdAt : Date;
    updatedAt : Date;
}