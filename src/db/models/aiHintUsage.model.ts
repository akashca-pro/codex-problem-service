import mongoose, {Schema} from "mongoose";
import { IAiHintUsage, IHintsUsed } from "../interface/aiHintUsages.interface";

const HintUsedSchema = new Schema<IHintsUsed>(
    {
        hint : {type : String, required : true},
        createdAt : {type : String, required : true}
    },
    {_id : false}
)

export const AiHintUsages = new Schema<IAiHintUsage>(
    {
        userId : { type : String, required : true },
        problemId : { type : Schema.Types.ObjectId, required : true },
        hintsUsed : { type : [HintUsedSchema], required : true },
        submissionId : { type : Schema.Types.ObjectId, required : false },
        userCode : { type : String, required : true }
    },
    {timestamps : true}
)

AiHintUsages.index({ userId : 1, problemId : 1});

export const AiHintUsageModel = mongoose.model<IAiHintUsage>('AiHintUsage', AiHintUsages);