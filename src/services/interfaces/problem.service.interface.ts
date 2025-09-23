import { PaginationDTO } from "@/dtos/PaginationDTO";
import { ICreateProblemRequestDTO } from "@/dtos/problem/CreateProblemRequestDTO";
import { IListProblemsRequestDTO } from "@/dtos/problem/listProblemsRequestDTO";
import { IUpdateSolutionCodeDTO } from "@/dtos/problem/solutionCodeRequestDTOs";
import { IUpdateBasicProblemRequestDTO } from "@/dtos/problem/updateProblemRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { TestCaseCollectionType } from "@/enums/testCaseCollectionType.enum";
import { ISolutionCode, ITestCase } from "@/infra/db/interface/problem.interface";
import { AddSolutionCodeRequest, AddTemplateCodeRequest, AddTestCaseRequest, BulkUploadTestCasesRequest, CreateProblemRequest, GetProblemRequest, ListProblemRequest, RemoveSolutionCodeRequest, RemoveTemplateCodeRequest, RemoveTestCaseRequest, UpdateBasicProblemDetailsRequest, UpdateSolutionCodeRequest, UpdateTemplateCode, UpdateTemplateCodeRequest } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";

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
     * @param request - Request payload to create a new problem
     * @returns {ResponseDTO} - the response data
     */
    createProblem(
        request : CreateProblemRequest
    ): Promise<ResponseDTO>;

    /**
     * Fetches the details of a problem by its id.
     * 
     * @async
     * @param request - Request payload to fetch details.
     * @returns {ResponseDTO} - the response data
     */
    getProblem(
        request : GetProblemRequest
    ): Promise<ResponseDTO>;

    /**
     * Fetches the details of a public problem by its id.
     * 
     * @async
     * @param request - Request payload to fetch details for public response.
     * @returns {ResponseDTO} - the response data
     */
    getProblemPublic(
        request : GetProblemRequest
    ): Promise<ResponseDTO>;

    /**
     * Lists problems based on the provided filters.
     * 
     * @async
     * @param request - Request payload contain filters to list problems
     * @returns {PaginationDTO} - the paginated response data
     */
    listProblems(
        request : ListProblemRequest
    ): Promise<PaginationDTO>;

    /**
     * Updates basic details of an existing problem.
     * 
     * @async
     * @param request - Request payload contain id and updatedData.
     * @returns {ResponseDTO} - the response data
     */
    updateBasicProblemDetails(
        request : UpdateBasicProblemDetailsRequest
    ): Promise<ResponseDTO>;

    /**
     * Executes the add test case service.
     * 
     * @async
     * @param request - Request payload contain problem id and testcase data.
     * @return {ResponseDTO}
     */
    addTestCase(
        request : AddTestCaseRequest
    ): Promise<ResponseDTO>;

    /**
     * Executes the bulk upload test case service.
     * 
     * @async
     * @param request - Request payload contain problem id and testcases.
     * @return {ResponseDTO}
     */
    bulkUploadTestCases(
        request : BulkUploadTestCasesRequest
    ): Promise<ResponseDTO>;

    /**
     * Removes a test case from a problem.
     * 
     * @async
     * @param request - Request payload contain problem and testcase id.
     * @returns {ResponseDTO} - the response data
     */
    removeTestCase(
        request : RemoveTestCaseRequest
    ): Promise<ResponseDTO>;

    /**
     * Add solution code to a problem.
     * 
     * @async
     * @param request - Request payload contains problemId, solutionId and solution code data.
     * @return {ResponseDTO}
     */
    addSolutionCode(
        request : AddSolutionCodeRequest
    ): Promise<ResponseDTO>;

    /**
     * Updates an existing solution code for a problem.
     * 
     * @async
     * @param request - Request payload contains problemId, solutionId and updated data.
     * @returns {ResponseDTO} - the response data
     */
    updateSolutionCode(
        request : UpdateSolutionCodeRequest
    ): Promise<ResponseDTO>;

    /**
     * Removes a solution code from a problem.
     * 
     * @async
     * @param request - Request payload contain problem and solution code id.
     * @returns {ResponseDTO} - the response data
     */
    removeSolutionCode(
        request : RemoveSolutionCodeRequest
    ): Promise<ResponseDTO>;

    /**
     * Add template code to problem document.
     * 
     * @param request - Add template request payload from handler.
     */
    addTemplateCode(
        request : AddTemplateCodeRequest
    ) : Promise<ResponseDTO>;

    /**
     * Updates template code in problem document.
     * 
     * @param request - Update template code request payload from handler.
     */
    updateTemplateCode(
        request : UpdateTemplateCodeRequest
    ) : Promise<ResponseDTO>;

    /**
     * Remove template code from the templateCodes array in problem document.
     * 
     * @param request - Remove template code request payload from handler.
     */
    removeTemplateCode(
        request : RemoveTemplateCodeRequest
    ) : Promise<ResponseDTO>

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