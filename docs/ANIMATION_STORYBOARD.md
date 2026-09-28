# Before/after decision walkthrough: rationale and storyboard

> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.** Synthetic data only. Generated from `public/engine/storyboard.js` by `npm run docs:storyboard`. Do not edit by hand.

## What it is for

A short, interview-friendly walkthrough of **design reasoning**. It shows the first-session problem, the underlying categorisation and drafts (the same in both arms), the treatment's transparent preview and readiness cues, and why each interface choice is there. It is not a result. No scene shows or implies a measured outcome, conversion rate or uplift, because none exists. The A/B test and its pre-registered decision rule are what would decide.

## Design principles

- **Hold the system constant.** The strip labelled "Same in both arms" stays on screen in every scene. The treatment is a visibility layer. It never generates, speeds up or sends a draft.
- **One idea per scene.** Each scene adds one or two treatment elements and highlights them. Everything else is dimmed, not hidden, so the before/after comparison stays in view.
- **Reasoning is sourced.** Each "why it matters" cites public evidence (`E#`) or a named assumption (`A#`) from the [evidence and assumptions register](EVIDENCE_AND_ASSUMPTIONS.md).
- **Honest limits are part of the story.** The empty state (no To do email in the last 300) is a scene of its own.
- **The disclaimer stays visible.** The site-wide sticky banner stays on screen, and the stage carries its own line: "Independent concept by Ayo Ahmed; not affiliated with Fyxer. Synthetic data."

## Accessibility

- **No autoplay.** The walkthrough starts paused on scene 1. Play advances every 7 seconds and stops at the last scene. Play/Pause, Back, Next and numbered scene buttons are all keyboard operable, and ←/→ step through scenes when the walkthrough has focus (WCAG 2.2.2 Pause, Stop, Hide).
- **Reduced motion.** If `prefers-reduced-motion: reduce` is set, or the "Reduce motion" box is ticked, fades, slides and the highlight pulse are switched off. State changes are instant, and the text version opens automatically.
- **Text fallback.** The visual stage is decorative (`aria-hidden`). Each scene's title, before, after and rationale are announced in a polite live region. The full storyboard is also available as an ordered list under "Text version", and in this document.
- **Deep links.** `#story/<scene-id>` opens a given scene, for example `#story/readiness`.

## Storyboard

| # | Scene | Before (control: documented setup flow) | After (treatment: transparent preview) | Why it matters | Refs | Appears |
|---|---|---|---|---|---|---|
| 1 | **The first-session problem** (`problem`) | Setup finishes with the checklist's next steps: check your inbox and review drafts in Gmail or Outlook. The drafts already exist, but the user has to go and find them. | Nothing yet. The treatment only diverges after categorisation completes. | Drafts already exist for To do / To respond emails (E2). What's unknown is whether a new user notices, understands and trusts one in session one (A1). That makes this a recognition problem, not a generation problem, so the design must not change what the system does. | E2, A1 | none |
| 2 | **The underlying system is unchanged** (`system`) | The 300 most recent emails are categorised, and drafts are written for To do / To respond emails. | Identical: same categorisation, same drafts, same timing. | Holding the system constant in both arms (E1, E2) means any difference comes from what the user sees. It also keeps the treatment from posing as a fix for behaviour the product already has. | E1, E2 | none |
| 3 | **Show the value where attention already is** (`preview`) | The user leaves setup and scans a full inbox for labels and drafts. | One screen shows what was sorted (counts by category) and the first draft that already exists, in full. | The moment after connection is when attention is highest. Showing the whole draft, not just a count, lets the user judge it. The preview only displays a draft that already exists: it never generates or sends one (E10). | E1, E10, A2 | `a-sorted`, `a-draft` |
| 4 | **Make the reasoning and the location visible** (`rationale`) | A draft sits under Drafts or on the email, with no explanation of why it was written. | 'Why this draft' lists the context it used. 'Where it lives' points back to the draft in the inbox. It restates that nothing sends without review. | Trust needs visible reasoning (A2). Pointing to where the draft lives builds the habit in the email client, which is where drafts are (E2). The copy invites light edits, which teach tone (E11), rather than blind sends. | A2, E2, E10, E11 | `a-why`, `a-where` |
| 5 | **Name the setup cause in context** (`readiness`) | If conversation view is off or labels are hidden, drafts are missing or invisible, and the fix lives in help pages. | A readiness list names each condition, why it matters, and how to fix it. | The conditions are documented (E3, E9, E4), but only in help pages. How common they are is an assumption (A3). Naming the condition that applies to this user turns an unexplained absence into a fix. The checks are logged in both arms, so control has the same segments. | E3, E9, E4, A3 | `a-ready` |
| 6 | **Be honest when there is nothing to show** (`empty`) | If nothing in the last 300 needs a reply, the user finds no drafts and gets no explanation. | An empty state says so plainly and offers the documented manual routes: Chat, forwarding and custom rules. | Some users may have no To do email in their last 300 (A6). Inventing a draft would damage trust. Pointing to the documented routes (E5, E12) keeps the preview truthful. | A6, E5, E12 | `a-empty` |
| 7 | **What would decide it** (`decision`) | Control stays exactly as documented. | Each choice maps to an event. The primary metric is a first draft sent within 24h. Guardrails catch over-trust (heavy edits, discards), discomfort (disconnects, support contacts) and cancellations. | No outcome is shown here, because none exists. This is design reasoning. The pre-registered A/B decision rule decides, after the 48–72h checks show the problem is real (A1, A3). | E10, A1, A3 | `a-test` |

## Presenting it (about 90 seconds)

Step through manually rather than pressing Play, so each rationale can be said out loud. Scenes 1–2 set the frame: the product already categorises email and writes drafts, and the question is recognition. Scenes 3–6 are the interface choices. Scene 7 hands over to the [experiment design](EXPERIMENT_DESIGN.md) and the [48–72h validation plan](VALIDATION_48_72H.md).
