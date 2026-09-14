"use client";

import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { ShieldCheck, Trash2 } from "lucide-react";
import { ConnectorHealth } from "@/components/integrations/connector-health";
import { InsForgeRecordsPanel } from "@/components/integrations/insforge-records-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/ui/filter-bar";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { useApi } from "@/lib/query/api-provider";
import { GmailAccounts } from "@/components/email/gmail-accounts";
import { useSession } from "@/lib/auth/session";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const api = useApi();
  const { token } = useSession();
  const connectors = useQuery({ queryKey: ["connectors"], queryFn: () => api.connectors() });

  return (
    <>
      <PageHeader title="Settings" summary="Account, connected inboxes, AI, privacy, security, and appearance." />
      <div className="mx-auto grid max-w-4xl gap-4 p-4 lg:p-8">
        <Panel title="InsForge account data">
          <InsForgeRecordsPanel />
        </Panel>
        <Panel title="Connected inboxes">
          {token === "insforge-session" && <GmailAccounts />}
          {connectors.isError ? <p role="status" className="text-sm text-muted-foreground">Gmail is not connected. Mailbox authorization must be configured before syncing or sending mail.</p> : connectors.isLoading ? <SkeletonList rows={3} /> : <ConnectorHealth connectors={connectors.data ?? []} />}
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" disabled title="Requires a connected Gmail account">Sync now</Button>
            <Button size="sm" variant="ghost" disabled>Manage permissions</Button>
          </div>
        </Panel>
        <Panel title="AI">
          <div className="grid gap-3">
            <Setting label="Draft style" value="Direct, friendly" />
            <Setting label="Commitment sensitivity" value="Balanced" />
            <Setting label="Follow-up timing" value="Business days" />
          </div>
        </Panel>
        <Panel title="Appearance">
          <FilterBar value={(theme ?? "system") as "light" | "dark" | "system"} onChange={(next) => setTheme(next)} options={[{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }, { label: "System", value: "system" }]} />
        </Panel>
        <Panel title="Privacy and data">
          <div className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><ShieldCheck size={16} /> Mailbox sending and data management require a connected account.</div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" variant="outline" disabled>Create export</Button>
              <Button size="sm" variant="destructive" disabled><Trash2 size={14} /> Delete SmartEmail data</Button>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-md border border-border bg-surface p-4"><h2 className="mb-3 text-sm font-semibold">{title}</h2>{children}</section>;
}

function Setting({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-b-0"><span>{label}</span><span className="text-muted-foreground">{value}</span></div>;
}
