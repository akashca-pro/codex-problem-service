
/**
 * Enum representing the error types related to problem services.
 * 
 * @enum
 */
export enum ProblemErrorType {

    ProblemNotFound = 'Problem not found',

    ProblemAlreadyExists = 'Problem already exists',

    ProblemFieldAlreadyExist = 'already exist',

    TestCaseNotFound = 'Problem or testcase not found.',

    TemplateCodeNotFound = 'Problem or template code not found',

    SolutionCodeNotFound = 'Solution code not found',

    QuestionIdAlreadyExist = 'QuestionId already exist',

    TitleAlreadyExist = 'Title already exist',
}