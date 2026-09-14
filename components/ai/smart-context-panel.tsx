"use client";

import { X } from "lucide-react";
import type { Commitment, Thread } from "@/types/domain";
import { SourceCitation } from "@/components/ai/source-citation";
import { Button } from "@/components/ui/button";

export function SmartContextPanel({ commitment, thread, onClose, onDraft }: { commitment?: Commitment | null; thread?: Thread | null; onClose?: () => void; onDraft?: () => void }) {
  const item = commitment ?? thread?.commitments?.[0] ?? null;
  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full border-l border-border bg-background p-4 shadow-drawer md:w-[380px]" aria-label="Smart context">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Smart context</h2>
        {onClose ? <Button size="icon" variant="ghost" aria-label="Close context" onClick={onClose}><X size={16} /></Button> : null}
      </div>
      <div className="mt-5 grid gap-5">
        <section>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">Summary</h3>
          <p className="mt-2 text-sm leading-6">{thread?.summary ?? item?.description ?? "SmartEmail found work hidden in this conversation."}</p>
        </section>
        {item ? (
          <section>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">{item.ownerType === "user" ? "You owe" : "Waiting on"}</h3>
            <p className="mt-2 text-sm font-medium">{item.action}</p>
            {item.source ? <div className="mt-3"><SourceCitation source={item.source} /></div> : null}
          </section>
        ) : null}
        {item?.source?.excerpt ? (
          <section>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Why SmartEmail detected this</h3>
            <blockquote className="mt-2 rounded-md border border-border bg-muted/50 p-3 text-sm leading-6">
              <span aria-hidden>&quot;</span>{item.source.excerpt}<span aria-hidden>&quot;</span>
            </blockquote>
            <p className="mt-2 text-xs text-muted-foreground">Detected action, owner, and deadline from the source sentence.</p>
          </section>
        ) : null}
        {onDraft ? <Button onClick={onDraft}>Draft reply</Button> : null}
      </div>
    </aside>
  );
}
