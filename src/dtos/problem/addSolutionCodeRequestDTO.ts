import { ISolutionCode } from "@/infra/db/interface/problem.interface";

/**
 * DTO (Data Tranfer Object) representing the structure of the add solution code request.
 * 
 * @interface
 */
export interface IAddSolutionCodeRequestDTO {

    _id : string;
    solutionCode : ISolutionCode

}