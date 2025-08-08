import { IExample, IProblem, ISolutionCode, IStarterCode, ITestCase } from "@/infra/db/interface/problem.interface";
import { BaseRepository } from "../base.repository";

/**
 * The interface representing the structure of problem repository.
 * 
 * @interface
 */
export interface IProblemRepository extends BaseRepository <IProblem>{

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
     * Updates an existing testcase in the specified collection type.
     *
     * @async
     * @param problemId - The id of the document.
     * @param testCaseId - The id of the testcase to update.
     * @param testCaseCollectionType - The type of the testcase collection (run or submit).
     * @param updatedTestCase - The updated testcase data.
     */
    updateTestCase(
        problemId : string,
        testCaseId : string,
        testCaseCollectionType : TestCaseCollectionType,
        updatedTestCase : ITestCase,
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
     * Adds constraint to the problem.
     *
     * @async
     * @param problemId - The id of the document.
     * @param constraints[] - The constraints to be added (can be added one or more) .
     */
    addContraint(
        problemId : string,
        constraints : string[]
    ): Promise<void>

    /**
     * Removes constraints from the problem.
     *
     * @async
     * @param problemId - The id of the document.
     */
    removeConstraint(
        problemId : string
    ) : Promise<void>

    /**
     * Adds a tag to the problem.
     *
     * @async
     * @param problemId - The id of the document.
     * @param tags[] - The tags to be added (can be one or more).
     */
    addTag(
        problemId : string,
        tags : string[]
    ) : Promise<void>

    /**
     * Removes a tag from the problem.
     *
     * @async
     * @param problemId - The id of the document.
     */
    removeTag(
        problemId : string
    ) : Promise<void>

    /**
     * Adds starter code to the problem.
     *
     * @async
     * @param problemId - The id of the document.
     * @param starterCode - The starter code data to be added.
     */
    addStarterCode(
        problemId : string,
        starterCode : Partial<IStarterCode>
    ) : Promise<void>

    /**
     * Updates existing starter code in the problem.
     *
     * @async
     * @param problemId - The id of the document.
     * @param starterCodeId - The id of the starter code to update.
     * @param starterCode - The updated starter code data.
     */
    updateStarterCode(
        problemId : string,
        starterCodeId : string,
        starterCode : IStarterCode
    ) : Promise<void>

    /**
     * Removes starter code from the problem.
     *
     * @async
     * @param problemId - The id of the document.
     * @param starterCodeId - The id of the starter code to remove.
     */
    removeStarterCode(
        problemId : string,
        starterCodeId : string,
    ) : Promise<void>

    /**
     * Adds an example to the problem.
     *
     * @async
     * @param problemId - The id of the document.
     * @param example - The example data to be added.
     */
    addExample(
        problemId : string,
        example : Partial<IExample>
    ) : Promise<void>

    /**
     * Updates an existing example in the problem.
     *
     * @async
     * @param problemId - The id of the document.
     * @param exampleId - The id of the example to update.
     * @param example - The updated example data.
     */
    updateExample(
        problemId : string,
        exampleId : string,
        example : IExample
    ) : Promise<void>

    /**
     * Removes an example from the problem.
     *
     * @async
     * @param problemId - The id of the document.
     * @param exampleId - The id of the example to remove.
     */
    removeExample(
        problemId : string,
        exampleId : string,
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
        solutionCode : Partial<ISolutionCode>
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
        solutionCode : ISolutionCode
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
    ) : Promise<void>

}