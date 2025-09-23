import { Language } from "@/enums/language.enum";
import { ITemplateCode } from "@/infra/db/interface/problem.interface";

export interface IAddTemplateCodeRequestDTO{
    _id : string;
    language : Language;
    wrappedCode : string;
}

export interface IUpdateTemplateCodeRequestDTO {
    _id : string;
    templateCodeId : string;
    updatedTemplateCode : Partial<ITemplateCode>
}

export interface IRemoveTemplateCodeRequestDTO {
    _id : string;
    templateCodeId : string;
}
