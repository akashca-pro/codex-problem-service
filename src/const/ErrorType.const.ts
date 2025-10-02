export const PROBLEM_ERROR_MESSAGES = {
  PROBLEM_NOT_FOUND: "Problem not found",
  PROBLEM_ALREADY_EXISTS: "Problem already exists",
  PROBLEM_FIELD_ALREADY_EXIST: "already exist",
  TEST_CASE_NOT_FOUND: "Problem or testcase not found.",
  TEMPLATE_CODE_NOT_FOUND: "Problem or template code not found",
  SOLUTION_CODE_NOT_FOUND: "Solution code not found",
  QUESTION_ID_ALREADY_EXIST: "QuestionId already exist",
  TITLE_ALREADY_EXIST: "Title already exist",
} as const;

export const SUBMISSION_ERROR_MESSAGES = {
  SUBMISSION_NOT_FOUND: "Submission not found",
  SUBMISSION_ALREADY_EXIST: "Submission already exists",
  INVALID_COUNTRY_CODE: "Invalid country code",
} as const;

export const SYSTEM_ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal Server Error",
} as const;
