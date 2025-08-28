import { MongoServerError } from "mongodb";

export function isDupKeyError(err: unknown): err is MongoServerError {
  return !!(err && typeof err === "object" && (err as any).code === 11000);
}

export function extractDup(err: MongoServerError): { field: string; value?: unknown } {
  const keyValue = (err as any).keyValue ?? {};
  const keyPattern = (err as any).keyPattern ?? {};
  const field = Object.keys(keyValue)[0] ?? Object.keys(keyPattern)[0] ?? "unique";
  return { field, value: keyValue[field] };
}