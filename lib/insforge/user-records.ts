"use client";

import { insforge } from "@/lib/insforge/client";
import type { SmartEmailUserRecord } from "@/types/domain";

type NewRecord = Omit<SmartEmailUserRecord, "id" | "user_id" | "created_at" | "updated_at">;

const seedRecords: NewRecord[] = [
  {
    record_type: "commitment",
    title: "Send revised pitch deck to Sarah",
    summary: "Sarah asked for the updated deck before Acme's investment review.",
    status: "open",
    priority: "high",
    source: "gmail",
    source_thread_id: "thread_acme",
    source_email_id: "email_deck",
    due_at: "2026-09-08T17:00:00+05:30",
    metadata: { person: "Sarah Chen", company: "Acme Ventures", quote: "Can you send the revised deck Friday?" }
  },
  {
    record_type: "waiting",
    title: "Investment decision from Sarah",
    summary: "Acme said they would review Monday and get back to you.",
    status: "waiting",
    priority: "normal",
    source: "gmail",
    source_thread_id: "thread_acme",
    source_email_id: "email_deck",
    due_at: "2026-09-09T17:00:00+05:30",
    metadata: { person: "Sarah Chen", company: "Acme Ventures", quote: "We'll review Monday and get back to you." }
  },
  {
    record_type: "approval",
    title: "Approve duplicate card refund",
    summary: "Stripe found two matching $120 charges. Human approval required.",
    status: "pending_approval",
    priority: "critical",
    source: "stripe",
    source_thread_id: "thread_refund",
    source_email_id: "email_refund",
    due_at: null,
    metadata: { amount: 120, policy: "Refunds above $50 need approval" }
  },
  {
    record_type: "decision",
    title: "Use Stripe for the international pilot",
    summary: "Stripe was chosen for card coverage and faster refund operations.",
    status: "completed",
    priority: "normal",
    source: "gmail",
    source_thread_id: "thread_invoice",
    source_email_id: "email_invoice",
    due_at: null,
    metadata: { alternative: "Razorpay", project: "EventSeal" }
  }
];

export async function listUserRecords() {
  const { data, error } = await insforge.database
    .from("smartemail_user_records")
    .select("id,user_id,record_type,title,summary,status,priority,source,source_thread_id,source_email_id,due_at,metadata,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return (data ?? []) as SmartEmailUserRecord[];
}

export async function ensureSeedUserRecords() {
  const existing = await listUserRecords();
  if (existing.length > 0) return existing;

  const { data, error } = await insforge.database
    .from("smartemail_user_records")
    .insert(seedRecords)
    .select("id,user_id,record_type,title,summary,status,priority,source,source_thread_id,source_email_id,due_at,metadata,created_at,updated_at");

  if (error) throw new Error(error.message);
  return (data ?? []) as SmartEmailUserRecord[];
}
