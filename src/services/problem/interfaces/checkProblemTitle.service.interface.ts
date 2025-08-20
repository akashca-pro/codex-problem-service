import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the check problem title exist in problem document.
 * 
 * @interface
 */
export interface ICheckProblemTitleAvailService { 

    execute(title : string) : Promise<ResponseDTO>

}