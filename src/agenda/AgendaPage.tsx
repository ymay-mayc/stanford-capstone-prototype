import { useEffect, useId, useRef, useState } from "react";
import { useAgenda } from "./AgendaContext";
import { SessionCard } from "./SessionCard";
import {
  dayEnd,
  dayStart,
  days,
  formatClock,
  rangesOverlap,
  slotHeight,
  slotMinutes,
} from "./sessions";
import type { AgendaEntry, DayId, SessionType } from "./types";

const sessionTypes: SessionType[] = ["Meeting", "Breakout", "Theater", "Hands-on Training", "Roundtable"];

const experiences = [
  {
    title: "Ask the Experts",
    body: "Book a 1-to-1 appointment with a Salesforce expert to resolve product roadblocks, deepen knowledge, and learn new features.",
  },
  {
    title: "Connect with Salesblazers in the Sales Lodge",
    body: "Visit the Sales Lodge to join interactive roundtables, get hands-on in workshops, and connect with fellow members of the Salesblazer Community.",
  },
  {
    title: "See Sales Cloud in Action at the Campground",
    body: "Campground is the perfect place to see Sales Cloud product innovations — with live product demos from Spiff, Revenue Cloud, partner relationship management, and more.",
  },
];

export function AgendaPage() {
  const agenda = useAgenda();
  const {
    sessions,
    layout,
    setLayout,
    showRecommended,
    setShowRecommended,
    showFavorites,
    setShowFavorites,
    forYouOpen,
    setForYouOpen,
  } = agenda;
  const [viewOpen, setViewOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [hiddenTypes, setHiddenTypes] = useState<SessionType[]>([]);
  const [consultationAdded, setConsultationAdded] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const recommendedId = useId();
  const favoritesId = useId();

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!toolbarRef.current?.contains(event.target as Node)) {
        setViewOpen(false);
        setFiltersOpen(false);
        setForYouOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setViewOpen(false);
        setFiltersOpen(false);
        setForYouOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [setForYouOpen]);

  const recommended = sessions.filter((session) => session.recommended);
  const visible = agenda
    .visibleEntries()
    .filter((entry) => !hiddenTypes.includes(entry.session.type));

  function toggleType(type: SessionType) {
    setHiddenTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type],
    );
  }

  return (
    <>
      <main className="agenda">
        <header className="agenda__intro">
          <h1>Dreamforce Agenda 2026</h1>
          <p>
            See the sessions you’ve added alongside personalized, AI-powered recommendations based
            on your interests and favorites. Recommendations appear right in your schedule, so you
            can quickly add sessions that interest you or hide them anytime. Scroll past your agenda
            to manage your experiences, review your scheduled meetings, or sync your calendar.
          </p>
        </header>

        <div className="console" ref={toolbarRef}>
          <div className="console__filters">
            <label className="check" htmlFor={recommendedId}>
              <span className="check__control">
                <input
                  id={recommendedId}
                  type="checkbox"
                  checked={showRecommended}
                  onChange={(event) => setShowRecommended(event.target.checked)}
                />
                <i className="icon icon--check check__glyph" aria-hidden="true" />
              </span>
              Show Recommended
            </label>
            <label className="check" htmlFor={favoritesId}>
              <span className="check__control">
                <input
                  id={favoritesId}
                  type="checkbox"
                  checked={showFavorites}
                  onChange={(event) => setShowFavorites(event.target.checked)}
                />
                <i className="icon icon--check check__glyph" aria-hidden="true" />
              </span>
              Show Favorites
            </label>
          </div>
          <div className="console__actions">
            <div className="menu">
              <button
                type="button"
                className="sf-cta sf-cta--medium sf-cta--secondary"
                aria-haspopup="listbox"
                aria-expanded={viewOpen}
                aria-label="Select calendar view"
                onClick={() => {
                  setViewOpen((open) => !open);
                  setFiltersOpen(false);
                  setForYouOpen(false);
                }}
              >
                {layout === "calendar" ? "Multi-day view" : "List view"}
                <i className="icon icon--chevrondown" aria-hidden="true" />
              </button>
              {viewOpen ? (
                <div className="menu__panel" role="listbox" aria-label="Calendar view">
                  <button
                    type="button"
                    role="option"
                    aria-selected={layout === "calendar"}
                    className="menu__item"
                    onClick={() => {
                      setLayout("calendar");
                      setViewOpen(false);
                    }}
                  >
                    Multi-day view
                  </button>
                  <button
                    type="button"
                    role="option"
                    aria-selected={layout === "list"}
                    className="menu__item"
                    onClick={() => {
                      setLayout("list");
                      setViewOpen(false);
                    }}
                  >
                    List view
                  </button>
                </div>
              ) : null}
            </div>

            <div className="menu">
              <button
                type="button"
                className="sf-cta sf-cta--medium sf-cta--primary"
                aria-expanded={forYouOpen}
                aria-label="For You menu"
                onClick={() => {
                  setForYouOpen(!forYouOpen);
                  setViewOpen(false);
                  setFiltersOpen(false);
                }}
              >
                For You
                <i className="icon icon--chevrondown" aria-hidden="true" />
              </button>
              {forYouOpen ? (
                <div className="menu__panel menu__panel--wide" role="menu" aria-label="For you">
                  {recommended.map((session) => {
                    const onAgenda = agenda.isOnAgenda(session.id);
                    return (
                      <div key={session.id} className="menu__row" role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className="menu__item menu__item--grow"
                          onClick={() => agenda.openQuickView(session.id)}
                        >
                          <span>{session.title}</span>
                          <span>
                            {days.find((day) => day.id === session.day)?.weekday} · {formatClock(session.start)}
                          </span>
                        </button>
                        {onAgenda ? (
                          <span className="for-you__state">On agenda</span>
                        ) : (
                          <button
                            type="button"
                            className="card__add"
                            onClick={() => agenda.toggleAgenda(session.id)}
                          >
                            <i className="icon icon--add" aria-hidden="true" />
                            {session.addLabel}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="menu">
              <button
                type="button"
                className="toolbar-btn toolbar-btn--icon"
                aria-expanded={filtersOpen}
                aria-label="Filters"
                onClick={() => {
                  setFiltersOpen((open) => !open);
                  setViewOpen(false);
                  setForYouOpen(false);
                }}
              >
                <i className="icon icon--slider" aria-hidden="true" />
              </button>
              {filtersOpen ? (
                <div className="menu__panel menu__panel--end" role="group" aria-label="Session types">
                  {sessionTypes.map((type) => (
                    <label key={type} className="check menu__check">
                      <input
                        type="checkbox"
                        checked={!hiddenTypes.includes(type)}
                        onChange={() => toggleType(type)}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="empty">Nothing matches these filters. Turn filters back on to see more of the agenda.</p>
        ) : layout === "calendar" ? (
          <Calendar
            entries={visible}
            onAdd={() => {
              setForYouOpen(true);
              setViewOpen(false);
              setFiltersOpen(false);
            }}
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

      <section className="band" aria-labelledby="experiences-title">
        <div className="band__inner">
          <header className="band__intro">
            <h2 id="experiences-title">Your Favorites, ready when you are.</h2>
            <p>
              Join these anytime experiences whenever it works for you, between sessions or a part of
              your adventure throughout campus.
            </p>
          </header>
          <h3 className="band__label">Experiences</h3>
          <ul className="experience-grid">
            {experiences.map((item) => (
              <li key={item.title}>
                <article className="experience">
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band" aria-labelledby="meetings-title">
        <div className="band__inner">
          <header className="band__intro">
            <h2 id="meetings-title">Manage your meetings</h2>
            <p>
              View or edit your scheduled meetings. Or unlock even more possibilities by meeting with
              our partners.
            </p>
          </header>
          <article className="meetings">
            <div className="meetings__header">
              <h3>Meetings</h3>
              <button
                type="button"
                className="sf-cta sf-cta--medium sf-cta--primary"
                onClick={() => setConsultationAdded(true)}
              >
                Add Consultation
              </button>
            </div>
            {consultationAdded ? (
              <p className="meetings__row">Consultation request · Waiting for a time</p>
            ) : (
              <div className="meetings__empty">
                <p>No Consultations Scheduled</p>
                <p>Start planning consultations to enhance your event experience.</p>
              </div>
            )}
          </article>
        </div>
      </section>
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
  const calendarRef = useRef<HTMLElement>(null);
  const slots: number[] = [];
  for (let minute = dayStart; minute < dayEnd; minute += slotMinutes) slots.push(minute);
  const height = slots.length * slotHeight;

  useEffect(() => {
    const calendar = calendarRef.current;
    if (!calendar) return;
    const rowsBeforeNine = (9 * 60 - dayStart) / slotMinutes;
    calendar.scrollTop = rowsBeforeNine * slotHeight;
  }, []);

  return (
    <section ref={calendarRef} className="calendar" aria-label="Event schedule">
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
                const top = ((entry.occurrence.start - dayStart) / slotMinutes) * slotHeight + 4;
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
