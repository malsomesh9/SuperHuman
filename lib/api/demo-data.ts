import type { AuditLog, Commitment, CompanyMemory, ConflictSignal, ConnectorHealth, DailyBrief, Decision, Email, ExecutionGraphResponse, ExecutionWorkflow, FollowUp, NeedsYouResponse, PersonSummary, PolicyRule, Project, SearchResponse, ShadowModeReport, SmartAction, SmartAttachment, Thread, TodayResponse, User, WorkflowSimulation } from "@/types/domain";

const sarah: PersonSummary = {
  id: "person_sarah",
  name: "Sarah Chen",
  primaryEmail: "sarah@acme.example",
  company: "Acme Ventures",
  relationshipType: "investor",
  lastInteractionAt: "2026-09-07T10:30:00Z",
  interactionCount: 12
};

const rahul: PersonSummary = {
  id: "person_rahul",
  name: "Rahul Mehta",
  primaryEmail: "rahul@eventseal.example",
  company: "EventSeal",
  relationshipType: "colleague",
  lastInteractionAt: "2026-09-07T09:10:00Z",
  interactionCount: 28
};

export const demoUser: User = {
  id: "demo-user",
  name: "Somesh",
  email: "demo@smartemail.local",
  timezone: "Asia/Kolkata",
  locale: "en"
};

export const demoPeople: PersonSummary[] = [sarah, rahul];

export const demoEmails: Email[] = [
  {
    id: "email_deck",
    threadId: "thread_acme",
    subject: "Revised pitch deck",
    fromEmail: "sarah@acme.example",
    fromName: "Sarah Chen",
    snippet: "Can you send the revised deck Friday? We'll review Monday and get back to you.",
    normalizedText: "Can you send the revised deck Friday? We'll review Monday and get back to you.",
    receivedAt: "2026-09-07T10:30:00Z",
    importance: "high",
    isRead: false,
    labels: ["investor", "needs_action"]
  },
  {
    id: "email_soc2",
    threadId: "thread_acme_security",
    subject: "SOC 2 checklist",
    fromEmail: "legal@acme.example",
    fromName: "Acme Legal",
    snippet: "Please send the SOC 2 summary today before the security review.",
    normalizedText: "Please send the SOC 2 summary today before the security review.",
    receivedAt: "2026-09-07T08:00:00Z",
    importance: "high",
    isRead: false,
    labels: ["customer", "security"]
  },
  {
    id: "email_hiring",
    threadId: "thread_hiring",
    subject: "Frontend candidate loop",
    fromEmail: "rahul@eventseal.example",
    fromName: "Rahul Mehta",
    snippet: "Can you review Nina's scorecard by tomorrow?",
    normalizedText: "Can you review Nina's scorecard by tomorrow?",
    receivedAt: "2026-09-06T15:00:00Z",
    importance: "normal",
    isRead: true,
    labels: ["hiring"]
  }
];

export const demoCommitments: Commitment[] = [
  {
    id: "commitment_deck",
    action: "Send revised pitch deck to Sarah",
    description: "Sarah asked for the revised deck by Friday.",
    ownerType: "user",
    status: "open",
    deadline: "2026-09-08T17:00:00+05:30",
    deadlineText: "Friday",
    confidence: 0.93,
    requiresConfirmation: false,
    sourceEmailId: "email_deck",
    threadId: "thread_acme",
    person: sarah,
    source: {
      emailId: "email_deck",
      threadId: "thread_acme",
      subject: "Revised pitch deck",
      sentAt: "2026-09-07T10:30:00Z",
      excerpt: "Can you send the revised deck Friday?"
    }
  },
  {
    id: "commitment_soc2",
    action: "Send SOC 2 summary",
    description: "Acme Legal needs the security summary before review.",
    ownerType: "user",
    status: "overdue",
    deadline: "2026-09-07T17:00:00+05:30",
    deadlineText: "today",
    confidence: 0.9,
    requiresConfirmation: false,
    sourceEmailId: "email_soc2",
    threadId: "thread_acme_security",
    person: sarah,
    source: {
      emailId: "email_soc2",
      threadId: "thread_acme_security",
      subject: "SOC 2 checklist",
      sentAt: "2026-09-07T08:00:00Z",
      excerpt: "Please send the SOC 2 summary today"
    }
  },
  {
    id: "commitment_wait_sarah",
    action: "Investment decision from Sarah",
    description: "Sarah said Acme will review Monday and get back to you.",
    ownerType: "other",
    status: "waiting",
    deadline: "2026-09-09T17:00:00+05:30",
    deadlineText: "Monday",
    confidence: 0.88,
    requiresConfirmation: false,
    sourceEmailId: "email_deck",
    threadId: "thread_acme",
    person: sarah,
    source: {
      emailId: "email_deck",
      threadId: "thread_acme",
      subject: "Revised pitch deck",
      sentAt: "2026-09-07T10:30:00Z",
      excerpt: "We'll review Monday and get back to you."
    }
  },
  {
    id: "commitment_scorecard",
    action: "Review Nina's scorecard",
    description: "Rahul asked for scorecard review by tomorrow.",
    ownerType: "user",
    status: "detected",
    deadline: "2026-09-09T17:00:00+05:30",
    deadlineText: "tomorrow",
    confidence: 0.72,
    requiresConfirmation: true,
    sourceEmailId: "email_hiring",
    threadId: "thread_hiring",
    person: rahul,
    source: {
      emailId: "email_hiring",
      threadId: "thread_hiring",
      subject: "Frontend candidate loop",
      sentAt: "2026-09-06T15:00:00Z",
      excerpt: "Can you review Nina's scorecard by tomorrow?"
    }
  }
];

