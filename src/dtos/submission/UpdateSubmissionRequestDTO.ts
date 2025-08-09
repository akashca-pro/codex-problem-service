import { IExecutionResult } from "@/infra/db/interface/submission.interface";

/**
 * Data Transfer Object (DTO) representing data to update submission document.
 *
 * @interface
 */
export interface IUpdateSubmissionRequestDTO {
    _id : string;
    executionResult : IExecutionResult;
    executionTime? : number;
    memoryUsage? : number;
}