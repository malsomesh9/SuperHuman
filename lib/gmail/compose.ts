import MailComposer from "nodemailer/lib/mail-composer/index.js";
import { createHash } from "node:crypto";
import { z } from "zod";
import { checked, database, MailError } from "./server";
import { GmailProvider, header, type GmailAccount } from "./provider";

const address = z.email().max(254).refine(v => !/[\r\n]/.test(v));
export const composeSchema = z.object({
  to: z.array(address).min(1).max(100), cc: z.array(address).max(100).default([]), bcc: z.array(address).max(100).default([]),
  subject: z.string().max(998).refine(v => !/[\r\n]/.test(v)), text: z.string().max(1_000_000),
  replyToMessageId: z.string().regex(/^[a-zA-Z0-9_-]+$/).optional(),
  attachments: z.array(z.object({ filename: z.string().min(1).max(255).refine(v => !/[\r\n/\\]/.test(v)), contentType: z.string().regex(/^[\w.+-]+\/[\w.+-]+$/), data: z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/).max(14_000_000) })).max(10).default([])
});
export type ComposeInput = z.infer<typeof composeSchema>;

export async function mimeMessage(input: ComposeInput, from: string, provider: GmailProvider, messageId: string) {
  let threadId: string | undefined;
  let inReplyTo: string | undefined;
  let references: string | undefined;
  let subject = input.subject;
  if (input.replyToMessageId) {
    const original = await provider.message(input.replyToMessageId);
    threadId = original.threadId;
    inReplyTo = header(original, "Message-ID");
    if (!inReplyTo || /[\r\n]/.test(inReplyTo)) throw new MailError("INVALID_REPLY", "This message is missing valid reply headers.");
    references = `${header(original, "References")} ${inReplyTo}`.trim();
    subject = header(original, "Subject");
  }
  const attachments = input.attachments.map(a => ({ filename: a.filename, contentType: a.contentType, content: Buffer.from(a.data, "base64") }));
  if (attachments.reduce((total, a) => total + a.content.length, 0) > 10 * 1024 * 1024) throw new MailError("ATTACHMENTS_TOO_LARGE", "Attachments must total 10 MB or less.");
  const node = new MailComposer({ from, to: input.to, cc: input.cc, bcc: input.bcc, subject, text: input.text, attachments, inReplyTo, references, messageId, disableFileAccess: true, disableUrlAccess: true }).compile();
  node.keepBcc = true;
  const raw = (await node.build()).toString("base64url");
  return { raw, ...(threadId ? { threadId } : {}) };
}

export async function sendMail(account: GmailAccount, provider: GmailProvider, id: string, input: ComposeInput, draftId?: string) {
  const requestHash = createHash("sha256").update(JSON.stringify({ account: account.id, input, draftId })).digest("hex");
  const previous = checked(await database().from("smartemail_gmail_sends").select("status,request_hash,gmail_id,thread_id").eq("id", id).eq("user_id", account.user_id).maybeSingle());
  if (previous) {
    if (previous.request_hash !== requestHash) throw new MailError("SEND_CONFLICT", "This send attempt belongs to different content.", 409);
    if (previous.status === "sent") return { id: previous.gmail_id, threadId: previous.thread_id };
    throw new MailError("SEND_UNCERTAIN", "This send may already have reached Gmail. Check Sent before retrying.", 409);
  }
  const message = await mimeMessage(input, account.email, provider, `<${id}@smartemail.invalid>`);
  const claimed = await database().from("smartemail_gmail_sends").insert([{ id, user_id: account.user_id, account_id: account.id, request_hash: requestHash, status: "sending" }]);
  if (claimed.error) throw new MailError("SEND_IN_PROGRESS", "This send is already being processed or storage is unavailable.", 409);
  try {
    const result = await provider.request<{ id: string; threadId: string }>(draftId ? "drafts/send" : "messages/send", "POST", draftId ? { id: draftId, message } : message);
    if (!result.id) throw new Error("Missing provider confirmation");
    checked(await database().from("smartemail_gmail_sends").update({ status: "sent", gmail_id: result.id, thread_id: result.threadId }).eq("id", id).eq("user_id", account.user_id));
    return result;
  } catch {
    await database().from("smartemail_gmail_sends").update({ status: "uncertain" }).eq("id", id).eq("user_id", account.user_id);
    throw new MailError("SEND_UNCERTAIN", "Sending was not confirmed. Your draft is preserved. Check Gmail Sent before starting another send.", 502);
  }
}
