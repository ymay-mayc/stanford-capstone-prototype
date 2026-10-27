import { findOccurrence, rangesOverlap } from "./sessions";

/**
 * Variant 2 keeps the proposed agenda in memory for this page only.
 * Nothing is written to the saved agenda until the attendee confirms.
 */

export function mergeLocked(proposal: string[], lockedIds: string[]) {
  const next = new Set(proposal.filter((id) => findOccurrence(id)));
  for (const id of lockedIds) {
    if (findOccurrence(id)) next.add(id);
  }
  return [...next];
}

export function changeSummary(draftIds: string[], savedIds: string[]) {
  const draft = new Set(draftIds);
  const saved = new Set(savedIds);
  return {
    adding: draftIds.filter((id) => !saved.has(id)),
    removing: savedIds.filter((id) => !draft.has(id)),
    staying: savedIds.filter((id) => draft.has(id)),
  };
}

export function summarySentence(summary: ReturnType<typeof changeSummary>) {
  const add =
    summary.adding.length === 1 ? "add 1 session" : `add ${summary.adding.length} sessions`;
  const remove =
    summary.removing.length === 1
      ? "remove 1 session"
      : `remove ${summary.removing.length} sessions`;
  const stay =
    summary.staying.length === 0
      ? "Nothing already on your agenda stays."
      : summary.staying.length === 1
        ? "1 session already on your agenda stays."
        : `${summary.staying.length} sessions already on your agenda stay.`;
  return `Updating your agenda will ${add} and ${remove}. ${stay}`;
}

export type DraftConflict = { first: string; second: string };

export function verifyDraft(draftIds: string[]) {
  const entries = draftIds
    .map((id) => findOccurrence(id))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const conflicts: DraftConflict[] = [];
  for (let index = 0; index < entries.length; index += 1) {
    for (let other = index + 1; other < entries.length; other += 1) {
      if (rangesOverlap(entries[index].occurrence, entries[other].occurrence)) {
        conflicts.push({
          first: entries[index].session.title,
          second: entries[other].session.title,
        });
      }
    }
  }
  const missingSpeaker = entries
    .filter((entry) => !entry.session.speaker.trim())
    .map((entry) => entry.session.title);
  return { conflicts, missingSpeaker };
}

export function conflictMessage(conflicts: DraftConflict[]) {
  if (conflicts.length === 0) return "No time conflicts. None of these sessions overlap.";
  return conflicts
    .map((conflict) => `Time conflict: “${conflict.first}” overlaps “${conflict.second}.”`)
    .join(" ");
}

export function missingMessage(titles: string[]) {
  if (titles.length === 0) return "No missing details. Every session in this proposal lists a speaker.";
  const noun = titles.length === 1 ? "session does" : "sessions do";
  return `${titles.length} ${noun} not list a speaker: ${titles.join("; ")}.`;
}
