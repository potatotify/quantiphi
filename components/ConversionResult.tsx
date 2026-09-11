import { formatMoney, formatRate } from "@/lib/format/currency";
import type { ConvertResponse } from "@/lib/types/currency";

interface ConversionResultProps {
  result: ConvertResponse;
}

export function ConversionResult({ result }: ConversionResultProps) {
  return (
    <section
      aria-live="polite"
      aria-label="Conversion result"
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
    >
      <p className="text-sm text-slate-400">Converted amount</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-50">
        {formatMoney(result.convertedAmount, result.to)}
      </p>
      <p className="mt-2 text-sm text-slate-400">
        {formatMoney(result.amount, result.from)} → {result.to}
      </p>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Exchange rate</dt>
          <dd className="mt-1 font-medium text-slate-200">
            1 {result.from} = {formatRate(result.rate)} {result.to}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Pair</dt>
          <dd className="mt-1 font-medium text-slate-200">
            {result.from} → {result.to}
          </dd>
        </div>
      </dl>
    </section>
  );
}
