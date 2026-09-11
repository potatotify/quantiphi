interface AmountInputProps {
  id?: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function AmountInput({
  id = "amount",
  value,
  disabled = false,
  onChange,
}: AmountInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        Amount
      </label>
      <input
        id={id}
        name={id}
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value}
        disabled={disabled}
        placeholder="0.00"
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg tabular-nums text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}
