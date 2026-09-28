// Before/after decision walkthrough. Design reasoning only: no scene shows or implies a measured outcome.

/**
 * @typedef {object} Scene
 * @property {string} id
 * @property {string} title
 * @property {string} before What the control (documented flow) shows at this point.
 * @property {string} after What the treatment (transparent preview) shows at this point.
 * @property {string} why Why this interface choice matters.
 * @property {string[]} refs Evidence (E#) and assumption (A#) ids the reasoning rests on.
 * @property {string[]} reveal Treatment elements that appear in this scene.
 * @property {string[]} focus Elements highlighted in this scene.
 */

/** @type {Scene[]} */
export const STORYBOARD = [
  {
    id: "problem",
    title: "The first-session problem",
    before: "Setup finishes with the checklist's next steps: check your inbox and review drafts in Gmail or Outlook. The drafts already exist, but the user has to go and find them.",
    after: "Nothing yet. The treatment only diverges after categorisation completes.",
    why: "Drafts already exist for To do / To respond emails (E2). What's unknown is whether a new user notices, understands and trusts one in session one (A1). That makes this a recognition problem, not a generation problem, so the design must not change what the system does.",
    refs: ["E2", "A1"],
    reveal: [],
    focus: ["b-next", "b-inbox"],
  },
  {
    id: "system",
    title: "The underlying system is unchanged",
    before: "The 300 most recent emails are categorised, and drafts are written for To do / To respond emails.",
    after: "Identical: same categorisation, same drafts, same timing.",
    why: "Holding the system constant in both arms (E1, E2) means any difference comes from what the user sees. It also keeps the treatment from posing as a fix for behaviour the product already has.",
    refs: ["E1", "E2"],
    reveal: [],
    focus: ["sys"],
  },
  {
    id: "preview",
    title: "Show the value where attention already is",
    before: "The user leaves setup and scans a full inbox for labels and drafts.",
    after: "One screen shows what was sorted (counts by category) and the first draft that already exists, in full.",
    why: "The moment after connection is when attention is highest. Showing the whole draft, not just a count, lets the user judge it. The preview only displays a draft that already exists: it never generates or sends one (E10).",
    refs: ["E1", "E10", "A2"],
    reveal: ["a-sorted", "a-draft"],
    focus: ["a-sorted", "a-draft"],
  },
  {
    id: "rationale",
    title: "Make the reasoning and the location visible",
    before: "A draft sits under Drafts or on the email, with no explanation of why it was written.",
    after: "'Why this draft' lists the context it used. 'Where it lives' points back to the draft in the inbox. It restates that nothing sends without review.",
    why: "Trust needs visible reasoning (A2). Pointing to where the draft lives builds the habit in the email client, which is where drafts are (E2). The copy invites light edits, which teach tone (E11), rather than blind sends.",
    refs: ["A2", "E2", "E10", "E11"],
    reveal: ["a-why", "a-where"],
    focus: ["a-why", "a-where"],
  },
  {
    id: "readiness",
    title: "Name the setup cause in context",
    before: "If conversation view is off or labels are hidden, drafts are missing or invisible, and the fix lives in help pages.",
    after: "A readiness list names each condition, why it matters, and how to fix it.",
    why: "The conditions are documented (E3, E9, E4), but only in help pages. How common they are is an assumption (A3). Naming the condition that applies to this user turns an unexplained absence into a fix. The checks are logged in both arms, so control has the same segments.",
    refs: ["E3", "E9", "E4", "A3"],
    reveal: ["a-ready"],
    focus: ["a-ready"],
  },
  {
    id: "empty",
    title: "Be honest when there is nothing to show",
    before: "If nothing in the last 300 needs a reply, the user finds no drafts and gets no explanation.",
    after: "An empty state says so plainly and offers the documented manual routes: Chat, forwarding and custom rules.",
    why: "Some users may have no To do email in their last 300 (A6). Inventing a draft would damage trust. Pointing to the documented routes (E5, E12) keeps the preview truthful.",
    refs: ["A6", "E5", "E12"],
    reveal: ["a-empty"],
    focus: ["a-empty"],
  },
  {
    id: "decision",
    title: "What would decide it",
    before: "Control stays exactly as documented.",
    after: "Each choice maps to an event. The primary metric is a first draft sent within 24h. Guardrails catch over-trust (heavy edits, discards), discomfort (disconnects, support contacts) and cancellations.",
    why: "No outcome is shown here, because none exists. This is design reasoning. The pre-registered A/B decision rule decides, after the 48–72h checks show the problem is real (A1, A3).",
    refs: ["E10", "A1", "A3"],
    reveal: ["a-test"],
    focus: ["a-test"],
  },
];

export const STORY_ELEMENTS = ["b-next", "b-inbox", "sys", "a-sorted", "a-draft", "a-why", "a-where", "a-ready", "a-empty", "a-test"];

/** Treatment elements visible at a scene index: everything revealed up to and including it. */
export function revealedAt(index) {
  const i = Math.max(0, Math.min(index, STORYBOARD.length - 1));
  return new Set(STORYBOARD.slice(0, i + 1).flatMap((s) => s.reveal));
}
