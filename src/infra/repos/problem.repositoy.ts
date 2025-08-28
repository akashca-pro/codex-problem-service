import { ProblemModel } from "../db/models/problem.model";
import { IExample, IProblem, ISolutionCode, IStarterCode, ITestCase } from "../db/interface/problem.interface";
import { BaseRepository } from "./base.repository";
import { IProblemRepository } from "./interfaces/problem.repository.interface";
import { TestCaseCollectionType } from "@/enums/testCaseCollectionType.enum";
import { IUpdateSolutionCodeDTO } from "@/dtos/problem/solutionCodeRequestDTOs";

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
    ): Promise<boolean> {
        const result = await this._model.updateOne({ _id : problemId }, {
            $pull : {
                [`testcaseCollection.${testCaseCollectionType}`]: { _id: testCaseId }
            }
        })
        return result.modifiedCount > 0
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
        solutionCode: ISolutionCode
    ): Promise<void> {
        await this.update(problemId,{
            $push : { solutionCodes : solutionCode }
        })
    }

    async updateSolutionCode(
        problemId: string, 
        solutionCodeId: string, 
        updateSolutionCode: IUpdateSolutionCodeDTO
    ): Promise<void> {
        const set: Record<string, unknown> = {};
        if (updateSolutionCode.code !== undefined) set["solutionCodes.$.code"] = updateSolutionCode.code;
        if (updateSolutionCode.language !== undefined) set["solutionCodes.$.language"] = updateSolutionCode.language;
        if (updateSolutionCode.executionTime !== undefined) set["solutionCodes.$.executionTime"] = updateSolutionCode.executionTime;
        if (updateSolutionCode.memoryTaken !== undefined) set["solutionCodes.$.memoryTaken"] = updateSolutionCode.memoryTaken;
        await this._model.updateOne(
            { _id : problemId, "solutionCodes._id" : solutionCodeId },
            { $set : set }
        );
    }

    async removeSolutionCode(
        problemId: string, 
        solutionCodeId: string
    ): Promise<boolean> {
        const result = await this._model.updateOne({ _id : problemId , 
            "solutionCodes._id" : solutionCodeId } ,
        {
            $pull : { solutionCodes : { _id : solutionCodeId } }
        })
        return result.modifiedCount > 0
    }
}