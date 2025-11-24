import { Document, Types } from "mongoose";

export interface IHintsUsed {
    level : number;
    description : string;
    hint : string;
}

export interface IAiHintUsage extends Document {
    userId : string;
    problemId : Types.ObjectId;
    hintsUsed : IHintsUsed[];
    userCode : string;
    createdAt : Date;
    updatedAt : Date;
}