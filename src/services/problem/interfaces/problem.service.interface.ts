import { PaginationDTO } from "@/dtos/PaginationDTO";
import { ICreateProblemRequestDTO } from "@/dtos/problem/CreateProblemRequestDTO";
import { IListProblemsRequestDTO } from "@/dtos/problem/listProblemsRequestDTO";
import { IUpdateSolutionCodeDTO } from "@/dtos/problem/solutionCodeRequestDTOs";
import { IUpdateBasicProblemRequestDTO } from "@/dtos/problem/updateProblemRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { TestCaseCollectionType } from "@/enums/testCaseCollectionType.enum";
import { ISolutionCode, ITestCase } from "@/infra/db/interface/problem.interface";

/**
 * Interface representing the structure of the problem service.
 * 
 * @interface
 */
export interface IProblemService {

    /**
     * Creates a new problem.
     * 
     * @async
     * @param data - data to create a new problem
     * @returns {ResponseDTO} - the response data
     */
    createProblem(
        data: ICreateProblemRequestDTO
    ): Promise<ResponseDTO>;

    /**
     * Fetches the details of a problem by its id.
     * 
     * @async
     * @param id - id of the problem to fetch details
     * @returns {ResponseDTO} - the response data
     */
    getProblem(
        id: string
    ): Promise<ResponseDTO>;

    /**
     * Fetches the details of a public problem by its id.
     * 
     * @async
     * @param id - id of the public problem to fetch details
     * @returns {ResponseDTO} - the response data
     */
    getProblemPublic(
        id: string
    ): Promise<ResponseDTO>;

    /**
     * Lists problems based on the provided filters.
     * 
     * @async
     * @param filters - filters to list problems
     * @returns {PaginationDTO} - the paginated response data
     */
    listProblems(
        filters: IListProblemsRequestDTO
    ): Promise<PaginationDTO>;

    /**
     * Updates basic details of an existing problem.
     * 
     * @async
     * @param id - problem id to update
     * @param updatedData - data to update problem
     * @returns {ResponseDTO} - the response data
     */
    updateBasicProblemDetails(
        id: string, 
        updatedData: IUpdateBasicProblemRequestDTO
    ): Promise<ResponseDTO>;

    /**
     * Executes the add test case service.
     * 
     * @async
     * @param {string} problemId - The ID of the problem to which the test case is to be added.
     * @param {TestCaseCollectionType} testCaseCollectionType - The type of test case collection.
     * @param {IAddTestCaseRequestDTO} testCase - The data for adding testcase
     * @return {ResponseDTO}
     */
    addTestCase(
        problemId: string, 
        testCaseCollectionType : TestCaseCollectionType,
        testCase: ITestCase
    ): Promise<ResponseDTO>;

    /**
     * Executes the bulk upload test case service.
     * 
     * @async
     * @param {string} problemId - The ID of the problem to which the test cases are to be added.
     * @param {TestCaseCollectionType} testCaseCollectionType - The type of test case collection.
     * @param {ITestCase[]} testCases - The data for bulk uploading test cases
     * @return {ResponseDTO}
     */
    bulkUploadTestCases(
        problemId: string, 
        testCaseCollectionType : TestCaseCollectionType,
        testCases: ITestCase[]
    ): Promise<ResponseDTO>;

    /**
     * Removes a test case from a problem.
     * 
     * @async
     * @param problemId - problem id to which the test case to be removed
     * @param testCaseId - test case id to be removed
     * @param testCaseCollectionType - type of test case collection
     * @returns {ResponseDTO} - the response data
     */
    removeTestCase(
        problemId: string, 
        testCaseId: string, 
        testCaseCollectionType : TestCaseCollectionType
    ): Promise<ResponseDTO>;

    /**
     * Add solution code to a problem.
     * 
     * @async
     * @param {string} problemId - The ID of the problem to which the solution code is to be added.
     * @param {IAddSolutionCodeRequestDTO} solutionCode - The data for adding solution code.
     * @return {ResponseDTO}
     */
    addSolutionCode(
        problemId: string, 
        solutionCode: ISolutionCode
    ): Promise<ResponseDTO>;

    /**
     * Updates an existing solution code for a problem.
     * 
     * @async
     * @param problemId - id of the problem to which the solution code belongs
     * @param solutionId - id of the solution code to be updated
     * @param updatedSolutionCode - data to update the solution code
     * @returns {ResponseDTO} - the response data
     */
    updateSolutionCode(
        problemId: string, 
        solutionId: string, 
        updatedSolutionCode: IUpdateSolutionCodeDTO
    ): Promise<ResponseDTO>;

    /**
     * Removes a solution code from a problem.
     * 
     * @async
     * @param problemId - id of the problem to which the solution code belongs
     * @param solutionId - id of the solution code to be removed
     * @returns {ResponseDTO} - the response data
     */
    removeSolutionCode(
        problemId: string, 
        solutionId: string
    ): Promise<ResponseDTO>;

    /**
     * Check if the question id is available or not.
     * 
     * @param questionId - question id to check availability
     * @returns {ResponseDTO} whether the question id is available or not
     */
    checkQuestionIdAvailability(
        questionId: string
    ): Promise<ResponseDTO>;

    /**
     * Check if the problem title is available or not.
     * 
     * @async
     * @param title - title of the problem to check availability
     * @returns {ResponseDTO} - returns whether the title is available or not
     */
    checkProblemTitleAvailability(
        title: string
    ): Promise<ResponseDTO>;
}