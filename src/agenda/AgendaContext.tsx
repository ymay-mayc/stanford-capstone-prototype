import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { mergeLocked } from "./draftReview";
import { entriesFor, findOccurrence, rangesOverlap, sessions } from "./sessions";
import { builtDraftIds, defaultGoals, protectedSessionIds, reviewDraft } from "./variantB";
import type { AgendaEntry, LayoutMode, Session, SyncTarget, View } from "./types";

type AgendaContextValue = {
  sessions: Session[];
  view: View;
  layout: LayoutMode;
  showRecommended: boolean;
  showFavorites: boolean;
  forYouOpen: boolean;
  syncTarget: SyncTarget;
  quickViewId: string | null;
  quickViewOccurrenceId: string | null;
  toast: string | null;
  openAgenda: () => void;
  openActivities: () => void;
  openDetail: (sessionId: string) => void;
  openInfo: (topic: string) => void;
  setLayout: (layout: LayoutMode) => void;
  setShowRecommended: (value: boolean) => void;
  setShowFavorites: (value: boolean) => void;
  setForYouOpen: (value: boolean) => void;
  setSyncTarget: (value: SyncTarget) => void;
  openQuickView: (sessionId: string, occurrenceId?: string) => void;
  closeQuickView: () => void;
  setQuickViewOccurrence: (occurrenceId: string) => void;
  isOnAgenda: (occurrenceId: string) => boolean;
  isSaved: (sessionId: string) => boolean;
  toggleAgenda: (occurrenceId: string) => void;
  toggleSaved: (sessionId: string) => void;
  dismissToast: () => void;
  notify: (message: string) => void;
  surfaceSessions: (occurrenceIds: string[]) => void;
  isSurfaced: (occurrenceId: string) => boolean;
  isDraftActive: () => boolean;
  draftOccurrenceIds: () => string[];
  isInDraft: (occurrenceId: string) => boolean;
  isLocked: (occurrenceId: string) => boolean;
  savedOccurrenceIds: () => string[];
  proposeDraft: (occurrenceIds: string[]) => string[];
  toggleLock: (occurrenceId: string) => void;
  discardDraft: () => void;
  goals: string[];
  setGoals: (goals: string[]) => void;
  appliedSummary: string | null;
  buildDraft: () => void;
  applyDraft: () => void;
  undoApply: () => void;
  overlapsFor: (occurrenceId: string) => AgendaEntry[];
  visibleEntries: () => AgendaEntry[];
  sessionById: (sessionId: string) => Session;
};

const AgendaContext = createContext<AgendaContextValue | null>(null);

function initialAgenda() {
  return Object.fromEntries(
    entriesFor(sessions).map(({ occurrence }) => [occurrence.id, protectedSessionIds.includes(occurrence.id)]),
  );
}

function initialSaved() {
  return Object.fromEntries(sessions.filter((session) => session.initialSaved).map((session) => [session.id, true]));
}

