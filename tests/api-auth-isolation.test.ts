import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetModules(); });

describe("account and demo isolation", () => {
  it("never routes an authenticated account through the shared prototype", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const { ApiClient } = await import("@/lib/api/client");
    const api = new ApiClient(() => "insforge-session");
    await expect(api.today()).rejects.toMatchObject({ code: "MAILBOX_NOT_CONNECTED" });
    await expect(api.approveAction("a")).rejects.toMatchObject({ code: "MAILBOX_NOT_CONNECTED" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not report failed sends, drafts or workflow approvals as successful", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Offline")));
    const { ApiClient } = await import("@/lib/api/client");
    const api = new ApiClient(() => "demo-token");
    await expect(api.approveAction("a")).rejects.toThrow("Offline");
    await expect(api.approveWorkflow("w")).rejects.toThrow("Offline");
    await expect(api.draft("t", "reply", "friendly")).rejects.toThrow("Offline");
    await expect(api.updateCommitment("c", { status: "completed" })).rejects.toThrow("Offline");
  });

  it("requires an explicit demo flag", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const { ApiClient } = await import("@/lib/api/client");
    await expect(new ApiClient(() => null).demoLogin()).rejects.toMatchObject({ code: "DEMO_DISABLED" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("surfaces malformed provider responses as application errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Bad gateway", { status: 502 })));
    const { ApiClient } = await import("@/lib/api/client");
    await expect(new ApiClient(() => "demo-token").approveAction("a")).rejects.toMatchObject({ code: "INVALID_RESPONSE", status: 502 });
  });
});
