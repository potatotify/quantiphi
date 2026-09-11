import type { ApiErrorResponse, TravelBudgetRequest, TravelBudgetResponse } from "@/lib/types/currency";

export async function requestTravelBudget(payload: TravelBudgetRequest): Promise<TravelBudgetResponse> {
  const response = await fetch("/api/travel-budget", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data: TravelBudgetResponse | ApiErrorResponse;

  try {
    data = (await response.json()) as TravelBudgetResponse | ApiErrorResponse;
  } catch {
    throw new Error("The travel budget could not read the server response.");
  }

  if (!response.ok || "error" in data) {
    throw new Error("error" in data ? data.error : "Unable to calculate the travel budget.");
  }

  return data;
}
