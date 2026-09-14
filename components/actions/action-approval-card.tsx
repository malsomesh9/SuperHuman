"use client";

import { Check, X } from "lucide-react";
import type { SmartAction } from "@/types/domain";
import { SmartBadge } from "@/components/ai/smart-badge";
import { Button } from "@/components/ui/button";

export function ActionApprovalCard({ action, onApprove, onReject }: { action: SmartAction; onApprove: (action: SmartAction) => void; onReject: (action: SmartAction) => void }) {
  const payload = action.payload as { to?: string; subject?: string; body?: string };
  return (
    <article className="rounded-md border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{payload.subject ?? "Prepared action"}</h3>
            <SmartBadge label="AI prepared" tone="accent" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{action.reason}</p>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" onClick={() => onApprove(action)}><Check size={14} /> Approve</Button>
          <Button size="sm" variant="outline" onClick={() => onReject(action)}><X size={14} /> Reject</Button>
        </div>
      </div>
      <div className="mt-4 rounded-md border border-border bg-background p-3 text-sm">
        {payload.to ? <div className="text-xs text-muted-foreground">To: {payload.to}</div> : null}
        <p className="mt-2 whitespace-pre-wrap leading-6">{payload.body ?? "Ready for review."}</p>
      </div>
    </article>
  );
}
