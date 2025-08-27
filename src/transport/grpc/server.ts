import container from "@/config/inversify/container";
import TYPES from "@/config/inversify/types";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import { ProblemServiceService, SubmissionServiceService } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { config } from "@/config";
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';

import { GrpcCreateSubmissionhandler } from "./handlers/submission/CreateSubmissionHandler";
import { GrpcUpdateSubmissionHandler } from "./handlers/submission/UpdateSubmissionHandler";
import { GrpcGetSubmissionsHandler } from "./handlers/submission/GetSubmissionHandler";
import { ProblemHandler } from "./handlers/problem.handler";
import { wrapAll } from "@/utils/metricsMiddleware";

// Problem handlers
const problemHandlerInstance = container.get<ProblemHandler>(TYPES.ProblemHandler);

const problemHandlers = wrapAll(problemHandlerInstance.getServerHandlers());

// Submission
const createSubmission = container.get<GrpcCreateSubmissionhandler>(TYPES.GrpcCreateSubmissionhandler);
const updateSubmission = container.get<GrpcUpdateSubmissionHandler>(TYPES.GrpcUpdateSubmissionHandler);
const getSubmissions = container.get<GrpcGetSubmissionsHandler>(TYPES.GrpcGetSubmissionsHandler);

const submissionHandler = wrapAll({
    ...createSubmission.getServiceHandler(),
    ...updateSubmission.getServiceHandler(),
    ...getSubmissions.getServiceHandler()
})

export const startGrpcServer = () => {

    const server = new Server();

    server.addService(
        ProblemServiceService, problemHandlers
    )

    server.addService(
        SubmissionServiceService, submissionHandler
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