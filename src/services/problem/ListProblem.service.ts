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
        if(data.tag) filter.tags = data.tag;
        if(data.active) filter.active = data.active;
        if (data.search) filter.$text = { $search: data.search };

        const skip = (data.page - 1) * data.limit;

        const [totalItems, problems] = await Promise.all([
            this.#_problemRepo.countDocuments(filter),
            this.#_problemRepo.findPaginated(filter,skip,data.limit)
        ])

        const totalPages = Math.ceil(totalItems/ data.limit);

        return {
            body : problems,
            currentPage : data.page,
            totalItems,
            totalPages
        }
    }
}

