import { ISolutionCode } from "@/infra/db/interface/problem.interface";

/**
 * DTO (Data Tranfer Object) representing the structure of the add solution code request.
 * 
 * @interface
 */
export interface IAddSolutionCodeRequestDTO {

    _id : string;
    solutionCode : ISolutionCode;

}

/**
 * DTO (Data Tranfer Object) representing the structure of the update solution code request.
 * 
 * @interface
 */
export interface IUpdateSolutionCodeRequestDTO {

    _id : string;
    solutionCodeId : string;
    solutionCode : ISolutionCode;
}