import { z } from "zod";
import * as seed from "@/lib/api/demo-data";
import type { SmartAction, Thread } from "@/types/domain";

export function initialState() {
  return structuredClone({ commitments: seed.demoCommitments, actions: seed.demoActions, workflows: seed.demoWorkflows, audit: seed.demoAudit, followups: seed.demoFollowups });
}
export type DemoState = ReturnType<typeof initialState>;
export class DemoError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
const missing = () => { throw new DemoError(404, "Demo record not found."); };
function threads(state: DemoState) {
  return seed.demoEmails.map(email => ({
    id: email.threadId, subject: email.subject, latestMessageAt: email.receivedAt,
    messageCount: 1, summary: email.snippet, priority: "high", requiresAction: !email.isRead,
    emails: [email], commitments: state.commitments.filter(c => c.threadId === email.threadId),
    followUps: state.followups.filter(f => f.threadId === email.threadId)
  } satisfies Thread));
}
function record(state: DemoState, action: string, id: string) {
  state.audit.unshift({ id: crypto.randomUUID(), action: `demo.${action}`, resourceType: "demo", resourceId: id, source: "simulation", metadata: { simulated: true }, createdAt: new Date().toISOString() });
  state.audit = state.audit.slice(0, 100);
}

export function execute(state: DemoState, method: string, path: string, body: unknown, status?: string | null): unknown {
  // Sessions created before follow-up persistence remain valid until expiry.
  state.followups ??= structuredClone(seed.demoFollowups);
  const dueFollowups = state.followups.filter(f => f.status === "suggested" || (f.status === "scheduled" && !!f.scheduledFor && Date.parse(f.scheduledFor) <= Date.now()));
  const parts = path.split("/").filter(Boolean);
  if (method === "GET") {
    const active = state.commitments.filter(c => !["completed", "dismissed", "cancelled"].includes(c.status));
    const items = { dueToday: active.filter(c => c.id === "commitment_deck"), overdue: active.filter(c => c.status === "overdue"), waiting: active.filter(c => c.ownerType === "other"), followups: dueFollowups, importantUnread: seed.demoEmails.filter(e => !e.isRead) };
    const today = { date: new Date().toISOString().slice(0, 10), items, summary: Object.fromEntries(Object.entries(items).map(([key, value]) => [key, value.length])) };
    const catalog: Record<string, unknown> = {
      health: { status: "ok" },
      me: seed.demoUser, today, commitments: status ? state.commitments.filter(c => c.status === status) : state.commitments,
      actions: state.actions, workflows: state.workflows, audit: state.audit,
      emails: { data: seed.demoEmails }, threads: { data: threads(state) }, followups: status ? state.followups.filter(f => f.status === status) : dueFollowups,
      people: seed.demoPeople, projects: seed.demoProjects, decisions: seed.demoDecisions,
      connectors: seed.demoConnectors, policies: seed.demoPolicies, companies: seed.demoCompanies,
      conflicts: seed.demoConflicts, "smart-attachments": seed.demoSmartAttachments,
      "daily-brief": seed.demoDailyBrief, "needs-you": seed.demoNeedsYou,
      "execution-graph": seed.demoExecutionGraph, "shadow-mode": seed.demoShadowMode, simulations: seed.demoSimulations
    };
    if (parts[0] === "threads" && parts[1]) return threads(state).find(t => t.id === parts[1]) ?? missing();
    return catalog[path] ?? missing();
  }
  if (method === "PATCH" && parts[0] === "followups" && parts.length === 2) {
    const input = z.discriminatedUnion("operation", [
      z.object({ operation: z.literal("snooze"), days: z.union([z.literal(1), z.literal(3), z.literal(7)]) }).strict(),
      z.object({ operation: z.literal("dismiss") }).strict(),
      z.object({ operation: z.literal("restore") }).strict()
    ]).parse(body);
    const item = state.followups.find(f => f.id === parts[1]) ?? missing();
    item.status = input.operation === "snooze" ? "scheduled" : input.operation === "dismiss" ? "dismissed" : "suggested";
    item.scheduledFor = input.operation === "snooze" ? new Date(Date.now() + input.days * 86400000).toISOString() : null;
    record(state, `followup.${input.operation}`, item.id);
    return item;
  }
  if (method === "PATCH" && parts[0] === "commitments" && parts.length === 2) {
    const patch = z.object({ status: z.enum(["detected", "open", "in_progress", "waiting", "completed", "overdue", "cancelled", "dismissed"]).optional(), action: z.string().min(1).max(300).optional(), deadline: z.string().datetime({ offset: true }).nullable().optional(), requiresConfirmation: z.boolean().optional() }).strict().parse(body);
    const item = state.commitments.find(c => c.id === parts[1]) ?? missing();
    Object.assign(item, patch);
    record(state, "commitment.updated", item.id);
    return item;
  }
  if (method === "POST" && parts[0] === "threads" && parts[2] === "draft") {
    const input = z.object({ intent: z.string().max(300), tone: z.string().max(30) }).parse(body);
    const thread = threads(state).find(t => t.id === parts[1]) ?? missing();
    if (state.actions.length >= 50) throw new DemoError(429, "Demo draft limit reached. Start a new demo session.");
    const email = thread.emails[0]!;
    const draft = `${input.tone === "formal" ? "Hello" : "Hi"} ${email.fromName ?? "there"},\n\n${input.intent.includes("follow") ? "Following up on our conversation. Could you share an update when you have a moment?" : `Thanks for your note about ${thread.subject?.toLowerCase() ?? "this"}. I will review the details and get back to you.`}\n\nBest,\nSomesh`;
    const action: SmartAction = { id: crypto.randomUUID(), actionType: "send_email", status: "pending_approval", riskLevel: 4, reason: "Template-based demo draft. No AI provider or email delivery is invoked.", payload: { to: email.fromEmail, subject: `Re: ${thread.subject}`, body: draft, simulated: true }, sourceThreadId: thread.id, sourceEmailId: email.id, createdAt: new Date().toISOString(), executedAt: null };
    state.actions.unshift(action);
    record(state, "draft.prepared", action.id);
    return { draft, action };
  }
  if (method === "POST" && parts[0] === "actions" && ["approve", "reject"].includes(parts[2] ?? "")) {
    const action = state.actions.find(a => a.id === parts[1]) ?? missing();
    const target = parts[2] === "approve" ? "executed" : "rejected";
    if (action.status === target) return action;
    if (action.status !== "pending_approval") throw new DemoError(409, "This action was already reviewed.");
    const input = z.object({ body: z.string().min(1).max(12000).optional() }).parse(body ?? {});
    if (input.body) action.payload.body = input.body;
    action.status = target;
    action.executedAt = target === "executed" ? new Date().toISOString() : null;
    record(state, `action.${target}`, action.id);
    return action;
  }
  if (method === "POST" && parts[0] === "workflows" && parts[2] === "approve") {
    const workflow = state.workflows.find(w => w.id === parts[1]) ?? missing();
    if (workflow.status !== "completed") {
      workflow.status = "completed";
      workflow.steps.forEach(step => { step.status = "completed"; });
      workflow.outcome = "Simulation complete. No refund, CRM update, or email was sent.";
      record(state, "workflow.simulated", workflow.id);
    }
    return workflow;
  }
  if (method === "POST" && path === "search") {
    const { query } = z.object({ query: z.string().min(1).max(500) }).parse(body);
    const words = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const matches = threads(state).filter(t => words.some(w => `${t.subject} ${t.summary} ${t.emails[0]?.fromName}`.toLowerCase().includes(w)));
    return { answer: matches.length ? "Matching sample conversations are listed below. Open a source to review the original wording." : "No matching sample conversations found.", sources: matches.map(t => ({ emailId: t.emails[0]!.id, threadId: t.id, subject: t.subject, sentAt: t.latestMessageAt, excerpt: t.summary ?? "" })), threads: matches };
  }
  throw new DemoError(404, "This demo operation is not available.");
}
