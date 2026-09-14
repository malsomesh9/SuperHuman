"use client";

import { AlertTriangle, CheckCircle2, Loader2, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ConnectorHealth as ConnectorHealthType, ConnectorStatus } from "@/types/domain";

const statusCopy: Record<ConnectorStatus, string> = {
  connected: "Connected",
  syncing: "Syncing",
  needs_attention: "Needs attention",
  disabled: "Disabled"
};

const statusTone: Record<ConnectorStatus, "success" | "accent" | "warning" | "neutral"> = {
  connected: "success",
  syncing: "accent",
  needs_attention: "warning",
  disabled: "neutral"
};

const statusIcon = {
  connected: CheckCircle2,
  syncing: Loader2,
  needs_attention: AlertTriangle,
  disabled: MinusCircle
};

export function ConnectorHealth({ connectors }: { connectors: ConnectorHealthType[] }) {
  return (
    <div className="grid gap-2">
      {connectors.map((connector) => {
        const Icon = statusIcon[connector.status];
        return (
          <div key={connector.id} className="grid gap-3 rounded-md border border-border bg-background p-3 md:grid-cols-[1fr_auto] md:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Icon size={15} className={connector.status === "syncing" ? "animate-spin text-accent" : undefined} aria-hidden />
                <span className="text-sm font-medium">{connector.name}</span>
                <Badge tone={statusTone[connector.status]}>{statusCopy[connector.status]}</Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {connector.recordsIndexed.toLocaleString()} records indexed - {connector.scopes.join(", ")}
              </div>
              {connector.issue ? <div className="mt-1 text-xs text-warning">{connector.issue}</div> : null}
            </div>
            <div className="text-xs text-muted-foreground">{connector.lastSyncAt ? `Last sync ${new Date(connector.lastSyncAt).toLocaleString()}` : "Not synced"}</div>
          </div>
        );
      })}
    </div>
  );
}
