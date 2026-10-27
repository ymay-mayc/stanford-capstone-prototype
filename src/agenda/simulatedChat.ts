import { findOccurrence } from "./sessions";

/**
 * Simulated conversation. Nothing here calls a model.
 * Replies are written in advance and only recommend sessions that already exist in this prototype.
 */

export const SIMULATED_REPLY_DELAY_MS = 700;

export const presetPrompts = [
  { id: "ai", label: "Find sessions about AI and agents." },
  { id: "ux", label: "Find sessions about UX design." },
  { id: "leadership", label: "Find sessions about leadership." },
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
};

const scripts: Record<(typeof presetPrompts)[number]["id"], SimulatedReply> = {
  ai: {
    text: "I found 2 sessions that match your request about AI and agents. They both check out with your current schedule where the time and distance will not be a conflict.",
    suggestions: [
      { occurrenceId: "o002", reason: "", addInChat: false },
      { occurrenceId: "o083", reason: "", addInChat: false },
    ],
  },
  ux: {
    text: "One session in this agenda is specifically about design and building an interface. This preview has not checked walking time between rooms.",
    suggestions: [
      {
        occurrenceId: "o005",
        reason: "It walks through using agents to code a UI from Figma, which is the closest UX match here.",
      },
    ],
  },
  leadership: {
    text: "These sessions from this agenda match a request about leadership. This preview has not checked walking time between rooms.",
    suggestions: [
      {
        occurrenceId: "o098",
        reason: "Reese Witherspoon talks about how leaders build lasting relevance.",
      },
      {
        occurrenceId: "o100",
        reason: "Sterling K. Brown talks about leading with empathy as technology changes the work.",
      },
      {
        occurrenceId: "o075",
        reason: "Marc Benioff and Sam Altman discuss how leaders put new AI tools to work.",
      },
    ],
  },
};

const fallback: SimulatedReply = {
  text: "This preview only has prepared answers for the suggested requests above. Choose one to see sessions from this agenda.",
  suggestions: [],
};

export function simulatedReply(request: string): SimulatedReply {
  const match = presetPrompts.find((prompt) => prompt.label === request.trim());
  const reply = match ? scripts[match.id] : fallback;
  return {
    text: reply.text,
    suggestions: reply.suggestions.filter((item) => findOccurrence(item.occurrenceId)),
  };
}
