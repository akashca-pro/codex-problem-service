import mongoose, {Schema} from "mongoose";
import { IExamples, IProblem, IStarterCode, ITemplateSolution, ITestCase, ITestCaseCollection } from "../types/problem";

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
        run : { type : [TestCaseSchema], required : true },
        submit : { type : [TestCaseSchema], required : true }
    },

    {_id : false}
)

const ExamplesSchema = new Schema<IExamples>(
    {
        input : { type : String, required : true },
        output : { type : String, required : true },
        explanation : { type : String, required : true }
    }
)

const SolutionCodeSchema = new Schema<ITemplateSolution>(
    {
        language : { type : String, required : true, enum : Object.values(Language) },
        code : { type : String, required : true },
        executionTime : { type : Number , required : false, default : undefined },
        memoryTaken : { type : Number, required : false, default : undefined }
    }
)

/**
 * Mongodb schema for problem collection.
 * 
 * @schema
 */
const ProblemSchema = new Schema<IProblem>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        difficulty: { type: String, enum: Object.values(Difficulty), required: true },
        tags: { type: [String], required: true },
        constraints: { type: [String], required: true },
        starterCode: { type: [StarterCodeSchema], required: true },
        testcaseCollection: { type: TestCaseCollectionSchema, required: true },
        solutionCode : { type : [SolutionCodeSchema], required : false, default : undefined },
        examples: { type: ExamplesSchema, required: true },
        active: { type: Boolean, default: true },
    },

    { timestamps : true }
)

export const ProblemModel = mongoose.model<IProblem>('Problem',ProblemSchema);