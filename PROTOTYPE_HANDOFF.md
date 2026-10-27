# Agenda prototype handoff

Read this before changing the prototype. The prototype itself was not changed to create this note.

## Where the work lives

- Project folder: `Agenda Prototype` on this Mac.
- Preview, when the local server is running: http://127.0.0.1:5173/
- Desktop size to check: 1440 pixels wide.
- Use Salesforce design tokens. Do not invent colors, type, spacing, or corner radius when a token exists.
- Figma is the visual source of truth when a frame is named. Do not restyle a component she has already approved unless she asks.
- Save a local checkpoint only when she asks. Do not upload to GitHub unless she asks.

## What is done and approved

These were reviewed and saved on this Mac. They were not uploaded to GitHub.

1. **Navigation.** Prototype links were kept. Menus open on hover. No underline on the current page. Logout stays a secondary button.
2. **Headline and description.** “Dreamforce Agenda 2026” and the approved description. They line up with the schedule, not with the wider navigation.
3. **Toolbar.** Show Recommended and Show Favorites, Multi-day view, and For You. For You is a blue primary button with no diamond. The filter icon still opens the existing filters.
4. **Schedule grid look.** Outer border, light blue day area, dates Tuesday September 15 through Thursday September 17, times from 7:00 AM through 10:00 PM. Each half hour is a tall row.
5. **Schedule scrolling.** The schedule box is 868 pixels tall, matching the live-site screenshot. The dates stay pinned while you scroll inside the box. A thin gray scrollbar appears when the pointer is over the schedule.
6. **Session cards.** Meeting titles, short-card title, 16-pixel spacing, and top alignment were approved.
   - Tuesday 9:30 AM: Breakfast with team. There is no separate 9:00 AM Tuesday meeting.
   - Tuesday 2:30 PM: Stop by Accenture booth.
   - Wednesday 9:00 AM: SIC meeting.
   - The Tuesday 10:00 AM breakout is the reference for a taller card. Leave that layout alone.
   - Short cards show the type pill and one truncated title, starting at the same top spacing as the 10:00 card. Time and heart are hidden on those short cards.
   - Longer cards keep the type, title, and time at the top, and the heart at the bottom right. The add button was not redesigned.

## Not saved yet

These are on the Mac but not in a checkpoint.

- **The schedule opens at 9:00 AM.** The day still runs from 7:00 AM to 10:00 PM. Scrolling up shows 7:00 through 8:30. This works, and she accepted it, but it was left out of the card checkpoint because it is a separate change. It is the only unsaved prototype change.
- **Writing rules for future chats**, in the hidden `.cursor` folder. Not part of the prototype.
- **This handoff note.** It is new. It is not a checkpoint until she asks to save one.

## Not started, or still open

Work has been moving from the top of the page downward. Next pieces have not been refined in this pass:

- Sections below the schedule: Favorites and experiences, meetings, and “Sync your calendar.”
- The footer still says September 1–3. The schedule dates are September 15–17. Do not change the footer unless she asks.
- The For You menu still lists recommended sessions. It was not replaced with the Figma list.
- The filter icon was kept even though that Figma toolbar frame did not show it.
- Navigation labels stay on the prototype’s own set of links. They were not switched to the live site’s labels.

## Figma and recordings to use

Figma file: [Cursor Prototype Inputs — Agenda Builder 2026 (Copy)](https://www.figma.com/design/8Y2AEzupULB1NIWMk37HJv/Cursor-Prototype-Inputs--Agenda-Builder-2026--Copy-)

Frames already used:

- Toolbar: node `14001-28122`
- Schedule grid: node `14001-27740`
- Shortest confirmed card, title truncated: node `14001-29985`
- Average card: node `14001-29942`
- Long card, session longer than 30 minutes. Ignore the button on that frame for now: node `14001-30533`

Live-site screenshot used for the schedule height: `Screenshot 2026-10-26 at 8.43.51 PM.png` on the Desktop. The schedule box in that full-size image is 868 pixels tall.

Related recordings on the Desktop, not yet used for the current card pass:

- `1-add-remove-recommended-session-via-quick-view.mov`
- `2-add-recommended-session-via-agenda-card.mov`
- `Registration-Attendee Portal-My Agenda-All Sessions.mov`

## Decisions and things to watch

- A half-hour row is 160 pixels tall, from the grid frame. Every row uses that height. A shorter row for a completely empty time was discussed, but that behavior is not in the current prototype.
- The schedule’s last time is 10:00 PM, not 11:00 PM.
- The three day columns are labeled Tuesday, Wednesday, and Thursday. Their internal names are still the old Sunday, Monday, and Tuesday names. Do not rename those internal names unless the task needs it. Sessions are attached to them.
- Card spacing is 16 pixels on every side. On a dashed recommendation card, the border is counted inside that 16 pixels.
- The heart icon button is 24 pixels.
- Short cards are the ones shorter than 140 pixels. That covers the 20-minute and 25-minute sessions. They must keep a visible title.
- Do not change an approved component while working on the next one.
- Check only the component that changed. A small visual check is enough for spacing. Test the interaction when the behavior changes.
