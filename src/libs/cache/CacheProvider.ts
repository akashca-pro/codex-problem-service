import redis from "@/config/redis";

/**
 * Redis Cache Provider.
 * 
 * @class
 */
export class RedisCacheProvider {

    readonly #_redis = redis

    async get<T>(key: string): Promise<T | null> {
        const data = await this.#_redis.get(key);
        return data ? JSON.parse(data) as T : null;
    }

    async set<T>(key: string, value: T, ttl: number): Promise<void> {
        const randomTtl = Math.floor(ttl + (Math.random() * 60));
        await this.#_redis.set(key,JSON.stringify(value),"EX",randomTtl);
    }

    async del(key: string): Promise<void> {
        await this.#_redis.del(key);
    }

    async invalidateByPattern(pattern: string): Promise<void> {
        const stream = this.#_redis.scanStream({
            match: pattern,
            count: 100 // batch size
        });

        const keysToDelete: string[] = [];

        return new Promise((resolve, reject) => {
            stream.on("data", (keys: string[]) => {
                if (keys.length) keysToDelete.push(...keys);
            });

            stream.on("end", async () => {
                if (!keysToDelete.length) return resolve();

                const pipeline = this.#_redis.pipeline();
                keysToDelete.forEach(key => pipeline.del(key));

                await pipeline.exec();
                resolve();
            });

            stream.on("error", reject);
        });
    }


}