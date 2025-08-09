import { ITestCase } from "@/infra/db/interface/problem.interface";

/**
 * DTO (Data Tranfer Object) representing the data to add a new test case.
 * 
 * @interface
 */
export interface IAddTestCaseRequestDTO {
    _id : string;
    testCaseCollectionType : TestCaseCollectionType;
    testCase : ITestCase
}


/**
 * DTO (Data Tranfer Object) representing the data to bulk upload test cases.
 * 
 * @interface
 */
export interface IBulkUploadTestCaseRequestDTO {
    _id : string;
    testCaseCollectionType : TestCaseCollectionType;
    testCase : ITestCase[]
}

/**
 * DTO (Data Tranfer Object) representing the data to remove test case.
 * 
 * @interface
 */
export interface IRemoveTestCaseRequestDTO {
    _id : string;
    testCaseId : string;
    testCaseCollectionType : TestCaseCollectionType;
}