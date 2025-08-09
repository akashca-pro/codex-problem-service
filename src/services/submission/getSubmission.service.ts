import { inject, injectable } from "inversify";
import { IGetSubmissionsService } from "./interfaces/getSubmissions.service.interface";
import { ISubmissionRepository } from "@/infra/repos/interfaces/submission.repository.interface";
import TYPES from "@/config/inversify/types";
import { PaginationDTO } from "@/dtos/PaginationDTO";
import { IGetSubmissionRequestDTO } from "@/dtos/submission/getSubmissionRequestDTO";

/**
 * Implementaion of get submission service.
 * 
 * @class
 * @implements {IGetSubmissionsService}
 */
@injectable()
export class GetSubmissionsService implements IGetSubmissionsService {

    #_submissionRepo : ISubmissionRepository

    /**
     * Create an instance of GetSubmissionsService
     * 
     * @param submissionRepo - The submission repository.
     * @constructor
     */
    constructor(
        @inject(TYPES.ISubmissionRepository)
        submissionRepo : ISubmissionRepository
    ){
        this.#_submissionRepo = submissionRepo;
    }

    async execute(data: IGetSubmissionRequestDTO): Promise<PaginationDTO> {
        
        const filter : Record<string, any> = {};

        if(data.problemId) filter.problemId = data.problemId;
        if(data.battleId) filter.battleId = data.battleId;
        if(data.userId) filter.userId = data.userId;

        const skip = (data.page - 1) * data.limit;

        const [totalItems,submissions] = await Promise.all([
            await this.#_submissionRepo.countDocuments(filter),
            await this.#_submissionRepo.findPaginated(filter,skip,data.limit)
        ]);

        const totalPages = Math.ceil(totalItems/ data.limit);

        return {
            body : submissions,
            currentPage : data.page,
            totalItems,
            totalPages
        }
    }
}