import { ResponseDTO } from "@/dtos/ResponseDTO";

/**
 * Interface representing the structure of the create problem service.
 * 
 * @interface
 */
export interface IAddTagsService {

    /**
     * Executes the add tags service.
     * 
     * @param _id The id of the problem.
     * @param tags - The tags to be added.
     */
    execute(_id : string, tags : string[]) : Promise<ResponseDTO>

}