import { Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const toneByLabel: Record<string, "neutral" | "accent" | "success" | "warning" | "danger"> = {
  Overdue: "danger",
  "Due today": "warning",
  Waiting: "accent",
  "Needs approval": "warning",
  "AI prepared": "accent",
  "Possible commitment": "warning",
  Completed: "success"
};

export function SmartBadge({ label, tone }: { label: string; tone?: "neutral" | "accent" | "success" | "warning" | "danger" }) {
  return (
    <Badge tone={tone ?? toneByLabel[label] ?? "neutral"}>
      <Circle size={7} fill="currentColor" aria-hidden />
      {label}
    </Badge>
  );
}
