"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Inbox, MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Composer } from "@/components/actions/composer";
import { ExecutionWorkflowCard } from "@/components/actions/execution-workflow-card";
import { DailyBriefCard } from "@/components/ai/daily-brief-card";
import { ExecutionGraphStrip } from "@/components/ai/execution-graph-strip";
import { SmartContextPanel } from "@/components/ai/smart-context-panel";
import { CommitmentRow } from "@/components/commitments/commitment-row";
import { FollowupRow } from "@/components/commitments/followup-row";
import { WaitingRow } from "@/components/commitments/waiting-row";
import { ThreadPreview } from "@/components/email/thread-preview";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { useApi } from "@/lib/query/api-provider";
import { useSession } from "@/lib/auth/session";
import type { Commitment, FollowUp } from "@/types/domain";
import type { ExecutionWorkflow } from "@/types/domain";

export default function TodayPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [selected, setSelected] = useState<Commitment | null>(null);
  const [composerThread, setComposerThread] = useState<string | null>(null);
  const today = useQuery({ queryKey: ["today"], queryFn: () => api.today() });
  const brief = useQuery({ queryKey: ["daily-brief"], queryFn: () => api.dailyBrief() });
  const graph = useQuery({ queryKey: ["execution-graph"], queryFn: () => api.executionGraph() });
  const workflows = useQuery({ queryKey: ["workflows"], queryFn: () => api.workflows() });
  const complete = useMutation({
    mutationFn: (item: Commitment) => api.updateCommitment(item.id, { status: "completed" }),
    onSuccess: async () => {
      toast.success("Commitment completed");
      await queryClient.invalidateQueries({ queryKey: ["today"] });
    }
  });
  const approveWorkflow = useMutation({
    mutationFn: (workflow: ExecutionWorkflow) => api.approveWorkflow(workflow.id),
    onSuccess: async () => {
      toast.success("Workflow completed");
      await queryClient.invalidateQueries({ queryKey: ["workflows"] });
      await queryClient.invalidateQueries({ queryKey: ["activity"] });
    }
  });

  const attention = today.data ? today.data.summary.dueToday + today.data.summary.overdue + today.data.summary.waiting + today.data.summary.followups + today.data.summary.importantUnread : 0;

  return (
    <>
      <PageHeader
        eyebrow={`Good afternoon, ${user?.name ?? "Somesh"}`}
        title="Today"
        summary={`${attention || 5} things need your attention - ${format(new Date(), "EEEE, MMMM d")}`}
      />
      <div className="mx-auto grid min-w-0 max-w-6xl grid-cols-1 gap-6 p-4 lg:p-8">
        {today.isLoading ? <SkeletonList rows={10} /> : null}
        {today.isError ? <ErrorState title="Today could not load." body="Your backend may be offline. Demo mode will keep seeded data available when enabled." onRetry={() => void today.refetch()} /> : null}
        {today.data ? (
          <>
            {brief.data ? <DailyBriefCard brief={brief.data} /> : null}
            <Section title="Needs You">
              {workflows.isLoading ? <SkeletonList rows={2} /> : workflows.data?.map((workflow) => <ExecutionWorkflowCard key={workflow.id} workflow={workflow} approving={approveWorkflow.isPending} onApprove={approveWorkflow.mutate} />)}
            </Section>
            {graph.data ? <ExecutionGraphStrip graph={graph.data} /> : null}
            <Section title="Due today">
              {today.data.items.dueToday.length ? today.data.items.dueToday.map((item) => <CommitmentRow key={item.id} commitment={item} onOpen={setSelected} onDraft={(next) => setComposerThread(next.threadId)} onComplete={(next) => complete.mutate(next)} />) : <EmptyState icon={MailCheck} title="Nothing due right now." body="SmartEmail will surface promises and deadlines from your conversations." />}
            </Section>
            <Section title="Overdue">
              {today.data.items.overdue.map((item) => <CommitmentRow key={item.id} commitment={item} onOpen={setSelected} onDraft={(next) => setComposerThread(next.threadId)} onComplete={(next) => complete.mutate(next)} />)}
            </Section>
            <Section title="Waiting on">
              {today.data.items.waiting.map((item) => <WaitingRow key={item.id} item={item} onOpen={setSelected} onDraft={(next) => setComposerThread(next.threadId)} />)}
            </Section>
            <Section title="Follow-ups">
              {today.data.items.followups.map((item: FollowUp) => <FollowupRow key={item.id} followup={item} onDraft={(next) => setComposerThread(next.threadId)} onDismiss={() => toast.success("Follow-up moved to later")} />)}
            </Section>
            <Section title="Important unread">
              {today.data.items.importantUnread.map((email) => <ThreadPreview key={email.id} email={email} />)}
            </Section>
          </>
        ) : null}
      </div>
      {selected ? <SmartContextPanel commitment={selected} onClose={() => setSelected(null)} onDraft={() => setComposerThread(selected.threadId)} /> : null}
      {composerThread ? <Composer open={Boolean(composerThread)} onOpenChange={(open) => !open && setComposerThread(null)} threadId={composerThread} /> : null}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-border bg-surface px-3 py-2">
      <div className="flex items-center gap-2 border-b border-border py-2">
        <Inbox size={14} className="text-muted-foreground" aria-hidden />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}
