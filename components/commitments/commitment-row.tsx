"use client";

import { Check, ExternalLink, MailPlus, MoreHorizontal } from "lucide-react";
import type { Commitment } from "@/types/domain";
import { PriorityBadge } from "@/components/ai/priority-badge";
import { SmartBadge } from "@/components/ai/smart-badge";
import { SourceCitation } from "@/components/ai/source-citation";
import { Button } from "@/components/ui/button";
import { formatOverdue, formatSmartDate } from "@/lib/utils/date";

export function CommitmentRow({ commitment, onOpen, onDraft, onComplete }: { commitment: Commitment; onOpen: (commitment: Commitment) => void; onDraft: (commitment: Commitment) => void; onComplete: (commitment: Commitment) => void }) {
  const overdue = commitment.status === "overdue";
  return (
    <article className="grid gap-3 border-b border-border px-1 py-3 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center">
      <button className="min-w-0 text-left" onClick={() => onOpen(commitment)}>
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={overdue ? "critical" : commitment.requiresConfirmation ? "normal" : "high"} />
          <h3 className="truncate text-sm font-medium">{commitment.action}</h3>
          {commitment.requiresConfirmation ? <SmartBadge label="Possible commitment" /> : null}
          {overdue ? <SmartBadge label="Overdue" tone="danger" /> : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{commitment.person?.name ?? "Unknown"}</span>
          {commitment.person?.company ? <span>{commitment.person.company}</span> : null}
          {commitment.deadline ? <span>{overdue ? formatOverdue(commitment.deadline) : formatSmartDate(commitment.deadline)}</span> : null}
          {commitment.source ? <SourceCitation source={commitment.source} /> : null}
        </div>
      </button>
      <div className="flex flex-wrap gap-1.5 md:justify-end">
        <Button size="sm" variant="outline" onClick={() => onOpen(commitment)}><ExternalLink size={14} /> Open</Button>
        <Button size="sm" variant="secondary" onClick={() => onDraft(commitment)}><MailPlus size={14} /> Draft reply</Button>
        {commitment.requiresConfirmation ? <Button size="sm" variant="outline">Confirm</Button> : <Button size="sm" onClick={() => onComplete(commitment)}><Check size={14} /> Complete</Button>}
        <Button size="icon" variant="ghost" aria-label="More actions"><MoreHorizontal size={15} /></Button>
      </div>
    </article>
  );
}
