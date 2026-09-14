"use client";

import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { PriorityBadge } from "@/components/ai/priority-badge";
import { Button } from "@/components/ui/button";
import type { DailyBrief } from "@/types/domain";

export function DailyBriefCard({ brief }: { brief: DailyBrief }) {
  const metrics = [
    ["Due", brief.metrics.due],
    ["Overdue", brief.metrics.overdue],
    ["Waiting", brief.metrics.waiting],
    ["Follow-ups", brief.metrics.followups],
    ["Approvals", brief.metrics.approvals]
  ] as const;

  return (
    <section className="rounded-md border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Clock3 size={14} aria-hidden />
            Morning brief - {brief.focusWindow}
          </div>
          <h2 className="mt-2 text-base font-semibold">{brief.headline}</h2>
        </div>
        <div className="grid grid-cols-5 gap-2 text-center">
          {metrics.map(([label, value]) => (
            <div key={label} className="min-w-14 rounded-md border border-border bg-background px-2 py-1.5">
              <div className="text-sm font-semibold">{value}</div>
              <div className="text-[11px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        {brief.priorities.map((item) => (
          <div key={item.id} className="grid gap-3 border-t border-border py-3 first:border-t-0 first:pt-0 md:grid-cols-[1fr_auto] md:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <PriorityBadge priority={item.priority} />
                <span className="text-sm font-medium">{item.title}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={item.href}>
                {item.cta}
                <ArrowRight size={14} aria-hidden />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
