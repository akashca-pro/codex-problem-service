import { Document } from "mongoose";

/**
 * Interface representing the structure of a test case.
 * 
 * @interface
 */
export interface ITestCase {
    input : string;
    output : string;
}

/**
 * Interface representing the structure of a collection of testcases (run,submit).
 * 
 * @interface
 */
export interface ITestCaseCollection {
    run : ITestCase[];
    submit : ITestCase[];
}

/**
 * Interface representing the structure of a examples of a problem.
 * 
 * @interface
 */
export interface IExamples {
    input : string;
    output : string;
    explanation : string;
}

/**
 * Interface representing the structure of a code template to be shown in the user end.
 * 
 * @interface
 */
export interface IStarterCode {
    language : Language;
    code : string;
}

/**
 * Interface representing the structure of template solution of the code.
 * 
 * @interface
 */
export interface ITemplateSolution {
    language : Language;
    code : string;
    executionTime : number;
    memoryTaken : number;
}

/**
 * Interface representing the structure of the problem schema.
 * 
 * @interface
 */
export interface IProblem extends Document {
    title : string;
    description : string;
    difficulty : Difficulty
    tags : string[];
    constraints : string[];
    starterCode : IStarterCode[];
    testcaseCollection : ITestCaseCollection;
    examples : IExamples;
    active : boolean;
    solutionCode : ITemplateSolution[];
}
