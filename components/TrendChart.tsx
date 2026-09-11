"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ErrorBanner } from "@/components/ErrorBanner";
import { requestTrend } from "@/lib/api/trends";
import { formatRate } from "@/lib/format/currency";
import type { CurrencyCode, TrendPoint } from "@/lib/types/currency";

interface TrendChartProps {
  from: CurrencyCode;
  to: CurrencyCode;
}

export function TrendChart({ from, to }: TrendChartProps) {
  const [points, setPoints] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTrend() {
      setLoading(true);
      setError(null);

      try {
        const trend = await requestTrend(from, to);

        if (!controller.signal.aborted) {
          setPoints(trend.points);
        }
      } catch (trendError) {
        if (!controller.signal.aborted) {
          setPoints([]);
          setError(
            trendError instanceof Error ? trendError.message : "Unable to load exchange-rate trends.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadTrend();

    return () => controller.abort();
  }, [from, to]);

  return (
    <section
      aria-busy={loading}
      aria-label={`30-day exchange rate trend for ${from} to ${to}`}
      className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl shadow-slate-950/40 sm:p-8"
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-100">30-day trend</h2>
        <p className="mt-1 text-sm text-slate-400">
          {from} → {to} over the last 30 days
        </p>
      </div>

      {loading ? (
        <div
          className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 text-sm text-slate-400"
          role="status"
        >
          Loading exchange-rate history…
        </div>
      ) : null}

      {!loading && error ? <ErrorBanner message={error} /> : null}

      {!loading && !error ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartDate}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                dataKey="rate"
                domain={["auto", "auto"]}
                tickFormatter={(value: number) => formatRate(value)}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
                width={72}
              />
              <Tooltip content={<TrendTooltip from={from} to={to} />} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: "#38bdf8" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  );
}

function TrendTooltip({
  active,
  payload,
  from,
  to,
}: {
  active?: boolean;
  payload?: Array<{ payload: TrendPoint }>;
  from: CurrencyCode;
  to: CurrencyCode;
}) {
  if (!active || !payload?.[0]) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-lg">
      <p className="text-slate-400">{formatChartDate(point.date)}</p>
      <p className="mt-1 font-medium">
        1 {from} = {formatRate(point.rate)} {to}
      </p>
    </div>
  );
}

function formatChartDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}
