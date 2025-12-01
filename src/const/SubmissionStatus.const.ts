export const SUBMISSION_STATUS_TYPES = {
  ACCEPTED: "accepted",
  FAILED: "failed",
  PENDING: "pending",
} as const;

export type SubmissionStatus = typeof SUBMISSION_STATUS_TYPES[keyof typeof SUBMISSION_STATUS_TYPES];