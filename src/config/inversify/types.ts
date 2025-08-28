const TYPES = {

    // Providers
    ICacheProvider : Symbol.for("ICacheProvider"),

    // Repos

    IProblemRepository : Symbol.for("IProblemRepository"),
    ISubmissionRepository : Symbol.for("ISubmissionRepository"),

    // services
    IProblemService : Symbol.for("IProblemService"),
    ISubmissionService : Symbol.for("ISubmissionService"),

    // Submission Services

    ICreateSubmissionService : Symbol.for("ICreateSubmissionService"),
    IUpdateSubmissionService : Symbol.for("IUpdateSubmissionService"),
    IGetSubmissionsService : Symbol.for("IGetSubmissionsService"),
    
    // Grpc Handlers
    ProblemHandler : Symbol.for("ProblemHandler"),
    SubmissionHandler : Symbol.for("SubmissionHandler"),

    // Grpc Handlers for submissions

    GrpcCreateSubmissionhandler : Symbol.for("GrpcCreateSubmissionhandler"),
    GrpcUpdateSubmissionHandler : Symbol.for("GrpcUpdateSubmissionHandler"),
    GrpcGetSubmissionsHandler : Symbol.for("GrpcGetSubmissionsHandler"),

}

export default TYPES