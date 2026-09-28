# PRD: Start-here welcome email (inbox-native first value)

> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.** Speculative. Synthetic data only. Tags: `E#` = documented in a public source (see [5 Whys](FIVE_WHYS.md)); `A#` = assumption, not yet verified.

## 1. The user's job (first principles)

A founder or executive has minutes between meetings. After connecting email, the job is not "try an AI assistant". It is:

1. **Find the thread that needs me.** Fyxer ranks action emails at the top as To do / To respond, with FYI next and notifications and marketing below (E14). In Gmail these are numbered, colour-coded labels, shown in the inbox and under the label (E17, R1, R4). Outlook uses folders and coloured category tags (E18, R7).
2. **Trust the draft.** Drafts are written in the user's tone from the thread and prior context (E15), and sit in Gmail's own reply box inside the thread (E2, R2).
3. **Edit safely, then send.** The user reviews, edits and presses Send. Fyxer never sends without review (E10). Light edits teach tone (E11).
4. **For scheduling, verify the times.** Scheduling drafts propose windows from the user's live calendar (E19). Fyxer's own note in the thread already lists the free times it found (R2). It does not check other attendees' availability (E20). Calendar connects separately from email (E4).
5. **Stay in the inbox.** Day-to-day work happens in the email client; the Dashboard is for setup (E21).

## 2. Problem (hypothesis, not a measured bottleneck)

The product already delivers each step above inside Gmail/Outlook. What can't be known from outside is whether a time-poor user, in session one, **finds** those three To respond threads among 300 sorted emails, **trusts** the draft enough to send, and knows what to fix when drafts are missing (A8, A1, A2). The inbox's own onboarding message ("You've connected your email · Here's what to expect", labelled 2: FYI, R1) is generic.

Documented conditions can hide or block the value: conversation view off (E3), Gmail labels hidden (E9), calendar not connected (E4), Microsoft 365 admin approval (E6). Right after connection, drafts may not exist yet; the docs say more appear as emails come through (E16). The trial lasts 7 days (E7).

**Kept distinct:** product value (documented, above) · growth hypothesis (this section, to test) · instrumentation (primary metric: first Fyxer draft sent within 24h of email connection, among exposed new trials) · trust guardrails (section 5). There is no Fyxer data or conversion figure anywhere in this PRD.

## 3. Goal and non-goals

**Goal (to test):** learn whether naming the threads that need the user, in the inbox, changes the share of new trial users who **send a first Fyxer draft within 24h of connecting email**, with no harm to trust guardrails.

**Non-goals**

- Changing whether, when or how drafts are generated. The treatment is a visibility layer only.
- Generating a draft when none exists. If there's no To do email, the preview says so (E5, E12).
- Adding a new surface or workflow. The treatment reuses a message already in the inbox and links into existing threads.
- Adding scheduling reasoning. Fyxer already explains calendar times in the thread (R2).
- Solving admin approval. That happens before exposure and is a separate bet (see Tom in the simulator).
- Any claim about Fyxer's current metrics. This PRD has no baselines.

## 4. Users (synthetic personas in the simulator)

| Persona | Setup | What it tests |
|---|---|---|
| Maya, agency founder, Gmail Workspace, desktop | Clean. 3 To do emails | Happy path: does visibility add anything when nothing is broken? |
| Tom, recruiter, Microsoft 365 | Admin approval required | An honest limit: blocked before the arms split |
| Priya, consultant, personal Gmail | Conversation view off (E3) | Readiness feedback names the cause of missing drafts |
| Dan, AE, Gmail on mobile | Labels hidden (E9) | Value exists but is invisible |
| Sam, ops manager, Microsoft 365 | 0 To do in last 300 | Honest empty state, no invented value |

## 5. Solution

The control is Gmail/Outlook as documented: labels, drafts in threads, and Fyxer's generic welcome email.

In the treatment, after the first categorisation pass, **the same welcome email** becomes specific. It stays in the inbox, in the user's normal flow:

1. **What was sorted**: counts per label for the emails considered (at most 300).
2. **Start here**: the To respond threads that already have a draft, each linking to the Gmail/Outlook thread where the draft sits.
3. **Why each needs you, and what the draft used**: one line per thread (the thread, past replies, the calendar), plus "you edit and send; light edits teach tone" (E10, E11).
4. **Scheduling**: whether the calendar is connected, and that only the user's own availability is checked (E4, E20).
5. **Setup readiness**: conversation view, label visibility (Gmail), calendar, workspace approval and tone guidance, each with its reason and fix.
6. **Empty state**: if nothing needs a reply, it says so, repeats that drafts appear as emails come in (E16), and offers Chat, forwarding and custom rules (E12).

