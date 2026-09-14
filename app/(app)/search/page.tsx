"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { SourceCitation } from "@/components/ai/source-citation";
import { ThreadPreview } from "@/components/email/thread-preview";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";
import { useApi } from "@/lib/query/api-provider";
import type { EmailSource } from "@/types/domain";

const examples = ["What do I owe people?", "Who should I follow up with?", "What am I waiting on from Acme?", "What did Sarah say about pricing?"];

export default function SearchPage() {
  const api = useApi();
  const [query, setQuery] = useState("");
  const search = useMutation({ mutationFn: (value: string) => api.search(value) });
  return (
    <>
      <PageHeader title="Search" summary="Ask your inbox. Answers include source emails." />
      <div className="mx-auto grid max-w-4xl gap-5 p-4 lg:p-8">
        <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); if (query.trim()) search.mutate(query); }}>
          <SearchBar value={query} onChange={setQuery} placeholder="Ask your inbox..." className="flex-1" />
          <Button type="submit" disabled={search.isPending}>{search.isPending ? "Searching..." : "Ask"}</Button>
        </form>
        {!search.data ? (
          <section className="rounded-md border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold">Ask anything about your inbox.</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {examples.map((example) => <button key={example} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted" onClick={() => { setQuery(example); search.mutate(example); }}>{example}</button>)}
            </div>
          </section>
        ) : (
          <section className="grid gap-4">
            <div className="rounded-md border border-border bg-surface p-4">
              <h2 className="text-sm font-semibold">Answer</h2>
              <p className="mt-2 text-sm leading-6">{search.data.answer}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {search.data.sources.map((source, index) => "emailId" in source ? <SourceCitation key={source.emailId} source={source as EmailSource} /> : <Link key={index} className="text-xs underline" href={`/thread/${source.threadId}`}>{source.action}</Link>)}
              </div>
            </div>
            <div className="rounded-md border border-border bg-surface px-3 py-2">
              <h2 className="border-b border-border py-2 text-sm font-semibold">Sources</h2>
              {search.data.threads.map((thread) => <ThreadPreview key={thread.id} thread={thread} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
