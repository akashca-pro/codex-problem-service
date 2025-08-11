const TYPES = {

    // Repos

    IProblemRepository : Symbol.for("IProblemRepository"),
    ISubmissionRepository : Symbol.for("ISubmissionRepository"),

    // Problem services

    ICreateProblemService : Symbol.for("ICreateProblemService"),
    IUpdateBasicProblemDetailsService : Symbol.for("IUpdateBasicProblemDetailsService"),
    IGetProblemService : Symbol.for("IGetProblemService"),
    IListProblemService : Symbol.for("IListProblemService"),
    IAddTestCaseService : Symbol.for("IAddTestCaseService"),
    IBulkUploadTestCaseService : Symbol.for("IBulkUploadTestCaseService"),
    IRemoveTestCaseService : Symbol.for("IRemoveTestCaseService"),
    IAddSolutionCodeService : Symbol.for("IAddSolutionCodeService"),
    IUpdateSolutionCodeService : Symbol.for("IUpdateSolutionCodeService"),
    IRemoveSolutionCodeService : Symbol.for("IRemoveSolutionCodeService"),

    // Submission Services

    ICreateSubmissionService : Symbol.for("ICreateSubmissionService"),
    IUpdateSubmissionService : Symbol.for("IUpdateSubmissionService"),
    IGetSubmissionsService : Symbol.for("IGetSubmissionsService"),
    
    // Grpc Handlers

    GrpcCreateProblemHandler : Symbol.for("GrpcCreateProblemHandler"),
    GrpcGetProblemHandler : Symbol.for("GrpcGetProblemHandler"),
    GrpcListProblemHandler : Symbol.for("GrpcListProblemHandler"),
    GrpcUpdateBasicProblemDetailsHandler : Symbol.for("GrpcUpdateBasicProblemDetailsHandler"),
    GrpcAddTestCaseHandler : Symbol.for("GrpcAddTestCaseHandler"),
    GrpcBulkUploadTestCaseHandler : Symbol.for("GrpcBulkUploadTestCaseHandler"),
    GrpcRemoveTestCaseHandler : Symbol.for("GrpcRemoveTestCaseHandler"),
    GrpcAddSolutionCodeHandler : Symbol.for("GrpcAddSolutionCodeHandler"),
    GrpcUpdateSolutionCodeHandler : Symbol.for("GrpcUpdateSolutionCodeHandler"),
    GrpcRemoveSolutionCodeHandler : Symbol.for("GrpcRemoveSolutionCodeHandler"),


}

export default TYPES