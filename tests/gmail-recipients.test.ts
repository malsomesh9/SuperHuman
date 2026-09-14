// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/gmail/server", () => ({ checked: vi.fn(), database: vi.fn(), MailError: class extends Error {} }));
import { replyRecipients } from "@/lib/gmail/recipients";

describe("reply recipients", () => {
  it("parses quoted names, uses Reply-To, removes self and duplicates, and never copies Bcc", () => {
    const result = replyRecipients({ id: "m", threadId: "t", payload: { headers: [
      { name: "From", value: '"Chen, Sarah" <sarah@example.com>' },
      { name: "Reply-To", value: 'Sarah <replies@example.com>' },
      { name: "To", value: 'Me <me@example.com>, "Team, Acme" <team@example.com>' },
      { name: "Cc", value: 'TEAM@example.com, another@example.com' },
      { name: "Bcc", value: 'private@example.com' }
    ] } }, "me@example.com");
    expect(result).toEqual({ replyTo: ["replies@example.com"], replyAllTo: ["replies@example.com", "team@example.com"], replyAllCc: ["another@example.com"] });
  });
});
