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

export interface ConvertRequest {
  from: CurrencyCode;
  to: CurrencyCode;
  amount: number;
}

export interface ConvertResponse {
  id: string;
  from: CurrencyCode;
  to: CurrencyCode;
  amount: number;
  rate: number;
  convertedAmount: number;
  createdAt: string;
}

export interface ApiErrorResponse {
  error: string;
}