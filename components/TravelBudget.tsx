"use client";

import { FormEvent, useState } from "react";

import { AmountInput } from "@/components/AmountInput";
import { ComparisonTable } from "@/components/ComparisonTable";
import { CurrencySelector } from "@/components/CurrencySelector";
import { ErrorBanner } from "@/components/ErrorBanner";
import { requestTravelBudget } from "@/lib/api/travel-budget";
import { SUPPORTED_CURRENCIES, TRAVEL_BUDGET_CURRENCIES } from "@/lib/constants/currencies";
import type { CurrencyCode, TravelBudgetResponse } from "@/lib/types/currency";

interface TravelBudgetProps {
  baseCurrency: CurrencyCode;
  amount: string;
  onBaseCurrencyChange: (value: CurrencyCode) => void;
  onAmountChange: (value: string) => void;
}

export function TravelBudget({
  baseCurrency,
  amount,
  onBaseCurrencyChange,
  onAmountChange,
}: TravelBudgetProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TravelBudgetResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a positive amount to compare.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const budget = await requestTravelBudget({
        baseCurrency,
        amount: parsedAmount,
      });
      setResult(budget);
    } catch (budgetError) {
      setResult(null);
      setError(
        budgetError instanceof Error ? budgetError.message : "Unable to calculate the travel budget.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={loading}
      className="flex flex-col gap-5 rounded-3xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl shadow-slate-950/40 sm:p-8"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Travel budget</h2>
        <p className="mt-1 text-sm text-slate-400">
          Compare one amount across {TRAVEL_BUDGET_CURRENCIES.join(", ")}.
        </p>
      </div>

      <AmountInput id="travel-amount" value={amount} disabled={loading} onChange={onAmountChange} />
      <CurrencySelector
        id="baseCurrency"
        label="Base currency"
        value={baseCurrency}
        options={SUPPORTED_CURRENCIES}
        disabled={loading}
        onChange={onBaseCurrencyChange}
      />

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="inline-flex w-full items-center justify-center rounded-xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
      >
        {loading ? "Comparing…" : "Compare travel budget"}
      </button>

      {loading ? (
        <p className="text-sm text-slate-400" role="status">
          Calculating equivalents in 5 major currencies…
        </p>
      ) : null}

      {error ? <ErrorBanner message={error} /> : null}
      {result ? <ComparisonTable result={result} /> : null}
    </form>
  );
}
