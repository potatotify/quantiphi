import "server-only";

import { getExchangeRateApiKey } from "@/lib/config/env";
import type { CurrencyCode } from "@/lib/types/currency";

const API_BASE_URL = "https://v6.exchangerate-api.com/v6";
const REQUEST_TIMEOUT_MS = 10_000;
const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

export type ExchangeRateErrorCode =
  | "NETWORK"
  | "API"
  | "INVALID_RESPONSE"
  | "UNSUPPORTED_CURRENCY";

export class ExchangeRateError extends Error {
  readonly code: ExchangeRateErrorCode;
  readonly status?: number;

  constructor(message: string, code: ExchangeRateErrorCode, status?: number) {
    super(message);
    this.name = "ExchangeRateError";
    this.code = code;
    this.status = status;
  }
}

export interface LatestRates {
  baseCurrency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  lastUpdatedAt: Date;
}

interface ExchangeRateApiSuccess {
  result: "success";
  base_code: string;
  conversion_rates: Record<string, number>;
  time_last_update_unix: number;
}

interface ExchangeRateApiFailure {
  result: "error";
  "error-type"?: string;
}

export function normalizeCurrencyCode(code: string): CurrencyCode {
  const normalized = code.trim().toUpperCase();

  if (!CURRENCY_CODE_PATTERN.test(normalized)) {
    throw new ExchangeRateError(
      `Invalid currency code: "${code}". Expected a 3-letter ISO 4217 code.`,
      "UNSUPPORTED_CURRENCY",
    );
  }

  return normalized;
}

export async function getLatestRates(baseCurrency: CurrencyCode): Promise<LatestRates> {
  const baseCode = normalizeCurrencyCode(baseCurrency);
  const apiKey = getExchangeRateApiKey();

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/latest/${baseCode}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new ExchangeRateError(
      toNetworkErrorMessage(error),
      "NETWORK",
    );
  }

  const payload = await readJsonBody(response);

  if (!response.ok) {
    throw new ExchangeRateError(
      toApiErrorMessage(payload, `ExchangeRate API request failed with status ${response.status}.`),
      "API",
      response.status,
    );
  }

  if (isApiFailure(payload)) {
    throw new ExchangeRateError(toApiErrorMessage(payload, "ExchangeRate API returned an error."), "API", response.status);
  }

  return parseLatestRates(payload);
}

export async function getLatestRate(
  baseCurrency: CurrencyCode,
  targetCurrency: CurrencyCode,
): Promise<number> {
  const targetCode = normalizeCurrencyCode(targetCurrency);
  const latestRates = await getLatestRates(baseCurrency);
  const rate = latestRates.rates[targetCode];

  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
    throw new ExchangeRateError(
      `No valid exchange rate found for ${latestRates.baseCurrency} → ${targetCode}.`,
      "UNSUPPORTED_CURRENCY",
    );
  }

  return rate;
}

async function readJsonBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ExchangeRateError(
      "ExchangeRate API returned a non-JSON response.",
      "INVALID_RESPONSE",
      response.status,
    );
  }
}

function parseLatestRates(payload: unknown): LatestRates {
  if (!isRecord(payload) || payload.result !== "success") {
    throw new ExchangeRateError("ExchangeRate API response is missing a success result.", "INVALID_RESPONSE");
  }

  const successPayload = payload as Partial<ExchangeRateApiSuccess>;

  if (typeof successPayload.base_code !== "string") {
    throw new ExchangeRateError("ExchangeRate API response is missing a base currency.", "INVALID_RESPONSE");
  }

  const baseCurrency = normalizeCurrencyCode(successPayload.base_code);

  if (!isRateMap(successPayload.conversion_rates)) {
    throw new ExchangeRateError("ExchangeRate API response contains invalid conversion rates.", "INVALID_RESPONSE");
  }

  if (
    typeof successPayload.time_last_update_unix !== "number" ||
    !Number.isFinite(successPayload.time_last_update_unix)
  ) {
    throw new ExchangeRateError("ExchangeRate API response is missing a valid update timestamp.", "INVALID_RESPONSE");
  }

  return {
    baseCurrency,
    rates: successPayload.conversion_rates,
    lastUpdatedAt: new Date(successPayload.time_last_update_unix * 1000),
  };
}

function isApiFailure(payload: unknown): payload is ExchangeRateApiFailure {
  return isRecord(payload) && payload.result === "error";
}

function isRateMap(value: unknown): value is Record<string, number> {
  if (!isRecord(value) || Object.keys(value).length === 0) {
    return false;
  }

  return Object.entries(value).every(
    ([code, rate]) => CURRENCY_CODE_PATTERN.test(code) && typeof rate === "number" && Number.isFinite(rate) && rate > 0,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNetworkErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return "ExchangeRate API request timed out.";
  }

  if (error instanceof Error && error.name === "AbortError") {
    return "ExchangeRate API request timed out.";
  }

  return "Unable to reach the ExchangeRate API.";
}

function toApiErrorMessage(payload: unknown, fallback: string): string {
  if (!isApiFailure(payload)) {
    return fallback;
  }

  switch (payload["error-type"]) {
    case "unsupported-code":
      return "The ExchangeRate API does not support the requested currency.";
    case "malformed-request":
      return "The ExchangeRate API rejected the request as malformed.";
    case "invalid-key":
      return "The ExchangeRate API key is invalid.";
    case "inactive-account":
      return "The ExchangeRate API account is inactive.";
    case "quota-reached":
      return "The ExchangeRate API quota has been reached.";
    default:
      return fallback;
  }
}
