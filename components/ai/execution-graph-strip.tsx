"use client";

import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ExecutionGraphResponse } from "@/types/domain";

const kindTone = {
  email: "neutral",
  commitment: "warning",
  waiting: "accent",
  workflow: "danger",
  action: "success",
  system: "neutral"
} as const;

export function ExecutionGraphStrip({ graph }: { graph: ExecutionGraphResponse }) {
  return (
    <section className="min-w-0 rounded-md border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Execution graph</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{graph.insight}</p>
        </div>
        <Badge tone="accent">{graph.edges.length} traced links</Badge>
      </div>
      <div className="mt-4 flex snap-x gap-2 overflow-x-auto pb-1">
        {graph.nodes.map((node, index) => (
          <div key={node.id} className="flex shrink-0 items-center gap-2">
            <div className="w-52 rounded-md border border-border bg-background p-3">
              <Badge tone={kindTone[node.kind]}>{node.kind}</Badge>
              <div className="mt-2 truncate text-sm font-medium">{node.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{node.status}</div>
            </div>
            {index < graph.nodes.length - 1 ? <ArrowRight size={16} className="text-muted-foreground" aria-hidden /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
