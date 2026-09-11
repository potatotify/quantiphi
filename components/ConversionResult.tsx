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
      className="rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-400/10 to-slate-950 p-5 sm:p-6"
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300">Converted amount</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {formatMoney(result.convertedAmount, result.to)}
      </p>
      <p className="mt-2 text-sm text-slate-300">
        {formatMoney(result.amount, result.from)} → {result.to}
      </p>
      <dl className="mt-6 grid gap-4 border-t border-slate-800 pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Exchange rate</dt>
          <dd className="mt-1 font-medium tabular-nums text-slate-100">
            1 {result.from} = {formatRate(result.rate)} {result.to}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Pair</dt>
          <dd className="mt-1 font-medium text-slate-100">
            {result.from} → {result.to}
          </dd>
        </div>
      </dl>
    </section>
  );
}
