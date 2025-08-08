const TYPES = {

    // Repos

    IProblemRepository : Symbol.for("IProblemRepository"),
    ISubmissionRepository : Symbol.for("ISubmissionRepository"),

    // Problem services

    ICreateProblemService : Symbol.for("ICreateProblemService"),
    IUpdateProblemService : Symbol.for("IUpdateProblemService"),
    IGetProblemService : Symbol.for("IGetProblemService"),

}

export default TYPES