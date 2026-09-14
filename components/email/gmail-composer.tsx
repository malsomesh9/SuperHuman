"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, Save, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gmailRequest, type MailAccount, type MailCompose } from "@/lib/api/gmail";

export function GmailComposer({ account, initial, onClose, onSent }: { account: MailAccount; initial?: Partial<MailCompose>; onClose: () => void; onSent: () => void }) {
  const [to, setTo] = useState(initial?.to?.join(", ") ?? "");
  const [cc, setCc] = useState(initial?.cc?.join(", ") ?? "");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [text, setText] = useState(initial?.text ?? "");
  const [attachments, setAttachments] = useState<MailCompose["attachments"]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const draftId = useRef<string | undefined>(undefined);
  const saving = useRef<Promise<unknown> | null>(null);
  const actionId = useRef(crypto.randomUUID());
  const uncertain = useRef(false);
  const values = useRef<MailCompose>({ to: [], cc: [], bcc: [], subject: "", text: "", attachments: [] });
  const split = (value: string) => value.split(",").map(v => v.trim()).filter(Boolean);
  values.current = { to: split(to), cc: split(cc), bcc: split(bcc), subject, text, attachments, ...(initial?.replyToMessageId ? { replyToMessageId: initial.replyToMessageId } : {}) };

  async function save() {
    if (saving.current) await saving.current;
    const compose = structuredClone(values.current);
    if (!compose.to.length) throw new Error("Add a recipient before saving or closing this draft.");
    if (uncertain.current) throw new Error("Check Gmail Sent before closing this unconfirmed send.");
    setStatus("Saving...");
    const job = gmailRequest<{ id: string }>("mailbox", { accountId: account.id, operation: "saveDraft", draftId: draftId.current, compose }).then(result => { draftId.current = result.id; setStatus("Saved to Gmail"); });
    saving.current = job;
    try { await job; } finally { if (saving.current === job) saving.current = null; }
  }
  const saveRef = useRef(save); saveRef.current = save;
  useEffect(() => {
    if (!to || busy || uncertain.current) return;
    setStatus("Unsaved changes");
    const timer = setTimeout(() => void saveRef.current().catch(e => { setError(e instanceof Error ? e.message : "Draft save failed."); setStatus("Not saved"); }), 1500);
    return () => clearTimeout(timer);
  }, [to, cc, bcc, subject, text, attachments, busy]);

  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (values.current.text) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, []);

  async function send() {
    if (busy || uncertain.current) return;
    if (!window.confirm(`Send to ${to}${cc ? `; Cc: ${cc}` : ""}${bcc ? `; Bcc: ${bcc}` : ""}?\n${attachments.length} attachments.${!subject ? "\nNo subject." : ""}${/attach/i.test(text) && !attachments.length ? "\nYou mentioned an attachment but have not added one." : ""}`)) return;
    setBusy(true); setError("");
    try {
      await save();
      uncertain.current = true;
      await gmailRequest("mailbox", { operation: "send", accountId: account.id, actionId: actionId.current, draftId: draftId.current, compose: values.current });
      setStatus("Sent through Gmail"); onSent();
    } catch (e) { setError(e instanceof Error ? e.message : "Sending failed."); }
    finally { setBusy(false); }
  }

  async function upload(files: FileList | null) {
    if (!files) return;
    if (Array.from(files).reduce((sum, f) => sum + f.size, 0) + attachments.reduce((sum, f) => sum + f.data.length * 0.75, 0) > 10 * 1024 * 1024) { setError("Attachments must total 10 MB or less."); return; }
    const added = await Promise.all(Array.from(files).map(file => new Promise<MailCompose["attachments"][number]>((resolve, reject) => {
      const reader = new FileReader(); reader.onerror = () => reject(new Error("Could not read attachment."));
      reader.onload = () => resolve({ filename: file.name, contentType: file.type || "application/octet-stream", data: String(reader.result).split(",")[1]! }); reader.readAsDataURL(file);
    })));
    setAttachments(current => [...current, ...added]);
  }

  return <section aria-label="Compose email" className="grid gap-3 border-t border-border bg-surface p-4">
    <div className="flex items-center justify-between"><h2 className="font-semibold">Compose</h2><Button variant="ghost" size="icon" aria-label="Save and close composer" disabled={busy || uncertain.current} onClick={() => void save().then(onClose).catch(e => setError(e.message))}><X size={16} /></Button></div>
    <p className="text-xs text-muted-foreground">From {account.email}</p>
    <fieldset disabled={busy || uncertain.current} className="grid gap-3">
      <label className="grid gap-1 text-sm">To<Input value={to} onChange={e => setTo(e.target.value)} autoFocus /></label>
      <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-sm">Cc<Input value={cc} onChange={e => setCc(e.target.value)} /></label><label className="grid gap-1 text-sm">Bcc<Input value={bcc} onChange={e => setBcc(e.target.value)} /></label></div>
      <label className="grid gap-1 text-sm">Subject<Input value={subject} onChange={e => setSubject(e.target.value)} /></label>
      <label className="grid gap-1 text-sm">Message<textarea className="min-h-48 w-full rounded-md border border-border bg-background p-3 text-sm" value={text} onChange={e => setText(e.target.value)} /></label>
      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm"><Paperclip size={16} />Attach files<input type="file" multiple className="max-w-52 text-xs" onChange={e => void upload(e.target.files).catch(err => setError(err.message))} /></label>
      {attachments.map((file, i) => <div key={`${file.filename}-${i}`} className="flex min-w-0 items-center gap-2 text-sm"><span className="truncate">{file.filename}</span><button aria-label={`Remove ${file.filename}`} onClick={() => setAttachments(current => current.filter((_, n) => n !== i))}><X size={14} /></button></div>)}
    </fieldset>
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    <div className="flex flex-wrap items-center gap-2"><Button disabled={busy || uncertain.current || !to} onClick={() => void send()}><Send size={16} />{busy ? "Sending..." : "Send"}</Button><Button variant="outline" disabled={busy || uncertain.current || !to} onClick={() => void save().catch(e => setError(e.message))}><Save size={16} />Save draft</Button><span role="status" className="text-xs text-muted-foreground">{status}</span></div>
  </section>;
}
