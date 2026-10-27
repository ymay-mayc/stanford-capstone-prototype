import { formatCardWhen } from "./sessions";
import type { Occurrence, Session } from "./types";
import { useAgenda } from "./AgendaContext";
import sparkle from "./recommended-sparkle.png";

export function SessionCard({
  session,
  occurrence,
  variant = "calendar",
}: {
  session: Session;
  occurrence?: Occurrence;
  variant?: "calendar" | "row";
}) {
  const { isOnAgenda, isSurfaced, toggleAgenda, openQuickView } = useAgenda();
  const time = occurrence ?? session.occurrences[0];
  const onAgenda = isOnAgenda(time.id);
  const suggestion = (session.recommended || isSurfaced(time.id)) && !onAgenda;
  const venue = session.location.split(",")[0]?.trim() ?? session.location;

  return (
    <article
      className={["card", variant === "row" ? "card--row" : "", suggestion ? "card--suggestion" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="card__open"
        onClick={() => openQuickView(session.id, time.id)}
      >
        <span className="card__header">
          <span className="card__type">{session.type}</span>
          {onAgenda ? <span className="card__recommended">Added</span> : null}
          {suggestion ? (
            <span className="card__recommended">
              <span className="card__sparkle">
                <img src={sparkle} alt="" />
              </span>
              Recommended
            </span>
          ) : null}
        </span>
        <span className="card__title">{session.title}</span>
        <span className="card__meta">{formatCardWhen(time, venue)}</span>
      </button>
      <div className="card__tools">
        {!onAgenda && !session.forced ? (
          <button
            type="button"
            className="card__add"
            onClick={() => toggleAgenda(time.id)}
          >
            <i className="icon icon--add" aria-hidden="true" />
            {session.addLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}
