// Before/after decision walkthrough. Design reasoning only: no scene shows or implies a measured outcome.

/**
 * @typedef {object} Scene
 * @property {string} id
 * @property {string} title
 * @property {string} short Stepper label.
 * @property {string} before What the control (documented flow) shows at this point.
 * @property {string} after What the treatment (specific start-here email) shows at this point.
 * @property {string} why Why this interface choice matters.
 * @property {string[]} refs Evidence (E#) and assumption (A#) ids the reasoning rests on.
 * @property {string[]} reveal Treatment elements that appear in this scene.
 * @property {string[]} focus Elements highlighted in this scene.
 */

/** @type {Scene[]} */
export const STORYBOARD = [
  {
    id: "job",
    title: "The job: find the thread that matters, trust the draft, send",
    short: "The job",
    before: "A founder connects Gmail between meetings. Fyxer sorts the 300 most recent emails. Three rows now read \"1: to respond\" with a red Draft marker, among dozens of FYI, notification and marketing rows.",
    after: "Identical inbox. Same labels, same rows, same drafts.",
    why: "The job isn't \"use an AI tool\". It's: which thread needs me, is the reply right, can I send it and get back to work? The product already does the sorting and drafting inside Gmail (E1, E14, E17). The question is whether a time-poor user finds and trusts that value in session one (A8, A1).",
    refs: ["E1", "E14", "E17", "A8", "A1"],
    reveal: [],
    focus: ["b-inbox", "t-inbox"],
  },
  {
    id: "system",
    title: "The thread and draft are the same in both arms",
    short: "Same system",
    before: "Opening Priya's thread shows Fyxer's draft already in Gmail's reply box, written from the thread. For scheduling, Fyxer's note lists the free times it found in the calendar. The user edits and presses Send.",
    after: "Identical thread, identical draft, identical Send button. Nothing is generated, changed or sent by the treatment.",
    why: "Holding the system constant (E2, E15, E19) means any difference comes from what the user sees. Fyxer already explains scheduling times inside the thread (R2), so the treatment must not pose as adding that. Sending stays a human action (E10).",
    refs: ["E2", "E15", "E19", "E10"],
    reveal: [],
    focus: ["sys"],
  },
  {
    id: "gap",
    title: "Where session one can stall",
    short: "The gap",
    before: "Fyxer's own welcome email (\"You've connected your email · Here's what to expect\") sits in the inbox as 2: FYI. Finding the drafts means spotting red Draft markers. If labels are hidden or conversation view is off, there may be nothing to spot.",
    after: "Same so far. The arms diverge only after categorisation finishes.",
    why: "This is an assumption to check, not a measured bottleneck. A busy user may not scan for markers (A8), and documented setup gaps can hide labels or block drafts (E9, E3). Readiness is logged in both arms so control has the same segments (A3).",
    refs: ["A8", "A1", "E9", "E3", "A3"],
    reveal: [],
    focus: ["b-welcome"],
  },
  {
    id: "start",
    title: "Name the threads, in the inbox they already use",
    short: "Start here",
    before: "The welcome email is generic. The user hunts for Draft markers.",
    after: "The same welcome email, made specific: what was sorted, and the three To respond threads that already have a draft. Each opens the Gmail thread, where the draft is.",
    why: "No new workflow and no new surface: the treatment rides on a message Fyxer already puts in the inbox (R1). It only points to drafts that exist (E2) and it opens the user's own thread, so the habit forms in Gmail (E21). Whether it adds friction is an assumption (A5).",
    refs: ["E2", "E21", "A5", "A8"],
    reveal: ["a-start"],
    focus: ["a-start"],
  },
  {
    id: "trust",
    title: "Say why each thread needs you, and what the draft used",
    short: "Why",
    before: "The label says 1: to respond. Why it's urgent, and what the draft drew on, is left to the user to infer.",
    after: "Each named thread has one line: why it needs a reply, and the context the draft used (the thread, past replies). It says the user edits and sends, and that light edits teach tone.",
    why: "Trust needs visible reasoning before sending (A2). The copy nudges light edits rather than blind sends or rewrites (E11), and repeats that nothing sends without review (E10).",
    refs: ["A2", "E11", "E10", "E15"],
    reveal: ["a-why"],
    focus: ["a-why"],
  },
  {
    id: "schedule",
    title: "Scheduling: the user verifies against their calendar",
    short: "Calendar",
    before: "Fyxer's in-thread note already lists free times from the calendar, if the calendar is connected. If it isn't, the reason is in help pages.",
    after: "The start-here email adds one line per scheduling thread: calendar connected or not, and that only the user's own availability is checked, not other attendees'.",
    why: "Calendar and email connect separately (E4). Scheduling drafts use the user's live calendar (E19), but added attendees aren't checked (E20). Saying so up front lets the user verify the proposed times before sending, rather than trusting them blindly.",
    refs: ["E4", "E19", "E20"],
    reveal: ["a-sched"],
    focus: ["a-sched", "sys"],
  },
  {
    id: "readiness",
    title: "Name the setup cause in context",
    short: "Readiness",
    before: "If conversation view is off or labels are hidden, drafts are missing or invisible, and the fix lives in help pages.",
    after: "A short readiness block in the same email names each condition, why it matters, and how to fix it.",
    why: "The conditions are documented (E3, E9, E4, E6), but only in help pages. How common they are is an assumption (A3). Naming the condition that applies turns an unexplained absence into a fix.",
    refs: ["E3", "E9", "E4", "E6", "A3"],
    reveal: ["a-ready"],
    focus: ["a-ready"],
  },
  {
    id: "empty",
    title: "Be honest when there is nothing to show",
    short: "Empty state",
    before: "If nothing in the last 300 needs a reply, there are no drafts yet. The docs say drafts appear as more emails come through.",
    after: "The email says so plainly, repeats that drafts will appear as replies are needed, and offers the documented manual routes: Chat, forwarding, custom rules.",
    why: "Some users may have no To respond email in their last 300 (A6). Inventing a draft would damage trust. The copy follows the docs (E16) and the documented routes (E5, E12).",
    refs: ["A6", "E16", "E5", "E12"],
    reveal: ["a-empty"],
    focus: ["a-empty"],
  },
  {
    id: "decision",
    title: "What would decide it",
    short: "Decision",
    before: "Control stays exactly as documented.",
    after: "Primary metric: first Fyxer draft sent within 24h of connecting email, among exposed new trials. Guardrails catch over-trust (heavy edits, discards), discomfort (disconnects, support contacts) and cancellations.",
    why: "No outcome is shown, because none exists. First-draft-sent is a testable activation hypothesis, not a measured Fyxer bottleneck; the link to trial-to-paid is itself an assumption (A4). The 48–72h checks come first (A1, A3, A8).",
    refs: ["A4", "A1", "A3", "A8"],
    reveal: ["a-test"],
    focus: ["a-test"],
  },
];

export const STORY_ELEMENTS = ["b-inbox", "b-welcome", "t-inbox", "sys", "a-start", "a-why", "a-sched", "a-ready", "a-empty", "a-test"];

/** Treatment elements visible at a scene index: everything revealed up to and including it. */
export function revealedAt(index) {
  const i = Math.max(0, Math.min(index, STORYBOARD.length - 1));
  return new Set(STORYBOARD.slice(0, i + 1).flatMap((s) => s.reveal));
}
