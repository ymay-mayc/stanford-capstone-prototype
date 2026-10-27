import { useAgenda } from "./AgendaContext";

export function Toast() {
  const { toast, dismissToast } = useAgenda();
  if (!toast) return null;

  return (
    <div className="toast" role="status">
      <i className="icon icon--check" aria-hidden="true" />
      <p>{toast}</p>
      <button type="button" className="toast__close" aria-label="Dismiss" onClick={dismissToast}>
        <i className="icon icon--close" aria-hidden="true" />
      </button>
    </div>
  );
}
