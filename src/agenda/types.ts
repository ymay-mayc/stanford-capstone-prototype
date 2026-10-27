export type DayId = "sun" | "mon" | "tue";

export type SessionType = "Meeting" | "Breakout" | "Theater" | "Hands-on Training" | "Roundtable";

export type Occurrence = {
  id: string;
  day: DayId;
  start: number;
  end: number;
  initialOnAgenda: boolean;
};

export type Session = {
  id: string;
  title: string;
  type: SessionType;
  day: DayId;
  start: number;
  end: number;
  location: string;
  speaker: string;
  description: string;
  equipment?: string;
  track: string;
  recommended: boolean;
  initialOnAgenda: boolean;
  initialSaved: boolean;
  /** Sessions stacked under a +N chip in the saved agenda. Titles were not in the page. */
  overflowCount: number;
  addLabel: string;
  forced: boolean;
  featured: boolean;
  occurrences: Occurrence[];
};

export type AgendaEntry = {
  session: Session;
  occurrence: Occurrence;
};

export type View =
  | { name: "agenda" }
  | { name: "activities" }
  | { name: "detail"; sessionId: string }
  | { name: "info"; topic: string };

export type LayoutMode = "calendar" | "list";

export type SyncTarget = "google" | "outlook" | "apple" | null;
