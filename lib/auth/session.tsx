"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { accountSignOut } from "@/lib/insforge/auth-actions";
import { toast } from "sonner";
import type { User } from "@/types/domain";

type InsForgeAuthUser = {
  id: string;
  email: string;
  profile?: {
    name?: string;
  } | null;
};

type SessionState = {
  user: User | null;
  token: string | null;
  ready: boolean;
  setSession: (session: { user: User; token: string }) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const raw = sessionStorage.getItem("smartemail-demo-session");
    if (raw && process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      try {
        const session = JSON.parse(raw) as { user: User; token: string };
        if (session.token === "demo-token" && session.user.id === "demo-user") {
          setUser(session.user);
          setToken(session.token);
        } else sessionStorage.removeItem("smartemail-demo-session");
      } catch {
        sessionStorage.removeItem("smartemail-demo-session");
      }
    }
    async function hydrateInsForge() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" });
        const data = await response.json() as { user?: InsForgeAuthUser };
        const authUser = data.user;
        if (!cancelled && authUser?.id && authUser.email) {
          const nextUser: User = {
            id: authUser.id,
            name: authUser.profile?.name ?? authUser.email.split("@")[0] ?? "SmartEmail user",
            email: authUser.email,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: navigator.language
          };
          const nextSession = { user: nextUser, token: "insforge-session" };
          setUser(nextSession.user);
          setToken(nextSession.token);
          sessionStorage.removeItem("smartemail-demo-session");
        }
      } catch {
        // Local demo still works if InsForge is unreachable.
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void hydrateInsForge();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<SessionState>(() => ({
    user,
    token,
    ready,
    setSession: (session) => {
      setUser(session.user);
      setToken(session.token);
      if (session.token === "demo-token") sessionStorage.setItem("smartemail-demo-session", JSON.stringify(session));
      else sessionStorage.removeItem("smartemail-demo-session");
    },
    signOut: () => {
      void (async () => {
        try {
          await accountSignOut();
          sessionStorage.removeItem("smartemail-demo-session");
          window.location.assign("/login");
        } catch {
          toast.error("Could not sign out. Please try again.");
        }
      })();
    }
  }), [ready, user, token]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside SessionProvider");
  return session;
}
