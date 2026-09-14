import Link from "next/link";
import { ArrowRight, CheckCircle2, Lock, MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid min-h-screen max-w-6xl gap-10 px-5 py-8 lg:grid-cols-[1fr_520px] lg:items-center">
        <div>
          <div className="mb-6 inline-flex rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">AI-native email execution</div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal md:text-6xl">Your inbox remembers messages. SmartEmail remembers what needs to happen.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">SmartEmail finds commitments, deadlines, follow-ups, and things you are waiting on, then helps you close the loop with approval-first AI actions.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link href="/signup">Start with SmartEmail <ArrowRight size={16} /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/today">Watch demo</Link></Button>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-drawer">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <div className="text-sm font-semibold">Today</div>
              <div className="text-xs text-muted-foreground">5 things need your attention</div>
            </div>
            <MailCheck size={18} className="text-accent" />
          </div>
          {[
            ["You owe", "Send revised pitch deck to Sarah", "Due today"],
            ["Waiting on", "Investment decision from Acme", "Waiting 4 days"],
            ["Follow-up", "Proposal sent Sep 1", "Suggested today"],
            ["Approval", "AI prepared Sarah follow-up", "Needs approval"]
          ].map(([kind, title, meta]) => (
            <div key={title} className="grid grid-cols-[92px_1fr_auto] items-center gap-3 border-b border-border py-3 last:border-b-0">
              <span className="text-xs font-medium text-muted-foreground">{kind}</span>
              <span className="min-w-0 truncate text-sm">{title}</span>
              <span className="text-xs text-muted-foreground">{meta}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="border-t border-border bg-surface px-5 py-10">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          <TrustItem icon={ShieldCheck} title="Approval before sending" />
          <TrustItem icon={Lock} title="Cited source emails" />
          <TrustItem icon={CheckCircle2} title="User-controlled deletion" />
        </div>
      </section>
    </main>
  );
}

function TrustItem({ icon: Icon, title }: { icon: typeof ShieldCheck; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-background p-4">
      <Icon size={18} className="text-accent" />
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}
