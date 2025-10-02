import { ProblemModel } from "../db/models/problem.model";
import { IProblem, ITemplateCode, ITestCase } from "../db/interface/problem.interface";
import { BaseRepository } from "./base.repository";
import { IProblemRepository } from "./interfaces/problem.repository.interface";
import { type TestcaseType } from "@/const/TestcaseType.const"; 

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
        testCaseCollectionType: TestcaseType, 
        testCase: ITestCase
    ): Promise<void> {
        await this.update( problemId, { $push : { [`testcaseCollection.${testCaseCollectionType}`] : testCase } } );
    }

    async removeTestCase(
        problemId: string, 
        testCaseId: string, 
        testCaseCollectionType: TestcaseType
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
        testCaseCollectionType: TestcaseType,
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

    async updateTemplateCode(
        problemId : string,
        templateCodeId : string,
        updatedTemplateCode : Partial<ITemplateCode>
    ) : Promise<void> {
        const set: Record<string, unknown> = {};
        if(updatedTemplateCode.language !== undefined) set["templateCodes.$.language"] = updatedTemplateCode.language;
        if(updatedTemplateCode.submitWrapperCode !== undefined) set["templateCodes.$.submitWrapperCode"] = updatedTemplateCode.submitWrapperCode;
        if(updatedTemplateCode.runWrapperCode !== undefined) set["templateCodes.$.runWrapperCode"] = updatedTemplateCode.runWrapperCode;
        await this._model.updateOne(
            { _id : problemId, "templateCodes._id" : templateCodeId },
            { $set : set }
        );
    }
}