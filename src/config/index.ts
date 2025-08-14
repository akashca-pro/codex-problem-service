import dotenv from 'dotenv';
dotenv.config();

interface Config {
    DATABASE_URL : string
    REDIS_URL : string;
    SERVICE_NAME : string;
    GRPC_SERVER_URL : string;
    METRICS_PORT : number;
    PROBLEM_DETAILS_CACHE_EXPIRY : number;
}

export const config : Config = {
    DATABASE_URL : process.env.DATABASE_URL || '',
    REDIS_URL : process.env.REDIS_URL || '',
    GRPC_SERVER_URL : process.env.GRPC_SERVER_URL || '',
    METRICS_PORT : Number(process.env.METRICS_PORT) || 9102,
    SERVICE_NAME : process.env.SERVICE_NAME || 'PROBLEM_SERVICE',
    PROBLEM_DETAILS_CACHE_EXPIRY : Number(process.env.PROBLEM_DETAILS_CACHE_EXPIRY) || 86400
}