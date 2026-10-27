import { useEffect, useState } from "react";
import { useAgenda } from "./AgendaContext";
import { dayById, formatClock, formatRange, sessions } from "./sessions";
import type { DayId, Session, SessionType } from "./types";

type GoalId = "ai" | "ux" | "leadership";
type Reason = "topic" | "level" | "time";

type Preference = {
  kind: Reason;
  value: string;
  label: string;
};

const goalChoices: { id: GoalId; label: string }[] = [
  { id: "ai", label: "AI and agents" },
  { id: "ux", label: "UX" },
  { id: "leadership", label: "Leadership" },
];

const suggestionOrder = ["o002", "o005", "o083", "o080", "o075", "o122", "o087", "o098", "o100"];

const fitReason: Record<string, string> = {
  o002: "This session covers how agent workflows should be grounded in user research.",
  o005: "This session walks through using agents to code an interface from Figma.",
  o083: "This session looks at the human layer that AI systems depend on.",
  o080: "This session covers trust and human rights in AI systems.",
  o075: "Marc Benioff and Sam Altman discuss putting new AI tools to work.",
  o122: "The main keynote covers humans and agents working together.",
  o087: "This keynote covers students using agents.",
  o098: "Reese Witherspoon talks about how leaders build lasting relevance.",
  o100: "Sterling K. Brown talks about leading with empathy as technology changes the work.",
};

