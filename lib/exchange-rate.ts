import "server-only";

import { getExchangeRateApiKey } from "@/lib/config/env";
import type { CurrencyCode, TrendPoint } from "@/lib/types/currency";
import { normalizeCurrencyCode } from "@/lib/validation/currency";

const API_BASE_URL = "https://v6.exchangerate-api.com/v6";
const HISTORY_FALLBACK_URL = "https://api.frankfurter.app";
const REQUEST_TIMEOUT_MS = 10_000;
const TREND_DAYS = 30;
const HISTORY_CONCURRENCY = 5;
const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ExchangeRateErrorCode =
  | "NETWORK"
  | "API"
  | "INVALID_RESPONSE"
  | "UNSUPPORTED_CURRENCY"
  | "PLAN_UPGRADE"
  | "EMPTY_DATA";

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
  time_last_update_unix?: number;
  year?: number;
  month?: number;
  day?: number;
}

interface ExchangeRateApiFailure {
  result: "error";
  "error-type"?: string;
}

export async function getLatestRates(baseCurrency: CurrencyCode): Promise<LatestRates> {
  const baseCode = normalizeCurrencyCode(baseCurrency);
  const payload = await requestExchangeRateApi(`latest/${baseCode}`);
  return parseLatestRates(payload);
}

export async function getLatestRate(
  baseCurrency: CurrencyCode,
  targetCurrency: CurrencyCode,
): Promise<number> {
  const targetCode = normalizeCurrencyCode(targetCurrency);
  const latestRates = await getLatestRates(baseCurrency);
  return readRate(latestRates.rates, latestRates.baseCurrency, targetCode);
}

export async function getThirtyDayRates(
  baseCurrency: CurrencyCode,
  targetCurrency: CurrencyCode,
): Promise<TrendPoint[]> {
  const from = normalizeCurrencyCode(baseCurrency);
  const to = normalizeCurrencyCode(targetCurrency);
  const dates = lastUtcDates(TREND_DAYS);

  if (from === to) {
    return dates.map((date) => ({ date: toIsoDate(date), rate: 1 }));
  }

  try {
    return await getOfficialHistoryRange(from, to, dates);
  } catch (error) {
    if (error instanceof ExchangeRateError && error.code === "PLAN_UPGRADE") {
      return getFallbackHistoryRange(from, to, dates);
    }

    throw error;
  }
}

async function getOfficialHistoryRange(
  from: CurrencyCode,
  to: CurrencyCode,
  dates: Date[],
): Promise<TrendPoint[]> {
  const probeDate = dates[dates.length - 2] ?? dates[0];
  const probeRate = await getOfficialHistoryRate(from, to, probeDate);

  if (probeRate === "upgrade") {
    throw new ExchangeRateError(
      "Historical rates require an upgraded ExchangeRate API plan.",
      "PLAN_UPGRADE",
    );
  }

  const points: TrendPoint[] = [];

  for (const batch of chunk(dates, HISTORY_CONCURRENCY)) {
    const results = await Promise.all(
      batch.map(async (date) => {
        const rate = await getOfficialHistoryRate(from, to, date);

        if (rate === "upgrade") {
          throw new ExchangeRateError(
            "Historical rates require an upgraded ExchangeRate API plan.",
            "PLAN_UPGRADE",
          );
        }

        if (rate === null) {
          return null;
        }

        return { date: toIsoDate(date), rate };
      }),
    );

    for (const point of results) {
      if (point) {
        points.push(point);
      }
    }
  }

  return requireTrendPoints(points, from, to);
}

async function getOfficialHistoryRate(
  from: CurrencyCode,
  to: CurrencyCode,
  date: Date,
): Promise<number | null | "upgrade"> {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  try {
    const payload = await requestExchangeRateApi(`history/${from}/${year}/${month}/${day}`);
    const rates = parseHistoryRates(payload);
    return readRate(rates, from, to);
  } catch (error) {
    if (error instanceof ExchangeRateError && error.code === "PLAN_UPGRADE") {
      return "upgrade";
    }

    if (error instanceof ExchangeRateError && error.message.includes("no historical data")) {
      return null;
    }

    throw error;
  }
}

