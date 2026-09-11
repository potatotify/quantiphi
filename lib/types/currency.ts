export type CurrencyCode = string;

export interface CurrencyOption {
  code: CurrencyCode;
  label: string;
  symbol: string;
}

export interface CurrencyPair {
  baseCurrency: CurrencyCode;
  targetCurrency: CurrencyCode;
}