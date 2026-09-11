import { NextResponse } from "next/server";

import { ExchangeRateError } from "@/lib/exchange-rate";
import { getCurrencyTrend, parseTrendQuery } from "@/lib/services/trends";
import type { ApiErrorResponse, TrendResponse } from "@/lib/types/currency";
import { ValidationError } from "@/lib/validation/currency";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const pair = parseTrendQuery(searchParams);
    const trend = await getCurrencyTrend(pair.from, pair.to);
    return NextResponse.json<TrendResponse>(trend, { status: 200 });
  } catch (error) {
    return handleTrendError(error);
  }
}

function handleTrendError(error: unknown) {
  if (error instanceof ValidationError) {
    return errorResponse(error.message, 400);
  }

  if (error instanceof ExchangeRateError) {
    if (error.code === "UNSUPPORTED_CURRENCY") {
      return errorResponse(error.message, 400);
    }

    return errorResponse(error.message, 502);
  }

  return errorResponse("Unable to load exchange-rate trends.", 500);
}

function errorResponse(error: string, status: number) {
  return NextResponse.json<ApiErrorResponse>({ error }, { status });
}
