import { isSupportedCurrency } from "@/lib/constants/currencies";
import { ExchangeRateError, normalizeCurrencyCode } from "@/lib/exchange-rate";
import type { CurrencyCode } from "@/lib/types/currency";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function parseCurrencyPair(fromValue: unknown, toValue: unknown): {
  from: CurrencyCode;
  to: CurrencyCode;
} {
  if (typeof fromValue !== "string" || fromValue.trim() === "") {
    throw new ValidationError("Field \"from\" must be a currency code.");
  }

  if (typeof toValue !== "string" || toValue.trim() === "") {
    throw new ValidationError("Field \"to\" must be a currency code.");
  }

  let from: CurrencyCode;
  let to: CurrencyCode;

  try {
    from = normalizeCurrencyCode(fromValue);
    to = normalizeCurrencyCode(toValue);
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

  return { from, to };
}

export function parseSupportedCurrency(value: unknown, fieldName: string): CurrencyCode {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`Field "${fieldName}" must be a currency code.`);
  }

  let code: CurrencyCode;

  try {
    code = normalizeCurrencyCode(value);
  } catch (error) {
    if (error instanceof ExchangeRateError) {
      throw new ValidationError(error.message);
    }

    throw error;
  }

  if (!isSupportedCurrency(code)) {
    throw new ValidationError(`Unsupported currency: ${code}.`);
  }

  return code;
}

export function parsePositiveAmount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new ValidationError("Amount must be a positive finite number.");
  }

  return value;
}
