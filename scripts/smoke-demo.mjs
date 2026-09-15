import assert from "node:assert/strict";

const origin = process.env.SMARTEMAIL_TEST_URL ?? "http://localhost:3000";
async function visitor() {
  const response = await fetch(`${origin}/api/demo/auth/demo-login`, { method: "POST", headers: { origin }, body: "{}" });
  assert.equal(response.status, 200, await response.text());
  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie);
  return async (path, method = "GET", body) => {
    const result = await fetch(`${origin}/api/demo/${path}`, { method, headers: { origin, cookie, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const payload = await result.json();
    assert.equal(result.status, 200, JSON.stringify(payload));
    assert.equal(payload.success, true);
    return payload.data;
  };
}

const first = await visitor();
const second = await visitor();
const followups = await first("followups");
for (const item of followups) await first(`threads/${item.threadId}/draft`, "POST", { intent: "follow-up", tone: "normal" });
const followupId = followups[0].id;
await first(`followups/${followupId}`, "PATCH", { operation: "snooze", days: 3 });
assert.equal((await first("followups")).some(f => f.id === followupId), false);
assert.equal((await first("followups?status=scheduled")).some(f => f.id === followupId), true);
assert.equal((await second("followups")).some(f => f.id === followupId), true);
await first(`followups/${followupId}`, "PATCH", { operation: "dismiss" });
assert.equal((await first("followups?status=dismissed")).some(f => f.id === followupId), true);
await first(`followups/${followupId}`, "PATCH", { operation: "restore" });
assert.equal((await first("followups")).some(f => f.id === followupId), true);
await first("commitments/commitment_deck", "PATCH", { status: "completed" });
assert.equal((await first("commitments")).find(c => c.id === "commitment_deck").status, "completed");
assert.equal((await second("commitments")).find(c => c.id === "commitment_deck").status, "open");
const { action } = await first("threads/thread_acme/draft", "POST", { intent: "follow up", tone: "friendly" });
await first(`actions/${action.id}/approve`, "POST", { body: "Reviewed demo reply" });
await first(`actions/${action.id}/approve`, "POST", { body: "Reviewed demo reply" });
assert.equal((await first("actions")).find(a => a.id === action.id).payload.body, "Reviewed demo reply");
assert.equal((await first("audit")).filter(a => a.resourceId === action.id && a.action === "demo.action.executed").length, 1);
assert.equal((await second("actions")).some(a => a.id === action.id), false);
const results = await first("search", "POST", { query: "Acme" });
assert.ok(results.sources.length);
for (const source of results.sources) assert.equal((await first(`threads/${source.threadId}`)).id, source.threadId);
const denied = await fetch(`${origin}/api/demo/today`);
assert.equal(denied.status, 401);
const csrf = await fetch(`${origin}/api/demo/auth/demo-login`, { method: "POST", headers: { origin: "https://invalid.example" } });
assert.equal(csrf.status, 403);
console.log("PASS: demo persistence, follow-up snooze/dismiss/restore, source drafts, visitor isolation, draft edits, idempotent approval, citations, auth and origin checks.");
