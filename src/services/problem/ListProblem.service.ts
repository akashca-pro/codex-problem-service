import { inject, injectable } from "inversify";
import { IListProblemService } from "./interfaces/ListProblem.service.interface";
import { IProblemRepository } from "@/infra/repos/interfaces/problem.repository.interface";
import TYPES from "@/config/inversify/types";
import { IListProblemsRequestDTO } from "@/dtos/problem/listProblemsRequestDTO";
import { PaginationDTO } from "@/dtos/PaginationDTO";

/**
 * Implementaion of List problem service.
 * 
 * @class
 * @implements {IListProblemService}
 */
@injectable()
export class ListProblemService implements IListProblemService {

    #_problemRepo : IProblemRepository

    /**
     * Creates an instance of ListProblemService.
     * 
     * @param problemRepo - The problem repository.
     * @constructor
     */
    constructor(
        @inject(TYPES.IProblemRepository)
        problemRepo : IProblemRepository
    ){
        this.#_problemRepo = problemRepo
    }

    async execute(data: IListProblemsRequestDTO): Promise<PaginationDTO> {
        
        const filter : Record<string, any> = {};
        if(data.difficulty) filter.difficulty = data.difficulty;
        if(data.questionId) filter.questionId = data.questionId;
        if(data.tags?.length) filter.tags = { $in : data.tags };

        if(data?.active !== null) data.active ? filter.active = true : filter.active = false;

        if (data.search) {
        filter.$or = [
            { title: { $regex: `^${data.search}`, $options: "i" } }, 
            { questionId: { $regex: `^${data.search}`, $options: "i" } },
            { tags: { $regex: `^${data.search}`, $options: "i" } }
        ];
        }
        const skip = (data.page - 1) * data.limit;

        const select = ['title','questionId','difficulty','tags','active','createdAt','updatedAt'];

        const [totalItems, problems] = await Promise.all([
            this.#_problemRepo.countDocuments(filter),
            this.#_problemRepo.findPaginatedLean(filter,skip,data.limit,select,{ questionId : 1 })
        ])

        const totalPages = Math.ceil(totalItems/ data.limit);

        return {
            body : problems || [],
            currentPage : data.page,
            totalItems,
            totalPages
        }
    }
}

