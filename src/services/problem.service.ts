import { inject, injectable } from "inversify";
import { IProblemService } from "./interfaces/problem.service.interface";
import TYPES from "@/config/inversify/types";
import { ICreateProblemRequestDTO } from "@/dtos/problem/CreateProblemRequestDTO";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";
import { extractDup, isDupKeyError } from "@/utils/mongoError";
import { ICacheProvider } from "@/libs/cache/ICacheProvider.interface";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";
import { ProblemMapper } from "@/dtos/mappers/ProblemMapper";
import { config } from "@/config";
import { PaginationDTO } from "@/dtos/PaginationDTO";
import { IListProblemsRequestDTO } from "@/dtos/problem/listProblemsRequestDTO";
import { IUpdateBasicProblemRequestDTO } from "@/dtos/problem/updateProblemRequestDTO";
import { TestCaseCollectionType } from "@/enums/testCaseCollectionType.enum";
import { ISolutionCode, ITestCase } from "@/infra/db/interface/problem.interface";
import { IUpdateSolutionCodeDTO } from "@/dtos/problem/solutionCodeRequestDTOs";

/**
 * Class representing the Problem Service interface.
 * 
 * @class
 * @implements {IProblemService}         
 */
@injectable()
export class ProblemService implements IProblemService {

    #_problemRepo : IProblemRepository;
    #_cacheProvider : ICacheProvider;

    /**
     * Creates an instance of ProblemService.
     * 
     * @param {IProblemRepository} problemRepo - The problem repository instance.
     * @constructor
     */
    constructor(
        @inject(TYPES.IProblemRepository) problemRepo : IProblemRepository,
        @inject(TYPES.ICacheProvider) cacheProvider : ICacheProvider
    ){
        this.#_problemRepo = problemRepo;
        this.#_cacheProvider = cacheProvider;
    }

    async createProblem(
        data: ICreateProblemRequestDTO
    ): Promise<ResponseDTO> {
        
        const problemAlreadyExist = await this.#_problemRepo.findByTitle(data.title);

        if(problemAlreadyExist){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemAlreadyExists
            }
        }

