import mongoose, { Schema } from "mongoose";
import { IExecutionResult, IFailedTestCase, IStats, ISubmission } from "../interface/submission.interface";
import { SubmissionStatus } from "@/enums/submissionStatus.enum";
import { Language } from "@/enums/language.enum";
import { Difficulty } from "@/enums/difficulty.enum";


const FailedTestCaseSchema = new Schema<IFailedTestCase>(
    {
        index : { type : Number, required : true },
        input : { type : String, required : true },
        output : { type : String, required : true },
        expectedOutput : { type : String, required : true },
    },
    { _id : false }
);

const StatsSchema = new Schema<IStats>(
    {
        totalTestCase : { type : Number, required : true },
        passedTestCase : { type : Number, required : true },
        failedTestCase : { type : Number, required : true }
    },
    {_id : false}
)

const ExecutionSchema = new Schema<IExecutionResult>(
    {
        stats : { type : StatsSchema, required : true },
        failedTestCase : { type : FailedTestCaseSchema, required : false, default : null }
    },
    {_id : false}
)

const SubmissionSchema = new Schema<ISubmission>(
    {
        problemId : { type : Schema.Types.ObjectId, ref : 'Problem', required : true },
        userId : { type : String, required : true },
        country : { type : String, required : false, default : null },
        battleId : { type : String, required : false, default : null },
        title : { type : String, required : true },
        status : { type : String, required : true, enum : Object.values(SubmissionStatus)},
        score : { type : Number, required : true, default : 0 },
        language : { type : String, required : true, enum : Object.values(Language) },
        userCode : { type : String, required : true },
        executionResult : { type : ExecutionSchema, required : false, default : {} },
        executionTime : { type : Number, required : false, default : null },
        memoryUsage : { type : Number, required : false, default : null },
        difficulty : { type : String, required : true, enum : Object.values(Difficulty)},
        isFirst : { type : Boolean, required : true, default : false }
    },
    { timestamps : true }
)

SubmissionSchema.index({ userId : 1 , createdAt : -1 });
SubmissionSchema.index({ isFirst : 1 , country : 1 , score : -1 });
SubmissionSchema.index({ problemId : 1, userId : 1 });
SubmissionSchema.index({ battleId : 1, userId : 1 });


export const SubmissionModel = mongoose.model<ISubmission>('Submission',SubmissionSchema);