"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";

export default function PersonDetailPage() {
  const params = useParams<{ id: string }>();
  return (
    <>
      <PageHeader title={params.id.includes("sarah") ? "Sarah Chen" : "Person"} summary="Partner - Acme Ventures" />
      <div className="mx-auto grid max-w-5xl gap-5 p-4 lg:p-8">
        <section className="grid gap-3 md:grid-cols-4">
          {["Last interaction Sep 7", "12 conversations", "1 open commitment", "1 waiting item"].map((item) => <div key={item} className="rounded-md border border-border bg-surface p-4 text-sm font-medium">{item}</div>)}
        </section>
        <section className="rounded-md border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold">Timeline</h2>
          {["Sep 7 - Sarah requested revised deck", "Sep 4 - You sent metrics", "Sep 3 - Partner meeting", "Aug 24 - You sent deck", "Aug 20 - First meeting"].map((event) => <div key={event} className="border-b border-border py-3 text-sm last:border-b-0"><Badge>{event.split(" - ")[0]}</Badge> <span className="ml-2">{event.split(" - ")[1]}</span></div>)}
        </section>
      </div>
    </>
  );
}
