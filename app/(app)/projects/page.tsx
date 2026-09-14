"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { DecisionList } from "@/components/projects/decision-list";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { useApi } from "@/lib/query/api-provider";

export default function ProjectsPage() {
  const api = useApi();
  const projects = useQuery({ queryKey: ["projects"], queryFn: () => api.projects() });
  const decisions = useQuery({ queryKey: ["decisions"], queryFn: () => api.decisions() });
  return (
    <>
      <PageHeader title="Projects" summary="Threads, people, decisions, and files grouped by workstream." />
      <div className="mx-auto grid max-w-5xl gap-3 p-4 lg:p-8">
        {projects.isLoading ? <SkeletonList rows={4} /> : projects.data?.map((project) => (
          <article key={project.id} className="rounded-md border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{project.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
                <span><b className="block text-sm text-foreground">{project.openCommitments ?? 0}</b>Open</span>
                <span><b className="block text-sm text-foreground">{project.waiting ?? 0}</b>Waiting</span>
                <span><b className="block text-sm text-foreground">{project.decisions ?? 0}</b>Decisions</span>
              </div>
            </div>
            <div className="mt-4">
              <DecisionList decisions={(decisions.data ?? []).filter((decision) => decision.projectId === project.id)} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
