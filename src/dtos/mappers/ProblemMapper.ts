import { Difficulty } from "@/enums/difficulty.enum";
import { ICreateProblemRequestDTO } from "../problem/CreateProblemRequestDTO";
import { IListProblemsRequestDTO } from "../problem/listProblemsRequestDTO";
import { IExample, IProblem, ISolutionCode, IStarterCode, ITestCase } from "@/infra/db/interface/problem.interface";
import { IUpdateBasicProblemRequestDTO } from "../problem/updateProblemRequestDTO";
import { 
    Example as IGrpcExample,
    StarterCode as IGrpcStarterCode, 
    TestCase as IGrpcTestCase,
    SolutionCode as IGrpcSolutionCode,
    UpdateSolutionCode as IGrpcUpdateSolutionCode,
    TestCaseCollectionType as GrpcTestCaseCollectionTypeEnum, 
    Difficulty as GrpcDifficultyEnum,
    Language as GrpcLanguageEnum,
    Problem as GrpcProblem,
    ListProblemDetails as GrpcListProblemDetails
} from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Language } from "@/enums/language.enum";
import { TestCaseCollectionType } from "@/enums/testCaseCollectionType.enum";
import { IAddTestCaseRequestDTO, IBulkUploadTestCaseRequestDTO, IRemoveTestCaseRequestDTO } from "../problem/testCaseRequestDTOs";
import { IAddSolutionCodeRequestDTO, IRemoveSolutionCodeRequestDTO, IUpdateSolutionCodeRequestDTO } from "../problem/solutionCodeRequestDTOs";
import { IGetProblemRequestDTO } from "../problem/getProblemRequestDTO";
import { LeanDocument } from "mongoose";

export class ProblemMapper {
    
    static toCreateProblemService(body : ICreateProblemInputDTO) : ICreateProblemRequestDTO {
        const difficulty = this._mapGrpcDifficultyEnum(body.difficulty);

        return {
            title : body.title,
            description : body.description,
            difficulty : difficulty,
            questionId : body.questionId,
            tags : body.tags,
        }
    }

    static toGetProblemDetails(body : IGetProblemInputDTO)  : IGetProblemRequestDTO {
        return {
            _id : body.Id,
            questionId : body?.questionId,
            title : body?.title
        }
    }

    static toListProblemService(body : IListProblemInputDTO) : IListProblemsRequestDTO {

        let difficulty : Difficulty | undefined 

        if(body.difficulty){
            difficulty = this._mapGrpcDifficultyEnum(body.difficulty);
        }

        return {
            limit : body.limit,
            page : body.page,
            active : body.active,
            difficulty : difficulty,
            questionId : body.questionId,
            search : body.search,
            tag : body.tag
        }
    }

    static toUpdateBasicProblemDetailsServive (
        body : IUpdateBasicProblemDetailsInputDTO
    ) : IUpdateBasicProblemRequestDTO {

        let difficulty : Difficulty | undefined 

        if(body.difficulty){
            difficulty = this._mapGrpcDifficultyEnum(body.difficulty);
        }

        return {
            questionId : body.questionId,
            title : body.title,
            active : body.active,
            constraints : body.constraints,
            description : body.description,
            difficulty,
            examples : body.examples?.map(this._mapGrpcExample),
            starterCodes : body.starterCodes?.map(this._mapGrpcStarterCode),
            tags : body.tags,
        }
    }

    static toAddTestCaseService (body : IAddTestCaseInputDTO) : IAddTestCaseRequestDTO {
        if(!body.testCase) throw new Error('No Testcase found in IAddTestCaseInputDTO')
        return {
            _id : body.Id,
            testCaseCollectionType : this._mapGrpcTestCaseCollectionTypeEnum(body.testCaseCollectionType),
            testCase : this._mapGrpcTestCase(body.testCase as IGrpcTestCase) 
        }
    }

    static toBulkUploadTestCaseService (body : IBulkUploadTestCaseInputDTO ) : IBulkUploadTestCaseRequestDTO {
        if(!body.testCase) throw new Error('No Testcase found in IAddTestCaseInputDTO')
        return {
            _id : body.Id,
            testCaseCollectionType : this._mapGrpcTestCaseCollectionTypeEnum(body.testCaseCollectionType),
            testCase : body.testCase.map(this._mapGrpcTestCase)
        }
    }

