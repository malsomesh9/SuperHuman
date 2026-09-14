"use client";

import { cn } from "@/lib/utils/cn";

export function FilterBar<T extends string>({ options, value, onChange }: { options: Array<{ label: string; value: T }>; value: T; onChange: (value: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-md border border-border bg-surface p-1" role="tablist">
      {options.map((option) => (
        <button key={option.value} type="button" role="tab" aria-selected={value === option.value} onClick={() => onChange(option.value)} className={cn("rounded px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground", value === option.value && "bg-background text-foreground shadow-fine")}>
          {option.label}
        </button>
      ))}
    </div>
  );
}
