"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApi } from "./api-provider";

export function useFollowupActions() {
  const api = useApi();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof api.updateFollowup>[1] }) => api.updateFollowup(id, input),
    onSuccess: async (_, { input }) => {
      await Promise.all(["followups", "today", "audit", "thread"].map(key => cache.invalidateQueries({ queryKey: [key] })));
      toast.success(input.operation === "snooze" ? "Reminder saved" : input.operation === "dismiss" ? "Follow-up dismissed" : "Follow-up restored");
    },
    onError: error => toast.error(error.message)
  });
}
