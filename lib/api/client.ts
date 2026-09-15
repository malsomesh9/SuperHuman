import type { AuditLog, Commitment, CompanyMemory, ConflictSignal, ConnectorHealth, DailyBrief, Decision, Email, ExecutionGraphResponse, ExecutionWorkflow, FollowUp, NeedsYouResponse, PersonSummary, PolicyRule, Project, SearchResponse, ShadowModeReport, SmartAction, SmartAttachment, Thread, TodayResponse, User, WorkflowSimulation } from "@/types/domain";
import { demoActions, demoAudit, demoCommitments, demoCompanies, demoConflicts, demoConnectors, demoDailyBrief, demoDecisions, demoEmails, demoExecutionGraph, demoFollowups, demoNeedsYou, demoPeople, demoPolicies, demoProjects, demoSearch, demoShadowMode, demoSimulations, demoSmartAttachments, demoThreads, demoToday, demoUser, demoWorkflows } from "./demo-data";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status: number) {
    super(message);
  }
}

type ApiResponse<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };

export class ApiClient {
  constructor(private readonly getToken: () => string | null) {}

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = this.getToken();
    if (token === "insforge-session") {
      throw new ApiError("MAILBOX_NOT_CONNECTED", "Your account is signed in. Real Gmail mailbox access is not configured yet.", 503);
    }
    const base = demoMode && (token === "demo-token" || path === "/auth/demo-login") ? "/api/demo" : apiUrl;
    const response = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...init?.headers
      }
    });
    let body: ApiResponse<T>;
    try {
      body = await response.json() as ApiResponse<T>;
    } catch {
      throw new ApiError("INVALID_RESPONSE", "The server returned an unreadable response. Please try again.", response.status);
    }
    if (!body || typeof body !== "object" || !("success" in body)) throw new ApiError("INVALID_RESPONSE", "The server returned an invalid response.", response.status);
    if (!body.success) throw new ApiError(body.error.code, body.error.message, response.status);
    if (!response.ok) throw new ApiError("REQUEST_FAILED", "The request failed. Please try again.", response.status);
    return body.data;
  }

  async demoLogin() {
    if (!demoMode) throw new ApiError("DEMO_DISABLED", "Demo mode is disabled.", 403);
    return this.request<{ user: User; token: string }>("/auth/demo-login", { method: "POST", body: JSON.stringify({ email: demoUser.email }) });
  }

  async me() {
    if (demoMode && !this.getToken()) return demoUser;
    return this.request<User>("/me");
  }

  async health() {
    if (demoMode && this.getToken() === "demo-token") return this.request<{ status: string }>("/health");
    const url = new URL(apiUrl);
    return fetch(`${url.origin}/health`).then(async (response) => {
      if (!response.ok) throw new ApiError("HEALTHCHECK_FAILED", "Prototype API is not reachable.", response.status);
      return response.json() as Promise<{ success: true; data: { status: string } }>;
    });
  }

  async today() {
    return this.safe(() => this.request<TodayResponse>("/today"), demoToday);
  }

  async needsYou() {
    return this.safe(() => this.request<NeedsYouResponse>("/needs-you"), demoNeedsYou);
  }

  async dailyBrief() {
    return this.safe(() => this.request<DailyBrief>("/daily-brief"), demoDailyBrief);
  }

  async executionGraph() {
    return this.safe(() => this.request<ExecutionGraphResponse>("/execution-graph"), demoExecutionGraph);
  }

  async connectors() {
    return this.safe(() => this.request<ConnectorHealth[]>("/connectors"), demoConnectors);
  }

  async policies() {
    return this.safe(() => this.request<PolicyRule[]>("/policies"), demoPolicies);
  }

  async shadowMode() {
    return this.safe(() => this.request<ShadowModeReport>("/shadow-mode"), demoShadowMode);
  }

  async simulations() {
    return this.safe(() => this.request<WorkflowSimulation[]>("/simulations"), demoSimulations);
  }

  async companies() {
    return this.safe(() => this.request<CompanyMemory[]>("/companies"), demoCompanies);
  }

  async conflicts() {
    return this.safe(() => this.request<ConflictSignal[]>("/conflicts"), demoConflicts);
  }

  async smartAttachments() {
    return this.safe(() => this.request<SmartAttachment[]>("/smart-attachments"), demoSmartAttachments);
  }

  async emails() {
    return this.safe(async () => (await this.request<{ data: Email[] }>("/emails")).data, demoEmails);
  }

  async threads() {
    return this.safe(async () => (await this.request<{ data: Thread[] }>("/threads")).data, demoThreads);
  }

  async thread(id: string) {
    return this.safe(() => this.request<Thread>(`/threads/${id}`), demoThreads.find((thread) => thread.id === id) ?? demoThreads[0]!);
  }

  async commitments(status?: string) {
    return this.safe(() => this.request<Commitment[]>(`/commitments${status ? `?status=${status}` : ""}`), demoCommitments);
  }

  async updateCommitment(id: string, data: Partial<Commitment>) {
    return this.request<Commitment>(`/commitments/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  }

  async followups(status?: "scheduled" | "dismissed") {
    return this.safe(() => this.request<FollowUp[]>(`/followups${status ? `?status=${status}` : ""}`), demoFollowups);
  }

  async updateFollowup(id: string, input: { operation: "snooze"; days: 1 | 3 | 7 } | { operation: "dismiss" | "restore" }) {
    return this.request<FollowUp>(`/followups/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  }

  async people() {
    return this.safe(() => this.request<PersonSummary[]>("/people"), demoPeople);
  }

  async projects() {
    return this.safe(() => this.request<Project[]>("/projects"), demoProjects);
  }

  async decisions() {
    return this.safe(() => this.request<Decision[]>("/decisions"), demoDecisions);
  }

  async actions() {
    return this.safe(() => this.request<SmartAction[]>("/actions"), demoActions);
  }

  async workflows() {
    return this.safe(() => this.request<ExecutionWorkflow[]>("/workflows"), demoWorkflows);
  }

  async approveWorkflow(id: string) {
    return this.request<ExecutionWorkflow>(`/workflows/${id}/approve`, { method: "POST" });
  }

  async approveAction(id: string, body?: string) {
    return this.request<SmartAction>(`/actions/${id}/approve`, { method: "POST", body: JSON.stringify({ body }) });
  }

  async rejectAction(id: string) {
    return this.request<SmartAction>(`/actions/${id}/reject`, { method: "POST" });
  }

  async search(query: string) {
    return this.safe(() => this.request<SearchResponse>("/search", { method: "POST", body: JSON.stringify({ query }) }), demoSearch(query));
  }

  async draft(threadId: string, intent: string, tone: string) {
    return this.request<{ draft: string; action: SmartAction }>(`/threads/${threadId}/draft`, { method: "POST", body: JSON.stringify({ intent, tone }) });
  }

  async audit() {
    return this.safe(() => this.request<AuditLog[]>("/audit"), demoAudit);
  }

  private async safe<T>(call: () => Promise<T>, fallback: T) {
    void fallback;
    return call();
  }
}
