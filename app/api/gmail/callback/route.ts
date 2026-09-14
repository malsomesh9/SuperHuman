import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checked, database, requireUser } from "@/lib/gmail/server";
import { gmailScope, oauthClient } from "@/lib/gmail/provider";
import { seal, unseal } from "@/lib/gmail/security";

export async function GET(request: NextRequest) {
  const store = await cookies();
  const cookie = store.get("smartemail_gmail_oauth")?.value;
  store.set("smartemail_gmail_oauth", "", { path: "/api/gmail", maxAge: 0 });
  try {
    const user = await requireUser();
    if (!cookie) throw new Error("Missing OAuth state");
    const state = z.object({ state: z.string(), codeVerifier: z.string(), expires: z.number() }).parse(JSON.parse(unseal(cookie, user.id)));
    if (state.expires < Date.now() || state.state !== request.nextUrl.searchParams.get("state")) throw new Error("Invalid OAuth state");
    const code = request.nextUrl.searchParams.get("code");
    if (!code || request.nextUrl.searchParams.has("error")) throw new Error("Consent denied");
    const client = oauthClient();
    const { tokens } = await client.getToken({ code, codeVerifier: state.codeVerifier });
    if (!tokens.access_token || !tokens.scope?.split(" ").includes(gmailScope)) throw new Error("Mailbox permission missing");
    client.setCredentials(tokens);
    const { data: profile } = await client.request<{ emailAddress: string }>({ url: "https://gmail.googleapis.com/gmail/v1/users/me/profile" });
    const existing = checked(await database().from("smartemail_gmail_accounts").select("id,credentials").eq("user_id", user.id).eq("email", profile.emailAddress).maybeSingle());
    if (!tokens.refresh_token && existing) tokens.refresh_token = JSON.parse(unseal(existing.credentials as string, user.id)).refresh_token;
    if (!tokens.refresh_token) throw new Error("Offline authorization required");
    checked(await database().from("smartemail_gmail_accounts").upsert([{ user_id: user.id, email: profile.emailAddress, credentials: seal(JSON.stringify(tokens), user.id), status: "connected" }], { onConflict: "user_id,email" }));
    return NextResponse.redirect(new URL("/inbox?gmail=connected", request.url));
  } catch {
    return NextResponse.redirect(new URL("/settings?gmail=connection_failed", request.url));
  }
}
