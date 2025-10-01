import { Difficulty } from "@/enums/difficulty.enum";
import { ICreateProblemRequestDTO } from "../problem/CreateProblemRequestDTO";
import { IListProblemsRequestDTO } from "../problem/listProblemsRequestDTO";
import { IExample, IProblem, ISolutionCode, IStarterCode, ITemplateCode, ITestCase, ITestCaseCollection } from "@/infra/db/interface/problem.interface";
import { IUpdateBasicProblemRequestDTO } from "../problem/updateProblemRequestDTO";
import { 
    Example as IGrpcExample,
    StarterCode as IGrpcStarterCode, 
    TestCase as IGrpcTestCase,
    SolutionCode as IGrpcSolutionCode,
    TemplateCode as IGrpcTemplateCode,
    TestCaseCollectionType as GrpcTestCaseCollectionTypeEnum, 
    Difficulty as GrpcDifficultyEnum,
    Language as GrpcLanguageEnum,
    Problem as GrpcProblem,
    ListProblemDetails as GrpcListProblemDetails,
    GetProblemPublicResponse as GrpcGetProblemPublicResponse,
    UpdateTemplateCodeRequest,
    UpdateBasicProblemDetailsRequest,
    CreateProblemRequest,
    GetProblemRequest,
    ListProblemRequest,
    AddTestCaseRequest,
    BulkUploadTestCasesRequest,
    RemoveTestCaseRequest,
    AddSolutionCodeRequest,
    UpdateSolutionCodeRequest,
    RemoveSolutionCodeRequest
} from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Language } from "@/enums/language.enum";
import { TestCaseCollectionType } from "@/enums/testCaseCollectionType.enum";
import { IAddTestCaseRequestDTO, IBulkUploadTestCaseRequestDTO, IRemoveTestCaseRequestDTO } from "../problem/testCaseRequestDTOs";
import { IAddSolutionCodeRequestDTO, IRemoveSolutionCodeRequestDTO, IUpdateSolutionCodeRequestDTO } from "../problem/solutionCodeRequestDTOs";
import { IGetProblemRequestDTO } from "../problem/getProblemRequestDTO";
import { LeanDocument } from "mongoose";
import { IUpdateTemplateCodeRequestDTO } from "../problem/templateCodeRequest.dto";

export class ProblemMapper {
    
    static toCreateProblemService(
        body : CreateProblemRequest
    ) : ICreateProblemRequestDTO {
        const difficulty = ProblemMapper._mapGrpcDifficultyEnum(body.difficulty);
        return {
            title : body.title,
            description : body.description,
            difficulty,
            questionId : body.questionId,
            tags : body.tags ?? [],
        }
    }

    static toGetProblemDetails(
        body : GetProblemRequest
    )  : IGetProblemRequestDTO {
        return { _id : body.Id };
    }

    static toListProblemService(
        body : ListProblemRequest
    ) : IListProblemsRequestDTO {
        const difficulty = body.difficulty 
            ? ProblemMapper._mapGrpcDifficultyEnum(body.difficulty)
            : undefined;

        return {
            limit : body.limit,
            page : body.page,
            active : body.active,
            difficulty,
            questionId : body.questionId,
            search : body.search,
            tags : body.tags ?? [],
            sort : body.sort
        }
    }

    static toUpdateBasicProblemDetailsServive(
        body : UpdateBasicProblemDetailsRequest
    ) : IUpdateBasicProblemRequestDTO {
        const difficulty = body.difficulty 
            ? ProblemMapper._mapGrpcDifficultyEnum(body.difficulty)
            : undefined;
        return {
            _id : body.Id,
            updatedData : {
                questionId : body.questionId,
                title : body.title,
                active : body.active,
                constraints : body.constraints ?? [],
                description : body.description,
                difficulty,
                examples : body.examples?.map(ProblemMapper._mapGrpcExample) ?? [],
                starterCodes : body.starterCodes?.map(ProblemMapper._mapGrpcStarterCode) ?? [],
                tags : body.tags ?? [],
            }
        }
    }

    static toAddTestCaseService(
        body : AddTestCaseRequest
    ) : IAddTestCaseRequestDTO {
        if(!body.testCase) throw new Error("No Testcase found in IAddTestCaseInputDTO");
        return {
            _id : body.Id,
            testCaseCollectionType : ProblemMapper._mapGrpcTestCaseCollectionTypeEnum(body.testCaseCollectionType),
            testCase : ProblemMapper._mapGrpcTestCase(body.testCase) 
        }
    }

    static toBulkUploadTestCaseService(
        body : BulkUploadTestCasesRequest 
    ) : IBulkUploadTestCaseRequestDTO {
        return {
            _id : body.Id,
            testCaseCollectionType : ProblemMapper._mapGrpcTestCaseCollectionTypeEnum(body.testCaseCollectionType),
            testCase : body.testCase?.map(ProblemMapper._mapGrpcTestCase) ?? []
        }
    }

