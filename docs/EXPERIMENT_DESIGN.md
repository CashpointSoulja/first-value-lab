# Experiment design: `fvl_first_value_preview_v1`

> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.** This document contains no baselines, results or uplift figures. Where numbers are needed, the in-app calculator takes your inputs.

## Hypothesis

If newly connected trial users see what was sorted, their first draft with the context behind it, and what setup is holding drafts back, then we predict a higher share of them will send a first draft within 24h of connecting email. The proposed mechanism: they can find and judge the draft in the moment (A1, A2). We also predict the trust guardrails will hold. These are predictions for the test to confirm or reject, and nothing here has been observed.

## Design

| | |
|---|---|
| Type | A/B, 50/50 |
| Unit | User (`anon_user_id`), assigned at `trial_started` |
| Exposure | `experiment_exposed`, fired at the first screen where the arms differ, **after** `initial_categorization_completed` |
| Analysis population | Exposed users (intent-to-treat from exposure) |
| Control | Documented setup flow: the checklist's next steps (check your inbox, review drafts in the email client) |
| Treatment | Transparent first-value preview plus readiness feedback. Drafting behaviour is identical |
| Eligibility | New trials on Standard or Pro that connect email. Users blocked before connection (e.g. admin approval, E6) are never exposed, which is correct: the treatment can't reach them |

## Primary metric

**First draft sent within 24h of connecting email.**

- Numerator: exposed users with `draft_sent` where `is_first = true`, within 24h of `integration_connected{integration=email}`
- Denominator: users with `experiment_exposed`
- Why this metric: it's the first moment the user *acted* on a draft, after review (E10). "Viewed" can be inflated by the treatment itself, because the preview displays the draft.

## Secondary metrics

| Metric | Definition | Role |
|---|---|---|
| Time to first view | `integration_connected(email)` → first `draft_viewed`, median and p75 | Mechanism |
| Early habit | ≥1 `draft_sent` on 2 or more of trial days 1–3 | Durability |
| Readiness resolution | Share of `needs_action` checks resolved by day 3 (control resolution inferred from later `readiness_check_evaluated`) | Mechanism |
| Trial-to-paid | `trial_converted` | Read, but **not** a decision metric: underpowered at this sample size (A4) |

## Guardrails (one-sided, pre-registered)

| Guardrail | Definition | Limit |
|---|---|---|
| Heavy-edit share of first sends | `draft_sent{is_first, edit_bucket=heavy}` / `draft_sent{is_first}` | ≤ +10% relative |
| First-draft discard rate | `draft_discarded{is_first}` / `draft_viewed{is_first}` | ≤ +10% relative |
| Email disconnect within 72h | `integration_disconnected{integration=email}`, trial days 1–3 | ≤ +10% relative |
| Support contact by day 3 | `support_contacted`, trial days 1–3 | ≤ +15% relative |
| Trial cancellation | `trial_cancelled` | ≤ +10% relative |

A guardrail is **breached** when the treatment is significantly worse (CI lower bound above 0) **and** the relative increase is above the limit. If a guardrail moves the wrong way past its limit but not significantly, it's flagged as **watch**.

## Segmentation (pre-registered)

| Segment | Values | Why |
|---|---|---|
| Provider | gmail · outlook | Label and folder mechanics differ (E9) |
| Account type | workspace · personal · m365 | Admin approval only applies to some tenants (E6) |
| Platform at connection | desktop · mobile | A preview may matter more where the inbox is harder to scan |
| To do count in last 300 | 0 · 1-4 · 5+ | With 0 there's no draft to show. Read that bucket as a guardrail check, not for lift |
| Readiness at connection | all ok · ≥1 needs_action | Separates the effect of the preview from the effect of readiness feedback |

Segment results are for learning and targeting. A ship decision rests on the overall primary metric. Anything not listed is exploratory.

## Power and runtime

Use the calculator in the app (Experiment tab). It's a two-sided two-proportion z-test with equal allocation, where the MDE is **absolute** (percentage points).

    n per arm = (z₁₋α/₂·√(2p̄(1−p̄)) + z₁₋β·√(p₁(1−p₁)+p₂(1−p₂)))² / MDE²

Runtime is rounded up to **whole weeks**, with a minimum of 7 days, to cover the weekday/weekend mix. The baseline must come from real data. The lab has none and ships none.

## Decision criteria (pre-registered)

Apply in this order:

1. **Invalid:** sample ratio mismatch, χ² p < 0.001. Fix assignment or logging, discard the run and restart.
2. **Keep running:** below the planned sample per arm or under 7 days. No peeking to ship. Early stop only for a significant guardrail breach.
3. **Stop (guardrail):** any guardrail breached.
4. **Ship:** the primary CI lower bound is above 0. Size the rollout claim to the **lower bound**, not the point estimate.
5. **Stop (negative):** the primary CI upper bound is below 0.
6. **Stop and re-scope:** the CI upper bound is below the MDE, so the effect we care about is ruled out.
7. **Iterate:** the CI still spans both 0 and the MDE. Revise the design. Extend only if an extension was pre-registered.

The in-app decision sandbox runs exactly this function (`decide()` in `public/engine/stats.js`), and each branch has a unit test.

## Analysis plan

- **Population:** exposed users (intention to treat from `experiment_exposed`). Users who connect but never reach exposure are reported separately and are the same in both arms by design.
- **Primary test:** two-sided two-proportion z-test, α = 0.05, 95% CI on the absolute difference. No variance-reduction covariates unless pre-registered.
- **Guardrails:** one-sided tests for harm, each with its breach threshold agreed before launch. A breach stops the test whatever the primary result.
- **Segments:** pre-registered segments are read with CIs and without a ship decision. Treat them as hypotheses for the next test.
- **Peeking:** the decision is made only at the planned sample and runtime. Interim looks cover SRM and guardrails only.

## Pre-launch checklist

- [ ] Baseline for the primary metric from day 0 of the validation plan (not from this repo)
- [ ] MDE agreed as the smallest effect worth shipping; sample and runtime from the calculator
- [ ] Guardrail breach thresholds written down
- [ ] Events verified in staging against `validateEvent()`, and parity checked in an A/A or the first 48h
- [ ] Setup copy frozen or versioned for the test window (E8)

## Threats to validity

- **Novelty:** check the day 1 vs day 3 habit metric.
- **Metric inflation:** the treatment displays the draft, so "viewed" isn't the primary metric.
- **Interference:** none expected. Assignment is per user, and shared inboxes are out of scope.
- **Instrumentation:** `readiness_check_evaluated` fires in both arms. Verify parity in an A/A or the first 48h.
- **The product changes during the test (E8):** freeze the relevant setup copy, or log its version.
