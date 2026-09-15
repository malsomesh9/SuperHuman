"use client";

import { BellOff, MailPlus, X, Undo2 } from "lucide-react";
import { useState } from "react";
import type { FollowUp } from "@/types/domain";
import { Button } from "@/components/ui/button";

import { useFollowupActions } from "@/lib/query/use-followup-actions";

export function FollowupRow({ followup, onDraft }: { followup: FollowUp; onDraft: (followup: FollowUp) => void }) {
  const [days, setDays] = useState<1 | 3 | 7>(1);
  const update = useFollowupActions();
  return (
    <article className="grid gap-3 border-b border-border px-1 py-3 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="text-sm font-medium">{followup.person?.company ?? followup.person?.name ?? "Follow up"}</div>
        <p className="mt-1 text-sm text-muted-foreground">{followup.reason}</p>
        <p className="mt-1 text-xs text-muted-foreground">Waiting {followup.daysWaiting} days</p>
        {followup.status === "scheduled" && followup.scheduledFor && <p className="mt-1 text-xs text-muted-foreground">Reminder: <time dateTime={followup.scheduledFor}>{new Date(followup.scheduledFor).toLocaleString()}</time></p>}
      </div>
      <div className="flex flex-wrap gap-1.5 md:justify-end" aria-busy={update.isPending}>
        <Button size="sm" disabled={!followup.threadId} onClick={() => onDraft(followup)}><MailPlus size={14} /> Draft follow-up</Button>
        {followup.status === "dismissed" ? <Button size="sm" variant="outline" disabled={update.isPending} onClick={() => update.mutate({ id: followup.id, input: { operation: "restore" } })}><Undo2 size={14} /> Restore</Button> : <>
          <select aria-label={`Remind later for ${followup.person?.name ?? "follow-up"}`} className="min-h-9 rounded border border-border bg-background px-2 text-xs" value={days} onChange={event => setDays(Number(event.target.value) as 1 | 3 | 7)} disabled={update.isPending}>
            <option value={1}>In 24 hours</option><option value={3}>In 3 days</option><option value={7}>In 1 week</option>
          </select>
          <Button size="sm" variant="ghost" disabled={update.isPending} onClick={() => update.mutate({ id: followup.id, input: { operation: "snooze", days } })}><BellOff size={14} /> Remind later</Button>
          <Button size="sm" variant="ghost" title="Dismiss follow-up" aria-label="Dismiss follow-up" disabled={update.isPending} onClick={() => update.mutate({ id: followup.id, input: { operation: "dismiss" } })}><X size={14} /></Button>
        </>}
      </div>
    </article>
  );
}
