import { isSupportedCurrency } from "@/lib/constants/currencies";
import { prisma } from "@/lib/db/prisma";
import { ExchangeRateError, getLatestRate, normalizeCurrencyCode } from "@/lib/exchange-rate";
import type { ConvertRequest, ConvertResponse } from "@/lib/types/currency";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function parseConvertRequest(body: unknown): ConvertRequest {
  if (!isRecord(body)) {
    throw new ValidationError("Request body must be a JSON object.");
  }

  if (typeof body.from !== "string" || body.from.trim() === "") {
    throw new ValidationError("Field \"from\" must be a currency code.");
  }

  if (typeof body.to !== "string" || body.to.trim() === "") {
    throw new ValidationError("Field \"to\" must be a currency code.");
  }

  if (typeof body.amount !== "number" || !Number.isFinite(body.amount) || body.amount <= 0) {
    throw new ValidationError("Amount must be a positive finite number.");
  }

  let from: string;
  let to: string;

  try {
    from = normalizeCurrencyCode(body.from);
    to = normalizeCurrencyCode(body.to);
  } catch (error) {
    if (error instanceof ExchangeRateError) {
      throw new ValidationError(error.message);
    }

    throw error;
  }

  if (!isSupportedCurrency(from)) {
    throw new ValidationError(`Unsupported source currency: ${from}.`);
  }

  if (!isSupportedCurrency(to)) {
    throw new ValidationError(`Unsupported target currency: ${to}.`);
  }

  return {
    from,
    to,
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
