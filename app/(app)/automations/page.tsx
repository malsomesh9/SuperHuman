"use client";

import { Workflow } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AutomationsPage() {
  const rules = [
    ["Invoice is overdue by 7 days", "Prepare follow-up email", "Approval required"],
    ["Investor has not replied for 5 days", "Suggest follow-up", "Approval required"],
    ["Customer asks about security", "Prepare SOC 2 response", "Approval required"]
  ];
  return (
    <>
      <PageHeader title="Automations" summary="Rules that prepare work, with approval controls." />
      <div className="mx-auto grid max-w-5xl gap-4 p-4 lg:p-8">
        <section className="rounded-md border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold">Mode</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {["Suggest only", "Prepare actions", "Autopilot"].map((mode) => <button key={mode} className={mode === "Prepare actions" ? "rounded-md border border-foreground bg-background p-3 text-left text-sm font-medium" : "rounded-md border border-border p-3 text-left text-sm text-muted-foreground"}>{mode}</button>)}
          </div>
        </section>
        <section className="rounded-md border border-border bg-surface px-3 py-2">
          <h2 className="border-b border-border py-2 text-sm font-semibold">Rules</h2>
          {rules.map(([when, then, approval]) => <article key={when} className="grid gap-3 border-b border-border py-3 last:border-b-0 md:grid-cols-[1fr_1fr_auto] md:items-center"><div><Badge>When</Badge><p className="mt-1 text-sm">{when}</p></div><div><Badge>Then</Badge><p className="mt-1 text-sm">{then}</p></div><Button size="sm" variant="outline"><Workflow size={14} /> {approval}</Button></article>)}
        </section>
      </div>
    </>
  );
}
