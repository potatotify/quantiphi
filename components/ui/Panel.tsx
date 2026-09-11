import type { HTMLAttributes, ReactNode } from "react";

interface PanelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function Panel({ children, className = "", ...props }: PanelProps) {
  return (
    <section
      {...props}
      className={`rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold tracking-tight text-slate-100">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-8 text-center">
      <p className="text-sm font-medium text-slate-200">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-800 ${className}`} />;
}

export function Spinner({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        className="h-4 w-4 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
        />
      </svg>
      <span>{label}</span>
    </span>
  );
}
