import mongoose, { Schema } from "mongoose";
import { IExecutionResult, IFailedTestCase, IStats } from "../interface/submission.interface";
import { IFirstSubmission } from "../interface/firstSubmission.interface";
import { SUBMISSION_STATUS_TYPES } from "@/const/SubmissionStatus.const";
import { Language } from "@/enums/language.enum";
import { DIFFICULTY } from "@/const/Difficulty.const";

const FailedTestCaseSchema = new Schema<IFailedTestCase>(
    {
        index : { type : Number, required : false, default : null },
        input : { type : String, required : false, default : null },
        output : { type : String, required : false, default : null },
        expectedOutput : { type : String, required : false, default : null },
    },
    { _id : false }
);

const StatsSchema = new Schema<IStats>(
    {
        totalTestCase : { type : Number, required : false, default : null },
        passedTestCase : { type : Number, required : false, default : null },
        failedTestCase : { type : Number, required : false, default : null },
        executionTimeMs : { type : Number, required : false, default : null },
        memoryMB : { type : Number, required : false, default : null}
    },
    {_id : false}
)

const ExecutionSchema = new Schema<IExecutionResult>(
    {
        stats : { type : StatsSchema, required : false, default : {} },
        failedTestCase : { type : FailedTestCaseSchema, required : false, default : {} }
    },
    {_id : false}
)

const FirstSubmissionSchema = new Schema<IFirstSubmission>(
    {
        problemId : { type : Schema.Types.ObjectId, ref : 'Problem', required : true },
        submissionId : { type : Schema.Types.ObjectId, ref : 'Submission', required : true},
        userId : { type : String, required : true },
        username : { type : String, requried : true },
        country : { type : String, required : false, default : null },
        battleId : { type : String, required : false, default : null },
        title : { type : String, required : true },
        status : { type : String, required : true, enum : Object.values(SUBMISSION_STATUS_TYPES), default : SUBMISSION_STATUS_TYPES.PENDING},
        score : { type : Number, required : true, default : 0 },
        language : { type : String, required : true, enum : Object.values(Language) },
        userCode : { type : String, required : true },
        executionResult : { type : ExecutionSchema, required : false, default : {} },
        difficulty : { type : String, required : true, enum : Object.values(DIFFICULTY)},
        isFirst : { type : Boolean, required : true, default : false }
    },
    { timestamps : true }
)

FirstSubmissionSchema.index({ userId: 1, problemId: 1 }, { unique: true });
FirstSubmissionSchema.index({ userId: 1, difficulty: 1 });

export const FirstSubmissionModel = mongoose.model<IFirstSubmission>('FirstSubmission', FirstSubmissionSchema);