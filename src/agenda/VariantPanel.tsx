import { useState } from "react";
import { useAgenda } from "./AgendaContext";
import { dayById, findOccurrence } from "./sessions";
import { defaultGoals, draftRange, omittedId, reviewDraft } from "./variantB";

export function DraftReview() {
  const agenda = useAgenda();
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [editingDraft, setEditingDraft] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const draftIds = agenda.draftOccurrenceIds();
  const savedIds = agenda.savedOccurrenceIds();
  const review = agenda.isDraftActive()
    ? reviewDraft(draftIds, savedIds)
    : null;
  const goalLabel = agenda.goals.length ? agenda.goals.join(" + ") : "No goals selected";

  return (
    <div className="variant-b">
      <section className="variant-b__card" aria-labelledby="variant-b-goals">
        <h2 id="variant-b-goals">Plan your day</h2>
        {editingPreferences ? (
          <PreferencesForm onClose={() => setEditingPreferences(false)} />
        ) : (
          <>
            <p>{agenda.goals.includes("AI and agents") && agenda.goals.includes("UX")
              ? "Our agentic recommendations are based on your stated interests in AI, Agents, and UX Design."
              : agenda.goals.length ? `Our agentic recommendations are based on your stated interests in ${goalLabel}.`
              : "Select your interests to see suggested activities."}</p>
            <p>Saved sessions are protected on the agenda. Our AI agent will work around those.</p>
          </>
        )}
        <div className="variant-b__actions">
          <button type="button" className="sf-cta sf-cta--medium sf-cta--secondary" onClick={() => setEditingPreferences((open) => !open)}>
            {editingPreferences ? "Close preferences" : "Edit preferences"}
          </button>
          <button type="button" className="sf-cta sf-cta--medium sf-cta--primary" onClick={agenda.buildDraft}>
            Build recommendations
          </button>
        </div>
      </section>

      {review ? (
        <section className="variant-b__card" aria-labelledby="variant-b-proposal">
          <h2 id="variant-b-proposal">Proposed agenda — not saved</h2>
          <p>{savedIds.length} saved sessions stay on your agenda.</p>
          <ul className="variant-b__sessions">
            {draftIds.filter((id) => !savedIds.includes(id)).map((id) => (
              <DraftRow key={id} occurrenceId={id} editing={editingDraft} />
            ))}
          </ul>
          {editingDraft && !draftIds.includes(omittedId) ? (
            <p className="variant-b__aside">
              Evaluating agent interactions has no location, so it was left out.
              <button type="button" className="agenda-prompt__action" onClick={() => agenda.toggleAgenda(omittedId)}>
                Add it anyway
              </button>
            </p>
          ) : null}
        </section>
      ) : null}

      {review ? (
        <section className="variant-b__card" aria-labelledby="variant-b-review">
          <h2 id="variant-b-review">Review before applying</h2>
          <p>{review.headline}</p>
          <ul className="variant-b__checks">
            <li>{review.overlapText}</li>
            <li>{review.walkingText}</li>
            <li>{review.locationText}</li>
            <li>{review.protectionText}</li>
          </ul>
          {review.canApply ? null : (
            <p id="variant-b-block">Apply requires a change, no time conflicts, and a location for each session. Edit the draft or keep your current agenda.</p>
          )}
          <div className="variant-b__actions">
            <button type="button" className="agenda-prompt__action" onClick={() => setEditingDraft((open) => !open)}>
              {editingDraft ? "Close editor" : "Edit draft"}
            </button>
            <button type="button" className="agenda-prompt__action" onClick={agenda.discardDraft}>
              Keep current agenda
            </button>
            <button
              type="button"
              className="sf-cta sf-cta--medium sf-cta--primary"
              disabled={!review.canApply}
              aria-describedby={review.canApply ? undefined : "variant-b-block"}
              onClick={agenda.applyDraft}
            >
              {review.applyLabel}
            </button>
          </div>
        </section>
      ) : null}

      {agenda.appliedSummary ? (
        <section className="variant-b__card" aria-labelledby="variant-b-applied">
          <h2 id="variant-b-applied">Agenda updated</h2>
          <p className="variant-b__updated" role="status">{agenda.appliedSummary}</p>
          {showChanges ? (
            <p>The saved agenda now includes the reviewed additions. Your previously saved sessions were not changed.</p>
          ) : null}
          <div className="variant-b__actions">
            <button type="button" className="agenda-prompt__action" onClick={() => setShowChanges((open) => !open)}>
              {showChanges ? "Hide changes" : "View changes"}
            </button>
            <button type="button" className="agenda-prompt__action" onClick={agenda.undoApply}>
              Undo
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function PreferencesForm({ onClose }: { onClose: () => void }) {
  const agenda = useAgenda();

  function toggleGoal(goal: string) {
    const next = agenda.goals.includes(goal)
      ? agenda.goals.filter((item) => item !== goal)
      : [...agenda.goals, goal];
    agenda.setGoals(defaultGoals.filter((item) => next.includes(item)));
  }

  return (
    <form
      className="variant-b__prefs"
      onSubmit={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <fieldset>
        <legend>Goals</legend>
        {defaultGoals.map((goal) => (
          <label key={goal}>
            <input
              type="checkbox"
              checked={agenda.goals.includes(goal)}
              onChange={() => toggleGoal(goal)}
            />
            {goal}
          </label>
        ))}
      </fieldset>
      <p>Saved sessions stay protected while you explore recommendations.</p>
      <p>Editing preferences does not change the saved agenda. Choose Build recommendations to use them.</p>
      <button type="submit" className="agenda-prompt__action">
        Done
      </button>
    </form>
  );
}

function DraftRow({ occurrenceId, editing }: { occurrenceId: string; editing: boolean }) {
  const agenda = useAgenda();
  const found = findOccurrence(occurrenceId);
  if (!found) return null;
  const locked = agenda.isLocked(occurrenceId);
  const suggested = !agenda.isOnAgenda(occurrenceId);
  return (
    <li>
      <p>
        <span className="variant-b__when">
          {dayById(found.occurrence.day).weekday} · {draftRange(found.occurrence.start, found.occurrence.end)}
        </span>{" "}
        {found.session.title}{" "}
        <span className="variant-b__status">{locked ? "Locked" : suggested ? "Draft · not saved" : "On agenda"}</span>
      </p>
      <p>{found.session.location || "Location not provided"}</p>
      {suggested ? <p><strong>Why this may fit: </strong>{found.session.description}</p> : null}
      <button type="button" className="sf-cta-link" onClick={() => agenda.openQuickView(found.session.id, occurrenceId)}>View details</button>
      {editing ? (
        <div className="variant-b__actions">
          {agenda.isOnAgenda(occurrenceId) ? null : (
            <button type="button" className="agenda-prompt__action" onClick={() => agenda.toggleLock(occurrenceId)}>
              {locked ? "Unlock" : "Lock"}
            </button>
          )}
          {locked ? null : (
            <button type="button" className="agenda-prompt__action" onClick={() => agenda.toggleAgenda(occurrenceId)}>
              Remove from draft
            </button>
          )}
        </div>
      ) : null}
    </li>
  );
}
