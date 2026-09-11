import type { ApiErrorResponse, ConvertRequest, ConvertResponse } from "@/lib/types/currency";

export async function requestConversion(payload: ConvertRequest): Promise<ConvertResponse> {
  const response = await fetch("/api/convert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data: ConvertResponse | ApiErrorResponse;

  try {
    data = (await response.json()) as ConvertResponse | ApiErrorResponse;
  } catch {
    throw new Error("The converter could not read the server response.");
  }

  if (!response.ok || "error" in data) {
    throw new Error("error" in data ? data.error : "Unable to complete the conversion.");
  }

  return data;
}
