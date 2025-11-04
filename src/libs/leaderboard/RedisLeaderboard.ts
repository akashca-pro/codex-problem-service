import { inject, injectable } from "inversify";
import { ILeaderboard } from "./leaderboard.interface";
import redis from "@/config/redis";
import TYPES from "@/config/inversify/types";
import { LeaderboardData, LeaderboardUser } from "@/dtos/Leaderboard.dto";
import logger from "@/utils/pinoLogger";
import { IFirstSubmissionRepository } from "@/repos/interfaces/firstSubmission.repository.interface";
import Redis from "ioredis";

@injectable()
export class RedisLeaderboard implements ILeaderboard {

    #_redis : Redis = redis;
    #_namespace : string;
    #_k : number = 100;
    #_firstSubmissionRepo : IFirstSubmissionRepository

    private getGlobalKey(): string { return `${this.#_namespace}:global`; }
    private getEntityKey(entity: string): string { return `${this.#_namespace}:entity:${entity}`; }
    private getUsersHashKey(): string { return `${this.#_namespace}:users`; }
    private getProblemsSolvedHashKey(): string { return `${this.#_namespace}:problems_solved`; }

    constructor(
        @inject(TYPES.IFirstSubmissionRepository) firstSubmissionRepo : IFirstSubmissionRepository,
        namespace : string = 'default'
    ){
        this.#_namespace = namespace;
        this.#_firstSubmissionRepo = firstSubmissionRepo;
    }

    public async init() : Promise<void> {
        try {
            logger.info("Initializing LeaderboardService, starting resync...");
            await this.resyncFromDatabase();
            logger.info("LeaderboardService initialized and resynced.");
        } catch (error) {
            logger.error("FATAL: Leaderboard resync failed on startup.", { error });
        }
    }

    async addUser(user: LeaderboardUser): Promise<void> {
        const { id, score, entity } = user;
        const multi = this.#_redis.multi();
        multi.zadd(this.getGlobalKey(), score, id);
        if(entity){
            multi.zadd(this.getEntityKey(entity), score, id);
        }
        multi.hset(this.getUsersHashKey(), id, entity || '');
        await multi.exec();
    }

    async incrementScore(
        userId: string, 
        entity: string, 
        scoreIncrement: number
    ): Promise<void> {
        let entityToUpdate = entity;
        if (!entityToUpdate) {
            entityToUpdate = await this.getUserEntity(userId);
        }   
        const multi = this.#_redis.multi();
        multi.zincrby(this.getGlobalKey(), scoreIncrement, userId);
        if (entityToUpdate) {
            multi.zincrby(this.getEntityKey(entityToUpdate), scoreIncrement, userId);
        }
        if(entity){
            multi.hset(this.getUsersHashKey(), userId, entity);
        }
        await multi.exec();
    }

    async decrementScore(
        userId: string, 
        entity: string, 
        scoreDecrement: number
    ): Promise<void> {
        await this.incrementScore(userId, entity, -scoreDecrement);
    }

    public async incrementProblemsSolved(
        userId: string
    ): Promise<void> {
        try {
            await this.#_redis.hincrby(this.getProblemsSolvedHashKey(), userId, 1);
        } catch (error) {
            logger.error("Failed to increment problems solved count", { userId, error });
        }
    }

    async removeUser(
        userId: string
    ): Promise<void> {
        const entity = await this.getUserEntity(userId);
        const multi = this.#_redis.multi();
        multi.zrem(this.getGlobalKey(), userId);
        if(entity){
            multi.zrem(this.getEntityKey(entity), userId);
        }
        multi.hdel(this.getUsersHashKey(), userId);
        await multi.exec();
    }

    async updateEntityByUserId(
        userId: string, 
        newEntity: string
    ): Promise<void> {
        if (!newEntity) {
            throw new Error("New entity cannot be empty");
        }
        const [oldEntity, score] = await Promise.all([
            this.getUserEntity(userId),
            this.getUserScore(userId)
        ]);
        if(oldEntity === newEntity) return;
        const multi = this.#_redis.multi();
        if(oldEntity){
            multi.zrem(this.getEntityKey(oldEntity), userId);
        }
        multi.zadd(this.getEntityKey(newEntity), score, userId);
        multi.hset(this.getUsersHashKey(), userId, newEntity);
        await multi.exec();
    }

    async getUserLeaderboardData(
        userId: string,
        k : number = this.#_k
    ): Promise<LeaderboardData> {
        const [score, entity, globalRank, topKGlobal] = await Promise.all([
            this.getUserScore(userId),
            this.getUserEntity(userId),
            this.getRankGlobal(userId),
            this.getTopKGlobal(k),
        ]);
        let entityRank = -1;
        let topKEntity: LeaderboardUser[] = [];
        if (entity) {
            const [rank, topK] = await Promise.all([
                this.getRankEntity(userId),
                this.getTopKEntity(entity, k)
            ]);
            entityRank = rank;
            topKEntity = topK;
        }
        return {
            userId,
            score,
            entity,
            globalRank,
            entityRank,
            topKGlobal,
            topKEntity
        };  
    }

