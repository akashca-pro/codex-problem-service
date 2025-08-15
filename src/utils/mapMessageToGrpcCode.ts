import { ProblemErrorType } from "@/enums/ErrorTypes/problemErrorType.enum";
import { SubmissionErrorType } from "@/enums/ErrorTypes/submissionErrorType.enum";
import { status } from "@grpc/grpc-js";

/**
 * Maps a known domain message to a gRPC status code.
 * 
 * @param {string} message - The domain message from enum.
 * @returns {status} gRPC status code
 */
export const mapMessageToGrpcStatus = (message : string) : status => {
    switch(true){

        case message === ProblemErrorType.ProblemNotFound:
        case message === SubmissionErrorType.SubmissionNotFound:
        case message === ProblemErrorType.TestCaseNotFound:
            return status.NOT_FOUND

        case message === SubmissionErrorType.InvalidCountryCode:
            return status.INVALID_ARGUMENT;
        
        case message === ProblemErrorType.ProblemAlreadyExists:
        case message.endsWith(ProblemErrorType.ProblemFieldAlreadyExist):
        case message === SubmissionErrorType.SubmissionAlreadyExist:
            return status.ALREADY_EXISTS

        default:
            return status.UNKNOWN
    }
}