export const demoFollowups: FollowUp[] = [
  {
    id: "followup_acme",
    threadId: "thread_acme",
    personId: "person_sarah",
    reason: "Proposal sent Sep 1, no response for 6 days",
    scheduledFor: "2026-09-08T11:00:00+05:30",
    status: "suggested",
    daysWaiting: 6,
    person: sarah
  },
  {
    id: "followup_invoice",
    threadId: "thread_invoice",
    personId: "person_rahul",
    reason: "Invoice approval is overdue by 4 days",
    scheduledFor: "2026-09-08T13:00:00+05:30",
    status: "suggested",
    daysWaiting: 4,
    person: rahul
  }
];

export const demoActions: SmartAction[] = [
  {
    id: "action_followup_sarah",
    actionType: "send_email",
    status: "pending_approval",
    riskLevel: 4,
    reason: "No response for 6 days after proposal",
    payload: { to: "sarah@acme.example", subject: "Following up on the proposal", body: "Hi Sarah,\n\nFollowing up on the revised deck and investment decision. Happy to send anything else helpful.\n\nBest,\nSomesh" },
    sourceThreadId: "thread_acme",
    sourceEmailId: "email_deck",
    createdAt: "2026-09-08T06:00:00Z",
    executedAt: null
  }
];

export const demoWorkflows: ExecutionWorkflow[] = [
  {
    id: "workflow_duplicate_refund",
    title: "Refund duplicate card charge",
    customer: "Acme Pilot",
    priority: "critical",
    status: "needs_approval",
    outcome: "Duplicate $120 charge refunded and customer informed.",
    elapsedText: null,
    source: {
      emailId: "email_refund",
      threadId: "thread_refund",
      subject: "Duplicate charge",
      sentAt: "2026-09-08T04:15:00Z",
      excerpt: "Our card was charged twice. Can you refund the duplicate?"
    },
    policy: {
      riskLevel: 5,
      approvalRequired: true,
      maxAmount: 150
    },
    steps: [
      { id: "detect", label: "Detected refund request", detail: "Customer reported duplicate card charge.", status: "completed", evidence: "Customer email" },
      { id: "stripe_lookup", label: "Verified Stripe charges", detail: "Found two matching $120 charges for the same customer.", status: "completed", evidence: "Stripe charge ch_120_a and ch_120_b" },
      { id: "policy", label: "Checked refund policy", detail: "Refund is within the $150 approval threshold.", status: "completed", evidence: "Refund policy v3" },
      { id: "approval", label: "Needs you", detail: "Approve refund and customer confirmation.", status: "ready", evidence: "Risk level 5 requires human approval" },
      { id: "refund", label: "Issue refund", detail: "Refund duplicate Stripe charge.", status: "pending" },
      { id: "crm", label: "Update CRM", detail: "Mark customer issue resolved.", status: "pending" },
      { id: "reply", label: "Send confirmation", detail: "Tell customer the duplicate charge was refunded.", status: "pending" },
      { id: "verify", label: "Verify outcome", detail: "Confirm refund succeeded and workflow closed.", status: "pending" }
    ]
  }
];

