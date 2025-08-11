import { Difficulty } from "@/enums/difficulty.enum";
import { ICreateProblemRequestDTO } from "../problem/CreateProblemRequestDTO";
import { IListProblemsRequestDTO } from "../problem/listProblemsRequestDTO";
import { IExample, ISolutionCode, IStarterCode, ITestCase } from "@/infra/db/interface/problem.interface";
import { IUpdateBasicProblemRequestDTO } from "../problem/updateProblemRequestDTO";
import { 
    Example as IGrpcExample,
    StarterCode as IGrpcStarterCode, 
    TestCase as IGrpcTestCase,
    SolutionCode as IGrpcSolutionCode,
    TestCaseCollectionType as GrpcTestCaseCollectionTypeEnum, 
    Difficulty as GrpcDifficultyEnum,
    Language as GrpcLanguageEnum,
} from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { Language } from "@/enums/language.enum";
import { TestCaseCollectionType } from "@/enums/testCaseCollectionType.enum";
import { IAddTestCaseRequestDTO, IBulkUploadTestCaseRequestDTO, IRemoveTestCaseRequestDTO } from "../problem/testCaseRequestDTOs";
import { IAddSolutionCodeRequestDTO } from "../problem/solutionCodeRequestDTOs";

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
        if(!body.testcase) throw new Error('No Testcase found in IAddTestCaseInputDTO')
        return {
            _id : body.Id,
            testCaseCollectionType : this._mapGrpcTestCaseCollectionTypeEnum(body.testCaseCollectionType),
            testCase : this._mapGrpcTestCase(body.testcase as IGrpcTestCase) 
        }
    }

    static toBulkUploadTestCaseService (body : IBulkUploadTestCaseInputDTO ) : IBulkUploadTestCaseRequestDTO {
        if(!body.testcase) throw new Error('No Testcase found in IAddTestCaseInputDTO')
        return {
            _id : body.Id,
            testCaseCollectionType : this._mapGrpcTestCaseCollectionTypeEnum(body.testCaseCollectionType),
            testCase : body.testcase.map(this._mapGrpcTestCase)
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
        if(!body.solutionCode) throw new Error('No Solution code found in IAddSolutionCodeInputDTO')
        return {
            _id : body.Id,
            solutionCode : this._mapGrpcSolutionCode(body.solutionCode)
        }
    }

    private static _mapGrpcExample(e : IGrpcExample) : IExample {
        return {
            _id : e.Id,
            input : e.input,
            output : e.output,
            explanation : e.expanation
        }
    }

    private static _mapGrpcStarterCode(s : IGrpcStarterCode) : IStarterCode {
        return {
            _id : s.Id,
            code : s.code,
            language : this._mapGrpcLanguageEnum(s.language)
        }
    }

    private static _mapGrpcTestCase(t : IGrpcTestCase) : ITestCase {
        return {
            _id : t.Id,
            input : t.input,
            output : t.output
        }
    }

    private static _mapGrpcSolutionCode(s : IGrpcSolutionCode ) : ISolutionCode {
        return {
            _id : s.Id,
            code : s.code,
            language : this._mapGrpcLanguageEnum(s.language),
            executionTime : s.executionTime,
            memoryTaken : s.memoryTaken
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
            throw new Error('Invalid difficulty value');
        }   
    }

    private static _mapGrpcLanguageEnum(language : number) : Language {
        if(language === 1){
            return Language.JAVASCRIPT;
        } else if (language === 2){
            return Language.PYTHON
        } else {
            throw new Error('Invalid choosen language')
        }
    }

    private static _mapGrpcTestCaseCollectionTypeEnum(
        testCaseCollectionType : GrpcTestCaseCollectionTypeEnum) : TestCaseCollectionType {
        if(testCaseCollectionType === 1){
            return TestCaseCollectionType.RUN
        } else if (testCaseCollectionType === 2){
            return TestCaseCollectionType.SUBMIT
        } else {
            throw new Error('Invalid testcase collection type')
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
    testcase? : IGrpcTestCase;
}

export interface IBulkUploadTestCaseInputDTO {
    Id : string;
    testCaseCollectionType : GrpcTestCaseCollectionTypeEnum;
    testcase? : IGrpcTestCase[];
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