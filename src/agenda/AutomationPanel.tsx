import { useState } from "react";
import { useAgenda } from "./AgendaContext";
import { entriesFor, sessions, formatRange, dayById } from "./sessions";

type Status = "off" | "on" | "paused";
const candidates = ["o005", "o002", "o080"];

export function AutomationPanel() {
  const agenda = useAgenda();
  const [status, setStatus] = useState<Status>("off");
  const [goal, setGoal] = useState("AI and UX");
  const [buffer, setBuffer] = useState(15);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [held, setHeld] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const last = sessions.find((s) => s.id === lastAdded);

  function record(text: string) {
    setMessage(text);
    setLog((items) => [text, ...items].slice(0, 6));
  }

  function addNext() {
    const saved = entriesFor(sessions).filter((entry) => agenda.isOnAgenda(entry.occurrence.id));
    const next = candidates.map((id) => sessions.find((s) => s.id === id)!)
      .filter((s) => s && !agenda.isOnAgenda(s.id) && !held.includes(s.id))
      .filter((s) => goal === "AI and UX" ? /ux|figma|designer|user research/i.test(`${s.title} ${s.description} ${s.track}`) : /\bai\b|agent/i.test(`${s.title} ${s.description}`))
      .find((s) => s.location.trim() && s.start >= 9 * 60 && s.end <= 17 * 60 && saved.every(({ occurrence: o }) => o.day !== s.day || s.end + buffer <= o.start || s.start >= o.end + buffer));
    if (!next) {
      setStatus("paused");
      record("Paused: no remaining sample suggestion fits your limits. Your agenda is unchanged. Review limits or keep planning manually.");
      return;
    }
    agenda.toggleAgenda(next.id);
    setLastAdded(next.id);
    setStatus("on");
    record(`Added ${next.title}. Matches ${goal}; no overlap and your ${buffer}-minute minimum gap is preserved in the sample schedule. Walking time is not verified.`);
  }

  function undo() {
    if (!lastAdded) return;
    if (agenda.isOnAgenda(lastAdded)) agenda.toggleAgenda(lastAdded);
    setHeld((ids) => [...ids, lastAdded]);
    setStatus("paused");
    record(`Undid ${last?.title ?? "the last addition"}. Automation paused; this session will not be automatically re-added during this demo.`);
    setLastAdded(null);
  }

  return (
    <div className="variant-b">
      <section className="variant-b__card" aria-labelledby="automation-status">
        <h2 id="automation-status">Automation is {status}</h2>
        <p>Your topics: {goal}. Your time: 9 a.m.–5 p.m. Additional considerations: Buffer at least {buffer} minutes between each session.</p>
        <p>Our AI agent will only fill your open times and keep your saved sessions. A time buffer is not a verified walking route estimate.</p>
        <div className="variant-b__actions">
          <button className="sf-cta sf-cta--medium sf-cta--secondary" onClick={() => { setEditing(!editing); if (status === "on") { setStatus("paused"); record("Automation is paused while you review your settings."); } }}>Review settings</button>
          {status !== "on" ? <button className="sf-cta sf-cta--medium sf-cta--primary" disabled={editing} onClick={addNext}>{status === "off" ? "Enable automation" : "Resume automation"}</button> : <button className="sf-cta sf-cta--medium sf-cta--secondary" onClick={() => { setStatus("paused"); record("Automation paused. Your saved sessions are unchanged."); }}>Pause automation</button>}
        </div>
        {editing ? <div className="variant-b__prefs">
          <label>Interests <select value={goal} onChange={(e) => setGoal(e.target.value)}><option>AI and UX</option><option>AI and agents</option></select></label>
          <label>Time between sessions <select value={buffer} onChange={(e) => setBuffer(Number(e.target.value))}><option value={15}>15 minutes</option><option value={30}>30 minutes</option></select></label>
          <button className="sf-cta sf-cta--small sf-cta--secondary" onClick={() => setEditing(false)}>Save settings</button>
          <p>Your changes will apply to new suggestions. Resume automation when you’re ready.</p>
        </div> : null}
        <p role="status" className={message ? undefined : "sr-only"}>{message}</p>
      </section>
      {last && agenda.isOnAgenda(last.id) ? <section className="variant-b__card" aria-labelledby="automatic-addition">
        <h2 id="automatic-addition">Added by automation</h2>
        <p><strong>{last.title}</strong></p>
        <p>{dayById(last.day).label} · {formatRange(last.start, last.end)} · {last.location}</p>
        <p><strong>Why this may fit:</strong> {last.description}</p>
        <div className="variant-b__actions">
          <button className="sf-cta sf-cta--medium sf-cta--secondary" onClick={() => agenda.openQuickView(last.id, last.id)}>View session details</button>
          <button className="sf-cta sf-cta--medium sf-cta--secondary" onClick={undo}>Undo last addition</button>
        </div>
      </section> : null}
      <section className="variant-b__card" aria-labelledby="automation-activity">
        <h2 id="automation-activity">Activity</h2>
        {log.length ? <ul className="variant-b__sessions">{log.map((item, i) => <li key={`${i}-${item}`}>{item}</li>)}</ul> : <p>No automated changes yet. Your saved keynote stays in place.</p>}
        <details><summary>Demo controls</summary>
          <p>Simulate a new recommendation arriving. No background service runs in this prototype.</p>
          <div className="variant-b__actions">
            <button className="sf-cta sf-cta--small sf-cta--secondary" disabled={status !== "on"} onClick={addNext}>Simulate next recommendation</button>
            <button className="sf-cta sf-cta--small sf-cta--secondary" disabled={status !== "on"} onClick={() => { setStatus("paused"); record("Needs review: the simulated next suggestion has no location. Nothing added. Automation paused."); }}>Simulate missing location</button>
          </div>
        </details>
      </section>
    </div>
  );
}
