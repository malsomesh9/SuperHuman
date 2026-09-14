// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GmailAccount, GmailProvider } from "@/lib/gmail/provider";

const state = vi.hoisted(() => ({ row: null as Record<string, unknown> | null }));
vi.mock("@/lib/gmail/server", () => ({
  MailError: class extends Error { constructor(public code: string, message: string) { super(message); } },
  checked: (value: { data: unknown; error: unknown }) => { if (value.error) throw new Error("storage"); return value.data; },
  database: () => ({ from: () => {
    const chain = { select: () => chain, eq: () => chain, maybeSingle: async () => ({ data: state.row, error: null }),
      insert: async (rows: Record<string, unknown>[]) => { if (state.row) return { error: { message: "duplicate" } }; state.row = rows[0]!; return { error: null }; },
      update: (values: Record<string, unknown>) => { state.row = { ...state.row, ...values }; return chain; },
      then: (resolve: (value: { data: null; error: null }) => void) => resolve({ data: null, error: null }) };
    return chain;
  } })
}));

import { composeSchema, sendMail } from "@/lib/gmail/compose";
const account = { id: "account", user_id: "user", email: "sender@example.com" } as GmailAccount;
const compose = composeSchema.parse({ to: ["receiver@example.com"], subject: "Hello", text: "Test" });
beforeEach(() => { state.row = null; });

describe("send attempt protection", () => {
  it("returns the stored provider result without sending twice", async () => {
    const request = vi.fn().mockResolvedValue({ id: "gmail-message", threadId: "gmail-thread" });
    const provider = { request } as unknown as GmailProvider;
    await sendMail(account, provider, "action", compose);
    await expect(sendMail(account, provider, "action", compose)).resolves.toEqual({ id: "gmail-message", threadId: "gmail-thread" });
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("does not retry an ambiguous send or reuse a key for different content", async () => {
    const request = vi.fn().mockRejectedValue(new Error("timeout"));
    const provider = { request } as unknown as GmailProvider;
    await expect(sendMail(account, provider, "action", compose)).rejects.toMatchObject({ code: "SEND_UNCERTAIN" });
    await expect(sendMail(account, provider, "action", compose)).rejects.toMatchObject({ code: "SEND_UNCERTAIN" });
    await expect(sendMail(account, provider, "action", { ...compose, text: "Different" })).rejects.toMatchObject({ code: "SEND_CONFLICT" });
    expect(request).toHaveBeenCalledTimes(1);
  });
});
