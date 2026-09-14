export type Priority = "critical" | "high" | "normal" | "low";
export type CommitmentStatus = "detected" | "open" | "in_progress" | "waiting" | "completed" | "overdue" | "cancelled" | "dismissed";
export type FollowUpStatus = "suggested" | "scheduled" | "sent" | "dismissed" | "cancelled";
export type ActionStatus = "pending_approval" | "approved" | "executed" | "rejected" | "failed" | "cancelled";
export type EmailCategory = "needs_action" | "waiting" | "fyi" | "newsletter" | "automated" | "low_priority" | "potential_opportunity";

export type User = {
  id: string;
  name: string | null;
  email: string;
  timezone: string;
  locale: string;
};

export type PersonSummary = {
  id: string;
  name: string | null;
  primaryEmail: string;
  company: string | null;
  relationshipType: string;
  lastInteractionAt: string | null;
  interactionCount: number;
};

export type EmailSource = {
  emailId: string;
  threadId: string;
  subject: string | null;
  sentAt: string | null;
  excerpt?: string;
};

export type Commitment = {
  id: string;
  action: string;
  description: string | null;
  ownerType: "user" | "other";
  status: CommitmentStatus;
  deadline: string | null;
  deadlineText: string | null;
  confidence: number;
  requiresConfirmation: boolean;
  sourceEmailId: string | null;
  threadId: string | null;
  person?: PersonSummary;
  source?: EmailSource;
};

export type FollowUp = {
  id: string;
  threadId: string | null;
  personId: string | null;
  reason: string;
  scheduledFor: string | null;
  status: FollowUpStatus;
  daysWaiting: number;
  person?: PersonSummary;
};

export type SmartAction = {
  id: string;
  actionType: string;
  status: ActionStatus;
  riskLevel: number;
  reason: string;
  payload: Record<string, unknown>;
  sourceThreadId: string | null;
  sourceEmailId: string | null;
  createdAt: string;
  executedAt: string | null;
};

export type WorkflowStepStatus = "pending" | "ready" | "running" | "completed" | "blocked";

export type WorkflowStep = {
  id: string;
  label: string;
  detail: string;
  status: WorkflowStepStatus;
  evidence?: string;
};

export type ExecutionWorkflow = {
  id: string;
  title: string;
  customer: string;
  priority: Priority;
  status: "needs_approval" | "running" | "completed" | "blocked";
  outcome: string;
  elapsedText: string | null;
  source: EmailSource;
  policy: {
    riskLevel: number;
    approvalRequired: boolean;
    maxAmount: number;
  };
  steps: WorkflowStep[];
};

export type DailyBrief = {
  headline: string;
  generatedAt: string;
  focusWindow: string;
  metrics: {
    due: number;
    overdue: number;
    waiting: number;
    followups: number;
    approvals: number;
  };
  priorities: Array<{
    id: string;
    title: string;
    reason: string;
    cta: string;
    href: string;
    priority: Priority;
  }>;
};

export type ConnectorStatus = "connected" | "syncing" | "needs_attention" | "disabled";

export type ConnectorHealth = {
  id: string;
  name: string;
  status: ConnectorStatus;
  lastSyncAt: string | null;
  scopes: string[];
  recordsIndexed: number;
  issue: string | null;
};

export type Decision = {
  id: string;
  projectId: string;
  title: string;
  reason: string;
  decidedAt: string;
  source: EmailSource;
};

export type ExecutionGraphNode = {
  id: string;
  label: string;
  kind: "email" | "commitment" | "waiting" | "workflow" | "action" | "system";
  status: string;
  priority: Priority;
};

export type ExecutionGraphEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
};

export type ExecutionGraphResponse = {
  nodes: ExecutionGraphNode[];
  edges: ExecutionGraphEdge[];
  insight: string;
};

export type NeedsYouItem = {
  id: string;
  type: "approval" | "ambiguity" | "overdue" | "escalation" | "relationship_risk" | "conflict";
  title: string;
  subject: string;
  reason: string;
  priority: Priority;
  href: string;
  cta: string;
  evidence: EmailSource[];
};

