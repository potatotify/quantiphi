import "server-only";

import { getThirtyDayRates } from "@/lib/exchange-rate";
import type { TrendResponse } from "@/lib/types/currency";
import { parseCurrencyPair } from "@/lib/validation/currency";

export function parseTrendQuery(searchParams: URLSearchParams) {
  return parseCurrencyPair(searchParams.get("from"), searchParams.get("to"));
}

export async function getCurrencyTrend(from: string, to: string): Promise<TrendResponse> {
  const points = await getThirtyDayRates(from, to);

  return {
    from,
    to,
    points,
  };
}
