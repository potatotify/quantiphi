import type { CurrencyOption } from "@/lib/types/currency";

interface CurrencySelectorProps {
  id: string;
  label: string;
  value: string;
  options: CurrencyOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function CurrencySelector({
  id,
  label,
  value,
  options,
  disabled = false,
  onChange,
}: CurrencySelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-10 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {options.map((option) => (
            <option key={option.code} value={option.code}>
              {option.code} — {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500" aria-hidden="true">
          ▾
        </span>
      </div>
    </div>
  );
}