    static toRemoveTestCaseService(
        body : RemoveTestCaseRequest
    ) : IRemoveTestCaseRequestDTO {
        return {
            _id : body.Id,
            testCaseId : body.testCaseId,
            testCaseCollectionType : ProblemMapper._mapGrpcTestCaseCollectionTypeEnum(body.testCaseCollectionType)
        }
    }

    static toAddSolutionCodeService(
        body : AddSolutionCodeRequest 
    ) : IAddSolutionCodeRequestDTO {
        if(!body.solutionCode) throw new Error("No Solution code found in IAddSolutionCodeInputDTO");
        return {
            _id : body.Id,
            solutionCode : ProblemMapper._mapGrpcSolutionCode(body.solutionCode)
        }
    }

    static toUpdateSolutionCodeService(
        body : UpdateSolutionCodeRequest
    ) : IUpdateSolutionCodeRequestDTO {
        if(!body.solutionCode) throw new Error("No Solution code found in IUpdateSolutionCodeInputDTO");
        const language = body.solutionCode.language 
            ? ProblemMapper._mapGrpcLanguageEnum(body.solutionCode.language)
            : undefined;
        return {
            _id : body.Id,
            solutionCodeId : body.solutionCodeId,
            solutionCode : {
                code : body.solutionCode.code,
                executionTime : body.solutionCode.executionTime,
                language,
                memoryTaken : body.solutionCode.memoryTaken
            }
        }
    }

    static toRemoveSolutionCodeService(
        body : RemoveSolutionCodeRequest 
    ) : IRemoveSolutionCodeRequestDTO {
        return { _id : body.Id, solutionCodeId : body.solutionCodeId }
    }

    static toUpdateTemplateCodeService(
        body : UpdateTemplateCodeRequest
    ) : IUpdateTemplateCodeRequestDTO {
        if(!body.updatedTemplateCode) throw new Error('UpdatedTempateCode is undefined from grpc');
        return {
            _id : body.Id,
            templateCodeId : body.templateCodeId,
            updatedTemplateCode : {
                language : body.updatedTemplateCode.language ? this._mapGrpcLanguageEnum(body.updatedTemplateCode.language) : undefined,
                submitWrapperCode : body.updatedTemplateCode.submitWrapperCode,
                runWrapperCode : body.updatedTemplateCode.runWrapperCode,
            }
        }
    }

    // ------------------ OUTPUT MAPPERS ------------------ //

    static toOutDTO(
        body: LeanDocument<IProblem>
    ): GrpcProblem {
        return {
            Id: body._id as string,
            questionId: body.questionId,
            title: body.title,
            description: body.description,
            difficulty: ProblemMapper._mapServiceDifficulyEnum(body.difficulty),
            tags: body.tags ?? [],
            constraints: body.constraints ?? [],
            starterCodes: body.starterCodes?.map(ProblemMapper._mapServiceStarterCode) ?? [],
            templateCodes : body.templateCodes?.map(ProblemMapper._mapServiceTemplateCodes) ?? [],
            testcaseCollection: {
                run: body.testcaseCollection?.run?.map(ProblemMapper._mapServiceTestCase) ?? [],
                submit: body.testcaseCollection?.submit?.map(ProblemMapper._mapServiceTestCase) ?? []
            },
            examples: body.examples?.map(ProblemMapper._mapServiceExample) ?? [],
            active: body.active ?? false,
            solutionCodes: body.solutionCodes?.map(ProblemMapper._mapServiceSolutionCode) ?? [],
            updatedAt: body.updatedAt instanceof Date ? body.updatedAt.toISOString() : body.updatedAt,
            createdAt: body.createdAt instanceof Date ? body.createdAt.toISOString() : body.createdAt
        };
    }

    static toOutPublicDTO(
        body: LeanDocument<IGetProblemPublicInputDTO>
    ): GrpcGetProblemPublicResponse {
        return {
            Id: body._id!,
            questionId: body.questionId,
            title: body.title,
            description: body.description,
            difficulty: ProblemMapper._mapServiceDifficulyEnum(body.difficulty),
            constraints: body.constraints ?? [],
            tags: body.tags ?? [],
            run: body.testcaseCollection?.run?.map(ProblemMapper._mapServiceTestCase) ?? [],
            examples: body.examples?.map(ProblemMapper._mapServiceExample) ?? [],
            starterCodes: body.starterCodes?.map(ProblemMapper._mapServiceStarterCode) ?? [],
            updatedAt: body.updatedAt instanceof Date ? body.updatedAt.toISOString() : body.updatedAt,
            createdAt: body.createdAt instanceof Date ? body.createdAt.toISOString() : body.createdAt
        };
    }

