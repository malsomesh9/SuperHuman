"use client";

import React, { createContext, useContext, useMemo } from "react";
import { ApiClient } from "@/lib/api/client";
import { useSession } from "@/lib/auth/session";

const ApiContext = createContext<ApiClient | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { token } = useSession();
  const client = useMemo(() => new ApiClient(() => token), [token]);
  return <ApiContext.Provider value={client}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const client = useContext(ApiContext);
  if (!client) throw new Error("useApi must be used inside ApiProvider");
  return client;
}
