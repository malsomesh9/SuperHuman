import { OAuth2Client, type Credentials } from "google-auth-library";
import { z } from "zod";
import { database, checked, MailError } from "./server";
import { seal, unseal } from "./security";

export const gmailScope = "https://www.googleapis.com/auth/gmail.modify";
export type GmailAccount = { id: string; user_id: string; email: string; credentials: string; history_id: string | null; last_sync_at: string | null; status: string };
export type GmailPart = { mimeType?: string; filename?: string; headers?: { name: string; value: string }[]; body?: { data?: string; attachmentId?: string; size?: number }; parts?: GmailPart[] };
export type GmailMessage = { id: string; threadId: string; labelIds?: string[]; snippet?: string; internalDate?: string; payload?: GmailPart };
export type GmailThread = { id: string; messages?: GmailMessage[] };
export type GmailLabel = { id: string; name: string; type?: string };

export function oauthClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_APP_URL } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !NEXT_PUBLIC_APP_URL) throw new MailError("GMAIL_NOT_CONFIGURED", "Gmail connection is awaiting Google OAuth configuration.", 503);
  return new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, `${NEXT_PUBLIC_APP_URL}/api/gmail/callback`);
}

export function configured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.NEXT_PUBLIC_APP_URL && process.env.INSFORGE_API_KEY && process.env.GMAIL_TOKEN_ENCRYPTION_KEY);
}

export async function ownedAccount(userId: string, accountId: string) {
  z.uuid().parse(accountId);
  const account = checked(await database().from("smartemail_gmail_accounts").select("id,user_id,email,credentials,history_id,last_sync_at,status").eq("id", accountId).eq("user_id", userId).maybeSingle()) as GmailAccount | null;
  if (!account || account.status !== "connected") throw new MailError("ACCOUNT_UNAVAILABLE", "Connect or reconnect this Gmail account.", 404);
  return account;
}

export class GmailProvider {
  private client: OAuth2Client;
  constructor(private account: GmailAccount) {
    this.client = oauthClient();
    this.client.setCredentials(JSON.parse(unseal(account.credentials, account.user_id)) as Credentials);
  }

  async request<T>(path: string, method: "GET" | "POST" | "PUT" | "DELETE" = "GET", body?: unknown): Promise<T> {
    const before = JSON.stringify(this.client.credentials);
    const token = await this.client.getAccessToken();
    if (!token.token) throw new MailError("GMAIL_RECONNECT", "Your Gmail authorization expired. Reconnect your mailbox.", 401);
    if (JSON.stringify(this.client.credentials) !== before) {
      checked(await database().from("smartemail_gmail_accounts").update({ credentials: seal(JSON.stringify(this.client.credentials), this.account.user_id) }).eq("id", this.account.id).eq("user_id", this.account.user_id));
    }
    // Mutations, especially send, must never be transparently retried.
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
      method, cache: "no-store", signal: AbortSignal.timeout(30_000),
      headers: { Authorization: `Bearer ${token.token}`, "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
    if (!response.ok) throw new MailError(response.status === 401 ? "GMAIL_RECONNECT" : "GMAIL_REQUEST_FAILED", response.status === 429 ? "Gmail is busy. Try again shortly." : "Gmail could not complete this request.", response.status);
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  profile() { return this.request<{ emailAddress: string; historyId: string }>("profile"); }
  messages(query: string, pageToken?: string) {
    const params = new URLSearchParams({ q: query, maxResults: "30", ...(pageToken ? { pageToken } : {}) });
    return this.request<{ messages?: { id: string; threadId: string }[]; nextPageToken?: string }>(`messages?${params}`);
  }
  message(id: string, format: "full" | "metadata" = "full") { return this.request<GmailMessage>(`messages/${encodeURIComponent(id)}?format=${format}`); }
  thread(id: string) { return this.request<GmailThread>(`threads/${encodeURIComponent(id)}?format=full`); }
  labels() { return this.request<{ labels: GmailLabel[] }>("labels"); }
}

export function header(message: GmailMessage, name: string) {
  return message.payload?.headers?.find(h => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export function plainText(part?: GmailPart): string {
  if (!part) return "";
  if (part.mimeType === "text/plain" && !part.filename && part.body?.data) return Buffer.from(part.body.data, "base64url").toString("utf8");
  return (part.parts ?? []).map(plainText).filter(Boolean).join("\n");
}
