import { Language } from "@/enums/language.enum";
import { ISolutionCode } from "@/infra/db/interface/problem.interface";

/**
 * DTO (Data Tranfer Object) representing the data to add a solution code.
 * 
 * @interface
 */
export interface IAddSolutionCodeRequestDTO {

    _id : string;
    solutionCode : ISolutionCode;

}

/**
 * DTO (Data Tranfer Object) representing the data to update solution code.
 * 
 * @interface
 */
export interface IUpdateSolutionCodeRequestDTO {

    _id : string;
    solutionCodeId : string;
    solutionCode : IUpdateSolutionCodeDTO;
}

/**
 * DTO (Data Tranfer Object) representing the data to remove solution code.
 * 
 * @interface
 */
export interface IRemoveSolutionCodeRequestDTO {

    _id : string;
    solutionCodeId : string;

}

/**
 * DTO (Data Tranfer Object) representing the data to be updated to solution code.
 * 
 * @interface
 */
export interface IUpdateSolutionCodeDTO {
    language? : Language,
    code? : string;
    executionTime? : number;
    memoryTaken? : number;
}