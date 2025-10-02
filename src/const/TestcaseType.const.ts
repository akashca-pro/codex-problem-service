export const TESTCASE_TYPE = {
    RUN : "run",
    SUBMIT : "submit"
} as const

export type TestcaseType = typeof TESTCASE_TYPE[keyof typeof TESTCASE_TYPE];