import { BackendStatus } from "@/components/layout/backend-status";

export function PageHeader({ title, eyebrow, summary, action }: { title: string; eyebrow?: string; summary?: string; action?: React.ReactNode }) {
  return (
    <header className="border-b border-border bg-surface/95 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow ? <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</p> : null}
          <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-normal">{title}</h1>
          {summary ? <p className="mt-1 text-sm text-muted-foreground">{summary}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <BackendStatus />
          {action}
        </div>
      </div>
    </header>
  );
}
