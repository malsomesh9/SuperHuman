import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/types/domain";

const tone: Record<Priority, "neutral" | "accent" | "warning" | "danger"> = {
  critical: "danger",
  high: "warning",
  normal: "neutral",
  low: "neutral"
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge tone={tone[priority]}>● {priority[0]!.toUpperCase() + priority.slice(1)}</Badge>;
}
