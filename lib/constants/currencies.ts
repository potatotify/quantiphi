import type { CurrencyOption } from "@/lib/types/currency";

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", label: "Swiss Franc", symbol: "CHF" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
];

export const DEFAULT_BASE_CURRENCY = "USD";
export const DEFAULT_TARGET_CURRENCY = "EUR";

/**
 * Travel Budget Mode always compares against these 5 major global currencies:
 * - USD: US Dollar (most traded reserve currency)
 * - EUR: Euro (eurozone)
 * - GBP: British Pound
 * - JPY: Japanese Yen
 * - AUD: Australian Dollar
 */
export const TRAVEL_BUDGET_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD"] as const;

const SUPPORTED_CURRENCY_CODES = new Set(SUPPORTED_CURRENCIES.map((currency) => currency.code));

export function isSupportedCurrency(code: string): boolean {
  return SUPPORTED_CURRENCY_CODES.has(code);
}