import container from "@/config/inversify/container";
import TYPES from "@/config/inversify/types";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import { ProblemServiceService, SubmissionServiceService } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { config } from "@/config";
import logger from '@/utils/pinoLogger';
import fs from "fs";
import { ProblemHandler } from "./problem.handler";
import { SubmissionHandler } from "./submission.handler";

// const caCert = fs.readFileSync("/secrets/ca/ca.pem");
// const serverCert = fs.readFileSync("/secrets/cert/problem.pem");
// const serverKey = fs.readFileSync("/secrets/key/problem.key");

// const creds = ServerCredentials.createSsl(
//   caCert,
//   [{
//     cert_chain: serverCert,
//     private_key: serverKey,
//   }],
//   true   
// );

// Grpc handlers
const problemHandlerInstance = container.get<ProblemHandler>(TYPES.ProblemHandler);
const submissionHandlerInstance = container.get<SubmissionHandler>(TYPES.SubmissionHandler);

// Wrap all handlers with metrics middleware
const problemHandlers = problemHandlerInstance.getServerHandlers();
const submissionHandlers = submissionHandlerInstance.getServiceHandler();

export const startGrpcServer = () => {

    const server = new Server();

    server.addService(
        ProblemServiceService, problemHandlers
    )

    server.addService(
        SubmissionServiceService, submissionHandlers
    )

    server.bindAsync(
        config.GRPC_PROBLEM_SERVICE_SERVER_URL,
        ServerCredentials.createInsecure(),
        (err,port) => {
            if(err){
                logger.error('gRPC Server failed to start : ', err);
            }
            logger.info(`gRPC Server running on port ${port}`);
        }
    )
}