export const demoThreads: Thread[] = [
  {
    id: "thread_acme",
    subject: "Revised pitch deck",
    latestMessageAt: "2026-09-07T10:30:00Z",
    messageCount: 5,
    summary: "Sarah requested the revised deck and said Acme will review Monday.",
    priority: "high",
    requiresAction: true,
    emails: [demoEmails[0]!],
    commitments: demoCommitments.filter((item) => item.threadId === "thread_acme"),
    followUps: demoFollowups.filter((item) => item.threadId === "thread_acme")
  }
];

export const demoProjects: Project[] = [
  { id: "project_eventseal", name: "EventSeal", description: "Launch, investor, and hiring conversations.", confidence: 0.84, updatedAt: "2026-09-08T06:00:00Z", openCommitments: 4, waiting: 3, decisions: 1 },
  { id: "project_acme", name: "Acme Pilot", description: "Enterprise pilot, SOC 2, pricing, and contract review.", confidence: 0.91, updatedAt: "2026-09-07T10:30:00Z", openCommitments: 2, waiting: 1, decisions: 1 }
];

export const demoDailyBrief: DailyBrief = {
  headline: "Your inbox has 5 loops to close today.",
  generatedAt: "2026-09-08T06:20:00Z",
  focusWindow: "Next 6 hours",
  metrics: { due: 1, overdue: 1, waiting: 1, followups: 2, approvals: 2 },
  priorities: [
    { id: "priority_deck", title: "Send revised pitch deck to Sarah", reason: "Due today and tied to Acme's Monday investment review.", cta: "Draft reply", href: "/thread/thread_acme", priority: "high" },
    { id: "priority_refund", title: "Approve duplicate charge refund", reason: "Policy is checked. SmartEmail can refund, update CRM, and confirm with the customer.", cta: "Review execution", href: "/actions", priority: "critical" },
    { id: "priority_soc2", title: "Send SOC 2 summary", reason: "Acme Legal is waiting before security review.", cta: "Open source", href: "/thread/thread_acme_security", priority: "high" }
  ]
};

export const demoConnectors: ConnectorHealth[] = [
  { id: "connector_gmail", name: "Gmail", status: "connected", lastSyncAt: "2026-09-08T06:18:00Z", scopes: ["read email", "prepare drafts", "send with approval"], recordsIndexed: 1204, issue: null },
  { id: "connector_drive", name: "Google Drive", status: "connected", lastSyncAt: "2026-09-08T06:12:00Z", scopes: ["read selected files", "attach with approval"], recordsIndexed: 38, issue: null },
  { id: "connector_calendar", name: "Google Calendar", status: "syncing", lastSyncAt: "2026-09-08T06:05:00Z", scopes: ["read events"], recordsIndexed: 24, issue: null },
  { id: "connector_stripe", name: "Stripe", status: "connected", lastSyncAt: "2026-09-08T05:59:00Z", scopes: ["verify charges", "refund with approval"], recordsIndexed: 12, issue: null },
  { id: "connector_crm", name: "CRM", status: "needs_attention", lastSyncAt: "2026-09-07T15:44:00Z", scopes: ["update customer status"], recordsIndexed: 57, issue: "OAuth permission expires soon" }
];

export const demoDecisions: Decision[] = [
  { id: "decision_stripe", projectId: "project_eventseal", title: "Use Stripe for the international pilot", reason: "Better card coverage for Acme and faster refund operations during the pilot.", decidedAt: "2026-09-02T11:20:00Z", source: { emailId: "email_invoice", threadId: "thread_invoice", subject: "Invoice approval", sentAt: "2026-09-04T12:00:00Z", excerpt: "Finance is waiting on your approval for the August invoice." } },
  { id: "decision_soc2", projectId: "project_acme", title: "Send SOC 2 summary before legal review", reason: "Acme Legal requested the summary before the next security checkpoint.", decidedAt: "2026-09-07T08:00:00Z", source: { emailId: "email_soc2", threadId: "thread_acme_security", subject: "SOC 2 checklist", sentAt: "2026-09-07T08:00:00Z", excerpt: "Please send the SOC 2 summary today before the security review." } }
];

