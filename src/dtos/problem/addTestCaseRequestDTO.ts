import { ITestCase } from "@/infra/db/interface/problem.interface";

/**
 * DTO (Data Tranfer Object) representing the structure of the add test case request.
 * 
 * @interface
 */
export interface IAddTestCaseRequestDTO {
    _id : string;
    testCaseCollectionType : TestCaseCollectionType;
    testCase : ITestCase
}