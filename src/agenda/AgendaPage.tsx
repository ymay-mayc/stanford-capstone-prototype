import { useAgenda } from "./AgendaContext";
import { SessionCard } from "./SessionCard";
import { DraftReview } from "./VariantPanel";
import { dayEnd, days, formatClock, rangesOverlap, slotHeight, slotMinutes } from "./sessions";
import type { AgendaEntry, DayId } from "./types";

export function AgendaPage() {
  const agenda = useAgenda();
  const { layout } = agenda;
  const visible = agenda.visibleEntries();

  return (
    <>
      <main className="agenda">
        <header className="agenda__intro">
          <h1>Build Your Dreamforce Agenda</h1>
          <DraftReview />
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
  onAdd: _onAdd,
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
