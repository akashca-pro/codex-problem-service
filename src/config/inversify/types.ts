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
    
    // Grpc Handlers

    GrpcCreateProblemHandler : Symbol.for("GrpcCreateProblemHandler"),
    

}

export default TYPES