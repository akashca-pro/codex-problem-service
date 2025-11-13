const TYPES = {

    // Providers
    ICacheProvider : Symbol.for("ICacheProvider"),
    ILeaderboard : Symbol.for("ILeaderboard"),

    // Repos

    IProblemRepository : Symbol.for("IProblemRepository"),
    ISubmissionRepository : Symbol.for("ISubmissionRepository"),
    IFirstSubmissionRepository : Symbol.for("IFirstSubmissionRepository"),


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

    // gRPC client 
    GrpcUserService : Symbol.for("GrpcUserService")

}

export default TYPES