import { IProblem, ITemplateCode, ITestCase } from "@/db/interface/problem.interface";
import { BaseRepository } from "../base.repository";
import { FilterQuery } from "mongoose";
import { type TestcaseType } from "@/const/TestcaseType.const"; 
import { IAdminDashboardProblemStats } from "@/dtos/dashboard.dto";

/**
 * The interface representing the structure of problem repository.
 * 
 * @interface
 */
export interface IProblemRepository extends BaseRepository <IProblem>{

    findByTitle(
        title : string
    ) : Promise<IProblem | null>

    addTestCase(
        problemId : string,
        testCaseCollectionType : TestcaseType,
        testCase : ITestCase
    ) : Promise<void>

    removeTestCase(
        problemId : string,
        testCaseId : string,
        testCaseCollectionType : TestcaseType,
    ) : Promise<boolean>

    bulkUploadTestCase(
        problemId : string,
        testCaseCollectionType : TestcaseType,
        testCases : ITestCase[]
    ) : Promise<void>

    updateTemplateCode(
        problemId : string,
        templateCodeId : string,
        updatedTemplateCode : Partial<ITemplateCode>
    ) : Promise<void>

    getAdminProblemStats () : Promise<IAdminDashboardProblemStats>

}