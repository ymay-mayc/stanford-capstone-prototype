const copy: Record<string, { title: string; body: string }> = {
  overview: {
    title: "Overview",
    body: "You’re registered for Dreamforce in San Francisco, September 15–17. Build your week from My Agenda.",
  },
  online: {
    title: "Online Activities",
    body: "The online channel isn’t part of this in-person agenda prototype.",
  },
  speakers: {
    title: "Speakers",
    body: "Speaker profiles aren’t part of this agenda prototype. Open a session to see who is presenting.",
  },
  sponsors: {
    title: "Sponsors",
    body: "Sponsor listings aren’t part of this agenda prototype.",
  },
  schedule: {
    title: "Event Schedule",
    body: "The in-person schedule lives on My Agenda and All Activities.",
  },
  "dreamforce-101": {
    title: "Dreamforce 101",
    body: "Dreamforce runs September 15–17 at the Moscone Center in San Francisco.",
  },
  faq: {
    title: "FAQ",
    body: "Add recommended sessions, keep pre-added sessions, and remove one side of an overlap to clear a conflict.",
  },
};

export function InfoPage({ topic }: { topic: string }) {
  const page = copy[topic] ?? copy.overview;
  return (
    <main className="info">
      <h1>{page.title}</h1>
      <p>{page.body}</p>
    </main>
  );
}