    static toRemoveTestCaseService (body : IRemoveTestCaseInputDTO) : IRemoveTestCaseRequestDTO {
        return {
            _id : body.Id,
            testCaseId : body.testCaseId,
            testCaseCollectionType : this._mapGrpcTestCaseCollectionTypeEnum(body.testCaseCollectionType)
        }
    }

    static toAddSolutionCodeService (body : IAddSolutionCodeInputDTO ) : IAddSolutionCodeRequestDTO {
        if(!body.solutionCode) throw new Error('No Solution code found in IAddSolutionCodeInputDTO');
        return {
            _id : body.Id,
            solutionCode : this._mapGrpcSolutionCode(body.solutionCode)
        }
    }

    static toUpdateSolutionCodeService (body : IUpdateSolutionCodeInputDTO) : IUpdateSolutionCodeRequestDTO {
        if(!body.solutionCode) throw new Error('No Solution code found in IUpdateSolutionCodeInputDTO');
        const language = body.solutionCode.language 
                        ? this._mapGrpcLanguageEnum(body.solutionCode.language)
                        : undefined;
        return {
            _id : body.Id,
            solutionCodeId : body.solutionCodeId,
            solutionCode : {
                code : body.solutionCode?.code,
                executionTime : body.solutionCode?.executionTime,
                language : language,
                memoryTaken : body.solutionCode?.memoryTaken
            }
        }
    }

    static toRemoveSolutionCodeService (body : IRemoveSolutionCodeInputDTO ) : IRemoveSolutionCodeRequestDTO {
        return {
            _id : body.Id,
            solutionCodeId : body.solutionCodeId
        }
    }

    static toOutDTO(body : LeanDocument<IProblem> ) : GrpcProblem {

            return {
                Id : body._id as string,
                questionId : body.questionId,
                title : body.title,
                decription : body.description,
                difficulty : this._mapServiceDifficulyEnum(body.difficulty),
                tags : body.tags,
                constraints : body.constraints,
                starterCodes: body.starterCodes.map(this._mapServiceStarterCode),
                testcaseCollection : {
                    run : body.testcaseCollection.run.map(this._mapServiceTestCase),
                    submit : body.testcaseCollection.submit.map(this._mapServiceTestCase)
                },
                examples : body.examples.map(this._mapServiceExample),
                active : body.active,
                solutionCodes : body.solutionCodes?.map(this._mapServiceSolutionCode) ?? [],
                updatedAt : body.updatedAt.toISOString(),
                createdAt : body.createdAt.toISOString()
            }

    }

    static toOutListDTO(body : LeanDocument<IListProblemOutputDTO>) : GrpcListProblemDetails {
        return {
            Id : body._id,
            title : body.title,
            questionId : body.questionId,
            difficulty : this._mapServiceDifficulyEnum(body.difficulty),
            tags : body.tags,
            active : body.active,
            updatedAt : body.updatedAt.toISOString(),
            createdAt : body.createdAt.toISOString()
        }
    }

    // mappers (Grpc to and from Service)

    private static _mapGrpcExample(e : IGrpcExample) : IExample {
        return {
            _id : e.Id,
            input : e.input,
            output : e.output,
            explanation : e.explanation
        }
    }

    private static _mapServiceExample(e : IExample) : IGrpcExample {
        return {
            Id : e._id,
            input : e.input,
            output : e.output,
            explanation : e.explanation   
        }
    }

    private static _mapGrpcStarterCode(s : IGrpcStarterCode) : IStarterCode {
        return {
            _id : s.Id,
            code : s.code,
            language : this._mapGrpcLanguageEnum(s.language)
        }
    }

    private static _mapServiceStarterCode(s : IStarterCode) : IGrpcStarterCode {
        return {
            Id : s._id,
            code : s.code,
            language : this._mapServiceLanguageEnum(s.language)
        }
    }

    private static _mapGrpcTestCase(t : IGrpcTestCase) : ITestCase {
        return {
            _id : t.Id === '' ? undefined : t.Id,
            input : t.input,
            output : t.output
        }
    }

    private static _mapServiceTestCase(t : ITestCase) : IGrpcTestCase {
        return {
            Id : t._id!,
            input : t.input,
            output : t.output
        }
    }

    private static _mapGrpcSolutionCode(s : IGrpcSolutionCode ) : ISolutionCode {
        return {
            _id : s.Id === '' || s.Id === undefined ? undefined : s.Id,
            code : s.code,
            language : this._mapGrpcLanguageEnum(s.language),
            executionTime : s.executionTime,
            memoryTaken : s.memoryTaken
        }
    }