The thread, draft, Send button and Fyxer's calendar note are identical in both arms.

### Requirements

| # | Requirement | Priority |
|---|---|---|
| R1 | The start-here content renders only after `initial_categorization_completed`. The system behaviour is identical across arms | Must |
| R2 | Only threads with an existing draft are named. The email never generates, edits or sends a draft; each link opens the user's own thread | Must |
| R3 | "Why this draft" lists only context the draft actually used | Must |
| R4 | Readiness checks are evaluated and logged in **both** arms, so segments exist for control | Must |
| R5 | The empty state is honest when `to_do_count = 0` | Must |
| R6 | No new surface: delivered in the existing welcome email, readable at mobile widths, and ignorable like any email | Must |
| R7 | Analytics carry no message content or PII (see [taxonomy](EVENT_TAXONOMY.md)) | Must |
| R8 | Works at mobile widths (Dan) | Should |
| R9 | The copy avoids over-claiming accuracy. Light edits teach tone (E11) | Should |

### User stories

- As a founder who has just connected email, I want the few threads that need me named in my inbox, so I don't scan 300 sorted emails.
- As that user, when a draft proposes meeting times, I want to know they came from my calendar and what wasn't checked, so I can send safely.
- As that user, I want to understand why a draft says what it says, so I can decide whether to trust and send it.
- As that user, if drafts are missing or invisible, I want to know what's causing it and how to fix it in one step.
- As a user with nothing to reply to, I want to be told so plainly, rather than wondering whether the product works.

### UX states

| State | Trigger | Shows |
|---|---|---|
| Preparing | Connected, categorisation still running | Progress copy only. No counts, no draft |
| Draft ready | `to_do_count ≥ 1` and at least one draft exists | What we sorted, first draft, why this draft, where it lives, readiness |
| Draft blocked | `to_do_count ≥ 1`, no draft, readiness gap (e.g. conversation view off) | What we sorted, the specific gap and its fix, and a note that drafts appear once it's fixed |
| Labels hidden | Gmail labels hidden | What we sorted, where it went, and how to show labels |
| Nothing to reply to | `to_do_count = 0` | Honest empty state plus documented manual routes (E12) |
| Dismissed | User closes the preview | The inbox as in control. The preview can be reopened from setup |

### Acceptance criteria

- In the lab's deterministic journeys, categorisation and draft outputs are identical across arms for every persona (`test/engine.test.ts`: pre-exposure parity, drafts only on To do threads).
- No treatment-only event fires in control. `validateEvent()` rejects it.
- No event carries message content or names. The validator rejects it.
- Sam's treatment path shows no draft. Tom's exposure happens on the same trial day in both arms.
- Every view shows the disclaimer at 390 px and 1366 px widths.

### Dependencies

- Categorisation completion and draft availability signals (`initial_categorization_completed`, `draft_generated`).
- Readiness signals: conversation view, label visibility, calendar connection and tone setup, evaluated at connection in both arms.
- An experimentation service with per-user assignment at trial start.

### Rollout (if the test ships)

1. Validation first ([48–72h plan](VALIDATION_48_72H.md)), then run the A/B test as designed.
2. Ship only under the pre-registered rule. Size any rollout claim to the CI lower bound.
3. Ramp 10% → 50% → 100% with guardrails monitored at each step, and keep a holdback for one trial cycle to check persistence.

## 6. Success measures

See [Experiment design](EXPERIMENT_DESIGN.md). The primary metric is first draft sent within 24h of connecting email. The guardrails are heavy-edit share, first-draft discards, disconnects within 72h, support contacts and trial cancellations.

## 7. Risks

| Risk | Mitigation |
|---|---|
| The preview adds friction on the happy path (A5) | Dismissible, one screen. Watch time-to-first-view |
| Over-trust: users send drafts they then regret | Heavy-edit and discard guardrails. "Why this draft" shows its limits |
| A more specific onboarding email feels invasive | Disconnect guardrail. Moderated sessions check comfort first |
| The effect comes only from readiness fixes, not from the preview | Pre-registered readiness segment. A 2×2 follow-up if needed |
| The live product already does something similar (E8) | Check the current flow before building (48–72h plan, day 0) |

## 8. Open questions

- Does the effect, if any, come from the preview or from readiness feedback alone? The readiness segment gives a first read, and a 2×2 would separate them.

- Does the first-session draft moment matter for conversion (A4)? This needs historical data Ayo doesn't have.
- How common is each readiness gap at connection (A3)?
- Which email should be shown first: the most recent, the most important, or the most confidently drafted?
