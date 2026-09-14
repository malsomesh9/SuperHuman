"use client";

import { useQuery } from "@tanstack/react-query";
import { Wifi, WifiOff } from "lucide-react";
import { useApi } from "@/lib/query/api-provider";
import { cn } from "@/lib/utils/cn";
import { useSession } from "@/lib/auth/session";

export function BackendStatus() {
  const api = useApi();
  const { token } = useSession();
  const health = useQuery({
    queryKey: ["backend-health"],
    queryFn: () => api.health(),
    refetchInterval: 15000,
    retry: 1,
    enabled: token === "demo-token"
  });

  const connected = health.isSuccess;
  if (token !== "demo-token") return <span className="text-xs text-muted-foreground">Signed in</span>;
  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium", connected ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning")}>
      {connected ? <Wifi size={13} aria-hidden /> : <WifiOff size={13} aria-hidden />}
      {connected ? "API connected" : "API offline"}
    </div>
  );
}
