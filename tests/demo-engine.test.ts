import { describe, it, expect, vi, afterEach } from "vitest";
import { execute, initialState } from "@/lib/demo/engine";
import type { SmartAction, SearchResponse, FollowUp } from "@/types/domain";
afterEach(() => vi.useRealTimers());

describe("isolated live demo", () => {
  it("snoozes, reappears when due, dismisses and restores without affecting another visitor", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-15T10:00:00Z"));
    const state = initialState(), other = initialState();
    const list = () => execute(state, "GET", "followups", {}) as FollowUp[];
    execute(state, "PATCH", "followups/followup_acme", { operation: "snooze", days: 3 });
    expect(list().some(f => f.id === "followup_acme")).toBe(false);
    expect((execute(other, "GET", "followups", {}) as FollowUp[]).some(f => f.id === "followup_acme")).toBe(true);
    vi.setSystemTime(new Date("2026-09-18T10:00:00Z"));
    expect(list().some(f => f.id === "followup_acme")).toBe(true);
    execute(state, "PATCH", "followups/followup_acme", { operation: "dismiss" });
    expect(list().some(f => f.id === "followup_acme")).toBe(false);
    execute(state, "PATCH", "followups/followup_acme", { operation: "restore" });
    expect(list().some(f => f.id === "followup_acme")).toBe(true);
  });
  it("supports legacy sessions and drafts every follow-up source", () => {
    const state = initialState();
    Reflect.deleteProperty(state, "followups");
    const items = execute(state, "GET", "followups", {}) as FollowUp[];
    for (const item of items) expect(execute(state, "POST", `threads/${item.threadId}/draft`, { intent: "follow-up", tone: "normal" })).toHaveProperty("draft");
    expect(() => execute(state, "PATCH", "followups/followup_acme", { operation: "snooze", days: -1 })).toThrow();
  });
  it("does not mutate another visitor's state", () => {
    const first = initialState(), second = initialState();
    execute(first, "PATCH", "commitments/commitment_deck", { status: "completed" });
    expect(first.commitments[0]?.status).toBe("completed");
    expect(second.commitments[0]?.status).toBe("open");
  });
  it("persists reviewed draft text and records only one simulated send", () => {
    const state = initialState();
    const result = execute(state, "POST", "threads/thread_acme/draft", { intent: "follow up", tone: "friendly" }) as { action: SmartAction };
    execute(state, "POST", `actions/${result.action.id}/approve`, { body: "My reviewed reply" });
    execute(state, "POST", `actions/${result.action.id}/approve`, { body: "My reviewed reply" });
    expect(result.action.payload.body).toBe("My reviewed reply");
    expect(state.audit.filter(a => a.action === "demo.action.executed")).toHaveLength(1);
    expect(() => execute(state, "POST", `actions/${result.action.id}/reject`, {})).toThrow("already reviewed");
  });
  it("returns real matching fixture citations and an honest empty result", () => {
    const state = initialState();
    const result = execute(state, "POST", "search", { query: "Acme" }) as SearchResponse;
    expect(result.sources.length).toBeGreaterThan(0);
    for (const source of result.sources) expect(execute(state, "GET", `threads/${source.threadId}`, {})).toBeTruthy();
    expect((execute(state, "POST", "search", { query: "zzzzzz" }) as SearchResponse).sources).toHaveLength(0);
  });
  it("rejects invalid mutations and missing source threads", () => {
    expect(() => execute(initialState(), "PATCH", "commitments/commitment_deck", { status: "invented" })).toThrow();
    expect(() => execute(initialState(), "GET", "threads/missing", {})).toThrow("not found");
  });
});
