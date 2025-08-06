import dotenv from 'dotenv';
dotenv.config();

interface Config {
    DATABASE_URL : string
    REDIS_URL : string;
    SERVICE_NAME : string;
    GRPC_SERVER_URL : string;
    METRICS_PORT : number;
}

export const config : Config = {
    DATABASE_URL : process.env.DATABASE_URL || '',
    REDIS_URL : process.env.REDIS_URL || '',
    GRPC_SERVER_URL : process.env.GRPC_SERVER_URL || '',
    METRICS_PORT : Number(process.env.METRICS_PORT) || 9102,
    SERVICE_NAME : process.env.SERVICE_NAME || 'PB_SB_LD_SERVICE'
}