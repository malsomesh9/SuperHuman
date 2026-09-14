import { cn } from "@/lib/utils/cn";

export function PersonAvatar({ name, email, className }: { name: string | null | undefined; email?: string | null; className?: string }) {
  const label = name ?? email ?? "Unknown";
  const initials = label.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-md border border-border bg-muted text-xs font-semibold text-muted-foreground", className)} aria-hidden>
      {initials || "?"}
    </span>
  );
}
