import mongoose, {Schema} from "mongoose";
import { IExamples, IProblem, IStarterCode, ITestCase, ITestCaseCollection } from "../types/problem";

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
        examples: { type: ExamplesSchema, required: true },
        active: { type: Boolean, default: true },
    },

    { timestamps : true }
)

export const ProblemModel = mongoose.model<IProblem>('Problem',ProblemSchema);