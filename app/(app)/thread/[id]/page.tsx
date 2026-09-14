"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Composer } from "@/components/actions/composer";
import { SmartContextPanel } from "@/components/ai/smart-context-panel";
import { ThreadMessage } from "@/components/email/thread-message";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { useApi } from "@/lib/query/api-provider";

export default function ThreadPage() {
  const api = useApi();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [composerOpen, setComposerOpen] = useState(false);
  const thread = useQuery({ queryKey: ["thread", params.id], queryFn: () => api.thread(params.id) });
  const sourceId = searchParams.get("source");
  const highlight = thread.data?.commitments?.find((item) => item.sourceEmailId === sourceId)?.source?.excerpt;

  return (
    <>
      <PageHeader title={thread.data?.subject ?? "Thread"} summary={thread.data?.summary ?? "Conversation context and next action."} action={<Button onClick={() => setComposerOpen(true)}>Draft reply</Button>} />
      <div className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:p-8">
        <section className="grid gap-3">
          {thread.isLoading ? <SkeletonList rows={5} /> : thread.data?.emails?.map((email) => <ThreadMessage key={email.id} email={email} {...(email.id === sourceId && highlight ? { highlight } : {})} />)}
        </section>
        <div className="hidden lg:block">
          {thread.data ? <SmartContextPanel thread={thread.data} onDraft={() => setComposerOpen(true)} /> : null}
        </div>
      </div>
      <Composer open={composerOpen} onOpenChange={setComposerOpen} threadId={params.id} />
    </>
  );
}
