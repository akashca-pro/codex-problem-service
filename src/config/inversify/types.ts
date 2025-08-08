const TYPES = {

    // Repos

    IProblemRepository : Symbol.for("IProblemRepository"),
    ISubmissionRepository : Symbol.for("ISubmissionRepository"),

    // Problem services

    ICreateProblemService : Symbol.for("ICreateProblemService"),
    IUpdateBasicProblemDetailsService : Symbol.for("IUpdateBasicProblemDetailsService"),
    IGetProblemService : Symbol.for("IGetProblemService"),
    IListProblemService : Symbol.for("IListProblemService"),


}

export default TYPES