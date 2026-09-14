import { cn } from "@/lib/utils/cn";

export function SkeletonList({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("grid gap-2", className)} aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-md border border-border bg-muted/70" />
      ))}
    </div>
  );
}
