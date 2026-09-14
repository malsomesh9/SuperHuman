"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function SearchBar({ value, onChange, placeholder, className }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string }) {
  return (
    <label className={cn("flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm", className)}>
      <Search size={16} className="text-muted-foreground" aria-hidden />
      <span className="sr-only">{placeholder}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
    </label>
  );
}
