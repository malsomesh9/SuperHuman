"use client";

import { format } from "date-fns";
import { SourceCitation } from "@/components/ai/source-citation";
import type { Decision } from "@/types/domain";

export function DecisionList({ decisions }: { decisions: Decision[] }) {
  if (!decisions.length) return <p className="text-sm text-muted-foreground">No decisions have been extracted yet.</p>;

  return (
    <div className="grid gap-2">
      {decisions.map((decision) => (
        <article key={decision.id} className="rounded-md border border-border bg-background p-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-medium">{decision.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{decision.reason}</p>
            </div>
            <time className="text-xs text-muted-foreground" dateTime={decision.decidedAt}>{format(new Date(decision.decidedAt), "MMM d")}</time>
          </div>
          <div className="mt-2">
            <SourceCitation source={decision.source} />
          </div>
        </article>
      ))}
    </div>
  );
}
