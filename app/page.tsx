export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quantiphi</p>
        <h1 className="text-3xl font-semibold md:text-5xl">Currency Converter Foundation</h1>
        <p className="max-w-2xl text-slate-300">
          App Router, TypeScript, Tailwind CSS, Prisma, and SQLite are wired up here. Feature logic will be added on top of this structure.
        </p>
      </div>
    </main>
  );
}