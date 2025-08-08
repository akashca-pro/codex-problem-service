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

    async findByTitle(
        title: string
    ): Promise<IProblem | null> {
        return await this._model.findOne({ title })
    }

    async addTestCase(
        problemId: string, 
        testCaseCollectionType: TestCaseCollectionType, 
        testCase: ITestCase
    ): Promise<void> {
        await this.update( problemId, { $push : { [`testcaseCollection.${testCaseCollectionType}`] : testCase } } );
    }

    async removeTestCase(
        problemId: string, 
        testCaseId: string, 
        testCaseCollectionType: TestCaseCollectionType
    ): Promise<void> {
        const problem = await this.findById(problemId);
        if (!problem) throw new Error(DbErrorType.ProblemNotFound);

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
        await this.update(problemId, {
            $push: {
                [`testcaseCollection.${testCaseCollectionType}`]: {
                    $each: testCases,
                },
            },
        });
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