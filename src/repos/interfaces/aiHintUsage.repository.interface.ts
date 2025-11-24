import { IAiHintUsage } from "@/db/interface/aiHintUsages.interface";
import { BaseRepository } from "../base.repository";

export interface IAiHintUsageRepository extends BaseRepository<IAiHintUsage> {
    getUsedHintsByUserForProblem(
        userId : string,
        problemId : string
    ) : Promise<IAiHintUsage | null>;
    getAllUsedHintsByUser(
        userId : string
    ) : Promise<IAiHintUsage[]>;
}