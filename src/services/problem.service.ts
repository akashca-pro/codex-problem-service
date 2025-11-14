import { inject, injectable } from "inversify";
import { IProblemService } from "./interfaces/problem.service.interface";
import TYPES from "@/config/inversify/types";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { IProblemRepository } from "@/repos/interfaces/problem.repository.interface";
import { PROBLEM_ERROR_MESSAGES } from "@/const/ErrorType.const"
import { extractDup, isDupKeyError } from "@/utils/mongoError";
import { ICacheProvider } from "@/libs/cache/ICacheProvider.interface";
import { REDIS_PREFIX } from "@/config/redis/keyPrefix";
import { ProblemMapper } from "@/dtos/mappers/ProblemMapper";
import { config } from "@/config";
import { PaginationDTO } from "@/dtos/PaginationDTO";
import { IUpdatedDataForBasicProblem } from "@/dtos/problem/updateProblemRequestDTO";
import {AddTestCaseRequest, BulkUploadTestCasesRequest, CreateProblemRequest, GetProblemRequest, ListProblemRequest
    , RemoveTestCaseRequest, UpdateBasicProblemDetailsRequest, UpdateTemplateCodeRequest 
} from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import logger from '@/utils/pinoLogger'; // Import the logger

/**
 * Class representing the Problem Service management.
 * * @class
 * @implements {IProblemService}         
 */
@injectable()
export class ProblemService implements IProblemService {

    #_problemRepo : IProblemRepository;
    #_cacheProvider : ICacheProvider;