export type NeedsYouResponse = {
  metrics: {
    approvals: number;
    ambiguousDecisions: number;
    overdueCommitments: number;
    customerEscalations: number;
    relationshipRisks: number;
    aiHandledToday: number;
    aiPrepared: number;
    waiting: number;
    completed: number;
    loopsClosed: number;
  };
  items: NeedsYouItem[];
};

export type PolicyRule = {
  id: string;
  name: string;
  action: string;
  condition: string;
  autonomyLevel: 0 | 1 | 2 | 3 | 4;
  requireApproval: boolean;
  status: "active" | "draft" | "paused";
};

export type ShadowModeReport = {
  window: string;
  summary: string;
  simulated: {
    archived: number;
    draftsPrepared: number;
    tasksCreated: number;
    followupsSent: number;
    escalated: number;
  };
  examples: Array<{
    id: string;
    title: string;
    outcome: string;
    policy: string;
    wouldExecute: boolean;
  }>;
};

export type WorkflowSimulation = {
  id: string;
  rule: string;
  historicalWindow: string;
  triggered: number;
  correct: number;
  manualReview: number;
  potentialMistakes: number;
  recommendation: string;
};

export type CompanyMemory = {
  id: string;
  name: string;
  domain: string;
  relationship: string;
  people: number;
  openConversations: number;
  potentialDeal: string | null;
  requested: string[];
  outstanding: string[];
  risk: string | null;
  suggestedAction: string;
  source: EmailSource;
};

export type RelationshipRisk = {
  id: string;
  person: PersonSummary;
  reason: string;
  usualReplyTime: string;
  currentDelay: string;
  suggestedAction: string;
  priority: Priority;
  source: EmailSource;
};

export type ConflictSignal = {
  id: string;
  title: string;
  entity: string;
  values: Array<{
    sourceName: string;
    value: string;
    source: EmailSource;
  }>;
  suggestedResolution: string;
  priority: Priority;
};

export type SmartAttachment = {
  id: string;
  commitmentId: string;
  fileName: string;
  reason: string;
  modifiedAt: string;
  source: "Google Drive" | "Local" | "Email";
  confidence: "high" | "medium" | "low";
  requiresApproval: boolean;
};

export type SmartEmailUserRecord = {
  id: string;
  user_id: string;
  record_type: "email" | "commitment" | "waiting" | "followup" | "decision" | "approval" | "workflow" | "policy" | "company" | "attachment" | "audit";
  title: string;
  summary: string;
  status: "open" | "waiting" | "pending_approval" | "completed" | "dismissed" | "needs_attention";
  priority: Priority;
  source: string;
  source_thread_id: string | null;
  source_email_id: string | null;
  due_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Email = {
  id: string;
  threadId: string;
  subject: string | null;
  fromEmail: string;
  fromName: string | null;
  snippet: string | null;
  normalizedText: string | null;
  receivedAt: string | null;
  importance: string;
  isRead: boolean;
  labels: string[];
};

export type Thread = {
  id: string;
  subject: string | null;
  latestMessageAt: string | null;
  messageCount: number;
  summary: string | null;
  priority: string;
  requiresAction: boolean;
  emails?: Email[];
  commitments?: Commitment[];
  followUps?: FollowUp[];
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  confidence: number;
  updatedAt: string;
  openCommitments?: number;
  waiting?: number;
  decisions?: number;
};

export type AuditLog = {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  source: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type TodayResponse = {
  date: string;
  summary: {
    dueToday: number;
    overdue: number;
    waiting: number;
    followups: number;
    importantUnread: number;
  };
  items: {
    dueToday: Commitment[];
    overdue: Commitment[];
    waiting: Commitment[];
    followups: FollowUp[];
    importantUnread: Email[];
  };
};

export type SearchResponse = {
  answer: string;
  sources: Array<EmailSource | { commitmentId: string; threadId: string | null; action: string }>;
  threads: Thread[];
};
