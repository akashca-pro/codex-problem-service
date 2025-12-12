import Redis from 'ioredis';
import { config } from '@/config';
import logger from '@/utils/pinoLogger';
import { REDIS_EVENT_TYPES } from '@/const/RedisStatus.const';

class RedisClient {
    private static _instance : Redis
    private static _isConnected = false;

    private constructor() {}

    public static getInstance() : Redis {
        if(!RedisClient._instance){
            RedisClient._instance = new Redis(config.REDIS_URL, {
                retryStrategy : (times : number) => {
                    const delay = Math.min(times * 50,2000);
                    return delay
                },
                maxRetriesPerRequest : 3,
            });
            RedisClient.setupEventListeners();
        }
        return RedisClient._instance
    }

    public static setupEventListeners() : void {
        RedisClient._instance.on(REDIS_EVENT_TYPES.READY,()=>{
            RedisClient._isConnected = true;
            logger.info('Redis is ready');
        })

    RedisClient._instance.on(REDIS_EVENT_TYPES.ERROR, (error) => {
      RedisClient._isConnected = false;
      logger.error('Redis connection error:', error);
    });

    RedisClient._instance.on(REDIS_EVENT_TYPES.CLOSE, () => {
      RedisClient._isConnected = false;
      logger.warn('Redis connection closed');
    });

    RedisClient._instance.on(REDIS_EVENT_TYPES.RECONNECTING, () => {
      logger.info('Reconnecting to Redis...');
    });
    }

    public static isReady() : boolean {
        return RedisClient._isConnected
    }
}

export default RedisClient.getInstance();