import "server-only";

import { prisma } from "@/lib/db/prisma";
import { getLatestRate } from "@/lib/exchange-rate";
import { recordFavoriteUsage } from "@/lib/services/favorites";
import type { ConvertRequest, ConvertResponse } from "@/lib/types/currency";
import { parseCurrencyPair, parseJsonObject, parsePositiveAmount } from "@/lib/validation/currency";

export function parseConvertRequest(body: unknown): ConvertRequest {
  const payload = parseJsonObject(body);
  const pair = parseCurrencyPair(payload.from, payload.to);

  return {
    from: pair.from,
    to: pair.to,
    amount: parsePositiveAmount(payload.amount),
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
