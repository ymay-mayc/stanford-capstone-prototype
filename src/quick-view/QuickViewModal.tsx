import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { HeartButton } from "../agenda/HeartButton";
import { useAgenda } from "../agenda/AgendaContext";
import { findOccurrence, formatWhen } from "../agenda/sessions";
import sparkle from "../agenda/recommended-sparkle.png";

export function QuickViewModal() {
  const {
    quickViewId,
    quickViewOccurrenceId,
    closeQuickView,
    sessionById,
    isOnAgenda,
    isSaved,
    toggleAgenda,
    toggleSaved,
    openDetail,
    setQuickViewOccurrence,
  } = useAgenda();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!quickViewId) return;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeQuickView();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [quickViewId, closeQuickView]);

  if (!quickViewId || !quickViewOccurrenceId) return null;

  const session = sessionById(quickViewId);
  const selected = findOccurrence(quickViewOccurrenceId)?.occurrence ?? session.occurrences[0];
  const onAgenda = isOnAgenda(selected.id);
  const saved = isSaved(session.id);
  const showRecommended = session.recommended && !onAgenda;
  const reserved = session.addLabel.toLowerCase().includes("reserve");

  return createPortal(
    <div className="qv-backdrop" onMouseDown={closeQuickView}>
      <article
        className="qv"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="qv__top">
          <div className="qv__kicker">
            <span className="qv__badge">{session.type}</span>
            {showRecommended ? (
              <span className="qv__recommended">
                <span className="qv__sparkle">
                  <img src={sparkle} alt="" />
                </span>
                Recommended
              </span>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            className="qv__icon-btn"
            aria-label="Close"
            onClick={closeQuickView}
          >
            <i className="icon icon--close" aria-hidden="true" />
          </button>
        </div>

        <h2 id={titleId} className="qv__title">
          {session.title}
        </h2>

        <div className="qv__when">
          <i className="icon icon--date-input" aria-hidden="true" />
          {session.occurrences.length > 1 ? (
            <label className="qv__select">
              <span className="sr-only">Day and time</span>
              <select
                value={selected.id}
                onChange={(event) => setQuickViewOccurrence(event.target.value)}
              >
                {session.occurrences.map((occurrence) => (
                  <option key={occurrence.id} value={occurrence.id}>
                    {formatWhen(occurrence)}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span>{formatWhen(selected)}</span>
          )}
        </div>

        {session.location ? (
          <p className="qv__place">
            <i className="icon icon--checkin" aria-hidden="true" />
            <span>{session.location}</span>
          </p>
        ) : null}

        <p className="qv__description">{session.description}</p>
        {session.speaker ? (
          <p className="qv__speaker">
            <strong>Speakers</strong>
            {session.speaker}
          </p>
        ) : null}
        {session.equipment ? (
          <p className="qv__equipment">
            <strong>Required Equipment: </strong>
            {session.equipment}
          </p>
        ) : null}

        <div className="qv__footer">
          {reserved ? (
            <p className="qv__seating">
              <i className="icon icon--info" aria-hidden="true" />
              Reserve seating, arrive 10 minutes early to guarantee your seat.
            </p>
          ) : null}
          <div className="qv__actions">
          <div className="qv__cta">
            {session.forced ? (
              <button type="button" className="sf-cta sf-cta--hero sf-cta--unavailable" disabled>
                Added for you
              </button>
            ) : onAgenda ? (
              <button
                type="button"
                className="sf-cta sf-cta--hero sf-cta--added"
                aria-label="Remove from agenda"
                title="Remove from agenda"
                onClick={() => toggleAgenda(selected.id)}
              >
                <i className="icon icon--check" aria-hidden="true" />
                Added to agenda
              </button>
            ) : (
              <button
                type="button"
                className="sf-cta sf-cta--hero sf-cta--primary"
                onClick={() => toggleAgenda(selected.id)}
              >
                <i className="icon icon--add" aria-hidden="true" />
                {session.addLabel}
              </button>
            )}
            <button
              type="button"
              className="sf-cta sf-cta--hero sf-cta--secondary"
              onClick={() => openDetail(session.id)}
            >
              See more details
            </button>
          </div>
          <HeartButton
            pressed={saved}
            label={saved ? `Remove ${session.title} from favorites` : `Save ${session.title}`}
            onClick={() => toggleSaved(session.id)}
          />
          </div>
        </div>
      </article>
    </div>,
    document.body,
  );
}
