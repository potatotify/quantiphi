import { formatMoney, formatRate } from "@/lib/format/currency";
import type { TravelBudgetResponse } from "@/lib/types/currency";

interface ComparisonTableProps {
  result: TravelBudgetResponse;
}

export function ComparisonTable({ result }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="min-w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          Travel budget comparison for {formatMoney(result.amount, result.baseCurrency)}
        </caption>
        <thead className="bg-slate-950 text-slate-400">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Currency
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Exchange rate
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Equivalent
            </th>
          </tr>
        </thead>
        <tbody>
          {result.comparisons.map((row) => (
            <tr key={row.currency} className="border-t border-slate-800 odd:bg-slate-950/40">
              <th scope="row" className="px-4 py-3 font-medium text-slate-100">
                {row.currency}
                <span className="mt-1 block text-xs font-normal text-slate-400">{row.label}</span>
              </th>
              <td className="px-4 py-3 tabular-nums text-slate-300">
                1 {result.baseCurrency} = {formatRate(row.rate)} {row.currency}
              </td>
              <td className="px-4 py-3 text-right text-base font-semibold tabular-nums text-slate-50">
                {formatMoney(row.convertedAmount, row.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
