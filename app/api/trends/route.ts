import { NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/http/errors";
import { getCurrencyTrend, parseTrendQuery } from "@/lib/services/trends";
import type { TrendResponse } from "@/lib/types/currency";

export async function GET(request: Request) {
  try {
    const pair = parseTrendQuery(new URL(request.url).searchParams);
    const trend = await getCurrencyTrend(pair.from, pair.to);
    return NextResponse.json<TrendResponse>(trend, { status: 200 });
  } catch (error) {
    return toErrorResponse(error, "Unable to load exchange-rate trends.");
  }
}
