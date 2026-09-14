"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PersonAvatar } from "@/components/people/person-avatar";
import { PageHeader } from "@/components/layout/page-header";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { formatSmartDate } from "@/lib/utils/date";
import { useApi } from "@/lib/query/api-provider";

export default function PeoplePage() {
  const api = useApi();
  const people = useQuery({ queryKey: ["people"], queryFn: () => api.people() });
  return (
    <>
      <PageHeader title="People" summary="Relationships, open items, and last interactions." />
      <div className="mx-auto p-4 lg:p-8">
        <section className="rounded-md border border-border bg-surface px-3 py-2">
          {people.isLoading ? <SkeletonList rows={8} /> : people.data?.map((person) => (
            <Link href={`/people/${person.id}`} key={person.id} className="grid gap-3 border-b border-border py-3 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-center gap-3">
                <PersonAvatar name={person.name} email={person.primaryEmail} />
                <div>
                  <div className="text-sm font-medium">{person.name ?? person.primaryEmail}</div>
                  <div className="text-xs text-muted-foreground">{person.company ?? person.relationshipType}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{formatSmartDate(person.lastInteractionAt)} - {person.interactionCount} conversations</div>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
