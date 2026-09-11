import "server-only";

import { getCurrencyOption } from "@/lib/format/currency";
import { TRAVEL_BUDGET_CURRENCIES } from "@/lib/constants/currencies";
import { ExchangeRateError, getLatestRates } from "@/lib/exchange-rate";
import type { TravelBudgetRequest, TravelBudgetResponse } from "@/lib/types/currency";
import { parseJsonObject, parsePositiveAmount, parseSupportedCurrency } from "@/lib/validation/currency";

export function parseTravelBudgetRequest(body: unknown): TravelBudgetRequest {
  const payload = parseJsonObject(body);

  return {
    baseCurrency: parseSupportedCurrency(payload.baseCurrency, "baseCurrency"),
    amount: parsePositiveAmount(payload.amount),
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

