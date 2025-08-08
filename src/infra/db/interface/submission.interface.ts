import { Document, Types } from "mongoose";

/**
 * Interface representing the structure of the final code execution stats for testcases.
 * 
 * @interface
 */
export interface IStats {
    totalTestCase : number;
    passedTestCase : number;
    failedTestCase : number;
}

/**
 * Interface representing the structure of the first failed test case details.
 * 
 * @interface
 */
export interface IFailedTestCase {
    index : number;
    input : string;
    output : string;
    expectedOutput : string; 
}

/**
 * Interface representing the structure of the execution result of the submission.
 * 
 * @interface
 */
export interface IExecutionResult {
    stats : IStats;
    failedTestCase : IFailedTestCase | null
}

/**
 * Interface representing the structure of the submission result.
 * 
 * @interface
 */
export interface ISubmission extends Document {
    problemId : Types.ObjectId;
    userId : string;
    country : string | null;
    battleId : string | null;
    title : string;
    status : SubmissionStatus;
    score : number;
    language : Language;
    userCode : string;
    executionResult : IExecutionResult | null;
    executionTime : number | null;
    memoryUsage : number | null;
    difficulty : Difficulty;
    isFirst : boolean;
}

