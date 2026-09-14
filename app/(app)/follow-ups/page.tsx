"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Composer } from "@/components/actions/composer";
import { FollowupRow } from "@/components/commitments/followup-row";
import { PageHeader } from "@/components/layout/page-header";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { useApi } from "@/lib/query/api-provider";

export default function FollowUpsPage() {
  const api = useApi();
  const [threadId, setThreadId] = useState<string | null>(null);
  const followups = useQuery({ queryKey: ["followups"], queryFn: () => api.followups() });
  return (
    <>
      <PageHeader title="Follow-ups" summary="Recommended next touches, kept approval-first." />
      <div className="mx-auto grid max-w-6xl gap-4 p-4 lg:p-8">
        <section className="rounded-md border border-border bg-surface px-3 py-2">
          {followups.isLoading ? <SkeletonList rows={6} /> : followups.data?.map((item) => <FollowupRow key={item.id} followup={item} onDraft={(next) => setThreadId(next.threadId)} onDismiss={() => toast.success("Follow-up dismissed")} />)}
        </section>
      </div>
      {threadId ? <Composer open={Boolean(threadId)} onOpenChange={(open) => !open && setThreadId(null)} threadId={threadId} intent="follow-up" /> : null}
    </>
  );
}
