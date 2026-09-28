# PRD: Transparent first-value preview

> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.** Speculative. Synthetic data only. Tags: `E#` = documented in a public source (see [5 Whys](FIVE_WHYS.md)); `A#` = assumption, not yet verified.

## 1. Problem

Fyxer's public setup guide says that after connection, the **300 most recent emails are categorised** (E1), and **drafts are written for emails needing a response in To do / To respond**, found under Drafts or attached to the email (E2). The value is generated. What's unknown from the outside is whether a new trial user, in their first session, **notices** that value, **understands** why it's there, and **trusts** it enough to send (A1, A2).

Three documented setup conditions can make that value hard to see or absent:

- conversation view off, which the docs say is needed to thread emails and generate drafts (E3)
- Gmail labels hidden, which makes the categorisation invisible (E9)
- Microsoft 365 admin approval, which blocks connection and uses up trial time (E6)

The trial lasts 7 days (E7), so every day before first value is a day of the trial gone.

## 2. Goal and non-goals

**Goal:** raise the share of new trial users who **send a first Fyxer draft within 24h of connecting email**, with no harm to trust guardrails.

**Non-goals**

- Changing whether, when or how drafts are generated. The treatment is a visibility layer only.
- Generating a draft when none exists. If there's no To do email, the preview says so (E5, E12).
- Solving admin approval. That happens before exposure and is a separate bet (see Tom in the simulator).
- Any claim about Fyxer's current metrics. This PRD has no baselines.

## 3. Users (synthetic personas in the simulator)

| Persona | Setup | What it tests |
|---|---|---|
| Maya, agency founder, Gmail Workspace, desktop | Clean. 3 To do emails | Happy path: does visibility add anything when nothing is broken? |
| Tom, recruiter, Microsoft 365 | Admin approval required | An honest limit: blocked before the arms split |
| Priya, consultant, personal Gmail | Conversation view off (E3) | Readiness feedback names the cause of missing drafts |
| Dan, AE, Gmail on mobile | Labels hidden (E9) | Value exists but is invisible |
| Sam, ops manager, Microsoft 365 | 0 To do in last 300 | Honest empty state, no invented value |

## 4. Solution

After the first categorisation pass, the treatment shows one in-product screen:

1. **What we sorted**: counts by category for the emails considered (at most 300).
2. **Your first draft**: the most recent To do email that has a draft, with the draft text.
3. **Why this draft**: the context used (thread length, prior replies and tone source, calendar availability or its absence) and where the draft lives in Gmail/Outlook. It also restates that nothing sends without review (E10).
4. **Setup readiness**: conversation view, label visibility (Gmail), calendar (E4), workspace approval and tone. Each item has its reason and a fix.
5. **Empty state**: if nothing needs a reply, it says so and offers the documented routes (Chat, forward, custom rules, E12).

The control is the lab's rendering of the public checklist's next steps: check your inbox, and review your first drafts in the email client.

### Requirements

| # | Requirement | Priority |
|---|---|---|
| R1 | The preview renders only after `initial_categorization_completed`. The system behaviour is identical across arms | Must |
| R2 | The draft shown is one that already exists. The preview never generates or sends | Must |
| R3 | "Why this draft" lists only context the draft actually used | Must |
| R4 | Readiness checks are evaluated and logged in **both** arms, so segments exist for control | Must |
| R5 | The empty state is honest when `to_do_count = 0` | Must |
| R6 | The preview can be dismissed, and the user can go straight to their inbox | Must |
| R7 | Analytics carry no message content or PII (see [taxonomy](EVENT_TAXONOMY.md)) | Must |
| R8 | Works at mobile widths (Dan) | Should |
| R9 | The copy avoids over-claiming accuracy. Light edits teach tone (E11) | Should |

## 5. Success measures

See [Experiment design](EXPERIMENT_DESIGN.md). The primary metric is first draft sent within 24h of connecting email. The guardrails are heavy-edit share, first-draft discards, disconnects within 72h, support contacts and trial cancellations.

## 6. Risks

| Risk | Mitigation |
|---|---|
| The preview adds friction on the happy path (A5) | Dismissible, one screen. Watch time-to-first-view |
| Over-trust: users send drafts they then regret | Heavy-edit and discard guardrails. "Why this draft" shows its limits |
| Showing email snippets in-product feels invasive | Disconnect guardrail. Moderated sessions check comfort first |
| The effect comes only from readiness fixes, not from the preview | Pre-registered readiness segment. A 2×2 follow-up if needed |
| The live product already does something similar (E8) | Check the current flow before building (48–72h plan, day 0) |

## 7. Open questions

- Does the first-session draft moment matter for conversion (A4)? This needs historical data Ayo doesn't have.
- How common is each readiness gap at connection (A3)?
- Which email should be shown first: the most recent, the most important, or the most confidently drafted?
