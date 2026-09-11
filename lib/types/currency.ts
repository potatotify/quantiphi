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

export interface TrendPoint {
  date: string;
  rate: number;
}

export interface TrendResponse {
  from: CurrencyCode;
  to: CurrencyCode;
  points: TrendPoint[];
}

export interface FavoritePairResponse {
  id: string;
  from: CurrencyCode;
  to: CurrencyCode;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface TravelBudgetRequest {
  baseCurrency: CurrencyCode;
  amount: number;
}

export interface TravelBudgetComparison {
  currency: CurrencyCode;
  label: string;
  rate: number;
  convertedAmount: number;
}

export interface TravelBudgetResponse {
  baseCurrency: CurrencyCode;
  amount: number;
  comparisons: TravelBudgetComparison[];
}

export interface ApiErrorResponse {
  error: string;
}