    /**
     * Creates an instance of ProblemService.
     * * @param {IProblemRepository} problemRepo - The problem repository instance.
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
        request : CreateProblemRequest
    ): Promise<ResponseDTO> {
        const method = 'createProblem';
        logger.info(`[PROBLEM-SERVICE] ${method} started`, { title: request.title, questionId: request.questionId });
        
        const dto = ProblemMapper.toCreateProblemService(request);
        
        const problemAlreadyExist = await this.#_problemRepo.findByTitle(dto.title);
        if(problemAlreadyExist){
            logger.warn(`[PROBLEM-SERVICE] ${method} failed: Title already exists`, { title: dto.title });
            return {
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.PROBLEM_ALREADY_EXISTS
            }
        }
        
        try {
            const result = await this.#_problemRepo.create({...dto, active : false});
            const outDTO = ProblemMapper.toOutDTO(result);
            logger.info(`[PROBLEM-SERVICE] ${method} completed successfully`, { problemId: result._id });
            return {
                data : outDTO,
                success : true
            }
        } catch (error) {
            if(isDupKeyError(error)){
                const { field } = extractDup(error as any);
                logger.error(`[PROBLEM-SERVICE] ${method} failed: Duplicate key error`, { field, request });
                return {
                    data : null,
                    success : false,
                    errorMessage : ` ${field} ${PROBLEM_ERROR_MESSAGES.PROBLEM_ALREADY_EXISTS}`
                }
            }
            logger.error(`[PROBLEM-SERVICE] ${method} failed unexpectedly`, { error });
            throw error;
        }
    }

    async getProblem(
        request : GetProblemRequest
    ): Promise<ResponseDTO> {
        const method = 'getProblem (Admin)';
        const dto = ProblemMapper.toGetProblemDetails(request);
        logger.info(`[PROBLEM-SERVICE] ${method} started`, { problemId: dto._id });

        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE_ADMIN}${dto._id}`;
        const cached = await this.#_cacheProvider.get(cacheKey);
        
        if(cached){
            logger.info(`[PROBLEM-SERVICE] ${method} cache hit`, { problemId: dto._id });
            return {
                data : cached,
                success : true
            }
        }
        logger.debug(`[PROBLEM-SERVICE] ${method} cache miss`, { problemId: dto._id });
        
        const problem = await this.#_problemRepo.findByIdLean(dto._id);
        
        if(!problem){
            logger.warn(`[PROBLEM-SERVICE] ${method} failed: Problem not found`, { problemId: dto._id });
            return {
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.PROBLEM_NOT_FOUND
            }
        }
        
        const outDTO = ProblemMapper.toOutDTO(problem)
        await this.#_cacheProvider.set(
            cacheKey,
            outDTO,
            config.PROBLEM_DETAILS_CACHE_EXPIRY
        );
        logger.info(`[PROBLEM-SERVICE] ${method} completed successfully (Cached)`, { problemId: dto._id });
        return {
            data : outDTO,
            success : true
        }
    }

    async getProblemPublic(
        request : GetProblemRequest
    ): Promise<ResponseDTO> {
        const method = 'getProblemPublic';
        const dto = ProblemMapper.toGetProblemDetails(request);
        logger.info(`[PROBLEM-SERVICE] ${method} started`, { problemId: dto._id });

        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${dto._id}`;
        const cached = await this.#_cacheProvider.get(cacheKey);
        
        if(cached){
            logger.info(`[PROBLEM-SERVICE] ${method} cache hit`, { problemId: dto._id });
            return {
                data : cached,
                success : true,
            }
        }
        logger.debug(`[PROBLEM-SERVICE] ${method} cache miss`, { problemId: dto._id });
        
        const select = ['questionId','title','description','difficulty','constraints','tags','testcaseCollection','examples','starterCodes','updatedAt','createdAt']
        const problem = await this.#_problemRepo.findByIdLean(dto._id, select);
        
        if(!problem){
            logger.warn(`[PROBLEM-SERVICE] ${method} failed: Problem not found`, { problemId: dto._id });
            return {
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.PROBLEM_NOT_FOUND
            }
        }
        
        const outDTO = ProblemMapper.toOutPublicDTO(problem)
        await this.#_cacheProvider.set(
            cacheKey,
            outDTO,
            config.PROBLEM_DETAILS_CACHE_EXPIRY
        );
        logger.info(`[PROBLEM-SERVICE] ${method} completed successfully (Cached)`, { problemId: dto._id });
        return {
            data : outDTO,
            success : true
        }
    }

    async listProblems(
        request : ListProblemRequest
    ): Promise<PaginationDTO> {
        const method = 'listProblems';
        logger.info(`[PROBLEM-SERVICE] ${method} started`, { page: request.page, limit: request.limit });
        
        const filters = ProblemMapper.toListProblemService(request);
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
        const outDTO = problems.map(p=>ProblemMapper.toOutListDTO(p)); 

        logger.info(`[PROBLEM-SERVICE] ${method} completed successfully`, { totalItems, currentPage: filters.page });
        
        return {
            body : outDTO,
            currentPage : filters.page,
            totalItems,
            totalPages
        }
    }

    async updateBasicProblemDetails(
        request : UpdateBasicProblemDetailsRequest
    ): Promise<ResponseDTO> {
        const method = 'updateBasicProblemDetails';
        logger.info(`[PROBLEM-SERVICE] ${method} started`, { problemId: request.Id });

        const { _id, updatedData } = ProblemMapper.toUpdateBasicProblemDetailsServive(request);
        
        const problemExist = await this.#_problemRepo.findById(_id);
        if(!problemExist){
            logger.warn(`[PROBLEM-SERVICE] ${method} failed: Problem not found`, { problemId: _id });
            return { 
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.PROBLEM_NOT_FOUND
            }
        }
        
        const updatedQuery: IUpdatedDataForBasicProblem = {
        ...(updatedData.title && { title: updatedData.title }),
        ...(updatedData.description && { description: updatedData.description }),
        ...(updatedData.difficulty && { difficulty: updatedData.difficulty }),
        ...(updatedData.tags && { tags: updatedData.tags }),
        ...(updatedData.constraints?.length ? { constraints: updatedData.constraints } : {}),
        ...(updatedData.questionId && { questionId: updatedData.questionId }),
        ...(updatedData.examples?.length ? { examples: updatedData.examples } : {}),
        ...(updatedData.starterCodes?.length ? { starterCodes: updatedData.starterCodes } : {}),
        active: updatedData.active ?? false, 
        };
        
        try {
            const updatedProblem = await this.#_problemRepo.update(_id, updatedQuery);
            if(!updatedProblem){
                // This case should be rare since we already checked existence
                logger.error(`[PROBLEM-SERVICE] ${method} failed: Update returned null despite problem existence check`, { problemId: _id, updatedQuery });
                return {
                    data : null,
                    success : false
                }
            }
            
            const cacheKeyAdmin = `${REDIS_PREFIX.PROBLEM_CACHE_ADMIN}${_id}`; 
            const cacheKeyCodeManage = `${REDIS_PREFIX.CODE_MANAGE_PROBLEM_DETAILS}${_id}` 
            const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${_id}`;
            
            logger.debug(`[PROBLEM-SERVICE] ${method}: Invalidating caches`, { problemId: _id, keys: [cacheKey, cacheKeyAdmin, cacheKeyCodeManage] });
            await Promise.all([
                this.#_cacheProvider.del(cacheKey),
                this.#_cacheProvider.del(cacheKeyAdmin),
                this.#_cacheProvider.del(cacheKeyCodeManage)
            ])
            
            logger.info(`[PROBLEM-SERVICE] ${method} completed successfully`, { problemId: _id });
            return {
                data : null,
                success : true,
            }
        } catch (error : unknown) {
            if(isDupKeyError(error)){
                const { field } = extractDup(error as any);
                logger.error(`[PROBLEM-SERVICE] ${method} failed: Duplicate key error during update`, { problemId: _id, field, updatedQuery });
                return {
                    data : null,
                    success : false,
                    errorMessage : `${field} ${PROBLEM_ERROR_MESSAGES.PROBLEM_FIELD_ALREADY_EXIST}`
                }
            }
            logger.error(`[PROBLEM-SERVICE] ${method} failed unexpectedly`, { error, problemId: _id });
            throw error;
        }
    }

    async addTestCase(
        request : AddTestCaseRequest
    ): Promise<ResponseDTO> {
        const method = 'addTestCase';
        logger.info(`[PROBLEM-SERVICE] ${method} started`, { problemId: request.Id, type: request.testCaseCollectionType });
        
        const dto = ProblemMapper.toAddTestCaseService(request);
        const problemExist = await this.#_problemRepo.findById(dto._id);
        if(!problemExist){
            logger.warn(`[PROBLEM-SERVICE] ${method} failed: Problem not found`, { problemId: dto._id });
            return { 
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.PROBLEM_NOT_FOUND
            }
        }
        
        await this.#_problemRepo.addTestCase(
            dto._id,
            dto.testCaseCollectionType,
            dto.testCase
        );
        
        const cacheKeyAdmin = `${REDIS_PREFIX.PROBLEM_CACHE_ADMIN}${dto._id}`; 
        const cacheKeyCodeManage = `${REDIS_PREFIX.CODE_MANAGE_PROBLEM_DETAILS}${dto._id}` 
        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${dto._id}`;
        
        logger.debug(`[PROBLEM-SERVICE] ${method}: Invalidating caches`, { problemId: dto._id });
        await Promise.all([
            this.#_cacheProvider.del(cacheKey),
            this.#_cacheProvider.del(cacheKeyAdmin),
            this.#_cacheProvider.del(cacheKeyCodeManage)
        ])
        
        logger.info(`[PROBLEM-SERVICE] ${method} completed successfully`, { problemId: dto._id });
        return {
            data : null,
            success : true
        }
    }

    async bulkUploadTestCases(
        request : BulkUploadTestCasesRequest
    ): Promise<ResponseDTO> {
        const method = 'bulkUploadTestCases';
        logger.info(`[PROBLEM-SERVICE] ${method} started`, { problemId: request.Id, count: request.testCase?.length });
        
        const dto = ProblemMapper.toBulkUploadTestCaseService(request);
        const problemExist = await this.#_problemRepo.findById(dto._id);
        if(!problemExist){
            logger.warn(`[PROBLEM-SERVICE] ${method} failed: Problem not found`, { problemId: dto._id });
            return { 
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.PROBLEM_NOT_FOUND
            }
        }
        
        await this.#_problemRepo.bulkUploadTestCase(
            dto._id,
            dto.testCaseCollectionType,
            dto.testCase
        );
        
        const cacheKeyAdmin = `${REDIS_PREFIX.PROBLEM_CACHE_ADMIN}${dto._id}`; 
        const cacheKeyCodeManage = `${REDIS_PREFIX.CODE_MANAGE_PROBLEM_DETAILS}${dto._id}` 
        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${dto._id}`;
        
        logger.debug(`[PROBLEM-SERVICE] ${method}: Invalidating caches`, { problemId: dto._id });
        await Promise.all([
            this.#_cacheProvider.del(cacheKey),
            this.#_cacheProvider.del(cacheKeyAdmin),
            this.#_cacheProvider.del(cacheKeyCodeManage)
        ])
        
        logger.info(`[PROBLEM-SERVICE] ${method} completed successfully`, { problemId: dto._id });
        return {
            data : null,
            success : true
        }
    }

    async removeTestCase(
        request : RemoveTestCaseRequest
    ): Promise<ResponseDTO> {
        const method = 'removeTestCase';
        logger.info(`[PROBLEM-SERVICE] ${method} started`, { problemId: request.Id, testCaseId: request.testCaseId });
        
        const dto = ProblemMapper.toRemoveTestCaseService(request);
        const removed = await this.#_problemRepo.removeTestCase(
            dto._id,
            dto.testCaseId,
            dto.testCaseCollectionType
        );
        
        if(!removed){
            logger.warn(`[PROBLEM-SERVICE] ${method} failed: Test case not found or not removed`, { problemId: dto._id, testCaseId: dto.testCaseId });
            return {
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.TEST_CASE_NOT_FOUND
            }
        }
        
        const cacheKeyAdmin = `${REDIS_PREFIX.PROBLEM_CACHE_ADMIN}${dto._id}`; 
        const cacheKeyCodeManage = `${REDIS_PREFIX.CODE_MANAGE_PROBLEM_DETAILS}${dto._id}` 
        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${dto._id}`;
        
        logger.debug(`[PROBLEM-SERVICE] ${method}: Invalidating caches`, { problemId: dto._id });
        await Promise.all([
            this.#_cacheProvider.del(cacheKey),
            this.#_cacheProvider.del(cacheKeyAdmin),
            this.#_cacheProvider.del(cacheKeyCodeManage)
        ])
        
        logger.info(`[PROBLEM-SERVICE] ${method} completed successfully`, { problemId: dto._id, testCaseId: dto.testCaseId });
        return {
            data : null,
            success : true
        }
    }

    async checkQuestionIdAvailability(
        questionId: string
    ): Promise<ResponseDTO> {
        const method = 'checkQuestionIdAvailability';
        logger.info(`[PROBLEM-SERVICE] ${method} started`, { questionId });
        
        const questionIdAlreadyExist = await this.#_problemRepo.findOne({ questionId });
        
        if(questionIdAlreadyExist){
            logger.warn(`[PROBLEM-SERVICE] ${method} failed: Question ID already exists`, { questionId });
            return {
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.QUESTION_ID_ALREADY_EXIST
            }
        }
        
        logger.info(`[PROBLEM-SERVICE] ${method} completed successfully (Available)`, { questionId });
        return {
            data : null,
            success : true
        }
    }

    async checkProblemTitleAvailability(
        title: string
    ): Promise<ResponseDTO> {
        const method = 'checkProblemTitleAvailability';
        logger.info(`[PROBLEM-SERVICE] ${method} started`, { title });
        
        const titleAlreadyExist = await this.#_problemRepo.findOne({
            title: { $regex: `^${title}$`, $options: "i" } 
        });
        
        if(titleAlreadyExist){
            logger.warn(`[PROBLEM-SERVICE] ${method} failed: Title already exists (case-insensitive)`, { title });
            return {
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.TITLE_ALREADY_EXIST
            }
        }
        
        logger.info(`[PROBLEM-SERVICE] ${method} completed successfully (Available)`, { title });
        return {
            data : null,
            success : true
        }
    }

    async updateTemplateCode(
        request: UpdateTemplateCodeRequest
    ): Promise<ResponseDTO> {
        const method = 'updateTemplateCode';
        logger.info(`[PROBLEM-SERVICE] ${method} started`, { problemId: request.Id, templateCodeId: request.templateCodeId });

        const dto = ProblemMapper.toUpdateTemplateCodeService(request);
        
        const problemExist = await this.#_problemRepo.findById(dto._id);
        if(!problemExist){
            logger.warn(`[PROBLEM-SERVICE] ${method} failed: Problem not found`, { problemId: dto._id });
            return { 
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.PROBLEM_NOT_FOUND
            }
        }
        
        await this.#_problemRepo.updateTemplateCode(
            dto._id, 
            dto.templateCodeId, 
            dto.updatedTemplateCode
        );
        
        const cacheKeyAdmin = `${REDIS_PREFIX.PROBLEM_CACHE_ADMIN}${dto._id}`; 
        const cacheKeyCodeManage = `${REDIS_PREFIX.CODE_MANAGE_PROBLEM_DETAILS}${dto._id}` 
        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${dto._id}`;
        
        logger.debug(`[PROBLEM-SERVICE] ${method}: Invalidating caches`, { problemId: dto._id });
        await Promise.all([
            this.#_cacheProvider.del(cacheKey),
            this.#_cacheProvider.del(cacheKeyAdmin),
            this.#_cacheProvider.del(cacheKeyCodeManage)
        ])
        
        logger.info(`[PROBLEM-SERVICE] ${method} completed successfully`, { problemId: dto._id });
        return {
            data : null,
            success : true
        } 
    }
}