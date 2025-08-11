import container from "@/config/inversify/container";
import { GrpcCreateProblemHandler } from "./handlers/problem/CreateProblemHandler";
import TYPES from "@/config/inversify/types";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import { ProblemServiceService } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { config } from "@/config";
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';
import { GrpcGetProblemHandler } from "./handlers/problem/GetProblemHandler";
import { GrpcListProblemHandler } from "./handlers/problem/ListProblemHandler";

// problem 
const createProblem = container.get<GrpcCreateProblemHandler>(TYPES.GrpcCreateProblemHandler);
const getProblem = container.get<GrpcGetProblemHandler>(TYPES.GrpcGetProblemHandler);
const listProblem = container.get<GrpcListProblemHandler>(TYPES.GrpcListProblemHandler);

const problemHandler = {
    ...createProblem.getServiceHandler(),
    ...getProblem.getServiceHandler(),
    ...listProblem.getServiceHandler(),
}

export const startGrpcServer = () => {

    const server = new Server();

    server.addService(
        ProblemServiceService,problemHandler
    )

    server.bindAsync(
        config.GRPC_SERVER_URL,
        ServerCredentials.createInsecure(),
        (err,port) => {
            if(err){
                logger.error('gRPC Server failed to start : ', err);
            }
            logger.info(`gRPC Server running on port ${port}`);
        }
    )
}