        try {
            const result = await this.#_problemRepo.create({...data, active : false});

            return {
                data : result,
                success : true
            }

        } catch (error) {
            if(isDupKeyError(error)){
                const { field } = extractDup(error as any);
                return {
                    data : null,
                    success : false,
                    errorMessage : ` ${field} ${ProblemErrorType.ProblemFieldAlreadyExist}`
                }
            }
            throw error;
        }
    }

    async getProblem(
        id: string
    ): Promise<ResponseDTO> {

        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${id}`;

        const cached = await this.#_cacheProvider.get(cacheKey);

        if(cached){
            return {
                data : cached,
                success : true
            }
        }
    
        const problem = await this.#_problemRepo.findByIdLean(id);

        if(!problem){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        const outDTO = ProblemMapper.toOutDTO(problem)

        await this.#_cacheProvider.set(
            cacheKey,
            outDTO,
            config.PROBLEM_DETAILS_CACHE_EXPIRY
        );

        return {
            data : outDTO,
            success : true
        }
    }

    async getProblemPublic(
        id: string
    ): Promise<ResponseDTO> {
        
        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${id}`;

        const cached = await this.#_cacheProvider.get(cacheKey);

        if(cached){
            return {
                data : cached,
                success : true,
            }
        }

        const select = ['questionId','title','description','difficulty','constraints','tags','testcaseCollection','examples','starterCodes','updatedAt','createdAt']

        const problem = await this.#_problemRepo.findByIdLean(id,select);
        if(!problem){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        const outDTO = ProblemMapper.toOutPublicDTO(problem)

        await this.#_cacheProvider.set(
            cacheKey,
            outDTO,
            config.PROBLEM_DETAILS_CACHE_EXPIRY
        );

        return {
            data : outDTO,
            success : true
        }
    }

    async listProblems(
        filters: IListProblemsRequestDTO
    ): Promise<PaginationDTO> {
        
        const sort : Record<string,1|-1> = {};
        const filter : Record<string, any> = {};
        if(filters.difficulty) filter.difficulty = filters.difficulty;
        if(filters.questionId) filter.questionId = filters.questionId;
        if(filters.tags?.length) filter.tags = { $in : filters.tags };

        if(filters?.active !== null) !filters.active ? filter.active = false : filter.active = true;

        if (filters.search) {
        filter.$or = [
            { title: { $regex: `^${filters.search}`, $options: "i" } }, 
            { questionId: { $regex: `^${filters.search}`, $options: "i" } },
            { tags: { $regex: `^${filters.search}`, $options: "i" } }
        ];
        }

        if(filters.sort === 'latest'){
            sort.createdAt = -1
        }else{
            sort.createdAt = 1
        }

        const skip = (filters.page - 1) * filters.limit;

        const select = ['title','questionId','difficulty','tags','active','createdAt','updatedAt'];

        const [totalItems, problems] = await Promise.all([
            this.#_problemRepo.countDocuments(filter),
            this.#_problemRepo.findPaginatedLean(filter,skip,filters.limit,select,sort)
        ])

        const totalPages = Math.ceil(totalItems/ filters.limit);

        return {
            body : problems || [],
            currentPage : filters.page,
            totalItems,
            totalPages
        }
    }

    async updateBasicProblemDetails(
        id: string, 
        updatedData: IUpdateBasicProblemRequestDTO
    ): Promise<ResponseDTO> {

        const problemExist = await this.#_problemRepo.findById(id);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }
        
        const updatedQuery : IUpdateBasicProblemRequestDTO = {};

        if(updatedData.title) updatedQuery.title = updatedData.title;
        if(updatedData.description) updatedQuery.description = updatedData.description;
        if(updatedData.difficulty) updatedQuery.difficulty = updatedData.difficulty;
        if(updatedData.tags) updatedQuery.tags = updatedData.tags;
        if(updatedData.constraints?.length !== 0) updatedQuery.constraints = updatedData.constraints;
        if(updatedData.questionId) updatedQuery.questionId = updatedData.questionId;
        if(updatedData.examples?.length !== 0) updatedQuery.examples = updatedData.examples;
        if(updatedData.starterCodes?.length !== 0) updatedQuery.starterCodes = updatedData.starterCodes;
        if(updatedData.active) updatedQuery.active = true;
        else updatedQuery.active = false;

        try {
            const updatedProblem = await this.#_problemRepo.update(id,updatedQuery);

            if(!updatedProblem){
                return {
                    data : null,
                    success : false
                }
            }

          const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${updatedProblem._id}`;
            await this.#_cacheProvider.del(cacheKey);

            return {
                data : null,
                success : true,
            }

        } catch (error : unknown) {

            if(isDupKeyError(error)){
                const { field } = extractDup(error as any);
                return {
                    data : null,
                    success : false,
                    errorMessage : `${field} ${ProblemErrorType.ProblemFieldAlreadyExist}`
                }
            }
            throw error;
        }
    }

    async addTestCase(
        problemId: string, 
        testCaseCollectionType : TestCaseCollectionType,
        testCase: ITestCase
    ): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(problemId);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        await this.#_problemRepo.addTestCase(
            problemId,
            testCaseCollectionType,
            testCase);

        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${problemId}`;
        await this.#_cacheProvider.del(cacheKey);

        return {
            data : null,
            success : true
        }
    }

    async bulkUploadTestCases(
        problemId: string, 
        testCaseCollectionType: TestCaseCollectionType, 
        testCases: ITestCase[]
    ): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(problemId);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        await this.#_problemRepo.bulkUploadTestCase(
            problemId,
            testCaseCollectionType,
            testCases);

        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${problemId}`;
        await this.#_cacheProvider.del(cacheKey);

        return {
            data : null,
            success : true
        }
    }

    async removeTestCase(
        problemId: string, 
        testCaseId: string, 
        testCaseCollectionType: TestCaseCollectionType
    ): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(problemId);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }
        
        const removed = await this.#_problemRepo.removeTestCase(
            problemId,
            testCaseId,
            testCaseCollectionType);

        if(!removed){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.TestCaseNotFound
            }
        }

        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${problemId}`;
        await this.#_cacheProvider.del(cacheKey);

        return {
            data : null,
            success : true
        }
    }

    async addSolutionCode(
        problemId: string, 
        solutionCode: ISolutionCode
    ): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(problemId);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        await this.#_problemRepo.addSolutionCode(
            problemId,
            solutionCode);
        
        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${problemId}`;
        await this.#_cacheProvider.del(cacheKey);

        return {
            data : null,
            success : true
        }
    }

    async updateSolutionCode(
        problemId: string, 
        solutionId: string, 
        updatedSolutionCode: IUpdateSolutionCodeDTO
    ): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(problemId);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        const solutionCode = await this.#_problemRepo.findOne({ _id : problemId,
            solutionCodes : { $elemMatch : { _id : solutionId } }
         })

        if(!solutionCode){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.SolutionCodeNotFound
            }
        }

        const updatedQuery : IUpdateSolutionCodeDTO = {}
        if(updatedSolutionCode.code) updatedQuery.code = updatedSolutionCode.code;
        if(updatedSolutionCode.language) updatedQuery.language = updatedSolutionCode.language;
        if(updatedSolutionCode.executionTime) updatedQuery.executionTime = updatedSolutionCode.executionTime;
        if(updatedSolutionCode.memoryTaken) updatedQuery.memoryTaken = updatedSolutionCode.memoryTaken;
        
        await this.#_problemRepo.updateSolutionCode(
            problemId,
            solutionId,
            updatedQuery);

        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${problemId}`;
        await this.#_cacheProvider.del(cacheKey);

        return {
            data : null,
            success : true,
        }
    }

    async removeSolutionCode(
        problemId: string, 
        solutionId: string
    ): Promise<ResponseDTO> {
        
        const problemExist = await this.#_problemRepo.findById(problemId);

        if(!problemExist){
            return { 
                data : null,
                success : false,
                errorMessage : ProblemErrorType.ProblemNotFound
            }
        }

        const removed = await this.#_problemRepo.removeSolutionCode(
            problemId,
            solutionId
        );

        if(!removed){
             return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.SolutionCodeNotFound
            }
        }

        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${problemId}`;
        await this.#_cacheProvider.del(cacheKey);

        return {
            data : null,
            success : true
        }
    }

    async checkQuestionIdAvailability(
        questionId: string
    ): Promise<ResponseDTO> {
        
        const questionIdAlreadyExist = await this.#_problemRepo.findOne({ questionId });

        if(questionIdAlreadyExist){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.QuestionIdAlreadyExist
            }
        }

        return {
            data : null,
            success : true
        }
    }

    async checkProblemTitleAvailability(
        title: string
    ): Promise<ResponseDTO> {

        const titleAlreadyExist = await this.#_problemRepo.findOne({
        title: { $regex: `^${title}$`, $options: "i" } 
        });


        if(titleAlreadyExist){
            return {
                data : null,
                success : false,
                errorMessage : ProblemErrorType.TitleAlreadyExist
            }
        }

        return {
            data : null,
            success : true
        }
    }
}
