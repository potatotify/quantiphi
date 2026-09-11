import { isSupportedCurrency } from "@/lib/constants/currencies";
import type { CurrencyCode } from "@/lib/types/currency";

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;
const MAX_CURRENCY_INPUT_LENGTH = 16;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function parseJsonObject(body: unknown): Record<string, unknown> {
  if (!isRecord(body)) {
    throw new ValidationError("Request body must be a JSON object.");
  }

  return body;
}

export function normalizeCurrencyCode(code: string): CurrencyCode {
  if (code.length > MAX_CURRENCY_INPUT_LENGTH) {
    throw new ValidationError("Invalid currency code. Expected a 3-letter ISO 4217 code.");
  }

  const normalized = code.trim().toUpperCase();

  if (!CURRENCY_CODE_PATTERN.test(normalized)) {
    throw new ValidationError("Invalid currency code. Expected a 3-letter ISO 4217 code.");
  }

  return normalized;
}

export function parseCurrencyPair(fromValue: unknown, toValue: unknown): {
  from: CurrencyCode;
  to: CurrencyCode;
} {
  const from = parseSupportedCurrency(fromValue, "from");
  const to = parseSupportedCurrency(toValue, "to");

  if (from === to) {
    throw new ValidationError("Source and target currencies must be different.");
  }

  return { from, to };
}

export function parseSupportedCurrency(value: unknown, fieldName: string): CurrencyCode {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`Field "${fieldName}" must be a currency code.`);
  }

  const code = normalizeCurrencyCode(value);

  if (!isSupportedCurrency(code)) {
    const label = fieldName === "from" ? "source" : fieldName === "to" ? "target" : fieldName;
    throw new ValidationError(`Unsupported ${label} currency: ${code}.`);
  }

  return code;
}

export function parsePositiveAmount(value: unknown): number {
  if (value === undefined || value === null || value === "") {
    throw new ValidationError("Amount is required.");
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError("Amount must be a valid number.");
  }

  if (!Number.isFinite(value)) {
    throw new ValidationError("Amount must be a finite number.");
  }

  if (value <= 0) {
    throw new ValidationError("Amount must be a positive number.");
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
