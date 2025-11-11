import { inject, injectable } from "inversify";
import { ILeaderboard } from "./leaderboard.interface";
import redis from "@/config/redis";
import TYPES from "@/config/inversify/types";
import { LeaderboardData, LeaderboardUser } from "@/dtos/Leaderboard.dto";
import logger from "@/utils/pinoLogger"; // Already here
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
    private getUsernameHashKey(): string { return `${this.#_namespace}:usernames`; }

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
            logger.error("FATAL: Leaderboard resync failed on startup.", error); // Error logging added
        }
    }

    async addUser(user: LeaderboardUser): Promise<void> {
        const { id, score, entity } = user;
        logger.debug(`[LB] Starting addUser for user ${id}`, { id, score, entity });
        try {
            const multi = this.#_redis.multi();
            multi.zadd(this.getGlobalKey(), score, id);
            if(entity){
                multi.zadd(this.getEntityKey(entity), score, id);
            }
            multi.hset(this.getUsersHashKey(), id, entity || '');
            await multi.exec();
            logger.info(`[LB] Successfully added user ${id}`, { id });
        } catch (error) {
            logger.error(`[LB] Failed to add user ${id}`, error);
            throw error;
        }
    }

    async incrementScore(
        userId: string, 
        entity: string, 
        scoreIncrement: number
    ): Promise<void> {
        logger.debug(`[LB] Starting incrementScore for user ${userId} by ${scoreIncrement}`, { userId, scoreIncrement });
        try {
            let entityToUpdate = entity;
            if (!entityToUpdate) {
                logger.debug(`[LB] Entity not provided, fetching for user ${userId}`);
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
            logger.info(`[LB] Score incremented for user ${userId}. Global key: ${this.getGlobalKey()}`, { userId, scoreIncrement });
        } catch (error) {
            logger.error(`[LB] Failed to increment score for user ${userId}`, error);
            throw error;
        }
    }

    async decrementScore(
        userId: string, 
        entity: string, 
        scoreDecrement: number
    ): Promise<void> {
        logger.debug(`[LB] Starting decrementScore for user ${userId} by ${scoreDecrement}`, { userId, scoreDecrement });
        // The implementation calls incrementScore, so logging will happen there too.
        await this.incrementScore(userId, entity, -scoreDecrement);
        logger.info(`[LB] Score decremented for user ${userId}`, { userId, scoreDecrement });
    }

    public async incrementProblemsSolved(
        userId: string
    ): Promise<void> {
        logger.debug(`[LB] Starting incrementProblemsSolved for user ${userId}`);
        try {
            await this.#_redis.hincrby(this.getProblemsSolvedHashKey(), userId, 1);
            logger.info(`[LB] Problems solved incremented for user ${userId}`, { userId });
        } catch (error) {
            logger.error(`Failed to increment problems solved count for user ${userId}`, { error});
        }
    }

    public async setUsername(
        userId: string, 
        username: string
    ): Promise<void> {
        logger.debug(`[LB] Starting setUsername for user ${userId}`, { userId, username });
        try {
            await this.#_redis.hset(this.getUsernameHashKey(), userId, username);
            logger.info(`[LB] Username set for user ${userId}`, { userId, username });
        } catch (error) {
            logger.error(`Failed to set username ${userId}`, { error });
        }
    }

    async removeUser(
        userId: string
    ): Promise<void> {
        logger.debug(`[LB] Starting removeUser for user ${userId}`);
        try {
            const entity = await this.getUserEntity(userId);
            const multi = this.#_redis.multi();
            multi.zrem(this.getGlobalKey(), userId);
            if(entity){
                multi.zrem(this.getEntityKey(entity), userId);
            }
            multi.hdel(this.getUsersHashKey(), userId);
            multi.hdel(this.getProblemsSolvedHashKey(), userId);
            multi.hdel(this.getUsernameHashKey(), userId);
            await multi.exec();
            logger.info(`[LB] Successfully removed user ${userId}`, { userId });
        } catch (error) {
            logger.error(`[LB] Failed to remove user ${userId}`, error);
            throw error;
        }
    }

    async updateEntityByUserId(
        userId: string, 
        newEntity: string
    ): Promise<void> {
        logger.debug(`[LB] Starting updateEntityByUserId for user ${userId} to ${newEntity}`);
        if (!newEntity) {
            logger.warn(`[LB] Attempted to update entity to empty value for user ${userId}`);
            throw new Error("New entity cannot be empty");
        }
        try {
            const [oldEntity, score, username, problemsSolved] = await Promise.all([
                this.getUserEntity(userId),
                this.getUserScore(userId),
                this.getUsername(userId),
                this.getProblemsSolved(userId)
            ]);
            if(oldEntity === newEntity) {
                logger.debug(`[LB] Entity is unchanged for user ${userId}. Skipping update.`, { userId, entity: newEntity });
                return;
            }
            const multi = this.#_redis.multi();
            if(oldEntity){
                logger.debug(`[LB] Removing user ${userId} from old entity leaderboard: ${oldEntity}`);
                multi.zrem(this.getEntityKey(oldEntity), userId);
            }
            multi.zadd(this.getEntityKey(newEntity), score, userId);
            multi.hset(this.getUsersHashKey(), userId, newEntity);
            if (username) {
                multi.hset(this.getUsernameHashKey(), userId, username);
            }
            if (problemsSolved !== null) {
                multi.hset(this.getProblemsSolvedHashKey(), userId, problemsSolved);
            }
            await multi.exec();
            logger.info(`[LB] Successfully updated entity and refreshed metadata for user ${userId}`, {
                userId,
                oldEntity,
                newEntity,
                username,
                problemsSolved,
            });
        } catch (error) {
            logger.error(`[LB] Failed to update entity for user ${userId}`, error);
            throw error;
        }
    }

    async getUserLeaderboardData(
        userId: string,
    ): Promise<LeaderboardData> {
        logger.debug(`[LB] Fetching full leaderboard data for user ${userId}`);
        const data = await Promise.all([
            this.getUserScore(userId),
            this.getUserEntity(userId),
            this.getRankGlobal(userId),
            this.getUsername(userId),
        ]);
        const [score, entity, globalRank, username] = data;
        let entityRank = -1;
        if (entity) {
            entityRank = await this.getRankEntity(userId);
        }
        logger.debug(`[LB] Completed fetching leaderboard data for user ${userId}`, { userId, globalRank, entityRank });
        return {
            userId,
            score,
            entity,
            globalRank,
            entityRank,
            username: username || '',
        };  
    }

    async forceClearLeaderboard(
        namespace : string = this.#_namespace
    ): Promise<void> {
        logger.warn(`[LB] Starting FORCE CLEAR operation for namespace: ${namespace}`);
        const scanKey = `${namespace}:*`;
        let cursor = '0';
        let keysDeleted = 0;
        do {
            logger.debug(`[LB] Scanning Redis for keys with cursor ${cursor}`);
            const [newCursor, keys] = await this.#_redis.scan(
                cursor, 
                'MATCH', 
                scanKey, 
                'COUNT', 
                100
            );
            if (keys.length > 0) {
                await this.#_redis.del(...keys);
                keysDeleted += keys.length;
                logger.debug(`[LB] Deleted ${keys.length} keys.`);
            }
            cursor = newCursor;
        } while (cursor !== '0');
        logger.info(`All keys with namespace '${namespace}' have been cleared. Total keys deleted: ${keysDeleted}`);
    }

    public async getUserEntity(userId: string): Promise<string> {
        logger.debug(`[LB] Getting entity for user ${userId}`);
        const entity = await this.#_redis.hget(this.getUsersHashKey(), userId);
        return entity || '';
    }

    public async getUserScore(userId: string): Promise<number> {
        logger.debug(`[LB] Getting score for user ${userId}`);
        const score = await this.#_redis.zscore(this.getGlobalKey(), userId);
        return score === null ? 0 : Number(score);
    }

    public async getRankGlobal(userId: string): Promise<number> {
        logger.debug(`[LB] Getting global rank for user ${userId}`);
        const rank = await this.#_redis.zrevrank(this.getGlobalKey(), userId);
        return rank === null ? -1 : rank;
    }

    public async getRankEntity(userId: string): Promise<number> {
        logger.debug(`[LB] Getting entity rank for user ${userId}`);
        const entity = await this.getUserEntity(userId);
        if (!entity) {
            logger.debug(`[LB] User ${userId} has no entity, returning rank -1.`);
            return -1;
        }
        const rank = await this.#_redis.zrevrank(this.getEntityKey(entity), userId);
        return rank === null ? -1 : rank;
    }

    public async getUsername(userId: string): Promise<string | null> {
        logger.debug(`[LB] Getting username for user ${userId}`);
        return this.#_redis.hget(this.getUsernameHashKey(), userId);
    }

    public async getProblemsSolved(userId : string) : Promise<number> {
        logger.debug(`[LB] Getting problems solved for user ${userId}`);
        const problemsSolved = await this.#_redis.hget(this.getProblemsSolvedHashKey(), userId);
        return problemsSolved ? parseInt(problemsSolved, 10) : 0;
    }

    public async getTopKGlobal(k : number = this.#_k): Promise<LeaderboardUser[]> {
        logger.debug(`[LB] Getting top ${k} global users.`);
        try {
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
            logger.debug(`[LB] Hydrating ${topK.length} global users.`);
            const hydrated = await this.hydrateUsers(topK);
            logger.debug(`[LB] Hydrated ${hydrated.length} global users.`);
            const ranked = this.assignRanks(hydrated);
            logger.info(`[LB] Successfully fetched top ${k} global users.`);
            return ranked;
        } catch (error) {
            logger.error(`[LB] Failed to fetch top ${k} global users.`, error);
            throw error;
        }
    }

    public async getTopKEntity(entity: string, k: number = this.#_k): Promise<LeaderboardUser[]> {
        logger.debug(`[LB] Getting top ${k} users for entity: ${entity}`);
        if (!entity) {
            logger.warn("[LB] Attempted to get top K for null/empty entity.");
            return [];
        }
        try {
            const topKWithScores = await this.#_redis.zrevrange(
                this.getEntityKey(entity), 0, k - 1, 'WITHSCORES'
            );
            if (topKWithScores.length === 0) {
                logger.info(`[LB] No users found for entity: ${entity}`);
                return [];
            }
            const userIds: string[] = [];
            const usersById: Map<string, LeaderboardUser> = new Map();
            for (let i = 0; i < topKWithScores.length; i += 2) {
                const id = topKWithScores[i];
                const score = Number(topKWithScores[i + 1]);
                userIds.push(id);
                usersById.set(id, {
                    id: id,
                    score: score,
                    entity: entity,
                    problemsSolved: 0,
                    username: ''
                });
            }
            logger.debug(`[LB] Starting hydration for ${userIds.length} users in entity ${entity}.`);
            // Fetch the problemsSolved counts
            const [problemsSolvedCounts, usernames] = await Promise.all([ 
                this.#_redis.hmget(this.getProblemsSolvedHashKey(), ...userIds),
                this.#_redis.hmget(this.getUsernameHashKey(), ...userIds)
            ]);
            // Merge the counts and usernames
            for (let i = 0; i < userIds.length; i++) {
                const id = userIds[i];
                const user = usersById.get(id);
                if (user) {
                    user.problemsSolved = parseInt(problemsSolvedCounts[i] || '0', 10);
                    user.username = usernames[i] || ''; 
                }
            }
            logger.info(`[LB] Successfully fetched and hydrated ${userIds.length} users for entity: ${entity}.`);
            const ranked = this.assignRanks(Array.from(usersById.values()));
            logger.info(`[LB] Successfully fetched top ${k} global users.`);
            return ranked;
        } catch (error) {
            logger.error(`[LB] Failed to fetch top ${k} users for entity: ${entity}`, error);
            throw error;
        }
    }

    private assignRanks(users: Omit<LeaderboardUser, 'rank'>[]) : LeaderboardUser[] {
        let lastScore: number | null = null;
        let currentRank = 0;
        let usersSeen = 0;

        return users.map((user) => {
            usersSeen++;

            if (user.score !== lastScore) {
            currentRank = usersSeen;
            lastScore = user.score;
            }

            return {
            ...user,
            rank: currentRank,
            };
        });
        
    }

    private async resyncFromDatabase(namespace : string = this.#_namespace) : Promise<void> {
        logger.info('Starting database aggregation for resync...');
        try {
            const [globalScores, userEntities, countryScores, problemsSolved, usernames] = await Promise.all([
                this.#_firstSubmissionRepo.getGlobalScores(),
                this.#_firstSubmissionRepo.getUserCountries(),
                this.#_firstSubmissionRepo.getCountryScores(),
                this.#_firstSubmissionRepo.getGlobalProblemsSolved(),
                this.#_firstSubmissionRepo.getUsernames() 
            ]);
            logger.debug(`Aggregated ${globalScores.length} global scores, ${countryScores.length} country scores. Starting Redis pipeline...`);
    
            const multi = this.#_redis.multi();
            
            // Clear all existing leaderboard keys to start fresh
            logger.debug(`Clearing existing keys for namespace: ${namespace}`);
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
                logger.debug(`Added ${globalScores.length} global scores to ZSET.`);
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
                    logger.debug(`Set ${Object.keys(userMap).length} user entities to HASH.`);
                }
            }
            
            // Repopulate all Country Leaderboards (ZSETs)
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
            logger.debug(`Added scores for ${scoresByCountry.size} entity leaderboards.`);
            
            if (problemsSolved.length > 0) {
                const problemsMap: { [key: string]: string } = {};
                for (const item of problemsSolved) {
                    problemsMap[item._id] = String(item.count);
                }
                multi.hset(this.getProblemsSolvedHashKey(), problemsMap);
                logger.debug(`Set ${problemsSolved.length} problems solved counts to HASH.`);
            }   
            
            if (usernames.length > 0) {
                const userMap: { [key: string]: string } = {};
                for (const item of usernames) {
                    if (item.username) { 
                        userMap[item._id] = item.username;
                    }
                }
                if (Object.keys(userMap).length > 0) {
                    multi.hset(this.getUsernameHashKey(), userMap);
                    logger.debug(`Set ${Object.keys(userMap).length} usernames to HASH.`);
                }
            }
            
            await multi.exec();
            logger.info('Leaderboard resync from database completed successfully.');
        } catch (error) {
            logger.error('Failed to complete database resync.', error);
            throw error;
        }
    }

    private async hydrateUsers(users: { value: string, score: number }[]): Promise<LeaderboardUser[]> {
        logger.debug(`[LB] Starting user hydration for ${users.length} users.`);
        if (users.length === 0) {
            return [];
        }
        const userIds = users.map(u => u.value);
        try {
            const [entities, problemsSolved, usernames] = await Promise.all([
                this.#_redis.hmget(this.getUsersHashKey(), ...userIds),
                this.#_redis.hmget(this.getProblemsSolvedHashKey(), ...userIds),
                this.#_redis.hmget(this.getUsernameHashKey(), ...userIds)
            ]);
            logger.debug("[LB] Finished fetching user metadata from Redis.");
            
            const hydrated = users.map((user, index) => ({
                id: user.value,
                score: user.score,
                entity: entities[index] || '',
                problemsSolved: parseInt(problemsSolved[index] || '0', 10),
                username: usernames[index] || ''
            }));
            logger.debug("[LB] User hydration completed.");
            return hydrated;
        } catch (error) {
            logger.error(`[LB] Failed to hydrate users: ${userIds.length} users affected.`, error);
            throw error;
        }
    }

}