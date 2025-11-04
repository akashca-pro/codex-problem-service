import { IProblem, ITemplateCode, ITestCase } from "@/db/interface/problem.interface";
import { BaseRepository } from "../base.repository";
import { FilterQuery } from "mongoose";
import { type TestcaseType } from "@/const/TestcaseType.const"; 

/**
 * The interface representing the structure of problem repository.
 * 
 * @interface
 */
export interface IProblemRepository extends BaseRepository <IProblem>{

    /**
     * This method is responsible for get problem data based on provided title.
     * 
     * @param title - The of the problem
     * @returns {IProblem | null} - The problem data or null if not found.
     */
    findByTitle(
        title : string
    ) : Promise<IProblem | null>

    /**
     * This method is responsible for adding testcase to the specific field (run & submit).
     * 
     * @async
     * @param problemId - The id of the document.
     * @param testCaseCollectionType - The type of the testcase collection (run & submit).
     * @param testCase - The testcase data to be added.
     */
    addTestCase(
        problemId : string,
        testCaseCollectionType : TestcaseType,
        testCase : ITestCase
    ) : Promise<void>

    /**
     * Removes a testcase from the specified collection type.
     *
     * @async
     * @param problemId - The id of the document.
     * @param testCaseId - The id of the testcase to remove.
     * @param testCaseCollectionType - The type of the testcase collection (run or submit).
     */
    removeTestCase(
        problemId : string,
        testCaseId : string,
        testCaseCollectionType : TestcaseType,
    ) : Promise<boolean>

    /**
     * Bulk uploads multiple testcases to the specified collection type.
     *
     * @async
     * @param problemId - The id of the document.
     * @param testCaseCollectionType - The type of the testcase collection (run or submit).
     * @param testCases - An array of testcases to be added.
     */
    bulkUploadTestCase(
        problemId : string,
        testCaseCollectionType : TestcaseType,
        testCases : ITestCase[]
    ) : Promise<void>

    /**
     * Updates existing template code in problem document.
     * 
     * @async
     * @param problemId - The id of the document.
     * @param templateCodeId - The id of the template code.
     * @param updatedTemplateCode - The updated template code.
     */
    updateTemplateCode(
        problemId : string,
        templateCodeId : string,
        updatedTemplateCode : Partial<ITemplateCode>
    ) : Promise<void>

}