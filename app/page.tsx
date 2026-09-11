import { CurrencyConverter } from "@/components/CurrencyConverter";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-950/90">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-sky-300">Dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Currency Converter</h1>
          <p className="max-w-2xl text-sm text-slate-400">
            Live conversion, 30-day trends, frequent pairs, and travel-budget comparison.
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <CurrencyConverter />
      </div>
    </main>
  );
}
