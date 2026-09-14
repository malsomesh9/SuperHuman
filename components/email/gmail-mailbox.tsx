"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Archive, ArrowLeft, Mail, MailOpen, PenSquare, RefreshCw, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { gmailRequest, mailHeader, fileParts, type MailAccount, type MailCompose, type MailMessage } from "@/lib/api/gmail";
import { GmailAccounts } from "./gmail-accounts";
import { GmailComposer } from "./gmail-composer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonList } from "@/components/ui/skeleton-list";

const folders = [["Inbox", "in:inbox"], ["Starred", "is:starred"], ["Sent", "in:sent"], ["Drafts", "in:drafts"], ["Important", "is:important"], ["All mail", "-in:trash -in:spam"], ["Spam", "in:spam"], ["Trash", "in:trash"]];

export function GmailMailbox() {
  const accounts = useQuery({ queryKey: ["gmail-accounts"], queryFn: () => gmailRequest<{ configured: boolean; accounts: MailAccount[] }>("accounts"), retry: false });
  const [accountId, setAccountId] = useState("");
  const account = accounts.data?.accounts.find(a => a.id === accountId) ?? accounts.data?.accounts[0];
  if (accounts.isLoading) return <div className="p-4"><SkeletonList rows={6} /></div>;
  if (!account) return <div className="p-6"><GmailAccounts /></div>;
  return <div className="min-w-0 p-4 lg:p-6"><label className="mb-3 flex items-center gap-3 text-sm">Mailbox<select className="max-w-full rounded border border-border bg-surface p-2" value={account.id} onChange={e => setAccountId(e.target.value)}>{accounts.data?.accounts.map(a => <option key={a.id} value={a.id}>{a.email}</option>)}</select></label><Mailbox key={account.id} account={account} /></div>;
}

