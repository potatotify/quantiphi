interface ConvertButtonProps {
  loading?: boolean;
  disabled?: boolean;
}

export function ConvertButton({ loading = false, disabled = false }: ConvertButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      aria-busy={loading}
      className="inline-flex w-full items-center justify-center rounded-xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
    >
      {loading ? "Converting…" : "Convert"}
    </button>
  );
}
