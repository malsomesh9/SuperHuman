"use client";

import { BellOff, MailPlus } from "lucide-react";
import type { FollowUp } from "@/types/domain";
import { Button } from "@/components/ui/button";

export function FollowupRow({ followup, onDraft, onDismiss }: { followup: FollowUp; onDraft: (followup: FollowUp) => void; onDismiss?: (followup: FollowUp) => void }) {
  return (
    <article className="grid gap-3 border-b border-border px-1 py-3 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="text-sm font-medium">{followup.person?.company ?? followup.person?.name ?? "Follow up"}</div>
        <p className="mt-1 text-sm text-muted-foreground">{followup.reason}</p>
        <p className="mt-1 text-xs text-muted-foreground">Waiting {followup.daysWaiting} days</p>
      </div>
      <div className="flex gap-1.5 md:justify-end">
        <Button size="sm" onClick={() => onDraft(followup)}><MailPlus size={14} /> Draft follow-up</Button>
        <Button size="sm" variant="ghost" onClick={() => onDismiss?.(followup)}><BellOff size={14} /> Remind later</Button>
      </div>
    </article>
  );
}
