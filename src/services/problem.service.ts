import { inject, injectable } from "inversify";
import { IProblemService } from "./interfaces/problem.service.interface";
import TYPES from "@/config/inversify/types";
import { ResponseDTO } from "@/dtos/ResponseDTO";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
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

/**
 * Class representing the Problem Service management.
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
        request : CreateProblemRequest
    ): Promise<ResponseDTO> {
        const dto = ProblemMapper.toCreateProblemService(request);
        const problemAlreadyExist = await this.#_problemRepo.findByTitle(dto.title);
        if(problemAlreadyExist){
            return {
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.PROBLEM_ALREADY_EXISTS
            }
        }
        try {
            const result = await this.#_problemRepo.create({...dto, active : false});
            const outDTO = ProblemMapper.toOutDTO(result);
            return {
                data : outDTO,
                success : true
            }
        } catch (error) {
            if(isDupKeyError(error)){
                const { field } = extractDup(error as any);
                return {
                    data : null,
                    success : false,
                    errorMessage : ` ${field} ${PROBLEM_ERROR_MESSAGES.PROBLEM_ALREADY_EXISTS}`
                }
            }
            throw error;
        }
    }

    async getProblem(
        request : GetProblemRequest
    ): Promise<ResponseDTO> {
        const dto = ProblemMapper.toGetProblemDetails(request);
        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE_ADMIN}${dto._id}`;
        const cached = await this.#_cacheProvider.get(cacheKey);
        if(cached){
            return {
                data : cached,
                success : true
            }
        }
        const problem = await this.#_problemRepo.findByIdLean(dto._id);
        if(!problem){
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
        return {
            data : outDTO,
            success : true
        }
    }

    async getProblemPublic(
        request : GetProblemRequest
    ): Promise<ResponseDTO> {
        const dto = ProblemMapper.toGetProblemDetails(request);
        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${dto._id}`;
        const cached = await this.#_cacheProvider.get(cacheKey);
        if(cached){
            return {
                data : cached,
                success : true,
            }
        }
        const select = ['questionId','title','description','difficulty','constraints','tags','testcaseCollection','examples','starterCodes','updatedAt','createdAt']
        const problem = await this.#_problemRepo.findByIdLean(dto._id, select);
        if(!problem){
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
        return {
            data : outDTO,
            success : true
        }
    }

    async listProblems(
        request : ListProblemRequest
    ): Promise<PaginationDTO> {
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
        const { _id, updatedData } = ProblemMapper.toUpdateBasicProblemDetailsServive(request);
        const problemExist = await this.#_problemRepo.findById(_id);
        if(!problemExist){
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
        active: updatedData.active ?? false, // always set, default false
        };
        try {
            const updatedProblem = await this.#_problemRepo.update(_id, updatedQuery);
            if(!updatedProblem){
                return {
                    data : null,
                    success : false
                }
            }
            const cacheKeyAdmin = `${REDIS_PREFIX.PROBLEM_CACHE_ADMIN}${_id}`; 
            const cacheKeyCodeManage = `${REDIS_PREFIX.CODE_MANAGE_PROBLEM_DETAILS}${_id}` 
            const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${_id}`;
            await Promise.all([
                await this.#_cacheProvider.del(cacheKey),
                await this.#_cacheProvider.del(cacheKeyAdmin),
                await this.#_cacheProvider.del(cacheKeyCodeManage)
            ])
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
                    errorMessage : `${field} ${PROBLEM_ERROR_MESSAGES.PROBLEM_FIELD_ALREADY_EXIST}`
                }
            }
            throw error;
        }
    }

    async addTestCase(
        request : AddTestCaseRequest
    ): Promise<ResponseDTO> {
        const dto = ProblemMapper.toAddTestCaseService(request);
        const problemExist = await this.#_problemRepo.findById(dto._id);
        if(!problemExist){
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
        await Promise.all([
            await this.#_cacheProvider.del(cacheKey),
            await this.#_cacheProvider.del(cacheKeyAdmin),
            await this.#_cacheProvider.del(cacheKeyCodeManage)
        ])
        return {
            data : null,
            success : true
        }
    }

    async bulkUploadTestCases(
        request : BulkUploadTestCasesRequest
    ): Promise<ResponseDTO> {
        const dto = ProblemMapper.toBulkUploadTestCaseService(request);
        const problemExist = await this.#_problemRepo.findById(dto._id);
        if(!problemExist){
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
        await Promise.all([
            await this.#_cacheProvider.del(cacheKey),
            await this.#_cacheProvider.del(cacheKeyAdmin),
            await this.#_cacheProvider.del(cacheKeyCodeManage)
        ])
        return {
            data : null,
            success : true
        }
    }

    async removeTestCase(
        request : RemoveTestCaseRequest
    ): Promise<ResponseDTO> {
        const dto = ProblemMapper.toRemoveTestCaseService(request);
        const removed = await this.#_problemRepo.removeTestCase(
            dto._id,
            dto.testCaseId,
            dto.testCaseCollectionType
        );
        if(!removed){
            return {
                data : null,
                success : false,
                errorMessage : PROBLEM_ERROR_MESSAGES.TEST_CASE_NOT_FOUND
            }
        }
        const cacheKeyAdmin = `${REDIS_PREFIX.PROBLEM_CACHE_ADMIN}${dto._id}`; 
        const cacheKeyCodeManage = `${REDIS_PREFIX.CODE_MANAGE_PROBLEM_DETAILS}${dto._id}` 
        const cacheKey = `${REDIS_PREFIX.PROBLEM_CACHE}${dto._id}`;
        await Promise.all([
            await this.#_cacheProvider.del(cacheKey),
            await this.#_cacheProvider.del(cacheKeyAdmin),
            await this.#_cacheProvider.del(cacheKeyCodeManage)
        ])
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
                errorMessage : PROBLEM_ERROR_MESSAGES.QUESTION_ID_ALREADY_EXIST
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
                errorMessage : PROBLEM_ERROR_MESSAGES.TITLE_ALREADY_EXIST
            }
        }
        return {
            data : null,
            success : true
        }
    }

    async updateTemplateCode(
        request: UpdateTemplateCodeRequest
    ): Promise<ResponseDTO> {
        const dto = ProblemMapper.toUpdateTemplateCodeService(request);
        const problemExist = await this.#_problemRepo.findById(dto._id);
        if(!problemExist){
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
        await Promise.all([
            await this.#_cacheProvider.del(cacheKey),
            await this.#_cacheProvider.del(cacheKeyAdmin),
            await this.#_cacheProvider.del(cacheKeyCodeManage)
        ])
        return {
            data : null,
            success : true
        } 
    }
}
