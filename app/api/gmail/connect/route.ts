import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { configured, gmailScope, oauthClient } from "@/lib/gmail/provider";
import { failure, MailError, requireUser, sameOrigin, success } from "@/lib/gmail/server";
import { seal } from "@/lib/gmail/security";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const user = await requireUser();
    if (!configured()) throw new MailError("GMAIL_NOT_CONFIGURED", "Gmail connection is awaiting Google OAuth configuration.", 503);
    const client = oauthClient();
    const state = randomBytes(32).toString("base64url");
    const { codeVerifier, codeChallenge } = await client.generateCodeVerifierAsync();
    if (!codeChallenge) throw new Error("Could not create OAuth challenge");
    (await cookies()).set("smartemail_gmail_oauth", seal(JSON.stringify({ state, codeVerifier, expires: Date.now() + 600_000 }), user.id), {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/api/gmail", maxAge: 600
    });
    const url = client.generateAuthUrl({ access_type: "offline", prompt: "consent", scope: [gmailScope], state, code_challenge: codeChallenge, code_challenge_method: "S256" as import("google-auth-library").CodeChallengeMethod });
    return success({ url });
  } catch (error) { return failure(error); }
}
