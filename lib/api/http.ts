import type { ApiErrorResponse } from "@/lib/types/currency";

export async function readApiJson<T>(response: Response, fallback: string): Promise<T> {
  let data: T | ApiErrorResponse;

  try {
    data = (await response.json()) as T | ApiErrorResponse;
  } catch {
    throw new Error("The server returned an unreadable response.");
  }

  if (!response.ok || isErrorResponse(data)) {
    throw new Error(isErrorResponse(data) ? data.error : fallback);
  }

  return data;
}

function isErrorResponse(data: unknown): data is ApiErrorResponse {
  return typeof data === "object" && data !== null && "error" in data && typeof data.error === "string";
}
