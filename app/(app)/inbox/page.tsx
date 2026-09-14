"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ThreadPreview } from "@/components/email/thread-preview";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { SearchBar } from "@/components/ui/search-bar";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { useApi } from "@/lib/query/api-provider";
import { useSession } from "@/lib/auth/session";
import { GmailMailbox } from "@/components/email/gmail-mailbox";

type InboxFilter = "all" | "needs_action" | "waiting" | "important";

export default function InboxPage() {
  const { token } = useSession();
  return token === "insforge-session" ? <GmailMailbox /> : <DemoInbox />;
}

function DemoInbox() {
  const api = useApi();
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [query, setQuery] = useState("");
  const emails = useQuery({ queryKey: ["inbox"], queryFn: () => api.emails() });
  const filtered = useMemo(() => (emails.data ?? []).filter((email) => {
    const matchesQuery = `${email.fromName} ${email.subject} ${email.snippet}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "important" ? email.importance === "high" : email.labels.includes(filter));
    return matchesQuery && matchesFilter;
  }), [emails.data, filter, query]);

  return (
    <>
      <PageHeader title="Inbox" summary="Optimized for action, priority, and relationship." />
      <div className="mx-auto grid max-w-6xl gap-4 p-4 lg:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <FilterBar value={filter} onChange={setFilter} options={[{ label: "All", value: "all" }, { label: "Needs action", value: "needs_action" }, { label: "Waiting", value: "waiting" }, { label: "Important", value: "important" }]} />
          <SearchBar value={query} onChange={setQuery} placeholder="Search inbox..." className="md:w-80" />
        </div>
        <section className="rounded-md border border-border bg-surface px-3 py-2">
          {emails.isLoading ? <SkeletonList rows={8} /> : filtered.map((email) => <ThreadPreview key={email.id} email={email} />)}
        </section>
      </div>
    </>
  );
}
