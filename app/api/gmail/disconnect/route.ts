import { z } from "zod";
import { oauthClient } from "@/lib/gmail/provider";
import { unseal } from "@/lib/gmail/security";
import { checked, database, failure, MailError, requireUser, sameOrigin, success } from "@/lib/gmail/server";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    const { accountId } = z.object({ accountId: z.uuid() }).parse(await request.json());
    const account = checked(await database().from("smartemail_gmail_accounts").select("credentials").eq("id", accountId).eq("user_id", user.id).maybeSingle());
    if (!account) throw new MailError("NOT_FOUND", "Mailbox not found.", 404);
    checked(await database().from("smartemail_gmail_accounts").update({ status: "disconnecting" }).eq("id", accountId).eq("user_id", user.id));
    const client = oauthClient(); client.setCredentials(JSON.parse(unseal(account.credentials as string, user.id)));
    await client.revokeCredentials();
    checked(await database().from("smartemail_gmail_accounts").delete().eq("id", accountId).eq("user_id", user.id));
    return success({ disconnected: true });
  } catch (error) { return failure(error); }
}
