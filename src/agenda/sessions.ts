import type { AgendaEntry, DayId, Occurrence, Session } from "./types";

export const days: { id: DayId; label: string; short: string; weekday: string }[] = [
  { id: "sun", label: "Tuesday, September 15", short: "Tuesday, September 15", weekday: "Tuesday" },
  { id: "mon", label: "Wednesday, September 16", short: "Wednesday, September 16", weekday: "Wednesday" },
  { id: "tue", label: "Thursday, September 17", short: "Thursday, September 17", weekday: "Thursday" },
];

/** 7:00 AM through the 10:00 PM row, matching the schedule grid frame. */
export const dayStart = 7 * 60;
export const dayEnd = 22 * 60 + 30;
export const slotMinutes = 30;
/** 30-minute row height from the schedule grid frame. */
export const slotHeight = 160;

type SessionDraft = Omit<Session, "occurrences"> & { extra?: Occurrence[] };

function finalize(draft: SessionDraft): Session {
  const { extra, ...session } = draft;
  const primary: Occurrence = {
    id: session.id,
    day: session.day,
    start: session.start,
    end: session.end,
    initialOnAgenda: session.initialOnAgenda,
  };
  return { ...session, occurrences: [primary, ...(extra ?? [])] };
}

const drafts: SessionDraft[] = [
  {
    id: "o005",
    title: "From Figma to Vibes: Using Agents to Code Your UI",
    type: "Theater",
    day: "tue",
    start: 9 * 60,
    end: 9 * 60 + 20,
    location: "Moscone West, L1 Forest, Redwood Theater",
    speaker: "",
    description:
      "Learn how to transform Figma designs into production-ready Salesforce components using Agentforce Vibes and model context protocol (MCP) to bridge the gap between design and development.",
    seating: "First come first seated",
    context: "Role: Designer",
    track: "Role: Designer",
    recommended: true,
    initialOnAgenda: false,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "o075",
    title: "A Conversation With Marc Benioff and Sam Altman",
    type: "Keynote",
    day: "sun",
    start: 14 * 60,
    end: 14 * 60 + 45,
    location: "YBCA, Keynote - Blue Shield of California Theater",
    speaker: "Marc Benioff, Sam Altman",
    description:
      "Marc and Sam will explore how OpenAI is advancing the AI frontier and partnering with Salesforce to turn that intelligence into trusted tools for business.",
    seating: "First come first seated",
    context: "Topic: Thought Leadership; Format: Keynote / Main Keynote",
    track: "Topic: Thought Leadership",
    recommended: true,
    initialOnAgenda: false,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "o080",
    title: "AI that Advances Human Rights",
    type: "Theater",
    day: "mon",
    start: 9 * 60,
    end: 9 * 60 + 30,
    location: "Moscone North, LL, Campground, Agentic Theater",
    speaker: "",
    description:
      "Trust isn't a limit on AI, it's the accelerant. A look at how strong governance turns human rights and public trust into the sharpest competitive edge in AI, not a constraint on it.",
    seating: "First come first seated",
    context: "Topic: Thought Leadership",
    track: "Topic: Thought Leadership",
    recommended: true,
    initialOnAgenda: false,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "o087",
    title: "EDU.FYI and will.i.am: Giving Students Agency Over Agents",
    type: "Keynote",
    day: "mon",
    start: 15 * 60,
    end: 15 * 60 + 45,
    location: "YBCA, Keynote - Blue Shield of California Theater",
    speaker: "will.i.am, Sonya Christian",
    description:
      "will.i.am and Chancellor Sonya Christian explore EDUFYI, created with ASU, and how an Agentic Self that learns with students for life could reshape the future of education at scale.",
    seating: "First come first seated",
    context: "Topic: Thought Leadership; Format: Keynote / Main Keynote",
    track: "Topic: Thought Leadership",
    recommended: true,
    initialOnAgenda: false,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "o098",
    title: "Reese Witherspoon on Telling the Stories that Sell",
    type: "Keynote",
    day: "tue",
    start: 13 * 60 + 15,
    end: 14 * 60,
    location: "Moscone South, LL, Keynote - Hall B",
    speaker: "Reese Witherspoon",
    description:
      "Attention is the scarcest resource in business. Reese Witherspoon discusses why brands that put women at the center of the story win and how leaders can build lasting relevance.",
    seating: "First come first seated",
    context: "Topic: Thought Leadership; Format: Keynote / Main Keynote",
    track: "Topic: Thought Leadership",
    recommended: true,
    initialOnAgenda: false,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "o100",
    title: "Sterling K. Brown on Getting Humanity Right",
    type: "Keynote",
    day: "mon",
    start: 10 * 60,
    end: 10 * 60 + 30,
    location: "YBCA, Keynote - Blue Shield of California Theater",
    speaker: "Sterling K. Brown",
    description:
      "Sterling K. Brown explores why empathy, inclusion, and human judgment matter more as technology shapes how we work, lead, and build for the people we serve.",
    seating: "First come first seated",
    context: "Topic: Thought Leadership",
    track: "Topic: Thought Leadership",
    recommended: true,
    initialOnAgenda: false,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "o122",
    title: "Dreamforce Main Keynote 2026",
    type: "Main Keynote",
    day: "sun",
    start: 10 * 60,
    end: 12 * 60,
    location: "Moscone South, LL, Keynote - Hall B",
    speaker: "Marc Benioff",
    description:
      "Join Salesforce Chair and CEO Marc Benioff, along with special guests, to explore what it means to become an Agentic Enterprise, where humans, agents, and platforms together promote customer success.",
    seating: "First come first seated",
    context: "Format: Keynote / Main Keynote",
    track: "Format: Keynote / Main Keynote",
    recommended: true,
    initialOnAgenda: false,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "o002",
    title: "Beyond the Prompt: Engineering Agentforce UX with Intention",
    type: "Theater",
    day: "mon",
    start: 13 * 60,
    end: 13 * 60 + 20,
    location: "Moscone West, L1 Forest, Redwood Theater",
    speaker: "",
    description:
      "When deploying agents, we often trust the model to make it accessible. AI doesn't live with a disability; people do. We'll demonstrate how to ground Agentforce workflows in authentic user research.",
    seating: "First come first seated",
    context: "Role: Designer",
    track: "Role: Designer",
    recommended: false,
    initialOnAgenda: false,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "o083",
    title: "Can AI Help Humans Thrive?",
    type: "Theater",
    day: "sun",
    start: 15 * 60,
    end: 15 * 60 + 30,
    location: "Moscone North, LL, Campground, Agentic Theater",
    speaker: "",
    description:
      "Every AI system relies on a human layer, and it's usually left to chance. The last decade of consumer tech showed us the cost. Designing for it makes AI faster and improves outcomes for people.",
    seating: "First come first seated",
    context: "Topic: Thought Leadership",
    track: "Topic: Thought Leadership",
    recommended: false,
    initialOnAgenda: false,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
];

export const sessions: Session[] = drafts.map(finalize);

export function entriesFor(list: Session[]): AgendaEntry[] {
  return list.flatMap((session) =>
    session.occurrences.map((occurrence) => ({ session, occurrence })),
  );
}

export function findOccurrence(occurrenceId: string) {
  for (const session of sessions) {
    const occurrence = session.occurrences.find((item) => item.id === occurrenceId);
    if (occurrence) return { session, occurrence };
  }
  return null;
}

export function dayById(id: DayId) {
  return days.find((day) => day.id === id)!;
}

export function formatClock(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const mm = mins.toString().padStart(2, "0");
  return `${hour12}:${mm} ${suffix}`;
}

export function formatRange(start: number, end: number) {
  const startClock = formatClock(start);
  const endClock = formatClock(end);
  const [startTime, startSuffix] = startClock.split(" ");
  const [, endSuffix] = endClock.split(" ");
  const startLabel = startSuffix === endSuffix ? startTime : startClock;
  return `${startLabel} — ${endClock} PT`;
}

export function formatWhen(session: Pick<Session, "day" | "start" | "end">) {
  return `${dayById(session.day).label} · ${formatRange(session.start, session.end)}`;
}

function formatCompact(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${mins.toString().padStart(2, "0")}${suffix}`;
}

export function formatCardWhen(occurrence: Occurrence, location: string) {
  const when = `${formatCompact(occurrence.start)} – ${formatCompact(occurrence.end)} PDT`;
  return location ? `${when} · ${location}` : when;
}

export function rangesOverlap(a: Occurrence, b: Occurrence) {
  return a.day === b.day && a.id !== b.id && a.start < b.end && b.start < a.end;
}
