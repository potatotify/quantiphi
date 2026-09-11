import type { ApiErrorResponse, CurrencyCode, TrendResponse } from "@/lib/types/currency";

export async function requestTrend(from: CurrencyCode, to: CurrencyCode): Promise<TrendResponse> {
  const params = new URLSearchParams({ from, to });
  const response = await fetch(`/api/trends?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  let data: TrendResponse | ApiErrorResponse;

  try {
    data = (await response.json()) as TrendResponse | ApiErrorResponse;
  } catch {
    throw new Error("The trend chart could not read the server response.");
  }

  if (!response.ok || "error" in data) {
    throw new Error("error" in data ? data.error : "Unable to load exchange-rate trends.");
  }

  return data;
}
