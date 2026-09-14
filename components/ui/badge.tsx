import { cn } from "@/lib/utils/cn";

const toneClass = {
  neutral: "border-border bg-muted text-muted-foreground",
  accent: "border-accent/25 bg-accent/10 text-accent",
  success: "border-success/25 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger"
};

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: keyof typeof toneClass; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[12px] font-medium", toneClass[tone], className)}>{children}</span>;
}
