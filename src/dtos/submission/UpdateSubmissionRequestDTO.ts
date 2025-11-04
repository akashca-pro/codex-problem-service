import { IExecutionResult } from "@/db/interface/submission.interface";

/**
 * Data Transfer Object (DTO) representing data to update submission document.
 *
 * @interface
 */
export interface IUpdateSubmissionRequestDTO {
    executionResult : IExecutionResult;
    status : string;
}