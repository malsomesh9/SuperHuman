// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { composeSchema, mimeMessage } from "@/lib/gmail/compose";
import type { GmailProvider } from "@/lib/gmail/provider";

vi.mock("@/lib/gmail/server", () => ({ checked: vi.fn(), database: vi.fn(), MailError: class extends Error {} }));

describe("Gmail MIME construction", () => {
  it("uses canonical reply headers and includes attachment bytes", async () => {
    const message = vi.fn().mockResolvedValue({ id: "original", threadId: "canonical-thread", payload: { headers: [{ name: "Subject", value: "Original subject" }, { name: "Message-ID", value: "<original@example.com>" }, { name: "References", value: "<earlier@example.com>" }] } });
    const provider = { message } as unknown as GmailProvider;
    const input = composeSchema.parse({ to: ["recipient@example.com"], bcc: ["private@example.com"], subject: "Wrong subject", text: "Reply", replyToMessageId: "original", attachments: [{ filename: "test.txt", contentType: "text/plain", data: Buffer.from("Attachment contents").toString("base64") }] });
    const result = await mimeMessage(input, "sender@example.com", provider, "<unique@example.com>");
    const mime = Buffer.from(result.raw, "base64url").toString();
    expect(result.threadId).toBe("canonical-thread");
    expect(mime).toContain("In-Reply-To: <original@example.com>");
    expect(mime).toContain("References: <earlier@example.com> <original@example.com>");
    expect(mime).toContain("Subject: Original subject");
    expect(mime).toContain("Bcc: private@example.com");
    expect(mime).toContain("multipart/mixed");
    expect(mime).toContain(Buffer.from("Attachment contents").toString("base64"));
  });
  it("rejects header injection and remote attachment URLs", () => {
    expect(() => composeSchema.parse({ to: ["ok@example.com\r\nBcc: bad@example.com"], subject: "test", text: "hello" })).toThrow();
    expect(() => composeSchema.parse({ to: ["ok@example.com"], subject: "test\r\nBcc: bad@example.com", text: "hello" })).toThrow();
    expect(() => composeSchema.parse({ to: ["ok@example.com"], subject: "test", text: "hello", attachments: [{ filename: "x", contentType: "text/plain", data: "https://internal/secret" }] })).toThrow();
  });
});
