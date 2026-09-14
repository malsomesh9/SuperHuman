import { z } from "zod";
import { GmailProvider, ownedAccount, type GmailPart } from "@/lib/gmail/provider";
import { checked, database, failure, MailError, requireUser } from "@/lib/gmail/server";

function attachments(part?: GmailPart): GmailPart[] { return part ? [...(part.filename ? [part] : []), ...(part.parts ?? []).flatMap(attachments)] : []; }

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const params = new URL(request.url).searchParams;
    const account = await ownedAccount(user.id, params.get("accountId") ?? "");
    const messageId = z.string().regex(/^[\w-]+$/).parse(params.get("messageId"));
    const attachmentId = z.string().regex(/^[\w-]*$/).parse(params.get("attachmentId") ?? "");
    const provider = new GmailProvider(account);
    const message = await provider.message(messageId);
    const part = attachments(message.payload).find(p => attachmentId ? p.body?.attachmentId === attachmentId : p.filename === params.get("filename") && p.body?.data);
    if (!part) throw new MailError("ATTACHMENT_MISSING", "This attachment is no longer available.", 404);
    const content = attachmentId ? await provider.request<{ data: string }>(`messages/${messageId}/attachments/${attachmentId}`) : { data: part.body!.data! };
    checked(await database().from("smartemail_gmail_audit").insert([{ user_id: user.id, account_id: account.id, action: "attachment.read", resource_id: messageId }]));
    const name = (part.filename ?? "attachment").replace(/[\r\n"\\/]/g, "_");
    return new Response(new Uint8Array(Buffer.from(content.data, "base64url")), { headers: {
      "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
      "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store", "Content-Security-Policy": "sandbox"
    } });
  } catch (error) { return failure(error); }
}
