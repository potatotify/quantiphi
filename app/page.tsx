import { CurrencyConverter } from "@/components/CurrencyConverter";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Currency Converter</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Convert in real time</h1>
          <p className="max-w-xl text-slate-400">
            Choose an amount and a currency pair. Conversion runs on the server using live exchange rates.
          </p>
        </header>
        <CurrencyConverter />
      </div>
    </main>
  );
}
