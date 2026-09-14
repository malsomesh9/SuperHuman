export type MailAccount = { id: string; email: string; status: string; last_sync_at: string | null };
export type MailPart = { mimeType?: string; filename?: string; body?: { attachmentId?: string; data?: string; size?: number }; parts?: MailPart[]; headers?: { name: string; value: string }[] };
export type MailMessage = { id: string; threadId: string; labelIds?: string[]; snippet?: string; internalDate?: string; payload?: MailPart; text?: string; replyTo?: string[]; replyAllTo?: string[]; replyAllCc?: string[] };
export type MailCompose = { to: string[]; cc: string[]; bcc: string[]; subject: string; text: string; replyToMessageId?: string; attachments: { filename: string; contentType: string; data: string }[] };

export async function gmailRequest<T>(path: string, data?: unknown): Promise<T> {
  const response = await fetch(`/api/gmail/${path}`, { credentials: "same-origin", cache: "no-store", ...(data ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) } : {}) });
  const body = await response.json();
  if (!response.ok || !body.success) throw new Error(body.error?.message ?? "The mailbox request failed.");
  return body.data as T;
}

export function mailHeader(message: MailMessage, name: string) { return message.payload?.headers?.find(h => h.name.toLowerCase() === name.toLowerCase())?.value ?? ""; }

export function fileParts(part?: MailPart): MailPart[] {
  return part ? [...(part.filename ? [part] : []), ...(part.parts ?? []).flatMap(fileParts)] : [];
}
