import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { entriesFor, findOccurrence, rangesOverlap, sessions } from "./sessions";
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
  overlapsFor: (occurrenceId: string) => AgendaEntry[];
  visibleEntries: () => AgendaEntry[];
  sessionById: (sessionId: string) => Session;
};

const AgendaContext = createContext<AgendaContextValue | null>(null);

function initialAgenda() {
  return Object.fromEntries(
    entriesFor(sessions).map(({ occurrence }) => [occurrence.id, occurrence.initialOnAgenda]),
  );
}

function initialSaved() {
  return Object.fromEntries(sessions.filter((session) => session.initialSaved).map((session) => [session.id, true]));
}

export function AgendaProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>({ name: "agenda" });
  const [layout, setLayout] = useState<LayoutMode>("calendar");
  const [showRecommended, setShowRecommended] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [forYouOpen, setForYouOpen] = useState(false);
  const [syncTarget, setSyncTarget] = useState<SyncTarget>(null);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [quickViewOccurrenceId, setQuickViewOccurrenceId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [onAgenda, setOnAgenda] = useState<Record<string, boolean>>(initialAgenda);
  const [saved, setSaved] = useState<Record<string, boolean>>(initialSaved);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const value = useMemo<AgendaContextValue>(() => {
    const isOnAgenda = (occurrenceId: string) => onAgenda[occurrenceId] ?? false;
    const isSaved = (sessionId: string) => saved[sessionId] ?? false;

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
        const next = !isOnAgenda(occurrenceId);
        setOnAgenda((current) => ({ ...current, [occurrenceId]: next }));
        setToast(next ? "Added to Agenda" : "Removed from Agenda");
      },
      toggleSaved: (sessionId: string) => {
        setSaved((current) => ({ ...current, [sessionId]: !current[sessionId] }));
      },
      dismissToast: () => setToast(null),
      notify: (message: string) => setToast(message),
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
  ]);

  return <AgendaContext.Provider value={value}>{children}</AgendaContext.Provider>;
}

export function useAgenda() {
  const value = useContext(AgendaContext);
  if (!value) throw new Error("useAgenda must be used within AgendaProvider");
  return value;
}