    static toOutListDTO(
        body: LeanDocument<IListProblemOutputDTO>
    ): GrpcListProblemDetails {
        return {
            Id: body._id!,
            title: body.title,
            questionId: body.questionId,
            difficulty: ProblemMapper._mapServiceDifficulyEnum(body.difficulty),
            tags: body.tags ?? [],
            active: body.active ?? false,
            updatedAt: body.updatedAt instanceof Date ? body.updatedAt.toISOString() : body.updatedAt,
            createdAt: body.createdAt instanceof Date ? body.createdAt.toISOString() : body.createdAt
        };
    }

    // ------------------ BASIC MAPPERS ------------------ //

    static _mapGrpcExample(e : IGrpcExample) : IExample {
        return { _id : e.Id || undefined, input : e.input, output : e.output, explanation : e.explanation }
    }

    static _mapServiceExample(e : IExample) : IGrpcExample {
        return { Id : e._id!, input : e.input, output : e.output, explanation : e.explanation }
    }

    static _mapGrpcStarterCode(s : IGrpcStarterCode) : IStarterCode {
        return { _id : s.Id || undefined, code : s.code, language : ProblemMapper._mapGrpcLanguageEnum(s.language) }
    }

    static _mapServiceStarterCode(s : IStarterCode) : IGrpcStarterCode {
        return { Id : s._id!, code : s.code, language : s.language ? ProblemMapper._mapServiceLanguageEnum(s.language) : 1 }
    }

    static _mapServiceTemplateCodes(t : ITemplateCode) : IGrpcTemplateCode {
        return {
            Id : t._id!,
            language : ProblemMapper._mapServiceLanguageEnum(t.language),
            submitWrapperCode : t.submitWrapperCode,
            runWrapperCode : t.runWrapperCode
        }
    }

    static _mapGrpcTestCase(t : IGrpcTestCase) : ITestCase {
        return { _id : t.Id || undefined, input : t.input, output : t.output }
    }

    static _mapServiceTestCase(t : ITestCase) : IGrpcTestCase {
        return { Id : t._id!, input : t.input, output : t.output }
    }

    static _mapGrpcSolutionCode(s : IGrpcSolutionCode ) : ISolutionCode {
        return {
            _id : s.Id || undefined,
            code : s.code,
            language : ProblemMapper._mapGrpcLanguageEnum(s.language),
            executionTime : s.executionTime,
            memoryTaken : s.memoryTaken
        }
    }

    static _mapServiceSolutionCode(s : ISolutionCode) : IGrpcSolutionCode {
        return {
            Id : s._id!,
            code : s.code,
            executionTime : s.executionTime ?? 0,
            memoryTaken : s.memoryTaken ?? 0,
            language : s.language ? ProblemMapper._mapServiceLanguageEnum(s.language) : 1
        }
    }

    static _mapGrpcDifficultyEnum(difficulty : GrpcDifficultyEnum) : Difficulty {
        switch(difficulty) {
            case 1: return Difficulty.EASY;
            case 2: return Difficulty.MEDIUM;
            case 3: return Difficulty.HARD;
            default: throw new Error("Invalid difficulty value mapping from grpc");
        }
    }

    static _mapServiceDifficulyEnum(difficulty : Difficulty) : GrpcDifficultyEnum {
        switch(difficulty) {
            case Difficulty.EASY: return 1;
            case Difficulty.MEDIUM: return 2;
            case Difficulty.HARD: return 3;
            default: throw new Error("Invalid difficulty value mapping from service");
        }
    }
 
    static _mapGrpcLanguageEnum(language : GrpcLanguageEnum) : Language {
        switch(language) {
            case 1: return Language.JAVASCRIPT;
            case 2: return Language.PYTHON;
            case 3: return Language.GO;
            default: throw new Error("Invalid language mapping from grpc");
        }
    }

    static _mapServiceLanguageEnum(language : Language) : GrpcLanguageEnum {
        switch(language) {
            case Language.JAVASCRIPT: return 1;
            case Language.PYTHON: return 2;
            case Language.GO: return 3;
            default: throw new Error("Invalid language mapping from service");
        }
    }

    static _mapGrpcTestCaseCollectionTypeEnum(t : GrpcTestCaseCollectionTypeEnum) : TestCaseCollectionType {
        switch(t) {
            case 1: return TestCaseCollectionType.RUN;
            case 2: return TestCaseCollectionType.SUBMIT;
            default: throw new Error("Invalid testcase collection type mapping from grpc");
        }
    }
}


export interface IListProblemOutputDTO {
    _id? : string;
    title : string;
    questionId : string;
    difficulty : Difficulty;
    tags : string[];
    active : boolean;
    updatedAt : Date;
    createdAt : Date;
}

export interface IGetProblemPublicInputDTO {
    _id? : string;
    questionId : string;
    title : string;
    description : string;
    difficulty : Difficulty
    tags : string[];
    constraints : string[];
    starterCodes : IStarterCode[];
    testcaseCollection : ITestCaseCollection;
    examples : IExample[];
    createdAt : Date;
    updatedAt : Date;
}
