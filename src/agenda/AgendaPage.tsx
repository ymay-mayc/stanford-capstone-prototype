import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useAgenda } from "./AgendaContext";
import { SessionCard } from "./SessionCard";
import {
  presetPrompts,
  SIMULATED_REPLY_DELAY_MS,
  simulatedReply,
  type Suggestion,
} from "./simulatedChat";
import {
  dayEnd,
  days,
  findOccurrence,
  formatClock,
  formatWhen,
  rangesOverlap,
  slotHeight,
  slotMinutes,
} from "./sessions";
import type { AgendaEntry, DayId } from "./types";

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; text: string; suggestions: Suggestion[] };

export function AgendaPage() {
  const agenda = useAgenda();
  const { layout } = agenda;
  const [ask, setAsk] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const askId = useId();
  const threadRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const replyTimer = useRef<number | null>(null);
  const messageCount = useRef(0);

  const visible = agenda.visibleEntries();

  useEffect(() => {
    return () => {
      if (replyTimer.current !== null) window.clearTimeout(replyTimer.current);
    };
  }, []);

  function updatePinned() {
    const thread = threadRef.current;
    if (!thread) return;
    const distance = thread.scrollHeight - thread.scrollTop - thread.clientHeight;
    const pinned = distance < 48;
    pinnedRef.current = pinned;
    setShowJump(!pinned);
  }

  function scrollToLatest() {
    const thread = threadRef.current;
    if (!thread) return;
    thread.scrollTop = thread.scrollHeight;
    pinnedRef.current = true;
    setShowJump(false);
  }

  function startExchange(request: string) {
    const text = request.trim();
    if (!text || pending) return;
    messageCount.current += 1;
    const userId = `user-${messageCount.current}`;
    setMessages((current) => [...current, { id: userId, role: "user", text }]);
    setPending(true);
    setLiveMessage("Finding sessions.");
    pinnedRef.current = true;
    window.setTimeout(scrollToLatest, 0);

    replyTimer.current = window.setTimeout(() => {
      const reply = simulatedReply(text);
      messageCount.current += 1;
      setMessages((current) => [
        ...current,
        { id: `assistant-${messageCount.current}`, role: "assistant", ...reply },
      ]);
      setPending(false);
      agenda.surfaceSessions(
        reply.suggestions.filter((item) => item.addInChat === false).map((item) => item.occurrenceId),
      );
      const titles = reply.suggestions
        .map((item) => findOccurrence(item.occurrenceId)?.session.title)
        .filter(Boolean);
      setLiveMessage(titles.length ? `${reply.text} ${titles.join(". ")}.` : reply.text);
      window.setTimeout(() => {
        if (pinnedRef.current) scrollToLatest();
        else setShowJump(true);
      }, 0);
    }, SIMULATED_REPLY_DELAY_MS);
  }

  function sendDraft(event: FormEvent) {
    event.preventDefault();
    const text = ask.trim();
    if (!text || pending) return;
    setAsk("");
    startExchange(text);
  }

  return (
    <>
      <main className="agenda">
        <header className="agenda__intro">
          <h1>Build Your Dreamforce Agenda</h1>
          <div className="agenda-prompt">
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {liveMessage}
            </div>
            <div
              className="agenda-prompt__thread"
              ref={threadRef}
              aria-busy={pending}
              onScroll={updatePinned}
            >
              <p>
                We&apos;ve started your agenda with a few sessions we think you&apos;ll enjoy. Want to
                make it more personal? Tell us what you&apos;re interested in, and we&apos;ll find more
                sessions for you.
              </p>
              <div className="agenda-prompt__topics" role="group" aria-label="Suggested requests">
                {presetPrompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    type="button"
                    className="agenda-prompt__topic"
                    disabled={pending}
                    onClick={() => startExchange(prompt.label)}
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
              {messages.map((message) =>
                message.role === "user" ? (
                  <p key={message.id} className="agenda-prompt__user">
                    {message.text}
                  </p>
                ) : (
                  <div key={message.id} className="agenda-prompt__reply">
                    <p>{message.text}</p>
                    {message.suggestions.length > 0 ? (
                      <ul className="agenda-prompt__suggestions">
                        {message.suggestions.map((item) => {
                          const found = findOccurrence(item.occurrenceId);
                          if (!found) return null;
                          const onAgenda = agenda.isOnAgenda(item.occurrenceId);
                          const action = onAgenda ? "Remove" : "Add";
                          const relation = onAgenda ? "from" : "to";
                          return (
                            <li key={item.occurrenceId}>
                              <p className="agenda-prompt__session">{found.session.title}</p>
                              <p className="agenda-prompt__when">{formatWhen(found.session)}</p>
                              {item.reason ? <p>{item.reason}</p> : null}
                              {item.addInChat === false ? null : (
                                <button
                                  type="button"
                                  className="agenda-prompt__action"
                                  aria-label={`${action} ${found.session.title} ${relation} your agenda`}
                                  onClick={() => agenda.toggleAgenda(item.occurrenceId)}
                                >
                                  {onAgenda ? "Remove from agenda" : "Add to agenda"}
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                ),
              )}
              {pending ? <p className="agenda-prompt__pending">Finding sessions…</p> : null}
            </div>
            {showJump ? (
              <button type="button" className="agenda-prompt__jump" onClick={scrollToLatest}>
                Jump to latest
              </button>
            ) : null}
            <p className="agenda-prompt__note">
              <i className="icon icon--info" aria-hidden="true" />
              Recommendations appear in your agenda below. Review sessions before adding them.
            </p>
            <form className="agenda-prompt__ask" onSubmit={sendDraft}>
              <label className="sr-only" htmlFor={askId}>
                Ask for sessions, change your schedule, or tell us what interests you
              </label>
              <div className="agenda-prompt__control">
                <span className="agenda-prompt__caret" aria-hidden="true" />
                <input
                  id={askId}
                  className="agenda-prompt__input"
                  value={ask}
                  placeholder="Ask for sessions, change your schedule, or tell us what interests you..."
                  onChange={(event) => setAsk(event.target.value)}
                />
                <button type="button" className="agenda-prompt__mic" aria-label="Use your voice">
                  <i className="icon icon--unmuted" aria-hidden="true" />
                </button>
                <button type="submit" className="agenda-prompt__send" aria-label="Send" disabled={pending}>
                  <i className="icon icon--arrowup" aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        </header>

        {visible.length === 0 ? (
          <p className="empty">Nothing matches these filters. Turn filters back on to see more of the agenda.</p>
        ) : layout === "calendar" ? (
          <Calendar
            entries={visible}
            onAdd={() => undefined}
            onOverflow={(count) => {
              const noun = count === 1 ? "session" : "sessions";
              agenda.notify(
                `${count} more overlapping ${noun} at this time. Their titles were not in the saved agenda.`,
              );
            }}
          />
        ) : (
          <AgendaList entries={visible} />
        )}
      </main>
    </>
  );
}

function Calendar({
  entries,
  onAdd,
  onOverflow,
}: {
  entries: AgendaEntry[];
  onAdd: (day: DayId, minute: number) => void;
  onOverflow: (count: number) => void;
}) {
  const visibleStart = 9 * 60;
  const slots: number[] = [];
  for (let minute = visibleStart; minute < dayEnd; minute += slotMinutes) slots.push(minute);
  const height = slots.length * slotHeight;

  return (
    <section className="calendar" aria-label="Event schedule">
      <div className="calendar__head">
        <div className="calendar__time-head" />
        {days.map((day) => (
          <div key={day.id} className="calendar__day-head">
            {day.label}
          </div>
        ))}
      </div>
      <div className="calendar__body">
        <div className="calendar__times" style={{ height }}>
          {slots.map((minute) => (
            <div key={minute} className="calendar__hour" style={{ height: slotHeight }}>
              {formatClock(minute)}
            </div>
          ))}
        </div>
        {days.map((day) => {
          const dayEntries = entries.filter((entry) => entry.occurrence.day === day.id);
          return (
            <div key={day.id} className="calendar__day" style={{ height }}>
              {slots.map((minute) => {
                const occupied = dayEntries.some(
                  (entry) => entry.occurrence.start < minute + slotMinutes && entry.occurrence.end > minute,
                );
                if (occupied) {
                  return <div key={minute} className="calendar__slot" style={{ height: slotHeight }} />;
                }
                return (
                  <div key={minute} className="calendar__slot" style={{ height: slotHeight }}>
                    <button
                      type="button"
                      className="calendar__add"
                      aria-label={`Add a session at ${formatClock(minute)} on ${day.label}`}
                      onClick={() => onAdd(day.id, minute)}
                    >
                      <i className="icon icon--add" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
              {dayEntries.map((entry) => {
                const group = dayEntries
                  .filter(
                    (other) =>
                      other.occurrence.id === entry.occurrence.id ||
                      rangesOverlap(entry.occurrence, other.occurrence),
                  )
                  .sort(
                    (a, b) =>
                      a.occurrence.start - b.occurrence.start ||
                      a.session.title.localeCompare(b.session.title),
                  );
                const lanes = group.length;
                const lane = Math.max(
                  0,
                  group.findIndex((item) => item.occurrence.id === entry.occurrence.id),
                );
                const top = ((entry.occurrence.start - visibleStart) / slotMinutes) * slotHeight + 4;
                const blockHeight =
                  ((entry.occurrence.end - entry.occurrence.start) / slotMinutes) * slotHeight - 8;
                const overflow = entry.session.overflowCount;
                return (
                  <div
                    key={entry.occurrence.id}
                    className="calendar__item"
                    style={{
                      top,
                      height: Math.max(blockHeight, 48),
                      left: `calc(${(lane / lanes) * 100}% + 4px)`,
                      width: overflow
                        ? `calc(${100 / lanes}% - 56px)`
                        : `calc(${100 / lanes}% - 8px)`,
                    }}
                  >
                    <SessionCard session={entry.session} occurrence={entry.occurrence} />
                    {overflow ? (
                      <button
                        type="button"
                        className="calendar__more"
                        aria-label={`${overflow} more overlapping ${overflow === 1 ? "session" : "sessions"}`}
                        onClick={() => onOverflow(overflow)}
                      >
                        +{overflow}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AgendaList({ entries }: { entries: AgendaEntry[] }) {
  return (
    <div className="day-list">
      {days.map((day) => {
        const items = entries
          .filter((entry) => entry.occurrence.day === day.id)
          .sort((a, b) => a.occurrence.start - b.occurrence.start);
        if (!items.length) return null;
        return (
          <section key={day.id} className="day-list__group">
            <h2>{day.label}</h2>
            <ul>
              {items.map((entry) => (
                <li key={entry.occurrence.id}>
                  <SessionCard session={entry.session} occurrence={entry.occurrence} variant="row" />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
