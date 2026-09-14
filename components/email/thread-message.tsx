import type { Email } from "@/types/domain";
import { PersonAvatar } from "@/components/people/person-avatar";
import { formatSmartDate } from "@/lib/utils/date";

export function ThreadMessage({ email, highlight }: { email: Email; highlight?: string }) {
  const text = email.normalizedText ?? email.snippet ?? "";
  const parts = highlight && text.includes(highlight) ? text.split(highlight) : [text];
  return (
    <article className="rounded-md border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <PersonAvatar name={email.fromName} email={email.fromEmail} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium">{email.fromName ?? email.fromEmail}</div>
            <time className="text-xs text-muted-foreground">{formatSmartDate(email.receivedAt)}</time>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
            {parts.length === 1 ? text : <>{parts[0]}<mark className="rounded bg-warning/20 px-1 text-foreground">{highlight}</mark>{parts.slice(1).join(highlight)}</>}
          </p>
        </div>
      </div>
    </article>
  );
}
