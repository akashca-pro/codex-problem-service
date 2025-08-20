import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the checking question id available service.
 * 
 * @interface
 */
export interface ICheckQuestionIdAvailablityService {

    execute(questionId : string) : Promise<ResponseDTO>

}