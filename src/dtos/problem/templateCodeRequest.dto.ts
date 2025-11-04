import { ITemplateCode } from "@/db/interface/problem.interface";

export interface IUpdateTemplateCodeRequestDTO {
    _id : string;
    templateCodeId : string;
    updatedTemplateCode : Partial<ITemplateCode>
}
