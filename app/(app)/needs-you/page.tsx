"use client";

import { useQuery } from "@tanstack/react-query";
import { NeedsYouConsole } from "@/components/needs-you/needs-you-console";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { useApi } from "@/lib/query/api-provider";

export default function NeedsYouPage() {
  const api = useApi();
  const needsYou = useQuery({ queryKey: ["needs-you"], queryFn: () => api.needsYou() });
  const policies = useQuery({ queryKey: ["policies"], queryFn: () => api.policies() });
  const shadowMode = useQuery({ queryKey: ["shadow-mode"], queryFn: () => api.shadowMode() });
  const simulations = useQuery({ queryKey: ["simulations"], queryFn: () => api.simulations() });
  const companies = useQuery({ queryKey: ["companies"], queryFn: () => api.companies() });
  const conflicts = useQuery({ queryKey: ["conflicts"], queryFn: () => api.conflicts() });
  const attachments = useQuery({ queryKey: ["smart-attachments"], queryFn: () => api.smartAttachments() });

  const loading = needsYou.isLoading || policies.isLoading || shadowMode.isLoading || simulations.isLoading || companies.isLoading || conflicts.isLoading || attachments.isLoading;
  const error = needsYou.isError || policies.isError || shadowMode.isError || simulations.isError || companies.isError || conflicts.isError || attachments.isError;

  return (
    <>
      <PageHeader
        eyebrow="AI Chief of Staff"
        title="Needs You"
        summary="Approvals, conflicts, overdue loops, relationship risks, and policy decisions."
      />
      {loading ? <div className="mx-auto max-w-6xl p-4 lg:p-8"><SkeletonList rows={12} /></div> : null}
      {error ? <div className="mx-auto max-w-6xl p-4 lg:p-8"><ErrorState title="Needs You could not load." body="The backend exception console is unavailable. Retry after the API reconnects." onRetry={() => void needsYou.refetch()} /></div> : null}
      {needsYou.data && policies.data && shadowMode.data && simulations.data && companies.data && conflicts.data && attachments.data ? (
        <NeedsYouConsole
          needsYou={needsYou.data}
          policies={policies.data}
          shadowMode={shadowMode.data}
          simulations={simulations.data}
          companies={companies.data}
          conflicts={conflicts.data}
          attachments={attachments.data}
        />
      ) : null}
    </>
  );
}
