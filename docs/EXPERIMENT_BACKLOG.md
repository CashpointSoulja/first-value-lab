# Experiment backlog: first value in the inbox

> Independent concept by Ayo Ahmed; not affiliated with Fyxer. This is a proposed sequence of tests, not Fyxer data or a claim of measured uplift. Public product claims and their sources are in [Evidence and assumptions](EVIDENCE_AND_ASSUMPTIONS.md). The [PRD](PRD.md), [event taxonomy](EVENT_TAXONOMY.md), [experiment design](EXPERIMENT_DESIGN.md) and [48–72h validation plan](VALIDATION_48_72H.md) define the first bet in detail.

## Decision order

Do not build an A/B test until the current product flow and the suspected first-session gap are checked. Score later bets only against observed user friction and trust, not simulated conversion rates.

| Order | Bet and hypothesis | Cheap test / required evidence | Decision gate | Status |
|---|---|---|---|---|
| 0 | **Check the premise.** Some connected users with generated drafts never view one on day one (A1); setup gaps may hide them (A3). | Audit current Gmail and Outlook onboarding; compare `draft_generated` with `draft_viewed` within 24h; inspect readiness-gap prevalence. Use a one-question trial survey if events do not exist. | Proceed if the pre-agreed problem threshold in the validation plan is met. If the live product already solves it, re-scope. | Proposed; requires internal data |
| 1 | **Specific welcome email.** Naming the existing To respond threads and why their drafts matter improves first draft sent within 24h, without harming trust (A2, A8). | Moderated first-session prototype tasks, then fake door; only then the 50/50 A/B specified in the experiment design. Keep categorisation, drafts, thread and Send identical across arms. | Pre-register the MDE and sample; ship only if the primary CI lower bound is above zero and no trust guardrail breaches. | Prototype in this lab; untested in product |
| 2 | **Readiness guidance alone.** Naming conversation-view, label, calendar or tone gaps may account for any lift rather than the thread preview (A3). | Read the pre-registered readiness segment from bet 1. If both mechanisms remain plausible, run a 2x2 test of preview and readiness guidance, with the same privacy-safe events. | Fund only if bet 1 shows a signal without harm and the mechanism is still ambiguous. | Conditional |
| 3 | **Empty-state guidance.** When no To do email appears in the last 300, an honest route to Chat, forwarding or custom rules may reduce confusion (A6). | Observe task completion and comprehension in users with a real empty state. Do not invent a draft or treat the empty state as a successful draft send. | Advance only if this is a meaningful segment and users understand the proposed route. | Conditional |
| 4 | **Draft-context disclosure.** A short explanation of what a draft used might improve trust, but could feel invasive or create over-trust (A2, A5). | Moderated comparison with and without "Why this draft"; measure edit, discard, disconnect and support-contact guardrails before considering exposure. | Stop if users infer guarantees the system cannot make or trust guardrails worsen. | Conditional |
| Separate | **Microsoft 365 admin approval.** This happens before email connection, so bet 1 cannot help users blocked here (E6). | Diagnose the pre-connection path and test admin-request guidance as a separate acquisition/onboarding problem. | Do not pool blocked users into the exposed population for bet 1. | Separate backlog |

## Instrumentation and safeguards before bet 1

- Confirm `integration_connected`, `initial_categorization_completed`, `draft_generated`, `draft_viewed`, `draft_sent` and `experiment_exposed` in both arms where applicable. Keep `readiness_check_evaluated` in both arms. Validate payloads against [the taxonomy](EVENT_TAXONOMY.md); no subjects, bodies, addresses, sender names or recipient names.
- Agree the real baseline and smallest effect worth shipping, then calculate sample size and whole-week runtime. This lab supplies neither a baseline nor results.
- Pre-register the primary metric, sample-ratio-mismatch check and limits for heavy edits, discards, disconnects, support contacts and cancellations. Read interim data only for SRM and harm.
- Freeze or log onboarding copy/version. Check mobile and desktop, Gmail and Outlook; keep A/A parity before exposure. Report unexpected platform effects as hypotheses, not ship decisions.

## What this lab demonstrates

The simulator shows deterministic synthetic journeys, event validation and decision rules. It is a decision aid, not a model of Fyxer's conversion or an experiment result. Any real prioritisation needs current product observation and internal data first.
