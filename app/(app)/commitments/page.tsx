"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Composer } from "@/components/actions/composer";
import { SmartContextPanel } from "@/components/ai/smart-context-panel";
import { CommitmentRow } from "@/components/commitments/commitment-row";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { SearchBar } from "@/components/ui/search-bar";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { useApi } from "@/lib/query/api-provider";
import type { Commitment } from "@/types/domain";

type Tab = "open" | "due_today" | "upcoming" | "completed" | "dismissed";

export default function CommitmentsPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("open");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Commitment | null>(null);
  const [composerThread, setComposerThread] = useState<string | null>(null);
  const commitments = useQuery({ queryKey: ["commitments", tab], queryFn: () => api.commitments(tab === "open" ? undefined : tab) });
  const complete = useMutation({
    mutationFn: (item: Commitment) => api.updateCommitment(item.id, { status: "completed" }),
    onSuccess: async () => {
      toast.success("Commitment completed");
      await queryClient.invalidateQueries({ queryKey: ["commitments"] });
    }
  });
  const rows = (commitments.data ?? []).filter((item) => item.action.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <PageHeader title="Commitments" summary="Promises, deadlines, and things that need confirmation." />
      <div className="mx-auto grid max-w-6xl gap-4 p-4 lg:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <FilterBar value={tab} onChange={setTab} options={[{ label: "Open", value: "open" }, { label: "Due today", value: "due_today" }, { label: "Upcoming", value: "upcoming" }, { label: "Completed", value: "completed" }, { label: "Dismissed", value: "dismissed" }]} />
          <SearchBar value={query} onChange={setQuery} placeholder="Search commitments..." className="md:w-80" />
        </div>
        <section className="rounded-md border border-border bg-surface px-3 py-2">
          {commitments.isLoading ? <SkeletonList rows={8} /> : rows.map((item) => <CommitmentRow key={item.id} commitment={item} onOpen={setSelected} onDraft={(next) => setComposerThread(next.threadId)} onComplete={(next) => complete.mutate(next)} />)}
        </section>
      </div>
      {selected ? <SmartContextPanel commitment={selected} onClose={() => setSelected(null)} onDraft={() => setComposerThread(selected.threadId)} /> : null}
      {composerThread ? <Composer open={Boolean(composerThread)} onOpenChange={(open) => !open && setComposerThread(null)} threadId={composerThread} /> : null}
    </>
  );
}
