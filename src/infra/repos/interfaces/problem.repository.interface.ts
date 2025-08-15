import { IExample, IProblem, ISolutionCode, IStarterCode, ITestCase } from "@/infra/db/interface/problem.interface";
import { BaseRepository } from "../base.repository";
import { FilterQuery } from "mongoose";
import { TestCaseCollectionType } from "@/enums/testCaseCollectionType.enum";
import { IUpdateSolutionCodeDTO } from "@/dtos/problem/solutionCodeRequestDTOs";

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
        testCaseCollectionType : TestCaseCollectionType,
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
        testCaseCollectionType : TestCaseCollectionType,
    ) : Promise<void>

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
        testCaseCollectionType : TestCaseCollectionType,
        testCases : ITestCase[]
    ) : Promise<void>

    /**
     * Adds solution code to the problem.
     *
     * @async
     * @param problemId - The id of the document.
     * @param solutionCode - The solution code data to be added.
     */
    addSolutionCode (
        problemId : string,
        solutionCode : ISolutionCode
    ) : Promise<void>

    /**
     * Updates existing solution code in the problem.
     *
     * @async
     * @param problemId - The id of the document.
     * @param solutionCodeId - The id of the solution code to update.
     * @param solutionCode - The updated solution code data.
     */
    updateSolutionCode(
        problemId : string,
        solutionCodeId : string,
        updatedSolutionCode : IUpdateSolutionCodeDTO
    ) : Promise<void>

    /**
     * Removes solution code from the problem.
     *
     * @async
     * @param problemId - The id of the document.
     * @param solutionCodeId - The id of the solution code to remove.
     */
    removeSolutionCode(
        problemId : string,
        solutionCodeId : string
    ) : Promise<boolean>

}