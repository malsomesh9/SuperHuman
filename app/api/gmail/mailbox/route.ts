import { randomUUID } from "node:crypto";
import { z } from "zod";
import { composeSchema, mimeMessage, sendMail } from "@/lib/gmail/compose";
import { GmailProvider, ownedAccount, header, plainText, type GmailMessage } from "@/lib/gmail/provider";
import { checked, database, failure, MailError, requireUser, sameOrigin, success } from "@/lib/gmail/server";
import { replyRecipients } from "@/lib/gmail/recipients";

const idSchema = z.string().regex(/^[\w-]+$/).max(200);
const requestSchema = z.object({ accountId: z.uuid(), operation: z.enum(["modify", "trash", "restore", "send", "saveDraft", "deleteDraft", "createLabel"]), ids: z.array(idSchema).min(1).max(100).optional(), addLabels: z.array(idSchema).max(20).default([]), removeLabels: z.array(idSchema).max(20).default([]), compose: composeSchema.optional(), actionId: z.uuid().optional(), draftId: idSchema.optional(), name: z.string().trim().min(1).max(100).optional() });

async function cacheMessages(userId: string, accountId: string, messages: GmailMessage[]) {
  if (!messages.length) return;
  checked(await database().from("smartemail_gmail_messages").upsert(messages.map(m => ({
    user_id: userId, account_id: accountId, gmail_id: m.id, thread_id: m.threadId,
    subject: header(m, "subject"), sender: header(m, "from"), snippet: m.snippet ?? "", labels: m.labelIds ?? [],
    internal_date: new Date(Number(m.internalDate ?? Date.now())).toISOString()
  })), { onConflict: "account_id,gmail_id" }));
}

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const params = new URL(request.url).searchParams;
    const account = await ownedAccount(user.id, params.get("accountId") ?? "");
    const provider = new GmailProvider(account);
    const threadId = params.get("threadId");
    if (threadId) {
      idSchema.parse(threadId);
      const thread = await provider.thread(threadId);
      if (thread.messages?.length) checked(await database().from("smartemail_gmail_audit").insert(thread.messages.map(message => ({ user_id: user.id, account_id: account.id, action: "message.read", resource_id: message.id }))));
      return success({ ...thread, messages: thread.messages?.map(m => ({ ...m, text: plainText(m.payload), ...replyRecipients(m, account.email) })) });
    }
    if (params.get("view") === "labels") return success(await provider.labels());
    if (params.get("view") === "drafts") {
      const pagination = new URLSearchParams({ maxResults: "30", ...(params.get("pageToken") ? { pageToken: params.get("pageToken")! } : {}) });
      return success(await provider.request(`drafts?${pagination}`));
    }
    const query = z.string().max(2000).parse(params.get("q") ?? "in:inbox");
    const page = await provider.messages(query, params.get("pageToken") ?? undefined);
    const messages: GmailMessage[] = [];
    for (let offset = 0; offset < (page.messages?.length ?? 0); offset += 5) {
      messages.push(...await Promise.all(page.messages!.slice(offset, offset + 5).map(m => provider.message(m.id, "metadata"))));
    }
    await cacheMessages(user.id, account.id, messages);
    return success({ messages, nextPageToken: page.nextPageToken });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    if (Number(request.headers.get("content-length")) > 16_000_000) throw new MailError("PAYLOAD_TOO_LARGE", "This message exceeds the upload limit.", 413);
    const raw = await request.text();
    if (raw.length > 16_000_000) throw new MailError("PAYLOAD_TOO_LARGE", "This message exceeds the upload limit.", 413);
    const input = requestSchema.parse(JSON.parse(raw));
    const account = await ownedAccount(user.id, input.accountId);
    const provider = new GmailProvider(account);
    let result: unknown;
    switch (input.operation) {
      case "send":
        if (!input.actionId || !input.compose) throw new MailError("INVALID_SEND", "Review your message before sending.");
        result = await sendMail(account, provider, input.actionId, input.compose, input.draftId);
        break;
      case "saveDraft": {
        if (!input.compose) throw new MailError("INVALID_DRAFT", "Draft content is required.");
        const message = await mimeMessage(input.compose, account.email, provider, `<${randomUUID()}@smartemail.invalid>`);
        result = await provider.request(input.draftId ? `drafts/${input.draftId}` : "drafts", input.draftId ? "PUT" : "POST", { message });
        break;
      }
      case "deleteDraft":
        if (!input.draftId) throw new MailError("INVALID_DRAFT", "Choose a draft.");
        await provider.request(`drafts/${input.draftId}`, "DELETE"); result = { deleted: true }; break;
      case "createLabel":
        if (!input.name) throw new MailError("INVALID_LABEL", "Enter a label name.");
        result = await provider.request("labels", "POST", { name: input.name }); break;
      case "modify":
      case "trash":
      case "restore": {
        if (!input.ids) throw new MailError("NO_MESSAGES", "Select at least one message.");
        const updated: GmailMessage[] = [];
        for (const id of input.ids) {
          const operation = input.operation === "restore" ? "untrash" : input.operation;
          await provider.request(`messages/${id}/${operation}`, "POST", input.operation === "modify" ? { addLabelIds: input.addLabels, removeLabelIds: input.removeLabels } : undefined);
          const message = await provider.message(id, "metadata");
          await cacheMessages(user.id, account.id, [message]);
          updated.push(message);
        }
        result = { messages: updated }; break;
      }
    }
    checked(await database().from("smartemail_gmail_audit").insert([{ user_id: user.id, account_id: account.id, action: input.operation, resource_id: input.actionId ?? input.draftId ?? input.ids?.[0] ?? null }]));
    return success(result);
  } catch (error) { return failure(error); }
}
