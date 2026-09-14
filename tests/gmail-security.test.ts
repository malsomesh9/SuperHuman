// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { seal, unseal } from "@/lib/gmail/security";

afterEach(() => vi.unstubAllEnvs());
describe("Gmail credential encryption", () => {
  it("binds ciphertext to its account owner and rejects tampering", () => {
    vi.stubEnv("GMAIL_TOKEN_ENCRYPTION_KEY", "a".repeat(64));
    const token = seal("refresh-token-test", "user-a");
    expect(unseal(token, "user-a")).toBe("refresh-token-test");
    expect(token).not.toContain("refresh-token-test");
    expect(() => unseal(token, "user-b")).toThrow();
    const parts = token.split("."); parts[3] = Buffer.from("tampered").toString("base64url");
    expect(() => unseal(parts.join("."), "user-a")).toThrow();
    expect(seal("refresh-token-test", "user-a")).not.toBe(token);
  });
  it("fails closed when encryption is not configured", () => {
    vi.stubEnv("GMAIL_TOKEN_ENCRYPTION_KEY", "");
    expect(() => seal("secret", "user")).toThrow("not configured");
  });
});
