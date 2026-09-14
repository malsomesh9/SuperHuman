import Link from "next/link";
import { formatSmartDate } from "@/lib/utils/date";
import type { EmailSource } from "@/types/domain";

export function SourceCitation({ source }: { source: EmailSource }) {
  return (
    <Link href={`/thread/${source.threadId}?source=${source.emailId}`} className="inline-flex items-center rounded-sm border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground hover:bg-surface">
      {source.subject ?? "Source"} · {formatSmartDate(source.sentAt)}
    </Link>
  );
}
