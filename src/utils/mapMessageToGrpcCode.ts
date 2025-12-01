import { PROBLEM_ERROR_MESSAGES, SUBMISSION_ERROR_MESSAGES } from "@/const/ErrorType.const"
import { status } from "@grpc/grpc-js";

/**
 * Maps a known domain message to a gRPC status code.
 * 
 * @param {string} message - The domain message from enum.
 * @returns {status} gRPC status code
 */
export const mapMessageToGrpcStatus = (message : string) : status => {
    switch(true){

        case message === PROBLEM_ERROR_MESSAGES.PROBLEM_NOT_FOUND:
        case message === SUBMISSION_ERROR_MESSAGES.SUBMISSION_NOT_FOUND:
        case message === PROBLEM_ERROR_MESSAGES.TEST_CASE_NOT_FOUND:
        case message === PROBLEM_ERROR_MESSAGES.TEMPLATE_CODE_NOT_FOUND:
            return status.NOT_FOUND

        case message === SUBMISSION_ERROR_MESSAGES.INVALID_COUNTRY_CODE:
            return status.INVALID_ARGUMENT;
        
        case message === PROBLEM_ERROR_MESSAGES.PROBLEM_ALREADY_EXISTS:
        case message.endsWith(PROBLEM_ERROR_MESSAGES.PROBLEM_FIELD_ALREADY_EXIST):
        case message === SUBMISSION_ERROR_MESSAGES.SUBMISSION_ALREADY_EXIST:
            return status.ALREADY_EXISTS

        default:
            return status.UNKNOWN
    }
}