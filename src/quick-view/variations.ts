export type PrimaryAction =
  | "add"
  | "rsvp"
  | "watch"
  | "coming-soon"
  | "ended";

export type QuickViewVariation = {
  id: string;
  label: string;
  detail: string;
  primary: PrimaryAction;
  showAiSummary: boolean;
};

export const variations: QuickViewVariation[] = [
  {
    id: "add",
    label: "Add to agenda",
    detail: "Current spec. Primary is Add to agenda.",
    primary: "add",
    showAiSummary: false,
  },
  {
    id: "rsvp",
    label: "Respond to RSVP",
    detail: "RSVP replaces Add to agenda.",
    primary: "rsvp",
    showAiSummary: false,
  },
  {
    id: "watch",
    label: "Watch now",
    detail: "Live or on-demand. Watch now replaces Add to agenda.",
    primary: "watch",
    showAiSummary: false,
  },
  {
    id: "coming-soon",
    label: "Coming soon",
    detail: "Virtual, not started. Watch action is disabled.",
    primary: "coming-soon",
    showAiSummary: false,
  },
  {
    id: "ended",
    label: "Ended",
    detail: "Session is over and cannot be watched.",
    primary: "ended",
    showAiSummary: false,
  },
  {
    id: "ai-summary",
    label: "AI summary",
    detail: "See AI summary sits between the primary action and See more details.",
    primary: "add",
    showAiSummary: true,
  },
];

export const session = {
  subtype: "Subtype",
  title: "7 Free Apps Every Salesforce Admin Should Have in a Toolkit",
  when: "Thursday, September 17 · 10:00 – 10:30AM PT",
  where: "Moscone West, L1 Forest, Appy Theater",
  video: "Video available",
  description:
    "The agentic era is here, but fragmented data holds businesses back. See how Data Cloud activates all your data to power Customer 360 apps, Agentforce, and real-time insights for intelligent action.",
  speaker:
    "Sharon Klardie · Sr. Director, AppExchange Labs & Innovation, Salesforce",
  seating: "Reserve seating, arrive 10 minutes early to guarantee your seat.",
};
