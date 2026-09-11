"use client";

import { FormEvent, useState } from "react";

import { AmountInput } from "@/components/AmountInput";
import { ConversionResult } from "@/components/ConversionResult";
import { ConvertButton } from "@/components/ConvertButton";
import { CurrencySelector } from "@/components/CurrencySelector";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FavoritesList } from "@/components/FavoritesList";
import { TravelBudget } from "@/components/TravelBudget";
import { TrendChart } from "@/components/TrendChart";
import { requestConversion } from "@/lib/api/convert";
import {
  DEFAULT_BASE_CURRENCY,
  DEFAULT_TARGET_CURRENCY,
  SUPPORTED_CURRENCIES,
} from "@/lib/constants/currencies";
import type { ConvertResponse } from "@/lib/types/currency";

export function CurrencyConverter() {
  const [from, setFrom] = useState(DEFAULT_BASE_CURRENCY);
  const [to, setTo] = useState(DEFAULT_TARGET_CURRENCY);
  const [amount, setAmount] = useState("100");
  const [travelMode, setTravelMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConvertResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a positive amount to convert.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const conversion = await requestConversion({
        from,
        to,
        amount: parsedAmount,
      });
      setResult(conversion);
    } catch (conversionError) {
      setResult(null);
      setError(
        conversionError instanceof Error
          ? conversionError.message
          : "Unable to complete the conversion.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-100">Travel Budget Mode</p>
          <p className="text-xs text-slate-400">Compare one amount in 5 major currencies.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={travelMode}
          aria-label="Travel Budget Mode"
          onClick={() => setTravelMode((current) => !current)}
          className={`relative h-7 w-12 rounded-full transition ${
            travelMode ? "bg-sky-400" : "bg-slate-700"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-slate-950 transition ${
              travelMode ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {travelMode ? (
        <TravelBudget
          baseCurrency={from}
          amount={amount}
          onBaseCurrencyChange={setFrom}
          onAmountChange={setAmount}
        />
      ) : (
        <>
          <form
            onSubmit={handleSubmit}
            aria-busy={loading}
            className="flex flex-col gap-5 rounded-3xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl shadow-slate-950/40 sm:p-8"
          >
            <AmountInput value={amount} disabled={loading} onChange={setAmount} />

            <div className="grid gap-4 sm:grid-cols-2">
              <CurrencySelector
                id="from"
                label="Source currency"
                value={from}
                options={SUPPORTED_CURRENCIES}
                disabled={loading}
                onChange={setFrom}
              />
              <CurrencySelector
                id="to"
                label="Target currency"
                value={to}
                options={SUPPORTED_CURRENCIES}
                disabled={loading}
                onChange={setTo}
              />
            </div>

            <ConvertButton loading={loading} />

            {loading ? (
              <p className="text-sm text-slate-400" role="status">
                Fetching the latest exchange rate…
              </p>
            ) : null}

            {error ? <ErrorBanner message={error} /> : null}
            {result ? <ConversionResult result={result} /> : null}
          </form>
          <FavoritesList
            from={from}
            to={to}
            refreshKey={result?.id}
            onSelect={(nextFrom, nextTo) => {
              setFrom(nextFrom);
              setTo(nextTo);
            }}
          />
          <TrendChart from={from} to={to} />
        </>
      )}
    </div>
  );
}
