import container from "@/config/inversify/container";
import { GrpcCreateProblemHandler } from "./handlers/problem/CreateProblemHandler";
import TYPES from "@/config/inversify/types";
import { Server, ServerCredentials } from "@grpc/grpc-js";
import { ProblemServiceService, SubmissionServiceService } from "@akashcapro/codex-shared-utils/dist/proto/compiled/gateway/problem";
import { config } from "@/config";
import logger from '@akashcapro/codex-shared-utils/dist/utils/logger';

import { GrpcGetProblemHandler } from "./handlers/problem/GetProblemHandler";
import { GrpcListProblemHandler } from "./handlers/problem/ListProblemHandler";
import { GrpcUpdateBasicProblemDetailsHandler } from "./handlers/problem/UpdateProblemBasicDetailsHandler";
import { GrpcAddTestCaseHandler } from "./handlers/problem/AddTestCaseHandler";
import { GrpcBulkUploadTestCaseHandler } from "./handlers/problem/bulkUploadTestCaseHandler";
import { GrpcRemoveTestCaseHandler } from "./handlers/problem/RemoveTestCaseHandler";
import { GrpcAddSolutionCodeHandler } from "./handlers/problem/AddSolutionCodeHandler";
import { GrpcUpdateSolutionCodeHandler } from "./handlers/problem/UpdateSolutionCodeHandler";
import { GrpcRemoveSolutionCodeHandler } from "./handlers/problem/RemoveSolutionCodeHandler";
import { GrpcCreateSubmissionhandler } from "./handlers/submission/CreateSubmissionHandler";
import { GrpcUpdateSubmissionHandler } from "./handlers/submission/UpdateSubmissionHandler";
import { GrpcGetSubmissionsHandler } from "./handlers/submission/GetSubmissionHandler";
import { GrpcGetProblemPublicHandler } from "./handlers/problem/GetProblemPublicHandler";

// problem 
const createProblem = container.get<GrpcCreateProblemHandler>(TYPES.GrpcCreateProblemHandler);
const getProblem = container.get<GrpcGetProblemHandler>(TYPES.GrpcGetProblemHandler);
const getProblemPublic = container.get<GrpcGetProblemPublicHandler>(TYPES.GrpcGetProblemPublicHandler);
const listProblem = container.get<GrpcListProblemHandler>(TYPES.GrpcListProblemHandler);
const updateBasicProblemDetails = container.get<GrpcUpdateBasicProblemDetailsHandler>(TYPES.GrpcUpdateBasicProblemDetailsHandler);
const addTestCase = container.get<GrpcAddTestCaseHandler>(TYPES.GrpcAddTestCaseHandler);
const bulkUploadTestCase = container.get<GrpcBulkUploadTestCaseHandler>(TYPES.GrpcBulkUploadTestCaseHandler);
const removeTestCase = container.get<GrpcRemoveTestCaseHandler>(TYPES.GrpcRemoveTestCaseHandler);
const addSolutionCode = container.get<GrpcAddSolutionCodeHandler>(TYPES.GrpcAddSolutionCodeHandler);
const updateSolutionCode = container.get<GrpcUpdateSolutionCodeHandler>(TYPES.GrpcUpdateSolutionCodeHandler);
const removeSolutionCode = container.get<GrpcRemoveSolutionCodeHandler>(TYPES.GrpcRemoveSolutionCodeHandler);

const problemHandler = {
    ...createProblem.getServiceHandler(),
    ...getProblem.getServiceHandler(),
    ...listProblem.getServiceHandler(),
    ...updateBasicProblemDetails.getServiceHandler(),
    ...addTestCase.getServiceHandler(),
    ...bulkUploadTestCase.getServiceHandler(),
    ...removeTestCase.getServiceHandler(),
    ...addSolutionCode.getServiceHandler(),
    ...updateSolutionCode.getServiceHandler(),
    ...removeSolutionCode.getServiceHandler(),
    ...getProblemPublic.getServiceHandler(),

}

// Submission
const createSubmission = container.get<GrpcCreateSubmissionhandler>(TYPES.GrpcCreateSubmissionhandler);
const updateSubmission = container.get<GrpcUpdateSubmissionHandler>(TYPES.GrpcUpdateSubmissionHandler);
const getSubmissions = container.get<GrpcGetSubmissionsHandler>(TYPES.GrpcGetSubmissionsHandler);

const submissionHandler = {
    ...createSubmission.getServiceHandler(),
    ...updateSubmission.getServiceHandler(),
    ...getSubmissions.getServiceHandler()
}

export const startGrpcServer = () => {

    const server = new Server();

    server.addService(
        ProblemServiceService, problemHandler
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