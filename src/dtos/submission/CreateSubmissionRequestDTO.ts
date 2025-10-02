import { type Difficulty } from "@/const/Difficulty.const";
import { Language } from "@/enums/language.enum";

/**
 * Data Transfer Object (DTO) representing data to create submission document.
 *
 * @interface
 */
export interface ICreateSubmissionRequestDTO {

    problemId : string;
    userId : string;
    battleId : string | null;
    country : string | null;
    title : string;
    language : Language;
    userCode : string;
    difficulty : Difficulty
}