    private static _mapServiceSolutionCode(s : ISolutionCode) : IGrpcSolutionCode {
        return {
            Id : s._id!,
            code : s.code,
            executionTime : s.executionTime ?? 0,
            memoryTaken : s.memoryTaken ?? 0,
            language : this._mapServiceLanguageEnum(s.language)
        }
    }

    private static _mapGrpcDifficultyEnum(difficulty : GrpcDifficultyEnum) : Difficulty {
        if (difficulty === 1) {
            return Difficulty.EASY;
        } else if (difficulty === 2) {
            return Difficulty.MEDIUM;
        } else if (difficulty === 3) {
            return Difficulty.HARD;
        } else {
            throw new Error('Invalid difficulty value mapping from grpc');
        }   
    }

    private static _mapServiceDifficulyEnum(difficulty : Difficulty) : GrpcDifficultyEnum {
        if (difficulty === Difficulty.EASY) {
            return 1;
        } else if (difficulty === Difficulty.MEDIUM) {
            return 2;
        } else if (difficulty === Difficulty.HARD) {
            return 3;
        } else {
            throw new Error('Invalid difficulty value mapping from service');
        }   
    }
 
    private static _mapGrpcLanguageEnum(language : GrpcLanguageEnum) : Language {
        if(language === 1){
            return Language.JAVASCRIPT;
        } else if (language === 2){
            return Language.PYTHON
        } else {
            throw new Error('Invalid choosen language mapping from grpc')
        }
    }

    private static _mapServiceLanguageEnum(language : Language) : GrpcLanguageEnum {
        if(language === Language.JAVASCRIPT){
            return 1;
        } else if (language === Language.PYTHON){
            return 2;
        } else {
            throw new Error('Invalid choosen language mapping from service');
        }
    }

    private static _mapGrpcTestCaseCollectionTypeEnum(
        testCaseCollectionType : GrpcTestCaseCollectionTypeEnum) : TestCaseCollectionType {
        if(testCaseCollectionType === 1){
            return TestCaseCollectionType.RUN
        } else if (testCaseCollectionType === 2){
            return TestCaseCollectionType.SUBMIT
        } else {
            throw new Error('Invalid testcase collection type mapping from grpc')
        }
    }
}

export interface ICreateProblemInputDTO {
    questionId : string;
    title : string;
    description : string;
    difficulty : GrpcDifficultyEnum;
    tags : string[];
}

export interface IListProblemInputDTO {
    page : number;
    limit : number;
    difficulty? : GrpcDifficultyEnum;
    tag? : string;
    active? : boolean;
    search? : string;
    questionId? : string 
}

export interface IUpdateBasicProblemDetailsInputDTO {
    Id : string;
    questionId? : string;
    title? : string;
    description? : string;
    difficulty? : GrpcDifficultyEnum;
    active? : boolean;
    tags? : string[];
    constraints? : string[];
    examples? : IGrpcExample[];
    starterCodes? : IGrpcStarterCode[];
}

export interface IAddTestCaseInputDTO {
    Id : string;
    testCaseCollectionType : GrpcTestCaseCollectionTypeEnum;
    testCase? : IGrpcTestCase;
}

export interface IBulkUploadTestCaseInputDTO {
    Id : string;
    testCaseCollectionType : GrpcTestCaseCollectionTypeEnum;
    testCase? : IGrpcTestCase[];
}

export interface IRemoveTestCaseInputDTO {
    Id : string;
    testCaseId : string;
    testCaseCollectionType : GrpcTestCaseCollectionTypeEnum;
}

export interface IAddSolutionCodeInputDTO {
    Id : string;
    solutionCode? : IGrpcSolutionCode
}

export interface IUpdateSolutionCodeInputDTO {
    Id : string;
    solutionCodeId : string;
    solutionCode? : IGrpcUpdateSolutionCode
}

export interface IRemoveSolutionCodeInputDTO {
    Id : string;
    solutionCodeId : string
}

export interface IGetProblemInputDTO {
    Id : string;
    title? : string;
    questionId? : string;
}

export interface IListProblemOutputDTO {
    _id : string;
    title : string;
    questionId : string;
    difficulty : Difficulty;
    tags : string[];
    active : boolean;
    updatedAt : Date;
    createdAt : Date;
}