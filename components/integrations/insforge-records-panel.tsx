"use client";

import { useQuery } from "@tanstack/react-query";
import { Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { listUserRecords } from "@/lib/insforge/user-records";
import { useSession } from "@/lib/auth/session";

export function InsForgeRecordsPanel() {
  const { token } = useSession();
  const records = useQuery({
    queryKey: ["insforge-user-records"],
    queryFn: listUserRecords,
    enabled: token === "insforge-session",
    retry: 1
  });

  if (token !== "insforge-session") return <p className="text-sm text-muted-foreground">Demo data is separate from your personal SmartEmail account.</p>;
  if (records.isLoading) return <SkeletonList rows={3} />;

  if (records.isError) {
    return (
      <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
        InsForge data is not available for this session. Sign in with email to create user-owned records.
      </div>
    );
  }

  const grouped = (records.data ?? []).reduce<Record<string, number>>((acc, record) => {
    acc[record.record_type] = (acc[record.record_type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Database size={16} className="text-success" aria-hidden />
          InsForge connected
        </div>
        <Badge tone="success">{records.data?.length ?? 0} user records</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(grouped).map(([type, count]) => (
          <Badge key={type}>{type}: {count}</Badge>
        ))}
      </div>
      <div className="grid gap-2">
        {(records.data ?? []).slice(0, 4).map((record) => (
          <div key={record.id} className="rounded-md border border-border bg-background p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={record.priority === "critical" ? "danger" : record.priority === "high" ? "warning" : "neutral"}>{record.priority}</Badge>
              <span className="text-sm font-medium">{record.title}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{record.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
