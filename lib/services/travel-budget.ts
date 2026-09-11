import { getCurrencyOption } from "@/lib/format/currency";
import { TRAVEL_BUDGET_CURRENCIES } from "@/lib/constants/currencies";
import { ExchangeRateError, getLatestRates } from "@/lib/exchange-rate";
import type { TravelBudgetRequest, TravelBudgetResponse } from "@/lib/types/currency";
import { parsePositiveAmount, parseSupportedCurrency, ValidationError } from "@/lib/validation/currency";

export function parseTravelBudgetRequest(body: unknown): TravelBudgetRequest {
  if (!isRecord(body)) {
    throw new ValidationError("Request body must be a JSON object.");
  }

  return {
    baseCurrency: parseSupportedCurrency(body.baseCurrency, "baseCurrency"),
    amount: parsePositiveAmount(body.amount),
  };
}

export async function calculateTravelBudget(
  request: TravelBudgetRequest,
): Promise<TravelBudgetResponse> {
  const latestRates = await getLatestRates(request.baseCurrency);

  const comparisons = TRAVEL_BUDGET_CURRENCIES.map((currency) => {
    const rate = currency === latestRates.baseCurrency ? 1 : latestRates.rates[currency];

    if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
      throw new ExchangeRateError(
        `No valid travel-budget rate found for ${currency}.`,
        "UNSUPPORTED_CURRENCY",
      );
    }

    const option = getCurrencyOption(currency);

    return {
      currency,
      label: option?.label ?? currency,
      rate,
      convertedAmount: request.amount * rate,
    };
  });

  return {
    baseCurrency: request.baseCurrency,
    amount: request.amount,
    comparisons,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
