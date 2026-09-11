import { SUPPORTED_CURRENCIES } from "@/lib/constants/currencies";
import type { CurrencyCode } from "@/lib/types/currency";

export function getCurrencyOption(code: CurrencyCode) {
  return SUPPORTED_CURRENCIES.find((currency) => currency.code === code);
}

export function formatMoney(amount: number, code: CurrencyCode): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: code === "JPY" ? 0 : 2,
  }).format(amount);
}

export function formatRate(rate: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(rate);
}
