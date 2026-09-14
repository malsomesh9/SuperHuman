import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@insforge/sdk/ssr";
import { createAdminClient } from "@insforge/sdk";
import { ZodError } from "zod";

export class MailError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}

export async function requireUser() {
  const client = createServerClient({ cookies: await cookies() });
  const { data, error } = await client.auth.getCurrentUser();
  if (error || !data?.user) throw new MailError("UNAUTHORIZED", "Sign in to connect your mailbox.", 401);
  return data.user;
}

export function database() {
  if (!process.env.INSFORGE_API_KEY) throw new MailError("BACKEND_NOT_CONFIGURED", "Mailbox storage is not configured.", 503);
  return createAdminClient({ baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!, apiKey: process.env.INSFORGE_API_KEY }).database;
}

export function checked<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new MailError("STORAGE_FAILED", "Mailbox storage could not complete the request.", 503);
  return result.data;
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  if (!origin || new URL(origin).origin !== new URL(expected).origin) throw new MailError("INVALID_ORIGIN", "Invalid request origin.", 403);
}

export function failure(error: unknown) {
  if (error instanceof MailError) return NextResponse.json({ success: false, error: { code: error.code, message: error.message } }, { status: error.status });
  if (error instanceof ZodError) return NextResponse.json({ success: false, error: { code: "INVALID_INPUT", message: "Check the mailbox request fields." } }, { status: 400 });
  // Provider errors can include credentials and message bodies. Do not serialize them.
  return NextResponse.json({ success: false, error: { code: "MAILBOX_FAILED", message: "The mailbox request failed. Your changes have not been confirmed." } }, { status: 502 });
}

export function success(data: unknown) { return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } }); }
