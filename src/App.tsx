import { AgendaProvider, useAgenda } from "./agenda/AgendaContext";
import { AgendaPage } from "./agenda/AgendaPage";
import { AllActivitiesPage } from "./activities/AllActivitiesPage";
import { EventFooter, EventNav } from "./chrome/EventNav";
import { InfoPage } from "./info/InfoPage";
import { Toast } from "./agenda/Toast";
import { QuickViewModal } from "./quick-view/QuickViewModal";
import { SessionDetailPage } from "./session/SessionDetailPage";

export function App() {
  return (
    <AgendaProvider>
      <Shell />
    </AgendaProvider>
  );
}

function Shell() {
  const { view } = useAgenda();

  return (
    <>
      <EventNav />
      {view.name === "agenda" ? <AgendaPage /> : null}
      {view.name === "activities" ? <AllActivitiesPage /> : null}
      {view.name === "detail" ? <SessionDetailPage sessionId={view.sessionId} /> : null}
      {view.name === "info" ? <InfoPage topic={view.topic} /> : null}
      <EventFooter />
      <QuickViewModal />
      <Toast />
    </>
  );
}
