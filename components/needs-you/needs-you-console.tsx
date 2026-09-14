"use client";

import Link from "next/link";
import { ArrowRight, Building2, FileCheck2, FlaskConical, GitBranch, ShieldCheck } from "lucide-react";
import { PriorityBadge } from "@/components/ai/priority-badge";
import { SourceCitation } from "@/components/ai/source-citation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CompanyMemory, ConflictSignal, NeedsYouResponse, PolicyRule, ShadowModeReport, SmartAttachment, WorkflowSimulation } from "@/types/domain";

export function NeedsYouConsole({
  needsYou,
  policies,
  shadowMode,
  simulations,
  companies,
  conflicts,
  attachments
}: {
  needsYou: NeedsYouResponse;
  policies: PolicyRule[];
  shadowMode: ShadowModeReport;
  simulations: WorkflowSimulation[];
  companies: CompanyMemory[];
  conflicts: ConflictSignal[];
  attachments: SmartAttachment[];
}) {
  const metrics = [
    ["Approvals", needsYou.metrics.approvals],
    ["Ambiguous decisions", needsYou.metrics.ambiguousDecisions],
    ["Overdue commitments", needsYou.metrics.overdueCommitments],
    ["Customer escalations", needsYou.metrics.customerEscalations],
    ["Relationship risks", needsYou.metrics.relationshipRisks],
    ["AI handled today", needsYou.metrics.aiHandledToday],
    ["AI prepared", needsYou.metrics.aiPrepared],
    ["Waiting", needsYou.metrics.waiting],
    ["Completed", needsYou.metrics.completed],
    ["Loops closed", needsYou.metrics.loopsClosed]
  ] as const;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-4 lg:p-8">
      <section className="rounded-md border border-border bg-surface p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Exception console</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage judgment calls while SmartEmail handles routine work under policy.</p>
          </div>
          <Badge tone="success">{needsYou.metrics.loopsClosed} loops closed</Badge>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-md border border-border bg-background p-3">
              <div className="text-lg font-semibold">{value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface px-3 py-2">
        <h2 className="border-b border-border py-2 text-sm font-semibold">Needs You</h2>
        <div>
          {needsYou.items.map((item) => (
            <article key={item.id} className="grid gap-3 border-b border-border py-3 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={item.priority} />
                  <Badge>{item.type.replace("_", " ")}</Badge>
                  <span className="text-xs text-muted-foreground">{item.subject}</span>
                </div>
                <h3 className="mt-1 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.evidence.map((source) => <SourceCitation key={`${item.id}-${source.emailId}`} source={source} />)}
                </div>
              </div>
              <Button asChild size="sm">
                <Link href={item.href}>
                  {item.cta}
                  <ArrowRight size={14} aria-hidden />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <ShadowModePanel report={shadowMode} />
        <PolicyPanel policies={policies} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SimulationPanel simulations={simulations} />
        <ConflictPanel conflicts={conflicts} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CompanyPanel companies={companies} />
        <AttachmentPanel attachments={attachments} />
      </div>
    </div>
  );
}

function PolicyPanel({ policies }: { policies: PolicyRule[] }) {
  return (
    <section className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-success" aria-hidden />
        <h2 className="text-sm font-semibold">Policy engine</h2>
      </div>
      <div className="mt-3 grid gap-2">
        {policies.map((policy) => (
          <div key={policy.id} className="rounded-md border border-border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">{policy.name}</span>
              <Badge tone={policy.requireApproval ? "warning" : "success"}>{policy.requireApproval ? "Approval" : "Autonomous"}</Badge>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{policy.action} - {policy.condition} - level {policy.autonomyLevel}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShadowModePanel({ report }: { report: ShadowModeReport }) {
  const numbers = [
    ["Archived", report.simulated.archived],
    ["Drafts", report.simulated.draftsPrepared],
    ["Tasks", report.simulated.tasksCreated],
    ["Follow-ups", report.simulated.followupsSent],
    ["Escalated", report.simulated.escalated]
  ] as const;

  return (
    <section className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <GitBranch size={16} className="text-accent" aria-hidden />
        <h2 className="text-sm font-semibold">Shadow mode</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{report.summary}</p>
      <div className="mt-3 grid grid-cols-5 gap-2 text-center">
        {numbers.map(([label, value]) => (
          <div key={label} className="rounded-md border border-border bg-background px-2 py-2">
            <div className="text-sm font-semibold">{value}</div>
            <div className="text-[11px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2">
        {report.examples.map((example) => (
          <div key={example.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 text-sm">
            <span>{example.title}</span>
            <span className="text-muted-foreground">{example.outcome}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SimulationPanel({ simulations }: { simulations: WorkflowSimulation[] }) {
  return (
    <section className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <FlaskConical size={16} className="text-accent" aria-hidden />
        <h2 className="text-sm font-semibold">Workflow simulation</h2>
      </div>
      <div className="mt-3 grid gap-2">
        {simulations.map((simulation) => (
          <article key={simulation.id} className="rounded-md border border-border bg-background p-3">
            <div className="text-sm font-medium">{simulation.rule}</div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs text-muted-foreground">
              <span><b className="block text-sm text-foreground">{simulation.triggered}</b>Triggered</span>
              <span><b className="block text-sm text-foreground">{simulation.correct}</b>Correct</span>
              <span><b className="block text-sm text-foreground">{simulation.manualReview}</b>Review</span>
              <span><b className="block text-sm text-foreground">{simulation.potentialMistakes}</b>Risk</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{simulation.recommendation}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ConflictPanel({ conflicts }: { conflicts: ConflictSignal[] }) {
  return (
    <section className="rounded-md border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold">Conflict detection</h2>
      <div className="mt-3 grid gap-2">
        {conflicts.map((conflict) => (
          <article key={conflict.id} className="rounded-md border border-border bg-background p-3">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={conflict.priority} />
              <span className="text-sm font-medium">{conflict.title}</span>
            </div>
            <div className="mt-2 grid gap-1">
              {conflict.values.map((value) => (
                <div key={`${conflict.id}-${value.sourceName}`} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">{value.sourceName}</span>
                  <span>{value.value}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{conflict.suggestedResolution}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CompanyPanel({ companies }: { companies: CompanyMemory[] }) {
  return (
    <section className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <Building2 size={16} className="text-accent" aria-hidden />
        <h2 className="text-sm font-semibold">Company memory</h2>
      </div>
      <div className="mt-3 grid gap-2">
        {companies.map((company) => (
          <article key={company.id} className="rounded-md border border-border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium">{company.name}</div>
                <div className="text-xs text-muted-foreground">{company.relationship} - {company.people} people - {company.openConversations} conversations</div>
              </div>
              {company.potentialDeal ? <Badge tone="accent">{company.potentialDeal}</Badge> : null}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {company.requested.map((request) => <Badge key={request}>{request}</Badge>)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{company.suggestedAction}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AttachmentPanel({ attachments }: { attachments: SmartAttachment[] }) {
  return (
    <section className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <FileCheck2 size={16} className="text-success" aria-hidden />
        <h2 className="text-sm font-semibold">Smart attachments</h2>
      </div>
      <div className="mt-3 grid gap-2">
        {attachments.map((attachment) => (
          <article key={attachment.id} className="rounded-md border border-border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">{attachment.fileName}</span>
              <Badge tone={attachment.confidence === "high" ? "success" : "warning"}>{attachment.confidence} confidence</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{attachment.reason}</p>
            <div className="mt-2 text-xs text-muted-foreground">{attachment.source} - approval required</div>
          </article>
        ))}
      </div>
    </section>
  );
}
