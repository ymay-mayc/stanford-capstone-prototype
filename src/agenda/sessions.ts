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
    id: "test-meeting",
    title: "Breakfast with team",
    type: "Meeting",
    day: "sun",
    start: 9 * 60 + 30,
    end: 9 * 60 + 55,
    location: "",
    speaker: "",
    description: "Meeting on the Sunday agenda.",
    track: "Meeting",
    recommended: false,
    initialOnAgenda: true,
    initialSaved: false,
    overflowCount: 1,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "devops",
    title: "The Future of DevOps on the Salesforce Platform",
    type: "Breakout",
    day: "sun",
    start: 10 * 60,
    end: 10 * 60 + 45,
    location: "Metreon AMC, L3, Theatre 15",
    speaker: "",
    description: "Breakout on the Salesforce platform and DevOps.",
    track: "Breakout",
    recommended: false,
    initialOnAgenda: true,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "certifications",
    title: "Accelerate Your Career with Salesforce Certifications",
    type: "Theater",
    day: "sun",
    start: 12 * 60,
    end: 12 * 60 + 20,
    location: "",
    speaker: "",
    description: "Theater session on Salesforce certifications.",
    track: "Theater",
    recommended: false,
    initialOnAgenda: true,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "partner-meeting",
    title: "Stop by Accenture booth",
    type: "Meeting",
    day: "sun",
    start: 14 * 60 + 30,
    end: 14 * 60 + 55,
    location: "",
    speaker: "",
    description: "Partner meeting PMTG1678.",
    track: "Meeting",
    recommended: false,
    initialOnAgenda: true,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "city-of-la",
    title: "12 Departments, 1 Platform: City of L.A. Drives Efficiency",
    type: "Breakout",
    day: "sun",
    start: 16 * 60,
    end: 16 * 60 + 45,
    location: "Moscone West, L3, Room 3016",
    speaker: "",
    description: "Breakout on how the City of Los Angeles uses one platform across 12 departments.",
    track: "Breakout",
    recommended: true,
    initialOnAgenda: false,
    initialSaved: true,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "sic-outbound",
    title: "SIC meeting",
    type: "Meeting",
    day: "mon",
    start: 9 * 60,
    end: 9 * 60 + 25,
    location: "",
    speaker: "",
    description: "Outbound meeting on the Monday agenda.",
    track: "Meeting",
    recommended: false,
    initialOnAgenda: true,
    initialSaved: false,
    overflowCount: 2,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "data-cloud-devs",
    title: "Introduction to Data Cloud for developers",
    type: "Theater",
    day: "mon",
    start: 11 * 60,
    end: 11 * 60 + 20,
    location: "",
    speaker: "",
    description: "Theater introduction to Data Cloud for developers.",
    track: "Theater",
    recommended: true,
    initialOnAgenda: false,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "appexchange-ai",
    title: "5 Ways to Get Your Business AI-Ready with AppExchange",
    type: "Theater",
    day: "mon",
    start: 12 * 60,
    end: 12 * 60 + 20,
    location: "",
    speaker: "",
    description: "Theater session on getting a business AI-ready with AppExchange.",
    track: "Theater",
    recommended: true,
    initialOnAgenda: false,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "sales-coaching",
    title: "Get Started with Agentforce Sales Coaching",
    type: "Hands-on Training",
    day: "tue",
    start: 10 * 60,
    end: 11 * 60,
    location: "Moscone West, L2, Roundtable 4",
    speaker: "",
    description: "Hands-on training for Agentforce Sales Coaching.",
    track: "Hands-on Training",
    recommended: true,
    initialOnAgenda: false,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Reserve my seat",
    forced: false,
    featured: false,
  },
  {
    id: "ux-ai",
    title: "6 UX Design Tips to Make AI Trustworthy and Easier to Use",
    type: "Theater",
    day: "tue",
    start: 13 * 60,
    end: 13 * 60 + 20,
    location: "",
    speaker: "",
    description: "Theater session on UX practices that make AI easier to trust and use.",
    track: "Theater",
    recommended: false,
    initialOnAgenda: true,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "coach-aes",
    title: "How Salesforce Ramps AEs with Coach and Next Best Actions",
    type: "Theater",
    day: "tue",
    start: 15 * 60,
    end: 15 * 60 + 20,
    location: "",
    speaker: "",
    description: "Theater session on ramping account executives with Coach and next best actions.",
    track: "Theater",
    recommended: true,
    initialOnAgenda: false,
    initialSaved: false,
    overflowCount: 0,
    addLabel: "Add to agenda",
    forced: false,
    featured: false,
  },
  {
    id: "agentic-enterprise",
    title: "Considerations for a Successful Agentic Enterprise",
    type: "Roundtable",
    day: "tue",
    start: 17 * 60,
    end: 18 * 60,
    location: "Moscone West, L1 Forest, Appy Theater",
    speaker: "",
    description: "Roundtable on what a successful agentic enterprise needs in place.",
    track: "Roundtable",
    recommended: false,
    initialOnAgenda: true,
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
