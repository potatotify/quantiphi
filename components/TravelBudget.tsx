"use client";

import { FormEvent, useState } from "react";

import { AmountInput } from "@/components/AmountInput";
import { ComparisonTable } from "@/components/ComparisonTable";
import { CurrencySelector } from "@/components/CurrencySelector";
import { ErrorBanner } from "@/components/ErrorBanner";
import { EmptyState, Panel, SectionHeading, Skeleton, Spinner } from "@/components/ui/Panel";
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
    <Panel>
      <SectionHeading
        title="Travel Budget Mode"
        description={`Compare one amount across ${TRAVEL_BUDGET_CURRENCIES.join(", ")}.`}
      />

      <form onSubmit={handleSubmit} aria-busy={loading} className="flex flex-col gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <AmountInput id="travel-amount" value={amount} disabled={loading} onChange={onAmountChange} />
          <CurrencySelector
            id="baseCurrency"
            label="Base currency"
            value={baseCurrency}
            options={SUPPORTED_CURRENCIES}
            disabled={loading}
            onChange={onBaseCurrencyChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300 md:w-auto md:self-start"
        >
          {loading ? <Spinner label="Comparing…" /> : "Compare travel budget"}
        </button>
      </form>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-2" role="status" aria-label="Calculating equivalents in 5 major currencies">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : null}

        {!loading && error ? <ErrorBanner message={error} /> : null}

        {!loading && !error && !result ? (
          <EmptyState
            title="No comparison yet"
            description="Enter an amount and compare to see the equivalent value in 5 major currencies."
          />
        ) : null}

        {!loading && result ? <ComparisonTable result={result} /> : null}
      </div>
    </Panel>
  );
}
