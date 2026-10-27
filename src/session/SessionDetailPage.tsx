import { HeartButton } from "../agenda/HeartButton";
import { useAgenda } from "../agenda/AgendaContext";
import { formatWhen } from "../agenda/sessions";

export function SessionDetailPage({ sessionId }: { sessionId: string }) {
  const {
    sessionById,
    sessions,
    isOnAgenda,
    isSaved,
    toggleAgenda,
    toggleSaved,
    overlapsFor,
    openAgenda,
    openDetail,
  } = useAgenda();
  const session = sessionById(sessionId);
  const onAgenda = isOnAgenda(session.id);
  const saved = isSaved(session.id);
  const overlaps = overlapsFor(session.id);
  const related = sessions.filter(
    (item) => item.id !== session.id && (item.track === session.track || item.day === session.day),
  ).slice(0, 3);

  return (
    <main className="detail">
      <header className="detail__hero">
        <p className="eyebrow">{session.featured ? "Featured" : session.type}</p>
        <h1>{session.title}</h1>
        <p className="detail__when">
          <span>{session.type}</span>
          <span>{formatWhen(session)}</span>
          {session.location ? <span>{session.location}</span> : null}
          <span>{session.track}</span>
        </p>
        <div className="detail__actions">
          {session.forced ? (
            <button type="button" className="sf-cta sf-cta--hero sf-cta--unavailable" disabled>
              Added for you
            </button>
          ) : (
            <button
              type="button"
              className={onAgenda ? "sf-cta sf-cta--hero sf-cta--secondary" : "sf-cta sf-cta--hero sf-cta--primary"}
              onClick={() => toggleAgenda(session.id)}
            >
              <i className={onAgenda ? "icon icon--check" : "icon icon--add"} aria-hidden="true" />
              {onAgenda ? "Added to agenda" : session.addLabel}
            </button>
          )}
          <button type="button" className="sf-cta-link" onClick={openAgenda}>
            Back to My Agenda
          </button>
          <HeartButton
            pressed={saved}
            label={saved ? `Remove ${session.title} from favorites` : `Save ${session.title}`}
            onClick={() => toggleSaved(session.id)}
          />
        </div>
        <ul className="badges">
          <li>{session.type}</li>
          <li>{session.track}</li>
          {session.recommended ? <li>For You</li> : null}
        </ul>
      </header>

      <section className="detail__body">
        <p>{session.description}</p>
        {session.speaker ? (
          <p>
            <strong>Speaker: </strong>
            {session.speaker}
          </p>
        ) : null}
        {session.equipment ? <p>Required equipment: {session.equipment}</p> : null}
        {session.forced ? <p className="qv__note">This session was added for you and can’t be removed.</p> : null}
        {overlaps.length ? (
          <p className="qv__note qv__note--overlap">
            Overlaps with {overlaps.map((item) => item.session.title).join(", ")}. Remove one session from My
            Agenda to resolve it.
          </p>
        ) : null}
      </section>

      <section className="detail__related">
        <h2>More on this day and track</h2>
        <ul>
          {related.map((item) => (
            <li key={item.id}>
              <button type="button" className="for-you__title" onClick={() => openDetail(item.id)}>
                <span>{item.title}</span>
                <span>{item.type}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