export const demoExecutionGraph: ExecutionGraphResponse = {
  insight: "Sarah's request created a user-owned commitment, a waiting item, and one prepared follow-up. The refund workflow is ready to execute after approval.",
  nodes: [
    { id: "email_deck", label: "Sarah requested revised deck", kind: "email", status: "source", priority: "high" },
    { id: "commitment_deck", label: "You owe revised pitch deck", kind: "commitment", status: "open", priority: "high" },
    { id: "commitment_wait_sarah", label: "Waiting on investment decision", kind: "waiting", status: "waiting", priority: "normal" },
    { id: "action_followup_sarah", label: "Prepared follow-up", kind: "action", status: "pending_approval", priority: "high" },
    { id: "workflow_duplicate_refund", label: "Refund duplicate charge", kind: "workflow", status: "needs_approval", priority: "critical" }
  ],
  edges: [
    { id: "edge_1", from: "email_deck", to: "commitment_deck", label: "created commitment" },
    { id: "edge_2", from: "email_deck", to: "commitment_wait_sarah", label: "created waiting item" },
    { id: "edge_3", from: "commitment_wait_sarah", to: "action_followup_sarah", label: "prepared follow-up" },
    { id: "edge_4", from: "workflow_duplicate_refund", to: "action_followup_sarah", label: "confirmation email" }
  ]
};

export const demoPolicies: PolicyRule[] = [
  { id: "policy_investor_send", name: "Investor mail requires approval", action: "gmail.send", condition: "relationshipType = investor", autonomyLevel: 2, requireApproval: true, status: "active" },
  { id: "policy_refund_limit", name: "Refunds above $50 need approval", action: "stripe.refund", condition: "amount > 50", autonomyLevel: 4, requireApproval: true, status: "active" },
  { id: "policy_newsletters", name: "Archive newsletters automatically", action: "gmail.archive", condition: "category = newsletter", autonomyLevel: 3, requireApproval: false, status: "active" },
  { id: "policy_finance_attachment", name: "Never attach financial files automatically", action: "drive.attach", condition: "file.category = finance", autonomyLevel: 2, requireApproval: true, status: "active" }
];

export const demoShadowMode: ShadowModeReport = {
  window: "Last 7 days",
  summary: "SmartEmail would have completed routine work while escalating investor, finance, and customer-impact decisions.",
  simulated: { archived: 42, draftsPrepared: 8, tasksCreated: 3, followupsSent: 2, escalated: 5 },
  examples: [
    { id: "shadow_newsletters", title: "Archive low-priority newsletters", outcome: "42 archived", policy: "Archive newsletters automatically", wouldExecute: true },
    { id: "shadow_investor", title: "Send investor follow-up", outcome: "Draft prepared only", policy: "Investor mail requires approval", wouldExecute: false },
    { id: "shadow_refund", title: "Refund duplicate charge", outcome: "Escalated for approval", policy: "Refunds above $50 need approval", wouldExecute: false }
  ]
};

export const demoSimulations: WorkflowSimulation[] = [
  { id: "simulation_invoice_followup", rule: "If invoice overdue 7 days, prepare follow-up", historicalWindow: "Last 90 days", triggered: 31, correct: 27, manualReview: 3, potentialMistakes: 1, recommendation: "Enable in prepare mode for customers and vendors." },
  { id: "simulation_bug_issue", rule: "If customer reports reproducible bug, prepare Linear issue", historicalWindow: "Last 90 days", triggered: 14, correct: 12, manualReview: 2, potentialMistakes: 0, recommendation: "Safe for low-risk issue creation after approval." }
];

export const demoCompanies: CompanyMemory[] = [
  { id: "company_acme", name: "Acme", domain: "acme.example", relationship: "Enterprise pilot", people: 8, openConversations: 5, potentialDeal: "$42K", requested: ["SOC 2", "SSO", "SCIM"], outstanding: ["Security questionnaire", "Partner decision"], risk: "Champion has not replied for 7 days", suggestedAction: "Follow up with Sarah and include the SOC 2 summary.", source: { emailId: "email_soc2", threadId: "thread_acme_security", subject: "SOC 2 checklist", sentAt: "2026-09-07T08:00:00Z", excerpt: "Please send the SOC 2 summary today before the security review." } },
  { id: "company_eventseal", name: "EventSeal", domain: "eventseal.example", relationship: "Internal launch", people: 12, openConversations: 9, potentialDeal: null, requested: ["Hiring scorecard", "August invoice approval"], outstanding: ["Nina scorecard review"], risk: null, suggestedAction: "Clear Rahul's hiring and finance asks before the investor update.", source: { emailId: "email_hiring", threadId: "thread_hiring", subject: "Frontend candidate loop", sentAt: "2026-09-06T15:00:00Z", excerpt: "Can you review Nina's scorecard by tomorrow?" } }
];

