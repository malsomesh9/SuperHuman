import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SyncPage() {
  const steps = [
    ["done", "Account connected"],
    ["done", "1,204 messages indexed"],
    ["done", "86 people identified"],
    ["active", "Finding commitments"],
    ["next", "Preparing first insights"]
  ] as const;
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <section className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-fine">
        <h1 className="text-2xl font-semibold">Connecting Gmail</h1>
        <div className="mt-5 grid gap-3">
          {steps.map(([state, label]) => <div key={label} className="flex items-center gap-3 text-sm">{state === "done" ? <CheckCircle2 size={17} className="text-success" /> : <Circle size={17} className={state === "active" ? "text-accent" : "text-muted-foreground"} />}<span>{label}</span></div>)}
        </div>
        <div className="mt-6 rounded-md border border-border bg-background p-4">
          <h2 className="text-sm font-semibold">We found 5 things you may have forgotten.</h2>
          <p className="mt-1 text-sm text-muted-foreground">Proposal due today, contract follow-up, hiring scorecard, overdue invoice, and an unanswered investor thread.</p>
        </div>
        <Button asChild className="mt-5 w-full"><Link href="/today">Open SmartEmail</Link></Button>
      </section>
    </main>
  );
}
