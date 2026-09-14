"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState } from "react";
import { SessionProvider, useSession } from "@/lib/auth/session";
import { ApiProvider } from "@/lib/query/api-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="smartemail-theme">
      <SessionProvider><AccountQueries>{children}</AccountQueries></SessionProvider>
      <Toaster richColors position="bottom-right" />
    </ThemeProvider>
  );
}

function AccountQueries({ children }: { children: React.ReactNode }) {
  const { user, token } = useSession();
  return <QueryScope key={`${user?.id ?? "anonymous"}:${token ?? "none"}`}>{children}</QueryScope>;
}

function QueryScope({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1
      }
    }
  }));

  return (
        <ApiProvider>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </ApiProvider>
  );
}
