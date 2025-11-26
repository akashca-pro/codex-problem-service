import { Document, Types } from "mongoose";

export interface IHintsUsed {
    _id? : string;
    level : number;
    description : string;
    hint : string;
    createdAt : string;
}

export interface IAiHintUsage extends Document {
    userId : string;
    problemId : Types.ObjectId;
    hintsUsed : IHintsUsed[];
    userCode : string;
    createdAt : Date;
    updatedAt : Date;
}