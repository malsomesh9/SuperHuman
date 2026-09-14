"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ActionApprovalCard } from "@/components/actions/action-approval-card";
import { ExecutionWorkflowCard } from "@/components/actions/execution-workflow-card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { useApi } from "@/lib/query/api-provider";
import type { ExecutionWorkflow } from "@/types/domain";
import type { SmartAction } from "@/types/domain";

export default function ActionsPage() {
  const api = useApi();
  const queryClient = useQueryClient();
  const actions = useQuery({ queryKey: ["actions"], queryFn: () => api.actions() });
  const workflows = useQuery({ queryKey: ["workflows"], queryFn: () => api.workflows() });
  const approve = useMutation({
    mutationFn: (action: SmartAction) => api.approveAction(action.id),
    onSuccess: async () => {
      toast.success("Action approved");
      await queryClient.invalidateQueries({ queryKey: ["actions"] });
    }
  });
  const reject = useMutation({
    mutationFn: (action: SmartAction) => api.rejectAction(action.id),
    onSuccess: async () => {
      toast.success("Action rejected");
      await queryClient.invalidateQueries({ queryKey: ["actions"] });
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
  const pending = (actions.data ?? []).filter((action) => action.status === "pending_approval");

  return (
    <>
      <PageHeader title="Approvals" summary="Execution workflows and AI-prepared actions awaiting approval." />
      <div className="mx-auto grid max-w-5xl gap-6 p-4 lg:p-8">
        <section className="grid gap-3">
          <h2 className="text-sm font-semibold">Verified execution</h2>
          {workflows.isLoading ? <SkeletonList rows={3} /> : workflows.data?.map((workflow) => <ExecutionWorkflowCard key={workflow.id} workflow={workflow} approving={approveWorkflow.isPending} onApprove={approveWorkflow.mutate} />)}
        </section>
        <section className="grid gap-3">
          <h2 className="text-sm font-semibold">Prepared drafts</h2>
        {actions.isLoading ? <SkeletonList rows={4} /> : pending.length ? pending.map((action) => <ActionApprovalCard key={action.id} action={action} onApprove={approve.mutate} onReject={reject.mutate} />) : <EmptyState title="No actions need approval." body="Prepared drafts and sensitive sends will appear here." />}
        </section>
      </div>
    </>
  );
}
