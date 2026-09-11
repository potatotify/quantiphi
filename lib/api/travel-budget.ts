import { readApiJson } from "@/lib/api/http";
import type { TravelBudgetRequest, TravelBudgetResponse } from "@/lib/types/currency";

export async function requestTravelBudget(payload: TravelBudgetRequest): Promise<TravelBudgetResponse> {
  const response = await fetch("/api/travel-budget", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return readApiJson<TravelBudgetResponse>(response, "Unable to calculate the travel budget.");
}
