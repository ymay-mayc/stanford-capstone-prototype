import { useMemo, useState, type ReactNode } from "react";
import { useAgenda } from "../agenda/AgendaContext";
import { SessionCard } from "../agenda/SessionCard";
import { days } from "../agenda/sessions";
import type { Session, SessionType } from "../agenda/types";

const pageSize = 4;
const types: Array<SessionType | "All"> = [
  "All",
  "Meeting",
  "Breakout",
  "Theater",
  "Hands-on Training",
  "Roundtable",
];

export function AllActivitiesPage() {
  const { sessions } = useAgenda();
  const [tab, setTab] = useState<(typeof types)[number]>("All");
  const [day, setDay] = useState("all");
  const [track, setTrack] = useState("all");
  const [location, setLocation] = useState("all");
  const [time, setTime] = useState("all");
  const [page, setPage] = useState(0);

  const tracks = unique(sessions.map((session) => session.track));
  const locations = unique(sessions.map((session) => session.location).filter(Boolean));

  const filtered = useMemo(() => {
    return sessions.filter((session) => {
      if (tab !== "All" && session.type !== tab) return false;
      if (day !== "all" && session.day !== day) return false;
      if (track !== "all" && session.track !== track) return false;
      if (location !== "all" && session.location !== location) return false;
      if (time === "morning" && session.start >= 12 * 60) return false;
      if (time === "afternoon" && session.start < 12 * 60) return false;
      return true;
    });
  }, [sessions, tab, day, track, location, time]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  function update(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(0);
  }

  return (
    <main className="activities">
      <header className="activities__intro">
        <p className="eyebrow">In-person</p>
        <h1>All activities</h1>
        <p>Browse the in-person program, then add sessions to My Agenda.</p>
      </header>

      <div className="tabs" role="tablist" aria-label="Activity type">
        {types.map((type) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={tab === type}
            className={tab === type ? "tabs__tab tabs__tab--on" : "tabs__tab"}
            onClick={() => {
              setTab(type);
              setPage(0);
            }}
          >
            {type === "All" ? "All activities" : type}
          </button>
        ))}
      </div>

      <div className="activities__layout">
        <form className="filters" aria-label="Filter activities">
          <h2>Filters</h2>
          <Filter label="Day" value={day} onChange={(value) => update(setDay, value)}>
            <option value="all">All days</option>
            {days.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </Filter>
          <Filter label="Track" value={track} onChange={(value) => update(setTrack, value)}>
            <option value="all">All tracks</option>
            {tracks.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Filter>
          <Filter label="Location" value={location} onChange={(value) => update(setLocation, value)}>
            <option value="all">All locations</option>
            {locations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Filter>
          <Filter label="Time" value={time} onChange={(value) => update(setTime, value)}>
            <option value="all">Any time</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
          </Filter>
        </form>

        <div className="activities__results">
          {visible.length === 0 ? (
            <p className="empty">No activities match these filters.</p>
          ) : (
            <ul className="activities__list">
              {visible.map((session: Session) => (
                <li key={session.id}>
                  <SessionCard session={session} variant="row" />
                </li>
              ))}
            </ul>
          )}
          <nav className="pager" aria-label="Pagination">
            <button
              type="button"
              className="sf-cta sf-cta--small sf-cta--secondary"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              Previous
            </button>
            <p>
              Page {safePage + 1} of {pageCount}
            </p>
            <button
              type="button"
              className="sf-cta sf-cta--small sf-cta--secondary"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </main>
  );
}

function Filter({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function unique(values: string[]) {
  return [...new Set(values)].sort();
}
