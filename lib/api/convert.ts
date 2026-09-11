import { readApiJson } from "@/lib/api/http";
import type { ConvertRequest, ConvertResponse } from "@/lib/types/currency";

export async function requestConversion(payload: ConvertRequest): Promise<ConvertResponse> {
  const response = await fetch("/api/convert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return readApiJson<ConvertResponse>(response, "Unable to complete the conversion.");
}
