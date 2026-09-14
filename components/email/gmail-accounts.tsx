"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { gmailRequest, type MailAccount } from "@/lib/api/gmail";
import { Button } from "@/components/ui/button";

export function GmailAccounts() {
  const params = useSearchParams();
  const query = useQuery({ queryKey: ["gmail-accounts"], queryFn: () => gmailRequest<{ configured: boolean; accounts: MailAccount[] }>("accounts"), retry: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function connect() {
    setBusy(true); setError("");
    try { const result = await gmailRequest<{ url: string }>("connect", {}); window.location.assign(result.url); }
    catch (e) { setError(e instanceof Error ? e.message : "Connection failed."); setBusy(false); }
  }
  return <section className="grid gap-3 py-3">
    <h2 className="text-base font-semibold">Connect Gmail</h2>
    <p className="text-sm text-muted-foreground">Authorize your mailbox separately from SmartEmail sign-in.</p>
    <ul className="grid gap-1 text-sm text-muted-foreground">
      <li>Read messages and attachments to display your mailbox.</li>
      <li>Modify labels, read status, stars, archive, and trash.</li>
      <li>Save Gmail drafts and send messages you approve.</li>
    </ul>
    {query.data?.accounts.map(a => <div key={a.id} className="flex flex-wrap items-center gap-2 text-sm">{a.email} · {a.status}<Button size="sm" variant="ghost" disabled={busy} onClick={() => {
      if (!window.confirm(`Disconnect ${a.email} and remove its SmartEmail index? Gmail messages will not be deleted.`)) return;
      setBusy(true); setError("");
      void gmailRequest("disconnect", { accountId: a.id }).then(() => query.refetch()).catch(e => setError(e.message)).finally(() => setBusy(false));
    }}>Disconnect</Button></div>)}
    {params.get("gmail") === "connection_failed" && <p role="alert" className="text-sm text-danger">Gmail could not be connected. Review the requested permissions and try again.</p>}
    {query.data && !query.data.configured && <p role="status" className="text-sm text-warning">Gmail connection is awaiting setup by the site owner.</p>}
    {(query.error || error) && <p role="alert" className="text-sm text-danger">{error || query.error?.message}</p>}
    <Button className="w-fit" disabled={busy || !query.data?.configured} onClick={() => void connect()}><Mail size={16} />{busy ? "Connecting..." : "Connect Gmail"}</Button>
  </section>;
}
