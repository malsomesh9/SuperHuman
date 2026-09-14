import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ title = "Something went wrong.", body, onRetry }: { title?: string; body?: string; onRetry?: () => void }) {
  return (
    <section className="rounded-md border border-danger/30 bg-danger/5 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 text-danger" size={18} aria-hidden />
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {body ? <p className="mt-1 text-sm text-muted-foreground">{body}</p> : null}
          {onRetry ? <Button className="mt-3" size="sm" variant="outline" onClick={onRetry}>Try again</Button> : null}
        </div>
      </div>
    </section>
  );
}
