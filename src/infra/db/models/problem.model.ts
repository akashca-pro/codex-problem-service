import mongoose, {Schema} from "mongoose";
import { IExample, IProblem, IStarterCode, ISolutionCode, ITestCase, ITestCaseCollection, ITemplateCode } from "../interface/problem.interface";
import { Language } from "@/enums/language.enum";
import { Difficulty } from "@/enums/difficulty.enum";

const StarterCodeSchema = new Schema<IStarterCode>(
    {
        language : { type : String, required : true , enum : Object.values(Language) },
        code : { type : String, required : true },
    }
);

const TestCaseSchema = new Schema<ITestCase>(
    { 
        input : { type : String, required : true },
        output : { type : String, required : true }
    }
)

const TestCaseCollectionSchema = new Schema<ITestCaseCollection>(
    {
        run : { type : [TestCaseSchema], required : true, default : [] },
        submit : { type : [TestCaseSchema], required : true , default : [] }
    },

    {_id : false}
)

const ExamplesSchema = new Schema<IExample>(
    {
        input : { type : String, required : true },
        output : { type : String, required : true },
        explanation : { type : String, required : true }
    }
)

const SolutionCodeSchema = new Schema<ISolutionCode>(
    {
        language : { type : String, required : true, enum : Object.values(Language) },
        code : { type : String, required : true },
        executionTime : { type : Number , required : false, default : undefined },
        memoryTaken : { type : Number, required : false, default : undefined }
    }
)

const TemplateCodeSchema = new Schema<ITemplateCode>(
    {
        language : { type : String, required : true, enum : Object.values(Language) },
        solutionClass : { type : String, required : true },
        mainFunc : { type : String, required : true },
        helpers : { type : String,  required : false, default : undefined }
    }
)

/**
 * Mongodb schema for problem collection.
 * 
 * @schema
 */
const ProblemSchema = new Schema<IProblem>(
    {
        questionId : { type : String, required : true, unique : true },
        title: { type: String, required: true , unique : true},
        description: { type: String, required: true },
        difficulty: { type: String, enum: Object.values(Difficulty), required: true },
        tags: { type: [String], required: true },
        constraints: { type: [String], required: false , default : []},
        starterCodes: { type: [StarterCodeSchema], required: false, default : [] },
        testcaseCollection: { type: TestCaseCollectionSchema, required: false, default : {} },
        solutionCodes : { type : [SolutionCodeSchema], required : false , default : []},
        templateCodes : { type :  [TemplateCodeSchema], required : false, default : [] },
        examples: { type: [ExamplesSchema], required: false  , default : []},
        active: { type: Boolean, default: true },
    },

    { timestamps : true }
)

ProblemSchema.index({ difficulty: 1, createdAt: 1 });
ProblemSchema.index({ title: 1 });
ProblemSchema.index({ tags : 1 });
ProblemSchema.index({ questionId : 1 });

export const ProblemModel = mongoose.model<IProblem>('Problem',ProblemSchema);