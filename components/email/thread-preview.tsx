import Link from "next/link";
import type { Email, Thread } from "@/types/domain";
import { PriorityBadge } from "@/components/ai/priority-badge";
import { SmartBadge } from "@/components/ai/smart-badge";
import { formatSmartDate } from "@/lib/utils/date";

export function ThreadPreview({ thread, email }: { thread?: Thread; email?: Email }) {
  const href = `/thread/${thread?.id ?? email?.threadId ?? ""}`;
  const title = thread?.subject ?? email?.subject ?? "Untitled thread";
  const snippet = thread?.summary ?? email?.snippet ?? "";
  return (
    <Link href={href} className="grid gap-1 border-b border-border px-1 py-3 hover:bg-muted/45 md:grid-cols-[180px_1fr_auto] md:items-center md:gap-3">
      <div className="min-w-0 text-sm font-medium">{email?.fromName ?? "SmartEmail"}</div>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium">{title}</span>
          {(thread?.requiresAction || email?.labels.includes("needs_action")) ? <SmartBadge label="Needs action" /> : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{snippet}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground md:justify-end">
        <PriorityBadge priority={thread?.priority === "high" || email?.importance === "high" ? "high" : "normal"} />
        <span>{formatSmartDate(thread?.latestMessageAt ?? email?.receivedAt ?? null)}</span>
      </div>
    </Link>
  );
}
