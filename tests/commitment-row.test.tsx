import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { CommitmentRow } from "@/components/commitments/commitment-row";
import type { Commitment } from "@/types/domain";

const commitment: Commitment = {
  id: "commitment_deck",
  action: "Send revised pitch deck to Sarah",
  description: "Sarah asked for the revised deck.",
  ownerType: "user",
  status: "open",
  deadline: "2026-09-08T17:00:00+05:30",
  deadlineText: "Friday",
  confidence: 0.93,
  requiresConfirmation: false,
  sourceEmailId: "email_deck",
  threadId: "thread_acme",
  person: {
    id: "person_sarah",
    name: "Sarah Chen",
    primaryEmail: "sarah@acme.example",
    company: "Acme Ventures",
    relationshipType: "investor",
    lastInteractionAt: "2026-09-07T10:30:00Z",
    interactionCount: 12
  },
  source: {
    emailId: "email_deck",
    threadId: "thread_acme",
    subject: "Revised pitch deck",
    sentAt: "2026-09-07T10:30:00Z",
    excerpt: "Can you send the revised deck Friday?"
  }
};

describe("CommitmentRow", () => {
  it("shows the action, person, source, and primary actions", () => {
    render(<CommitmentRow commitment={commitment} onOpen={vi.fn()} onDraft={vi.fn()} onComplete={vi.fn()} />);

    expect(screen.getByText("Send revised pitch deck to Sarah")).toBeInTheDocument();
    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(screen.getByText("Acme Ventures")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /draft reply/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /complete/i })).toBeInTheDocument();
  });
});