export function ChooseSession({
  slotRequest,
}: {
  slotRequest: { day: DayId; minute: number; nonce: number } | null;
}) {
  const { isOnAgenda, toggleAgenda, openQuickView } = useAgenda();
  const [goals, setGoals] = useState<GoalId[]>(["ai", "ux"]);
  const [editingGoals, setEditingGoals] = useState(false);
  const [passed, setPassed] = useState<Record<string, boolean>>({});
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<Reason | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [slot, setSlot] = useState<{ day: DayId; minute: number } | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");

  useEffect(() => {
    if (!slotRequest) return;
    setSlot({ day: slotRequest.day, minute: slotRequest.minute });
    setShowAlternatives(true);
  }, [slotRequest]);

  const queue = suggestionOrder
    .map((id) => sessions.find((session) => session.id === id))
    .filter((session): session is Session => Boolean(session))
    .filter((session) => matchesGoals(session, goals) && allowed(session, preferences) && !passed[session.id] && !isOnAgenda(session.id));

  const focused = focusId ? queue.find((session) => session.id === focusId) : undefined;
  const current = focused ?? queue[0] ?? null;
  const added = sessions
    .filter((session) => isOnAgenda(session.id))
    .sort((a, b) => dayRank(a.day) - dayRank(b.day) || a.start - b.start);
  const alternatives = sessions.filter((session) => session.id !== current?.id && !isOnAgenda(session.id));
  const slotMatches = slot
    ? alternatives.filter(
        (session) => session.day === slot.day && session.start < slot.minute + 30 && session.end > slot.minute,
      )
    : alternatives;
  const alternativeList = slot && slotMatches.length > 0 ? slotMatches : alternatives;

  function toggleGoal(id: GoalId) {
    setGoals((currentGoals) =>
      currentGoals.includes(id) ? currentGoals.filter((goal) => goal !== id) : [...currentGoals, id],
    );
    setFocusId(null);
  }

  function addSession(session: Session) {
    if (!isOnAgenda(session.id)) toggleAgenda(session.id);
    setPassed((currentPassed) => {
      if (!currentPassed[session.id]) return currentPassed;
      const next = { ...currentPassed };
      delete next[session.id];
      return next;
    });
    setFocusId(null);
    setFeedbackOpen(false);
    setSelectedReason(null);
    setLiveMessage(`${session.title} added to your agenda.`);
  }

  function undo(session: Session) {
    if (isOnAgenda(session.id)) toggleAgenda(session.id);
    setFocusId(session.id);
    setLiveMessage(`${session.title} removed from your agenda.`);
  }

  function confirmPass() {
    if (!current) return;
    const nextPreferences = [...preferences];
    if (selectedReason === "topic" && !nextPreferences.some((item) => item.kind === "topic" && item.value === current.track)) {
      nextPreferences.push({ kind: "topic", value: current.track, label: `Avoiding ${current.track}` });
    }
    if (selectedReason === "level" && !nextPreferences.some((item) => item.kind === "level" && item.value === current.type)) {
      nextPreferences.push({ kind: "level", value: current.type, label: `Avoiding ${current.type}` });
    }
    if (selectedReason === "time") {
      const band = current.start < 12 * 60 ? "morning" : "afternoon";
      if (!nextPreferences.some((item) => item.kind === "time" && item.value === band)) {
        nextPreferences.push({
          kind: "time",
          value: band,
          label: `Avoiding ${band} sessions`,
        });
      }
    }
    setPreferences(nextPreferences);
    setPassed((currentPassed) => ({ ...currentPassed, [current.id]: true }));
    setFeedbackOpen(false);
    setSelectedReason(null);
    setFocusId(null);
    setLiveMessage(
      selectedReason
        ? `${current.title} set aside. Preference saved.`
        : `${current.title} set aside.`,
    );
  }

  const goalSummary = goalChoices
    .filter((goal) => goals.includes(goal.id))
    .map((goal) => goal.label)
    .join(" + ");

  return (
    <div className="choose">
      <div className="sr-only" aria-live="polite">
        {liveMessage}
      </div>

      <section className="choose__panel" aria-labelledby="choose-goals">
        <h2 id="choose-goals" className="choose__label">
          Your activity goals
        </h2>
        <p>{goals.includes("ai") && goals.includes("ux") && goals.length === 2
          ? "Our agentic recommendations are based on your stated interests in AI, Agents, and UX Design."
          : goals.length ? `Our agentic recommendations are based on your stated interests in ${goalSummary}.`
          : "Select your interests to see suggested activities."}</p>
        <button type="button" className="sf-cta sf-cta--small sf-cta--secondary" onClick={() => setEditingGoals((open) => !open)}>
          {editingGoals ? "Done" : "Change goals"}
        </button>
        {editingGoals ? (
          <div className="choose__goals" role="group" aria-label="Change goals">
            {goalChoices.map((goal) => {
              const on = goals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  type="button"
                  aria-pressed={on}
                  className={on ? "choose__goal choose__goal--on" : "choose__goal"}
                  onClick={() => toggleGoal(goal.id)}
                >
                  {goal.label}
                </button>
              );
            })}
          </div>
        ) : null}
        {preferences.length > 0 ? (
          <p className="choose__meta">Preferences: {preferences.map((item) => item.label).join(" · ")}</p>
        ) : null}
      </section>

      <section className="choose__panel" aria-labelledby="choose-suggestion">
        <h2 id="choose-suggestion" className="choose__label">
          Suggested sessions
        </h2>
        {current ? (
          <>
            <p className="choose__title">{current.title}</p>
            <p className="choose__meta">
              {dayById(current.day).label} · {formatRange(current.start, current.end)} · {roomFor(current)}
            </p>
            <p>
              <strong>Why you might like it: </strong>
              Based on your interest in {goalSummary || "these topics"}: {fitReason[current.id] ?? current.description}
            </p>
            <p className="choose__meta">Allow time to get there. Walking times and available seats haven’t been checked.</p>
            <p>
              {current.track.replace(/^Role: /, "For ") } · {current.type}{" · "}
              <button type="button" className="sf-cta-link" onClick={() => openQuickView(current.id, current.id)}>
                View details
              </button>
            </p>
          </>
        ) : (
          <p>No matches right now. Try changing your interests or browsing other sessions.</p>
        )}
      {current ? (
        <>
          <div className="choose__actions">
            <button type="button" className="sf-cta sf-cta--medium sf-cta--primary" onClick={() => addSession(current)}>
              Add session
            </button>
            <button
              type="button"
              className="sf-cta sf-cta--medium sf-cta--secondary"
              aria-expanded={feedbackOpen}
              onClick={() => {
                setFeedbackOpen((open) => !open);
                setSelectedReason(null);
              }}
            >
              Not for me
            </button>
            <button
              type="button"
              className="sf-cta sf-cta--medium sf-cta--secondary"
              aria-expanded={showAlternatives}
              onClick={() => {
                setSlot(null);
                setShowAlternatives((open) => !open);
              }}
            >
              Browse alternatives
            </button>
          </div>
          {feedbackOpen ? (
            <div className="choose__feedback">
              <p>Want to refine your suggestions? You can choose a reason, or just skip this session.</p>
              <div className="choose__goals" role="group" aria-label="Reason this session is not for you">
                <ReasonButton label="Wrong topic" reason="topic" selected={selectedReason} onSelect={setSelectedReason} />
                <ReasonButton label="Wrong format" reason="level" selected={selectedReason} onSelect={setSelectedReason} />
                <ReasonButton label="Wrong time" reason="time" selected={selectedReason} onSelect={setSelectedReason} />
              </div>
              <p className="choose__meta">Preferences change only after you confirm.</p>
              <div className="choose__actions">
                <button type="button" className="sf-cta sf-cta--small sf-cta--primary" onClick={confirmPass}>
                  Confirm
                </button>
                <button
                  type="button"
                  className="sf-cta sf-cta--small sf-cta--secondary"
                  onClick={() => {
                    setFeedbackOpen(false);
                    setSelectedReason(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
      </section>

      {showAlternatives ? (
        <section className="choose__panel" aria-labelledby="choose-alternatives">
          <h2 id="choose-alternatives" className="choose__label">
            Browse alternatives
          </h2>
          <p>
            {slot
              ? `Sessions around ${formatClock(slot.minute)} on ${dayById(slot.day).label}. `
              : "Other sessions from this catalog. "}
            Adding one does not check your goals, time conflicts, or walking time.
          </p>
          {slot && slotMatches.length === 0 ? (
            <p className="choose__meta">Nothing is scheduled in that open time. These other sessions may not fit that slot.</p>
          ) : null}
          <ul className="choose__list">
            {alternativeList.map((session) => (
              <li key={session.id}>
                <p className="choose__title">{session.title}</p>
                <p className="choose__meta">
                  {dayById(session.day).weekday} · {formatRange(session.start, session.end)} · {roomFor(session)}
                </p>
                <button type="button" className="sf-cta sf-cta--small sf-cta--secondary" onClick={() => addSession(session)}>
                  Add session
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {added.length > 0 ? (
        <section className="choose__panel" aria-labelledby="choose-added">
          <h2 id="choose-added" className="choose__label">
            Added to your agenda
          </h2>
          <ul className="choose__list">
            {added.map((session) => (
              <li key={session.id}>
                <p className="choose__kicker">Added to your agenda · {formatRange(session.start, session.end)}</p>
                <p className="choose__title">{session.title}</p>
                <button type="button" className="sf-cta sf-cta--small sf-cta--secondary" onClick={() => undo(session)}>
                  Undo
                </button>
                <p className="choose__meta">This session is also on the agenda below. This confirmation stays until you undo it.</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ReasonButton({
  label,
  reason,
  selected,
  onSelect,
}: {
  label: string;
  reason: Reason;
  selected: Reason | null;
  onSelect: (reason: Reason) => void;
}) {
  const on = selected === reason;
  return (
    <button
      type="button"
      aria-pressed={on}
      className={on ? "choose__goal choose__goal--on" : "choose__goal"}
      onClick={() => onSelect(reason)}
    >
      {label}
    </button>
  );
}

function matchesGoals(session: Session, goals: GoalId[]) {
  const blob = `${session.title} ${session.description} ${session.track} ${session.context ?? ""}`.toLowerCase();
  return goals.some((goal) => {
    if (goal === "ai") return /\bai\b|agent/.test(blob);
    if (goal === "ux") return /ux|figma|designer|interface|user research/.test(blob);
    return /leader|empathy|stories|humanity|relevance/.test(blob);
  });
}

function allowed(session: Session, preferences: Preference[]) {
  const band = session.start < 12 * 60 ? "morning" : "afternoon";
  return preferences.every((preference) => {
    if (preference.kind === "topic") return session.track !== preference.value;
    if (preference.kind === "level") return session.type !== (preference.value as SessionType);
    return band !== preference.value;
  });
}

function roomFor(session: Session) {
  return session.location.split(",")[0]?.trim() || session.location;
}

function dayRank(day: DayId) {
  return day === "sun" ? 0 : day === "mon" ? 1 : 2;
}
