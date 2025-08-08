import { ProblemModel } from "../db/models/problem.model";
import { IExample, IProblem, ISolutionCode, IStarterCode, ITestCase } from "../db/interface/problem.interface";
import { BaseRepository } from "./base.repository";
import { IProblemRepository } from "./interfaces/problem.repository.interface";

/**
 * This class implements the problem repository.
 * 
 * @class
 * @extends {BaseRepository}
 * @implements {IProblemRepository}
 */
export class ProblemRepository extends BaseRepository<IProblem> implements IProblemRepository {

    constructor(){
        super(ProblemModel)
    }

    async addTestCase(
        problemId: string, 
        testCaseCollectionType: TestCaseCollectionType, 
        testCase: ITestCase
    ): Promise<void> {
        
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this.update(
            problemId,
            { $push : { [`testcaseCollection.${testCaseCollectionType}`] : testCase } }
        );

    }

    async updateTestCase(
        problemId : string,
        testCaseId : string,
        testCaseCollectionType : TestCaseCollectionType,
        updatedTestCase : ITestCase,
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        const testCases = problem.testcaseCollection[testCaseCollectionType];
        const targetTestCase = testCases.find(tc => tc._id.toString() === testCaseId);

        if (!targetTestCase) throw new Error(DbErrorType.TestCaseNotFound);

        targetTestCase.input = updatedTestCase.input;
        targetTestCase.output = updatedTestCase.output;

        await problem.save();
    }

    async removeTestCase(
        problemId: string, 
        testCaseId: string, 
        testCaseCollectionType: TestCaseCollectionType
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        const testCases = problem.testcaseCollection[testCaseCollectionType];
        const targetTestCase = testCases.find(tc => tc._id.toString() === testCaseId);

        if (!targetTestCase) throw new Error(DbErrorType.TestCaseNotFound);

        await this.update(problemId, {
            $pull : {
                [`testcaseCollection.${testCaseCollectionType}`]: { _id: testCaseId }
            }
        })
    }

    async bulkUploadTestCase(
        problemId: string, 
        testCaseCollectionType: TestCaseCollectionType,
        testCases : ITestCase[]
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this.update(problemId, {
            $push: {
                [`testcaseCollection.${testCaseCollectionType}`]: {
                    $each: testCases,
                },
            },
        });
    }

    async addContraint(
        problemId: string, 
        constraints: string[]
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this.update(problemId,{
            $push : {
                constraints : { $each : constraints }
            }
        })
    }

    async removeConstraint(
        problemId: string
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this.update(problemId,{
            $pop : { constraints : 1 }
        })
    }

    async addTag(
        problemId: string, 
        tags: string[]
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this.update(problemId,{
            $push : { 
                tags : { $each : tags }
            }
        })
    }

    async removeTag(
        problemId: string
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this.update(problemId,{
            $pop : { tags : 1 }
        })
    }

    async addStarterCode(
        problemId: string, 
        starterCode: Partial<IStarterCode>
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this.update(problemId,{
            $push : { starterCodes : starterCode }
        })
    }

    async updateStarterCode(
        problemId: string, 
        starterCodeId: string,
        starterCode : IStarterCode
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this._model.updateOne(
            { _id : problemId, "starterCodes._id" : starterCodeId },
            {
                $set : {
                    "starterCodes.$.language" : starterCode.language,
                    "starterCodes.$.code" : starterCode.code
                }
            }
        );
    }

    async removeStarterCode(
        problemId: string,
        starterCodeId: string
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this.update(problemId,{
            $pull : {
                starterCodes : { _id : starterCodeId }
            }
        })
    }

    async addExample(
        problemId: string, 
        example: Partial<IExample>
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this.update(problemId,{
            $push : { examples : example }
        })
    }

    async updateExample(
        problemId: string, 
        exampleId: string, 
        example: IExample
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this._model.updateOne(
            { _id : problemId, "examples._id" : exampleId },
            {
                $set : {
                    "examples.$.input" : example.input,
                    "examples.$.output" : example.output,
                    "examples.$.explanation" : example.explanation,
                }
            }
        );
    }

    async removeExample(
        problemId: string,
        exampleId: string
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this.update(problemId,{
            $pull : {
                examples : { _id : exampleId }
            }
        })

    }

    async addSolutionCode(
        problemId: string, 
        solutionCode: Partial<ISolutionCode>
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this.update(problemId,{
            $push : { solutionCodes : solutionCode }
        })
    }

    async updateSolutionCode(
        problemId: string, 
        solutionCodeId: string, 
        solutionCode: ISolutionCode
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this._model.updateOne(
            { _id : problemId, "solutionCodes._id" : solutionCodeId },
            {
                $set : {
                    "solutionCodes.$.language" : solutionCode.language,
                    "solutionCodes.$.code" : solutionCode.code,
                    "solutionCodes.$.executionTime" : solutionCode.executionTime,
                    "solutionCodes.$.memoryTaken" : solutionCode.memoryTaken,
                }
            }
        );
    }

    async removeSolutionCode(
        problemId: string, 
        solutionCodeId: string
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

        await this.update(problemId,{
            $pull : {
                solutionCodes : { _id : solutionCodeId }
            }
        })
    }
}