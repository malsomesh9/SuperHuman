"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Composer } from "@/components/actions/composer";
import { SmartContextPanel } from "@/components/ai/smart-context-panel";
import { WaitingRow } from "@/components/commitments/waiting-row";
import { PageHeader } from "@/components/layout/page-header";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { useApi } from "@/lib/query/api-provider";
import type { Commitment } from "@/types/domain";

export default function WaitingPage() {
  const api = useApi();
  const [selected, setSelected] = useState<Commitment | null>(null);
  const [composerThread, setComposerThread] = useState<string | null>(null);
  const commitments = useQuery({ queryKey: ["commitments", "waiting"], queryFn: () => api.commitments("waiting") });
  const rows = (commitments.data ?? []).filter((item) => item.ownerType === "other" || item.status === "waiting");

  return (
    <>
      <PageHeader title="Waiting" summary="Things other people owe you." />
      <div className="mx-auto grid max-w-6xl gap-6 p-4 lg:p-8">
        <section className="rounded-md border border-border bg-surface px-3 py-2">
          <h2 className="border-b border-border py-2 text-sm font-semibold">Overdue and expected soon</h2>
          {commitments.isLoading ? <SkeletonList rows={6} /> : rows.map((item) => <WaitingRow key={item.id} item={item} onOpen={setSelected} onDraft={(next) => setComposerThread(next.threadId)} />)}
        </section>
      </div>
      {selected ? <SmartContextPanel commitment={selected} onClose={() => setSelected(null)} onDraft={() => setComposerThread(selected.threadId)} /> : null}
      {composerThread ? <Composer open={Boolean(composerThread)} onOpenChange={(open) => !open && setComposerThread(null)} threadId={composerThread} intent="follow-up" /> : null}
    </>
  );
}
