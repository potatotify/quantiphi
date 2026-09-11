import { prisma } from "@/lib/db/prisma";
import { getLatestRate } from "@/lib/exchange-rate";
import { recordFavoriteUsage } from "@/lib/services/favorites";
import type { ConvertRequest, ConvertResponse } from "@/lib/types/currency";
import { parseCurrencyPair, ValidationError } from "@/lib/validation/currency";

export { ValidationError };

export function parseConvertRequest(body: unknown): ConvertRequest {
  if (!isRecord(body)) {
    throw new ValidationError("Request body must be a JSON object.");
  }

  const pair = parseCurrencyPair(body.from, body.to);

  if (typeof body.amount !== "number" || !Number.isFinite(body.amount) || body.amount <= 0) {
    throw new ValidationError("Amount must be a positive finite number.");
  }

  return {
    from: pair.from,
    to: pair.to,
    amount: body.amount,
  };
}

export async function convertCurrency(request: ConvertRequest): Promise<ConvertResponse> {
  const rate = await getLatestRate(request.from, request.to);
  const convertedAmount = request.amount * rate;

  const record = await prisma.conversionHistory.create({
    data: {
      baseCurrency: request.from,
      targetCurrency: request.to,
      amount: request.amount,
      convertedAmount,
      rate,
      source: "live",
    },
  });

  await recordFavoriteUsage(request.from, request.to);

  return {
    id: record.id,
    from: record.baseCurrency,
    to: record.targetCurrency,
    amount: record.amount,
    rate: record.rate,
    convertedAmount: record.convertedAmount,
    createdAt: record.createdAt.toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
