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
  const { isOnAgenda, isSurfaced, isDraftActive, isInDraft, isLocked, toggleAgenda, openQuickView } =
    useAgenda();
  const time = occurrence ?? session.occurrences[0];
  const onAgenda = isOnAgenda(time.id);
  const draftActive = isDraftActive();
  const inDraft = isInDraft(time.id);
  const proposed = draftActive && inDraft && !onAgenda;
  const removing = draftActive && onAgenda && !inDraft && !isLocked(time.id);
  const suggestion = !proposed && !removing && (session.recommended || isSurfaced(time.id)) && !onAgenda;
  const venue = session.location.split(",")[0]?.trim() ?? session.location;

  return (
    <article
      className={[
        "card",
        variant === "row" ? "card--row" : "",
        suggestion || proposed ? "card--suggestion" : "",
        removing ? "card--removing" : "",
      ]
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
          {proposed ? <span className="card__recommended">Draft · not saved</span> : null}
          {onAgenda && !removing ? <span className="card__recommended">Added</span> : null}
          {isLocked(time.id) ? <span className="card__recommended">Locked</span> : null}
          {removing ? <span className="card__recommended">Will be removed</span> : null}
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
        {draftActive && !proposed && !onAgenda && !session.forced ? (
          <button type="button" className="card__add" onClick={() => toggleAgenda(time.id)}>
            <i className="icon icon--add" aria-hidden="true" />
            Add to proposal
          </button>
        ) : null}
        {!draftActive && !onAgenda && !session.forced ? (
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