    async forceClearLeaderboard(
        namespace : string = this.#_namespace
    ): Promise<void> {
        const scanKey = `${namespace}:*`;
        let cursor = '0';
        do {
            const [newCursor, keys] = await this.#_redis.scan(
                cursor, 
                'MATCH', 
                scanKey, 
                'COUNT', 
                100
            );
            if (keys.length > 0) {
                await this.#_redis.del(...keys);
            }
            cursor = newCursor;
        } while (cursor !== '0');
        logger.info(`All keys with namespace '${namespace}' have been cleared.`);
    }

    public async getUserEntity(userId: string): Promise<string> {
        const entity = await this.#_redis.hget(this.getUsersHashKey(), userId);
        return entity || '';
    }

    public async getUserScore(userId: string): Promise<number> {
        const score = await this.#_redis.zscore(this.getGlobalKey(), userId);
        return score === null ? 0 : Number(score);
    }

    public async getRankGlobal(userId: string): Promise<number> {
        const rank = await this.#_redis.zrevrank(this.getGlobalKey(), userId);
        return rank === null ? -1 : rank;
    }

    public async getRankEntity(userId: string): Promise<number> {
        const entity = await this.getUserEntity(userId);
        if (!entity) {
            return -1;
        }
        const rank = await this.#_redis.zrevrank(this.getEntityKey(entity), userId);
        return rank === null ? -1 : rank;
    }

    public async getTopKGlobal(k : number = this.#_k): Promise<LeaderboardUser[]> {
        const results = await this.#_redis.zrevrange(
            this.getGlobalKey(), 0, k - 1, 'WITHSCORES'
        );
        const topK: { value: string, score: number }[] = [];
        for (let i = 0; i < results.length; i += 2) {
            topK.push({
                value: results[i],
                score: parseFloat(results[i + 1])
            });
        }
        return this.hydrateUsers(topK);
    }

    public async getTopKEntity(entity: string, k: number = this.#_k): Promise<LeaderboardUser[]> {
        if (!entity) return [];
        const topKWithScores = await this.#_redis.zrevrange(
            this.getEntityKey(entity), 0, k - 1, 'WITHSCORES'
        );
        if (topKWithScores.length === 0) {
            return [];
        }
        const userIds: string[] = [];
        const usersById: Map<string, LeaderboardUser> = new Map();
        // Parse the list and prepare for hydration
        for (let i = 0; i < topKWithScores.length; i += 2) {
            const id = topKWithScores[i];
            const score = Number(topKWithScores[i + 1]);
            userIds.push(id);
            usersById.set(id, {
                id: id,
                score: score,
                entity: entity,
                problemsSolved: 0
            });
        }
        // Fetch the problemsSolved counts
        const problemsSolvedCounts = await this.#_redis.hmget(
            this.getProblemsSolvedHashKey(), 
            ...userIds
        );
        // Merge the problemsSolved counts into the final list
        for (let i = 0; i < userIds.length; i++) {
            const id = userIds[i];
            const user = usersById.get(id);
            if (user) {
                user.problemsSolved = parseInt(problemsSolvedCounts[i] || '0', 10);
            }
        }
        return Array.from(usersById.values());
    }

    private async resyncFromDatabase(namespace : string = this.#_namespace) : Promise<void> {
        logger.info('Starting database aggregation for resync...');
        const [globalScores, userEntities, countryScores, problemsSolved] = await Promise.all([
            this.#_firstSubmissionRepo.getGlobalScores(),
            this.#_firstSubmissionRepo.getUserCountries(),
            this.#_firstSubmissionRepo.getCountryScores(),
            this.#_firstSubmissionRepo.getGlobalProblemsSolved()
        ]);
        logger.debug(`Aggregated ${globalScores.length} global scores, ${countryScores.length} country scores.`);

        const multi = this.#_redis.multi();
        // Clear all existing leaderboard keys to start fresh
        const allKeys = await this.#_redis.keys(`${namespace}:*`);
        if (allKeys.length > 0) {
            multi.del(allKeys);
        }   
        // Repopulate Global Leaderboard (ZSET)
        if (globalScores.length > 0) {
            const globalArgs = globalScores.map(item => ({
                score: item.totalScore,
                value: item._id 
        }));
            const zaddArgs = globalArgs.flatMap(g => [String(g.score), g.value]);
            multi.zadd(this.getGlobalKey(), ...zaddArgs);
        }
        // Repopulate User-to-Entity Map (HASH)
        if (userEntities.length > 0) {
            const userMap: { [key: string]: string } = {};
            for (const item of userEntities) {
                if (item.entity) { 
                    userMap[item._id] = item.entity;
                }
            }
            if (Object.keys(userMap).length > 0) {
                multi.hset(this.getUsersHashKey(), userMap);
            }
        }
        // Repopulate all Country Leaderboards (ZSETs)
        // Group by country to make fewer Redis calls
        const scoresByCountry = new Map<string, { score: number, value: string }[]>();
        for (const item of countryScores) {
            const { country, userId } = item._id;
            if (!scoresByCountry.has(country)) {
                scoresByCountry.set(country, []);
            }
            scoresByCountry.get(country)!.push({
                score: item.totalScore,
                value: userId
            });
        }
        for (const [country, args] of scoresByCountry.entries()) {
            const zaddArgs = args.flatMap(g => [String(g.score), g.value]);
            multi.zadd(this.getEntityKey(country), ...zaddArgs);
        }
        if (problemsSolved.length > 0) {
            const problemsMap: { [key: string]: string } = {};
            for (const item of problemsSolved) {
                // item._id is userId, item.count is the total
                problemsMap[item._id] = String(item.count);
            }
            multi.hset(this.getProblemsSolvedHashKey(), problemsMap);
        }   
        await multi.exec();
    }

    private async hydrateUsers(users: { value: string, score: number }[]): Promise<LeaderboardUser[]> {
        if (users.length === 0) {
            return [];
        }
        const userIds = users.map(u => u.value);
        const [entities, problemsSolved] = await Promise.all([
            this.#_redis.hmget(this.getUsersHashKey(), ...userIds),
            this.#_redis.hmget(this.getProblemsSolvedHashKey(), ...userIds)
        ]);
        return users.map((user, index) => ({
            id: user.value,
            score: user.score,
            entity: entities[index] || '',
            problemsSolved: parseInt(problemsSolved[index] || '0', 10)
        }));
    }

}