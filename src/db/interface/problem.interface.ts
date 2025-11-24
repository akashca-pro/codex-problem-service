import { type Difficulty } from "@/const/Difficulty.const";
import { Language } from "@/enums/language.enum";
import { Document } from "mongoose";

/**
 * Interface representing the structure of a test case.
 * 
 * @interface
 */
export interface ITestCase {
    _id? : string;
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
export interface IExample {
    _id? : string;
    input : string;
    output : string;
}

/**
 * Interface representing the structure of a code template to be shown in the user end.
 * 
 * @interface
 */
export interface IStarterCode {
    _id? : string;
    language : Language;
    code : string;
}

/**
 * Interface representing the structure of template code that wraps user code.
 */
export interface ITemplateCode {
    _id? : string;
    language : Language;
    submitWrapperCode : string;
    runWrapperCode : string;
}

export interface ISolutionRoadmap {
    _id? : string;
    level : number;
    description : string;
}

/**
 * Interface representing the structure of the problem schema.
 * 
 * @interface
 */
export interface IProblem extends Document {
    questionId : string;
    title : string;
    description : string;
    difficulty : Difficulty
    tags : string[];
    constraints : string[];
    starterCodes : IStarterCode[];
    testcaseCollection : ITestCaseCollection;
    examples : IExample[];
    active : boolean;
    templateCodes : ITemplateCode[] | null;
    solutionRoadmap : ISolutionRoadmap[] | null;
    createdAt : Date;
    updatedAt : Date;
}
