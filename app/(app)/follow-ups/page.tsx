"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { Composer } from "@/components/actions/composer";
import { FollowupRow } from "@/components/commitments/followup-row";
import { PageHeader } from "@/components/layout/page-header";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { useApi } from "@/lib/query/api-provider";

export default function FollowUpsPage() {
  const api = useApi();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [view, setView] = useState<"active" | "scheduled" | "dismissed">("active");
  const followups = useQuery({ queryKey: ["followups", view], queryFn: () => api.followups(view === "active" ? undefined : view) });
  return (
    <>
      <PageHeader title="Follow-ups" summary="Recommended next touches, kept approval-first." />
      <div className="mx-auto grid max-w-6xl gap-4 p-4 lg:p-8">
        <label className="flex items-center gap-2 text-sm">View
          <select className="min-h-10 rounded border border-border bg-background px-3" value={view} onChange={event => setView(event.target.value as typeof view)}>
            <option value="active">Ready now</option><option value="scheduled">Scheduled</option><option value="dismissed">Dismissed</option>
          </select>
        </label>
        <section className="rounded-md border border-border bg-surface px-3 py-2">
          {followups.isLoading ? <SkeletonList rows={6} /> : followups.data?.map((item) => <FollowupRow key={item.id} followup={item} onDraft={(next) => setThreadId(next.threadId)} />)}
          {followups.isError && <ErrorState title="Follow-ups could not load" body="Please retry. No changes have been confirmed." onRetry={() => void followups.refetch()} />}
          {followups.data?.length === 0 && <p className="py-6 text-sm text-muted-foreground">No {view === "active" ? "follow-ups ready now" : `${view} follow-ups`}.</p>}
        </section>
      </div>
      {threadId ? <Composer open={Boolean(threadId)} onOpenChange={(open) => !open && setThreadId(null)} threadId={threadId} intent="follow-up" /> : null}
    </>
  );
}
