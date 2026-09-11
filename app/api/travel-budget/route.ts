import { NextResponse } from "next/server";

import { ExchangeRateError } from "@/lib/exchange-rate";
import { calculateTravelBudget, parseTravelBudgetRequest } from "@/lib/services/travel-budget";
import type { ApiErrorResponse, TravelBudgetResponse } from "@/lib/types/currency";
import { ValidationError } from "@/lib/validation/currency";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  try {
    const payload = parseTravelBudgetRequest(body);
    const budget = await calculateTravelBudget(payload);
    return NextResponse.json<TravelBudgetResponse>(budget, { status: 200 });
  } catch (error) {
    return handleTravelBudgetError(error);
  }
}

function handleTravelBudgetError(error: unknown) {
  if (error instanceof ValidationError) {
    return errorResponse(error.message, 400);
  }

  if (error instanceof ExchangeRateError) {
    if (error.code === "UNSUPPORTED_CURRENCY") {
      return errorResponse(error.message, 400);
    }

    return errorResponse(error.message, 502);
  }

  return errorResponse("Unable to calculate the travel budget.", 500);
}

function errorResponse(error: string, status: number) {
  return NextResponse.json<ApiErrorResponse>({ error }, { status });
}