async function getFallbackHistoryRange(
  from: CurrencyCode,
  to: CurrencyCode,
  dates: Date[],
): Promise<TrendPoint[]> {
  const start = toIsoDate(dates[0]);
  const end = toIsoDate(dates[dates.length - 1]);
  const payload = await requestJson(
    `${HISTORY_FALLBACK_URL}/${start}..${end}?from=${from}&to=${to}`,
    "Unable to reach the historical exchange-rate service.",
  );

  if (!isRecord(payload) || !isRecord(payload.rates)) {
    throw new ExchangeRateError("Historical exchange-rate data is missing or invalid.", "INVALID_RESPONSE");
  }

  const points = Object.entries(payload.rates)
    .map(([date, rateMap]) => {
      if (!ISO_DATE_PATTERN.test(date) || !isRecord(rateMap)) {
        return null;
      }

      const rate = rateMap[to];

      if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
        return null;
      }

      return { date, rate };
    })
    .filter((point): point is TrendPoint => point !== null)
    .sort((left, right) => left.date.localeCompare(right.date));

  return requireTrendPoints(points, from, to);
}

async function requestExchangeRateApi(path: string): Promise<unknown> {
  const apiKey = getExchangeRateApiKey();
  const payload = await requestJson(
    `${API_BASE_URL}/${path}`,
    "Unable to reach the ExchangeRate API.",
    {
      Authorization: `Bearer ${apiKey}`,
    },
  );

  if (isApiFailure(payload)) {
    throw new ExchangeRateError(
      toApiErrorMessage(payload, "ExchangeRate API returned an error."),
      payload["error-type"] === "plan-upgrade-required" ? "PLAN_UPGRADE" : "API",
    );
  }

  return payload;
}

async function requestJson(
  url: string,
  networkMessage: string,
  headers: Record<string, string> = {},
): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...headers,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new ExchangeRateError(toNetworkErrorMessage(error, networkMessage), "NETWORK");
  }

  const payload = await readJsonBody(response);

  if (!response.ok && isApiFailure(payload)) {
    throw new ExchangeRateError(
      toApiErrorMessage(payload, `Exchange-rate request failed with status ${response.status}.`),
      payload["error-type"] === "plan-upgrade-required" ? "PLAN_UPGRADE" : "API",
      response.status,
    );
  }

  if (!response.ok) {
    throw new ExchangeRateError(
      `Exchange-rate request failed with status ${response.status}.`,
      "API",
      response.status,
    );
  }

  return payload;
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
  const successPayload = asSuccessPayload(payload);

  if (typeof successPayload.base_code !== "string") {
    throw new ExchangeRateError("ExchangeRate API response is missing a base currency.", "INVALID_RESPONSE");
  }

  let baseCurrency: CurrencyCode;

  try {
    baseCurrency = normalizeCurrencyCode(successPayload.base_code);
  } catch {
    throw new ExchangeRateError("ExchangeRate API response is missing a base currency.", "INVALID_RESPONSE");
  }

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

function parseHistoryRates(payload: unknown): Record<string, number> {
  const successPayload = asSuccessPayload(payload);

  if (!isRateMap(successPayload.conversion_rates)) {
    throw new ExchangeRateError("Historical exchange-rate data is missing or invalid.", "INVALID_RESPONSE");
  }

  return successPayload.conversion_rates;
}

function asSuccessPayload(payload: unknown): Partial<ExchangeRateApiSuccess> {
  if (!isRecord(payload) || payload.result !== "success") {
    throw new ExchangeRateError("ExchangeRate API response is missing a success result.", "INVALID_RESPONSE");
  }

  return payload as Partial<ExchangeRateApiSuccess>;
}

function readRate(
  rates: Record<string, number>,
  baseCurrency: CurrencyCode,
  targetCurrency: CurrencyCode,
): number {
  const rate = rates[targetCurrency];

  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
    throw new ExchangeRateError(
      `No valid exchange rate found for ${baseCurrency} → ${targetCurrency}.`,
      "UNSUPPORTED_CURRENCY",
    );
  }

  return rate;
}

function requireTrendPoints(points: TrendPoint[], from: CurrencyCode, to: CurrencyCode): TrendPoint[] {
  if (points.length < 2) {
    throw new ExchangeRateError(
      `Not enough historical data is available for ${from} → ${to}.`,
      "EMPTY_DATA",
    );
  }

  return points;
}

function lastUtcDates(days: number): Date[] {
  const today = new Date();
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (days - 1));

  return Array.from({ length: days }, (_, index) => new Date(start + index * 24 * 60 * 60 * 1000));
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }

  return batches;
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

function toNetworkErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return "Exchange-rate request timed out.";
  }

  if (error instanceof Error && error.name === "AbortError") {
    return "Exchange-rate request timed out.";
  }

  return fallback;
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
    case "no-data-available":
      return "The ExchangeRate API has no historical data for that date.";
    case "plan-upgrade-required":
      return "Historical rates require an upgraded ExchangeRate API plan.";
    default:
      return fallback;
  }
}
