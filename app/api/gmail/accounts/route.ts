import { configured } from "@/lib/gmail/provider";
import { checked, database, failure, requireUser, success } from "@/lib/gmail/server";

export async function GET() {
  try {
    const user = await requireUser();
    if (!configured()) return success({ configured: false, accounts: [] });
    const accounts = checked(await database().from("smartemail_gmail_accounts").select("id,email,status,last_sync_at").eq("user_id", user.id).order("created_at").limit(20));
    return success({ configured: true, accounts });
  } catch (error) { return failure(error); }
}
