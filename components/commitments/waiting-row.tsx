"use client";

import { ExternalLink, MailPlus } from "lucide-react";
import type { Commitment } from "@/types/domain";
import { SourceCitation } from "@/components/ai/source-citation";
import { Button } from "@/components/ui/button";
import { formatWaitingDuration } from "@/lib/utils/date";

export function WaitingRow({ item, onOpen, onDraft }: { item: Commitment; onOpen: (item: Commitment) => void; onDraft: (item: Commitment) => void }) {
  return (
    <article className="grid gap-3 border-b border-border px-1 py-3 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center">
      <button className="text-left" onClick={() => onOpen(item)}>
        <div className="text-sm font-medium">Waiting on {item.person?.name ?? "someone"}</div>
        <div className="mt-1 text-sm">{item.action}</div>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{item.deadline ? formatWaitingDuration(item.deadline) : "No explicit deadline"}</span>
          {item.source ? <SourceCitation source={item.source} /> : null}
        </div>
      </button>
      <div className="flex gap-1.5 md:justify-end">
        <Button size="sm" variant="outline" onClick={() => onOpen(item)}><ExternalLink size={14} /> Open</Button>
        <Button size="sm" onClick={() => onDraft(item)}><MailPlus size={14} /> Draft follow-up</Button>
      </div>
    </article>
  );
}
