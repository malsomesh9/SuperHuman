import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { database, checked, sameOrigin, success, failure, MailError } from "@/lib/gmail/server";
import { initialState, execute, DemoError, type DemoState } from "@/lib/demo/engine";
import { demoUser } from "@/lib/api/demo-data";

export const runtime = "nodejs";
const table = "smartemail_demo_sessions";
const cookieName = "smartemail-demo-id";
type Row = { id: string; state: DemoState; revision: number };

async function handle(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") throw new MailError("DEMO_DISABLED", "Demo mode is disabled.", 404);
    if (request.method !== "GET") sameOrigin(request);
    const path = (await context.params).path.join("/");
    const jar = await cookies();
    const raw = jar.get(cookieName)?.value;
    const id = raw && /^[a-f0-9]{64}$/.test(raw) ? createHash("sha256").update(raw).digest("hex") : null;
    const db = database();
    if (path === "auth/demo-login" && request.method === "POST") {
      if (id) {
        const previous = checked(await db.from(table).select("id").eq("id", id).gt("expires_at", new Date().toISOString()).maybeSingle());
        if (previous) return success({ user: demoUser, token: "demo-token" });
      }
      const secret = randomBytes(32).toString("hex");
      checked(await db.from(table).insert([{ id: createHash("sha256").update(secret).digest("hex"), state: initialState() }]));
      jar.set(cookieName, secret, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/api/demo", maxAge: 86400 });
      return success({ user: demoUser, token: "demo-token" });
    }
    if (!id) throw new MailError("DEMO_EXPIRED", "Open the demo from the login page to begin.", 401);
    const text = request.method === "GET" ? "" : await request.text();
    if (text.length > 16000) throw new MailError("TOO_LARGE", "Request is too large.", 413);
    const body: unknown = text ? JSON.parse(text) : {};
    for (let attempt = 0; attempt < 3; attempt++) {
      const row = checked(await db.from(table).select("id,state,revision").eq("id", id).gt("expires_at", new Date().toISOString()).maybeSingle()) as Row | null;
      if (!row) throw new MailError("DEMO_EXPIRED", "Your demo expired. Open a new demo from the login page.", 401);
      const result = execute(row.state, request.method, path, body, new URL(request.url).searchParams.get("status"));
      if (request.method === "GET" || path === "search") return success(result);
      const updated = checked(await db.from(table).update({ state: row.state, revision: row.revision + 1 }).eq("id", id).eq("revision", row.revision).select("id"));
      if (updated?.length) return success(result);
    }
    throw new MailError("CONFLICT", "Another update is in progress. Please retry.", 409);
  } catch (error) {
    if (error instanceof DemoError) return failure(new MailError("DEMO_ERROR", error.message, error.status));
    if (error instanceof z.ZodError || error instanceof SyntaxError) return failure(new MailError("INVALID_INPUT", "Check the submitted fields.", 400));
    return failure(error);
  }
}
export { handle as GET, handle as POST, handle as PATCH };
