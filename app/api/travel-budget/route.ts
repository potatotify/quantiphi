import { NextResponse } from "next/server";

import { readJsonBody, toErrorResponse } from "@/lib/http/errors";
import { calculateTravelBudget, parseTravelBudgetRequest } from "@/lib/services/travel-budget";
import type { TravelBudgetResponse } from "@/lib/types/currency";

export async function POST(request: Request) {
  try {
    const payload = parseTravelBudgetRequest(await readJsonBody(request));
    const budget = await calculateTravelBudget(payload);
    return NextResponse.json<TravelBudgetResponse>(budget, { status: 200 });
  } catch (error) {
    return toErrorResponse(error, "Unable to calculate the travel budget.");
  }
}
