"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { SkeletonList } from "@/components/ui/skeleton-list";
import { useSession } from "@/lib/auth/session";

export function ProtectedApp({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready } = useSession();

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, ready, router, user]);

  if (!ready) return <div className="p-6"><SkeletonList rows={8} /></div>;
  if (!user) return null;

  return <AppShell>{children}</AppShell>;
}