function Mailbox({ account }: { account: MailAccount }) {
  const searchParams = useSearchParams();
  const client = useQueryClient();
  const [query, setQuery] = useState("in:inbox");
  const [search, setSearch] = useState("");
  const [pageToken, setPageToken] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [threadId, setThreadId] = useState("");
  const [compose, setCompose] = useState<Partial<MailCompose> | null>(searchParams.get("compose") === "true" ? {} : null);
  const params = new URLSearchParams({ accountId: account.id, q: query, pageToken });
  const mail = useQuery({ queryKey: ["gmail-mail", account.id, query, pageToken], queryFn: () => gmailRequest<{ messages: MailMessage[]; nextPageToken?: string }>(`mailbox?${params}`), refetchInterval: 60_000, refetchIntervalInBackground: false, retry: false });
  const thread = useQuery({ queryKey: ["gmail-thread", account.id, threadId], queryFn: () => gmailRequest<{ messages: MailMessage[] }>(`mailbox?${new URLSearchParams({ accountId: account.id, threadId })}`), enabled: Boolean(threadId), retry: false });
  const labels = useQuery({ queryKey: ["gmail-labels", account.id], queryFn: () => gmailRequest<{ labels: { id: string; name: string; type: string }[] }>(`mailbox?accountId=${account.id}&view=labels`), staleTime: 300_000 });
  const mutation = useMutation({ mutationFn: (data: Record<string, unknown>) => gmailRequest("mailbox", { accountId: account.id, ...data }), onSuccess: () => { setSelected([]); void client.invalidateQueries({ queryKey: ["gmail-mail", account.id] }); void client.invalidateQueries({ queryKey: ["gmail-thread", account.id] }); }, onError: (error) => toast.error(error.message) });
  useEffect(() => {
    const sync = () => { if (document.visibilityState === "visible") void gmailRequest("sync", { accountId: account.id }).catch(() => undefined); };
    sync();
    const timer = setInterval(sync, 120_000);
    return () => clearInterval(timer);
  }, [account.id]);
  const changeFolder = (q: string) => { setQuery(q); setPageToken(""); setSelected([]); setThreadId(""); };
  const modify = (addLabels: string[], removeLabels: string[], ids = selected) => mutation.mutate({ operation: "modify", ids, addLabels, removeLabels });
  const reply = (message: MailMessage, all = false) => {
    const to = all ? message.replyAllTo ?? [] : message.replyTo ?? [];
    const cc = all ? message.replyAllCc ?? [] : [];
    setCompose({ to, cc, subject: mailHeader(message, "subject"), replyToMessageId: message.id });
  };

  return <div className="grid min-w-0 gap-3">
    <nav aria-label="Mailbox folders" className="flex flex-wrap gap-1">{folders.map(([label, q]) => <Button key={q} size="sm" variant={query === q ? "secondary" : "ghost"} onClick={() => changeFolder(q!)}>{label}</Button>)}</nav>
    <div className="flex flex-wrap items-center gap-2"><Button onClick={() => setCompose({})}><PenSquare size={16} />Compose</Button><Button variant="outline" size="icon" aria-label="Refresh mailbox" onClick={() => void mail.refetch()}><RefreshCw size={16} /></Button><form className="flex min-w-0 flex-1 gap-2" onSubmit={e => { e.preventDefault(); changeFolder(search || "in:inbox"); }}><Input aria-label="Search Gmail" placeholder="Search Gmail" value={search} onChange={e => setSearch(e.target.value)} /><Button type="submit" variant="outline">Search</Button></form></div>
    {compose && <GmailComposer account={account} initial={compose} onClose={() => setCompose(null)} onSent={() => { setCompose(null); toast.success("Sent through Gmail"); void mail.refetch(); void thread.refetch(); }} />}
    {selected.length > 0 && <div className="flex flex-wrap items-center gap-2 border-y border-border py-2"><span className="text-xs">{selected.length} selected</span><Button size="icon" variant="ghost" aria-label="Archive selected" disabled={mutation.isPending} onClick={() => modify([], ["INBOX"])}><Archive size={16} /></Button><Button size="icon" variant="ghost" aria-label="Mark selected read" disabled={mutation.isPending} onClick={() => modify([], ["UNREAD"])}><MailOpen size={16} /></Button><Button size="icon" variant="ghost" aria-label="Mark selected unread" disabled={mutation.isPending} onClick={() => modify(["UNREAD"], [])}><Mail size={16} /></Button><Button size="icon" variant="ghost" aria-label="Trash selected" disabled={mutation.isPending} onClick={() => mutation.mutate({ operation: "trash", ids: selected })}><Trash2 size={16} /></Button><Button size="sm" variant="ghost" disabled={mutation.isPending} onClick={() => mutation.mutate({ operation: "restore", ids: selected })}>Restore</Button><select aria-label="Apply label" className="max-w-44 border border-border bg-background p-2 text-sm" value="" onChange={e => modify([e.target.value], [])}><option value="">Apply label</option>{labels.data?.labels.filter(l => l.type === "user").map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>}
    {(mail.error || thread.error) && <p role="alert" className="py-4 text-sm text-danger">{mail.error?.message ?? thread.error?.message}</p>}
    {threadId ? <section className="grid min-w-0 gap-4"><Button className="w-fit" variant="ghost" onClick={() => setThreadId("")}><ArrowLeft size={16} />Back to mailbox</Button>{thread.isLoading ? <SkeletonList rows={5} /> : thread.data?.messages.map((m, i, messages) => <details key={m.id} open={i === messages.length - 1} className="min-w-0 border-b border-border pb-3"><summary className="cursor-pointer break-words text-sm font-medium">{mailHeader(m, "from")} · {mailHeader(m, "subject")}</summary><p className="mt-2 break-words text-xs text-muted-foreground">To: {mailHeader(m, "to")} {mailHeader(m, "cc") ? ` · Cc: ${mailHeader(m, "cc")}` : ""}</p><pre className="my-4 whitespace-pre-wrap break-words font-sans text-sm leading-6">{m.text || m.snippet || "No plain-text body is available."}</pre>{fileParts(m.payload).map((file, j) => <a key={j} className="mb-2 block break-words text-sm underline" href={`/api/gmail/attachment?${new URLSearchParams({ accountId: account.id, messageId: m.id, attachmentId: file.body?.attachmentId ?? "", filename: file.filename ?? "attachment" })}`}>{file.filename}</a>)}<div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => reply(m)}>Reply</Button><Button size="sm" variant="outline" onClick={() => reply(m, true)}>Reply all</Button><Button size="sm" variant="ghost" onClick={() => setCompose({ subject: `Fwd: ${mailHeader(m, "subject")}`, text: `\n\n---------- Forwarded message ----------\nFrom: ${mailHeader(m, "from")}\nDate: ${mailHeader(m, "date")}\nSubject: ${mailHeader(m, "subject")}\n\n${m.text ?? m.snippet ?? ""}` })}>Forward</Button></div></details>)}</section> : <section aria-label="Messages" className="min-w-0 divide-y divide-border">{mail.isLoading ? <SkeletonList rows={8} /> : mail.data?.messages.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No messages match this view.</p> : mail.data?.messages.map(m => <div key={m.id} className={`flex min-w-0 items-center gap-2 py-3 ${m.labelIds?.includes("UNREAD") ? "font-semibold" : ""}`}><input type="checkbox" aria-label={`Select ${mailHeader(m, "subject")}`} checked={selected.includes(m.id)} onChange={e => setSelected(current => e.target.checked ? [...current, m.id] : current.filter(id => id !== m.id))} /><Button variant="ghost" size="icon" aria-label={m.labelIds?.includes("STARRED") ? "Unstar message" : "Star message"} disabled={mutation.isPending} onClick={() => m.labelIds?.includes("STARRED") ? modify([], ["STARRED"], [m.id]) : modify(["STARRED"], [], [m.id])}><Star size={16} fill={m.labelIds?.includes("STARRED") ? "currentColor" : "none"} /></Button><button className="grid min-w-0 flex-1 gap-1 text-left text-sm md:grid-cols-[180px_1fr]" onClick={() => { setThreadId(m.threadId); if (m.labelIds?.includes("UNREAD")) modify([], ["UNREAD"], [m.id]); }}><span className="truncate">{mailHeader(m, "from")}</span><span className="truncate">{mailHeader(m, "subject") || "(No subject)"}<span className="ml-2 font-normal text-muted-foreground">{m.snippet}</span></span></button></div>)}</section>}
    {!threadId && <div className="flex gap-2"><Button variant="ghost" size="sm" disabled={!pageToken} onClick={() => setPageToken("")}>First page</Button><Button variant="outline" size="sm" disabled={!mail.data?.nextPageToken} onClick={() => { setPageToken(mail.data!.nextPageToken!); setSelected([]); }}>Next page</Button></div>}
  </div>;
}
