import { readApiJson } from "@/lib/api/http";
import type { CurrencyCode, TrendResponse } from "@/lib/types/currency";

export async function requestTrend(from: CurrencyCode, to: CurrencyCode): Promise<TrendResponse> {
  const params = new URLSearchParams({ from, to });
  const response = await fetch(`/api/trends?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return readApiJson<TrendResponse>(response, "Unable to load exchange-rate trends.");
}
