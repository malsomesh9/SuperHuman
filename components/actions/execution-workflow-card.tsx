"use client";

import { CheckCircle2, Circle, ShieldCheck, Zap } from "lucide-react";
import type { ExecutionWorkflow, WorkflowStepStatus } from "@/types/domain";
import { PriorityBadge } from "@/components/ai/priority-badge";
import { SourceCitation } from "@/components/ai/source-citation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const stepTone: Record<WorkflowStepStatus, string> = {
  pending: "text-muted-foreground",
  ready: "text-warning",
  running: "text-accent",
  completed: "text-success",
  blocked: "text-danger"
};

export function ExecutionWorkflowCard({ workflow, onApprove, approving }: { workflow: ExecutionWorkflow; onApprove: (workflow: ExecutionWorkflow) => void; approving?: boolean }) {
  const completed = workflow.status === "completed";
  return (
    <article className="rounded-md border border-accent/15 bg-accent/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={workflow.priority} />
            <span className="rounded-sm border border-accent/25 bg-accent/10 px-1.5 py-0.5 text-xs font-medium text-accent">Needs You</span>
          </div>
          <h2 className="mt-2 text-base font-semibold">{workflow.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{workflow.customer} - {workflow.outcome}</p>
          <div className="mt-2"><SourceCitation source={workflow.source} /></div>
        </div>
        <div className="rounded-md border border-border bg-surface p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground"><ShieldCheck size={14} /> Policy check</div>
          <div className="mt-1">Risk level {workflow.policy.riskLevel}</div>
          <div>Refund limit ${workflow.policy.maxAmount}</div>
          <div>{workflow.policy.approvalRequired ? "Approval required" : "Auto-approved"}</div>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        {workflow.steps.map((step) => (
          <div key={step.id} className="grid gap-2 rounded-md border border-border bg-surface p-3 md:grid-cols-[20px_1fr_auto] md:items-start">
            {step.status === "completed" ? <CheckCircle2 className="text-success" size={16} aria-hidden /> : <Circle className={cn("mt-0.5", stepTone[step.status])} size={16} aria-hidden />}
            <div>
              <div className="text-sm font-medium">{step.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{step.detail}</div>
            </div>
            {step.evidence ? <span className="text-xs text-muted-foreground">{step.evidence}</span> : null}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">{completed ? `Workflow completed in ${workflow.elapsedText}` : "6 manual steps ready after evidence and policy checks."}</div>
        <Button onClick={() => onApprove(workflow)} disabled={completed || approving}>
          <Zap size={14} />
          {completed ? "Completed" : approving ? "Executing..." : "Approve execution"}
        </Button>
      </div>
    </article>
  );
}