export function AgendaProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>({ name: "agenda" });
  const [layout, setLayout] = useState<LayoutMode>("calendar");
  const [showRecommended, setShowRecommended] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [forYouOpen, setForYouOpen] = useState(false);
  const [syncTarget, setSyncTarget] = useState<SyncTarget>(null);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [quickViewOccurrenceId, setQuickViewOccurrenceId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [onAgenda, setOnAgenda] = useState<Record<string, boolean>>(initialAgenda);
  const [saved, setSaved] = useState<Record<string, boolean>>(initialSaved);
  const [surfaced, setSurfaced] = useState<Record<string, boolean>>({});
  const [draftIds, setDraftIds] = useState<string[] | null>(null);
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [goals, setGoals] = useState<string[]>(defaultGoals);
  const [appliedSummary, setAppliedSummary] = useState<string | null>(null);
  const [priorAgenda, setPriorAgenda] = useState<Record<string, boolean> | null>(null);
  const [lastDraft, setLastDraft] = useState<string[] | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const value = useMemo<AgendaContextValue>(() => {
    const isOnAgenda = (occurrenceId: string) => onAgenda[occurrenceId] ?? false;
    const isSaved = (sessionId: string) => saved[sessionId] ?? false;
    const isSurfaced = (occurrenceId: string) => surfaced[occurrenceId] ?? false;
    const isDraftActive = () => draftIds !== null;
    const draftOccurrenceIds = () => draftIds ?? [];
    const isInDraft = (occurrenceId: string) => draftIds?.includes(occurrenceId) ?? false;
    const isLocked = (occurrenceId: string) => isOnAgenda(occurrenceId) || (locked[occurrenceId] ?? false);
    const savedOccurrenceIds = () =>
      Object.entries(onAgenda)
        .filter(([, on]) => on)
        .map(([id]) => id);
    const lockedIds = () => [...new Set([
      ...savedOccurrenceIds(),
      ...Object.entries(locked).filter(([, on]) => on).map(([id]) => id),
    ])];

    const overlapsFor = (occurrenceId: string) => {
      const found = findOccurrence(occurrenceId);
      if (!found || !isOnAgenda(occurrenceId)) return [];
      return entriesFor(sessions).filter(
        (entry) =>
          isOnAgenda(entry.occurrence.id) && rangesOverlap(found.occurrence, entry.occurrence),
      );
    };

    const visibleEntries = () =>
      entriesFor(sessions).filter(({ session, occurrence }) => {
        if (isOnAgenda(occurrence.id)) return true;
        if (showFavorites && isSaved(session.id)) return true;
        if (showRecommended && session.recommended) return true;
        if (isSurfaced(occurrence.id)) return true;
        if (isInDraft(occurrence.id)) return true;
        return false;
      });

    return {
      sessions,
      view,
      layout,
      showRecommended,
      showFavorites,
      forYouOpen,
      syncTarget,
      quickViewId,
      quickViewOccurrenceId,
      toast,
      openAgenda: () => setView({ name: "agenda" }),
      openActivities: () => setView({ name: "activities" }),
      openDetail: (sessionId: string) => {
        setQuickViewId(null);
        setQuickViewOccurrenceId(null);
        setView({ name: "detail", sessionId });
      },
      openInfo: (topic: string) => setView({ name: "info", topic }),
      setLayout,
      setShowRecommended,
      setShowFavorites,
      setForYouOpen,
      setSyncTarget,
      openQuickView: (sessionId: string, occurrenceId?: string) => {
        setQuickViewId(sessionId);
        setQuickViewOccurrenceId(occurrenceId ?? sessionId);
      },
      closeQuickView: () => {
        setQuickViewId(null);
        setQuickViewOccurrenceId(null);
      },
      setQuickViewOccurrence: (occurrenceId: string) => setQuickViewOccurrenceId(occurrenceId),
      isOnAgenda,
      isSaved,
      toggleAgenda: (occurrenceId: string) => {
        const found = findOccurrence(occurrenceId);
        if (!found || found.session.forced) return;
        if (isOnAgenda(occurrenceId)) {
          setToast("Saved sessions are protected. Recommendations will work around them.");
          return;
        }
        if (draftIds) {
          if (isLocked(occurrenceId)) {
            setToast("This session is protected. Your saved agenda will stay unchanged.");
            return;
          }
          const included = draftIds.includes(occurrenceId);
          setDraftIds(
            included ? draftIds.filter((id) => id !== occurrenceId) : [...draftIds, occurrenceId],
          );
          setToast(included ? "Removed from the proposal" : "Added to the proposal");
          return;
        }
        const next = !isOnAgenda(occurrenceId);
        setOnAgenda((current) => ({ ...current, [occurrenceId]: next }));
        setToast(next ? "Added to Agenda" : "Removed from Agenda");
      },
      toggleSaved: (sessionId: string) => {
        setSaved((current) => ({ ...current, [sessionId]: !current[sessionId] }));
      },
      dismissToast: () => setToast(null),
      notify: (message: string) => setToast(message),
      surfaceSessions: (occurrenceIds: string[]) => {
        setSurfaced((current) => {
          const next = { ...current };
          for (const id of occurrenceIds) next[id] = true;
          return next;
        });
      },
      isSurfaced,
      isDraftActive,
      draftOccurrenceIds,
      isInDraft,
      isLocked,
      savedOccurrenceIds,
      goals,
      setGoals,
      appliedSummary,
      proposeDraft: (occurrenceIds: string[]) => {
        const next = mergeLocked(occurrenceIds, lockedIds());
        setDraftIds(next);
        return next;
      },
      toggleLock: (occurrenceId: string) => {
        if (!findOccurrence(occurrenceId)) return;
        if (isOnAgenda(occurrenceId)) {
          setToast("Saved sessions stay protected.");
          return;
        }
        const nextLocked = !isLocked(occurrenceId);
        setLocked((current) => ({ ...current, [occurrenceId]: nextLocked }));
        if (nextLocked && draftIds && !draftIds.includes(occurrenceId)) {
          setDraftIds([...draftIds, occurrenceId]);
        }
      },
      buildDraft: () => {
        const next = mergeLocked(goals.length ? builtDraftIds(savedOccurrenceIds()) : savedOccurrenceIds(), lockedIds());
        setDraftIds(next);
        setAppliedSummary(null);
        setToast("Proposed agenda is ready. Nothing is saved until you apply it.");
      },
      applyDraft: () => {
        if (!draftIds) return;
        const review = reviewDraft(draftIds, savedOccurrenceIds());
        if (!review.canApply) {
          setToast("Resolve the conflict in this draft before applying it.");
          return;
        }
        setPriorAgenda(onAgenda);
        setLastDraft(draftIds);
        const draft = new Set(draftIds);
        const protectedIds = new Set(lockedIds());
        setOnAgenda((current) => {
          const next = { ...current };
          for (const id of Object.keys(next)) {
            if (next[id] && !draft.has(id) && !protectedIds.has(id)) next[id] = false;
          }
          for (const id of draft) next[id] = true;
          for (const id of protectedIds) next[id] = true;
          return next;
        });
        setDraftIds(null);
        setAppliedSummary(review.appliedText);
        setToast("Agenda updated");
      },
      undoApply: () => {
        if (!priorAgenda) return;
        setOnAgenda((current) => {
          const next = { ...current };
          const applied = new Set(lastDraft ?? []);
          for (const id of new Set([...Object.keys(priorAgenda), ...applied])) {
            if (Boolean(priorAgenda[id]) !== applied.has(id)) next[id] = Boolean(priorAgenda[id]);
          }
          return next;
        });
        setPriorAgenda(null);
        setDraftIds(null);
        setAppliedSummary(null);
        setToast("Undid the last applied changes. Other agenda sessions are unchanged.");
      },
      discardDraft: () => {
        setDraftIds(null);
        setToast("Kept your current agenda");
      },
      overlapsFor,
      visibleEntries,
      sessionById: (sessionId: string) =>
        sessions.find((session) => session.id === sessionId) ?? sessions[0],
    };
  }, [
    view,
    layout,
    showRecommended,
    showFavorites,
    forYouOpen,
    syncTarget,
    quickViewId,
    quickViewOccurrenceId,
    toast,
    onAgenda,
    saved,
    surfaced,
    draftIds,
    locked,
    goals,
    appliedSummary,
    priorAgenda,
    lastDraft,
  ]);

  return <AgendaContext.Provider value={value}>{children}</AgendaContext.Provider>;
}

export function useAgenda() {
  const value = useContext(AgendaContext);
  if (!value) throw new Error("useAgenda must be used within AgendaProvider");
  return value;
}
