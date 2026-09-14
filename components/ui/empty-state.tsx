import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, body, action }: { icon?: LucideIcon; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <section className="rounded-md border border-dashed border-border bg-surface p-6 text-center">
      {Icon ? <Icon className="mx-auto mb-3 text-muted-foreground" size={22} aria-hidden /> : null}
      <h2 className="text-sm font-semibold">{title}</h2>
      {body ? <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
