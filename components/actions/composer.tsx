"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Send, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApi } from "@/lib/query/api-provider";

export function Composer({ open, onOpenChange, threadId, intent = "reply" }: { open: boolean; onOpenChange: (open: boolean) => void; threadId: string; intent?: string }) {
  const api = useApi();
  const queryClient = useQueryClient();
  const [tone, setTone] = useState("normal");
  const [confirming, setConfirming] = useState(false);
  const [editedBody, setEditedBody] = useState("");
  const draft = useMutation({ mutationFn: () => api.draft(threadId, intent, tone), onSuccess: data => setEditedBody(data.draft), onError: error => toast.error(error.message) });
  const approve = useMutation({
    mutationFn: (id: string) => api.approveAction(id, editedBody),
    onSuccess: async () => {
      toast.success("Demo send recorded. No email was delivered.");
      await queryClient.invalidateQueries({ queryKey: ["actions"] });
      await queryClient.invalidateQueries({ queryKey: ["audit"] });
      onOpenChange(false);
      setConfirming(false);
    },
    onError: error => toast.error(error.message)
  });

  const body = draft.data?.draft ?? "";
  const actionId = draft.data?.action.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-base">Draft reply</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 p-5">
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Tone
            <div className="flex flex-wrap gap-1">
              {["short", "normal", "detailed", "direct", "friendly", "formal"].map((item) => (
                <button key={item} type="button" onClick={() => setTone(item)} className={item === tone ? "rounded bg-foreground px-2 py-1 text-xs text-background" : "rounded border border-border px-2 py-1 text-xs"}>
                  {item}
                </button>
              ))}
            </div>
          </label>
          {!body ? (
            <Button onClick={() => draft.mutate()} disabled={draft.isPending}>{draft.isPending ? "Preparing draft..." : "Prepare draft"}</Button>
          ) : (
            <>
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                Body
                <textarea className="min-h-52 rounded-md border border-border bg-background p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" value={editedBody} onChange={event => setEditedBody(event.target.value)} />
              </label>
              {confirming ? (
                <div className="rounded-md border border-warning/40 bg-warning/10 p-3">
                  <div className="flex gap-2 text-sm font-medium"><AlertTriangle size={16} /> Confirm simulated send</div>
                  <p className="mt-1 text-xs text-muted-foreground">To: {String(draft.data?.action.payload.to ?? "")}. No email will leave this demo.</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => actionId && approve.mutate(actionId)} disabled={approve.isPending || !editedBody.trim()}><Send size={14} /> Simulate send</Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}><X size={14} /> Cancel</Button>
                  <Button onClick={() => setConfirming(true)}><Send size={14} /> Review demo send</Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
