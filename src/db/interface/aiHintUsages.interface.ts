import { Document, Types } from "mongoose";

export interface IHintsUsed {
    hint : string;
    createdAt : string;
}

export interface IAiHintUsage extends Document {
    userId : string;
    problemId : Types.ObjectId;
    hintsUsed : IHintsUsed[];
    submissionId? : Types.ObjectId
    userCode : string;
    createdAt : Date;
    updatedAt : Date;
}