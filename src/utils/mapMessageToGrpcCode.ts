import { status } from "@grpc/grpc-js";

/**
 * Maps a known domain message to a gRPC status code.
 * 
 * @param {string} message - The domain message from enum.
 * @returns {status} gRPC status code
 */
export const mapMessageToGrpcStatus = (message : string) : status => {
    switch(message){

        case ProblemErrorType.ProblemNotFound:
        case SubmissionErrorType.SubmissionNotFound:
            return status.INVALID_ARGUMENT;
        
        case ProblemErrorType.ProblemAlreadyExists:
        case SubmissionErrorType.SubmissionAlreadyExist:
            return status.ALREADY_EXISTS

        default:
            return status.UNKNOWN
    }
}