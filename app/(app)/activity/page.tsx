"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { formatSmartDate } from "@/lib/utils/date";
import { useApi } from "@/lib/query/api-provider";

export default function ActivityPage() {
  const api = useApi();
  const audit = useQuery({ queryKey: ["activity"], queryFn: () => api.audit() });
  return (
    <>
      <PageHeader title="Activity" summary="Audit trail for sync, AI detections, drafts, and approvals." />
      <div className="mx-auto max-w-4xl p-4 lg:p-8">
        <section className="rounded-md border border-border bg-surface px-3 py-2">
          {audit.isLoading ? <SkeletonList rows={6} /> : audit.data?.map((item) => (
            <div key={item.id} className="grid grid-cols-[96px_1fr] gap-3 border-b border-border py-3 text-sm last:border-b-0">
              <time className="text-xs text-muted-foreground">{formatSmartDate(item.createdAt)}</time>
              <span>{item.action.replaceAll(".", " ")}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
