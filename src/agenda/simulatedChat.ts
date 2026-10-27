import { findOccurrence } from "./sessions";

/**
 * Simulated conversation. Nothing here calls a model.
 * Replies are written in advance and only recommend sessions that already exist in this prototype.
 */

export const SIMULATED_REPLY_DELAY_MS = 700;

export const presetPrompts = [
  { id: "ai", label: "Build an agenda about AI and agents." },
  { id: "ux", label: "Build an agenda about UX design." },
  { id: "leadership", label: "Build an agenda about leadership." },
] as const;

export type Suggestion = {
  occurrenceId: string;
  reason: string;
  /** When false, the session is added from the agenda below, not from the reply. */
  addInChat?: boolean;
};

export type SimulatedReply = {
  text: string;
  suggestions: Suggestion[];
  /** Sessions the prepared reply would put on the agenda. Empty until the attendee confirms. */
  proposal: string[];
};

const proposalReply =
  "I assembled a proposed agenda. It is not saved yet. The change summary shows what would be added or removed. You can edit or lock sessions, or update your agenda now.";

const scripts: Record<(typeof presetPrompts)[number]["id"], SimulatedReply> = {
  ai: {
    text: proposalReply,
    suggestions: [],
    proposal: ["o122", "o002", "o083", "o080"],
  },
  ux: {
    text: proposalReply,
    suggestions: [],
    proposal: ["o122", "o005", "o002"],
  },
  leadership: {
    text: proposalReply,
    suggestions: [],
    proposal: ["o122", "o098", "o100", "o075"],
  },
};

const fallback: SimulatedReply = {
  text: "This preview can prepare an agenda for the three requests above. Choose one to see a proposal.",
  suggestions: [],
  proposal: [],
};

export function simulatedReply(request: string): SimulatedReply {
  const match = presetPrompts.find((prompt) => prompt.label === request.trim());
  const reply = match ? scripts[match.id] : fallback;
  return {
    text: reply.text,
    suggestions: reply.suggestions.filter((item) => findOccurrence(item.occurrenceId)),
    proposal: reply.proposal.filter((id) => findOccurrence(id)),
  };
}