export const demoConflicts: ConflictSignal[] = [
  {
    id: "conflict_launch_date",
    title: "Launch date conflict",
    entity: "Enterprise Launch",
    priority: "high",
    suggestedResolution: "Ask Rahul to confirm whether Sep 22 replaced Sep 15 before replying to Acme.",
    values: [
      { sourceName: "Email", value: "Launch Sep 15", source: { emailId: "email_deck", threadId: "thread_acme", subject: "Revised pitch deck", sentAt: "2026-09-07T10:30:00Z", excerpt: "The prior launch note referenced Sep 15." } },
      { sourceName: "Slack", value: "Launch delayed to Sep 22", source: { emailId: "email_hiring", threadId: "thread_hiring", subject: "Frontend candidate loop", sentAt: "2026-09-06T15:00:00Z", excerpt: "Slack note: launch moved after beta QA." } }
    ]
  }
];

export const demoSmartAttachments: SmartAttachment[] = [
  { id: "attachment_deck_v22", commitmentId: "commitment_deck", fileName: "EventSeal-Deck-v22.pdf", reason: "Newest deck in the fundraising folder and referenced in Slack 2 hours ago.", modifiedAt: "2026-09-08T05:47:00Z", source: "Google Drive", confidence: "high", requiresApproval: true },
  { id: "attachment_soc2_summary", commitmentId: "commitment_soc2", fileName: "SOC2-Summary-2026.pdf", reason: "Latest approved security summary for Acme Legal.", modifiedAt: "2026-09-07T07:15:00Z", source: "Google Drive", confidence: "medium", requiresApproval: true }
];

export const demoNeedsYou: NeedsYouResponse = {
  metrics: {
    approvals: 2,
    ambiguousDecisions: 1,
    overdueCommitments: 1,
    customerEscalations: 2,
    relationshipRisks: 1,
    aiHandledToday: 21,
    aiPrepared: 14,
    waiting: 3,
    completed: 19,
    loopsClosed: 7
  },
  items: [
    { id: "needs_refund", type: "approval", title: "Approve refund workflow", subject: "Duplicate card charge", reason: "Stripe found two matching $120 charges. Policy requires approval before refunding.", priority: "critical", href: "/actions", cta: "Inspect workflow", evidence: [demoWorkflows[0]!.source] },
    { id: "needs_contract_value", type: "conflict", title: "Resolve Acme contract value mismatch", subject: "Acme Pilot", reason: "Email says $20K while CRM says $25K. SmartEmail will not choose silently.", priority: "high", href: "/projects", cta: "Review evidence", evidence: [demoConflicts[0]!.values[0]!.source] },
    { id: "needs_soc2", type: "overdue", title: "Send SOC 2 summary", subject: "Security review", reason: "Acme Legal asked for this before review and the deadline is overdue.", priority: "critical", href: "/thread/thread_acme_security", cta: "Draft reply", evidence: [demoCommitments[1]!.source!] }
  ]
};

export const demoAudit: AuditLog[] = [
  { id: "audit_1", action: "commitment.created", resourceType: "commitment", resourceId: "commitment_deck", source: "ai", metadata: {}, createdAt: "2026-09-08T06:01:00Z" },
  { id: "audit_2", action: "followup.prepared", resourceType: "action", resourceId: "action_followup_sarah", source: "ai", metadata: {}, createdAt: "2026-09-08T06:04:00Z" }
];

export const demoToday: TodayResponse = {
  date: "2026-09-08",
  summary: { dueToday: 1, overdue: 1, waiting: 1, followups: 2, importantUnread: 2 },
  items: {
    dueToday: [demoCommitments[0]!],
    overdue: [demoCommitments[1]!],
    waiting: [demoCommitments[2]!],
    followups: demoFollowups,
    importantUnread: demoEmails.filter((email) => !email.isRead)
  }
};

export function demoSearch(query: string): SearchResponse {
  const lower = query.toLowerCase();
  const waiting = lower.includes("waiting") || lower.includes("acme");
  return {
    answer: waiting
      ? "You are waiting on Sarah at Acme for the investment decision. She said Acme would review Monday and get back to you."
      : "Sarah and Acme Legal both have active items tied to the pilot: the revised deck, SOC 2 summary, and investment decision.",
    sources: [
      { emailId: "email_deck", threadId: "thread_acme", subject: "Revised pitch deck", sentAt: "2026-09-07T10:30:00Z", excerpt: "We'll review Monday and get back to you." }
    ],
    threads: demoThreads
  };
}
