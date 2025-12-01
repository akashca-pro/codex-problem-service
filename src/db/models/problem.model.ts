import mongoose, {Schema} from "mongoose";
import { IExample, IProblem, IStarterCode, ITestCase, ITestCaseCollection, ITemplateCode, ISolutionRoadmap } from "../interface/problem.interface";
import { Language } from "@/enums/language.enum";
import { DIFFICULTY } from "@/const/Difficulty.const";
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
    }
)

const SolutionRoadmapSchema = new Schema<ISolutionRoadmap>(
    {
        level : { type : Number, required : true },
        description : { type : String, required : true }
    },
)

const TemplateCodeSchema = new Schema<ITemplateCode>(
    {
        language: { type: String, required: true, enum: Object.values(Language) },
        runWrapperCode: { type: String, required: false, default: '' },
        submitWrapperCode: { type: String, required: false, default: '' },
    }
);

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
        difficulty: { type: String, enum: Object.values(DIFFICULTY), required: true },
        tags: { type: [String], required: true },
        constraints: { type: [String], required: false , default : []},
        starterCodes: { type: [StarterCodeSchema], required: false, default : [] },
        testcaseCollection: { type: TestCaseCollectionSchema, required: false, default : {} },
        templateCodes : { type :  [TemplateCodeSchema], required : false, default : [] },
        examples: { type: [ExamplesSchema], required: false  , default : []},
        solutionRoadmap : { type : [SolutionRoadmapSchema], required : false, default : [] },
        active: { type: Boolean, default: true },
    },

    { timestamps : true }
)

    ProblemSchema.index({ questionId: 1 }, { unique: true });
    ProblemSchema.index({ title: 1 }, { unique: true });
    ProblemSchema.index({ title: 'text' });
    ProblemSchema.index({ difficulty: 1, createdAt: 1 });
    ProblemSchema.index({ tags: 1 });
    ProblemSchema.index({ active: 1, difficulty: 1 });


ProblemSchema.pre('save', function (next) {
  if (!this.templateCodes || this.templateCodes.length === 0) {
    this.templateCodes = Object.values(Language).map((lang) => ({
      language: lang,
      submitWrapperCode: '',
      runWrapperCode: ''
    }));
  }
  next();
});

export const ProblemModel = mongoose.model<IProblem>('Problem',ProblemSchema);