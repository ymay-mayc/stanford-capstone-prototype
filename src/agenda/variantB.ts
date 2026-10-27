import { changeSummary } from "./draftReview";
import { findOccurrence, rangesOverlap } from "./sessions";

// Saved catalog sessions supplied by the attendee, matching the original prototype.
export const protectedSessionIds = ["o080", "o005", "o122", "o100"];
export const suggestedId = "o002";
export const omittedId = "b-omitted";
export const defaultGoals = ["AI and agents", "UX"];

export function clock24(minutes: number) {
  return `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`;
}
export function draftRange(start: number, end: number) {
  return `${clock24(start)}–${clock24(end)}`;
}

export function builtDraftIds(savedIds: string[]) {
  const next = new Set(savedIds.filter((id) => findOccurrence(id)));
  const candidate = findOccurrence(suggestedId);
  const conflicts = candidate && [...next].some((id) => {
    const saved = findOccurrence(id);
    return saved && rangesOverlap(candidate.occurrence, saved.occurrence);
  });
  if (candidate?.session.location.trim() && !conflicts) next.add(suggestedId);
  return [...next];
}

export function reviewDraft(draftIds: string[], savedIds: string[]) {
  const summary = changeSummary(draftIds, savedIds);
  const entries = draftIds.map(findOccurrence).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const overlaps: string[] = [];
  for (let index = 0; index < entries.length; index++) {
    for (let other = index + 1; other < entries.length; other++) {
      if (rangesOverlap(entries[index].occurrence, entries[other].occurrence)) {
        overlaps.push(`“${entries[index].session.title}” overlaps “${entries[other].session.title}.”`);
      }
    }
  }
  const missingLocation = entries.some((entry) => !entry.session.location.trim());
  const additionCount = summary.adding.length;
  const removalCount = summary.removing.length;
  const additionLabel = `${additionCount} ${additionCount === 1 ? "addition" : "additions"}`;
  const removalLabel = `${removalCount} ${removalCount === 1 ? "removal" : "removals"}`;
  const protectionText = removalCount ? "A saved session is missing. Restore it before applying." : "All saved sessions are protected.";
  return {
    summary, additionCount, removalCount, additionLabel, removalLabel,
    headline: `${additionLabel}; ${removalLabel}. Saved sessions stay unchanged.`,
    overlapText: overlaps.length ? `Time overlap: ${overlaps.join(" ")}` : "No time conflicts with your saved sessions.",
    walkingText: "Walking time has not been checked.",
    locationText: missingLocation ? "A suggestion is missing its location." : "Recommended sessions have locations listed.",
    protectionText,
    canApply: overlaps.length === 0 && !missingLocation && removalCount === 0 && additionCount > 0,
    applyLabel: `Apply ${additionLabel}`,
    appliedText: `AGENDA UPDATED — ${additionCount} ${additionCount === 1 ? "session added" : "sessions added"}. Your saved sessions are unchanged.`,
  };
}
