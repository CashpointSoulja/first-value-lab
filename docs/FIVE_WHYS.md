# 5 Whys: evidence versus assumptions

> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.** Each "why" is tagged **Documented** (a public source, quoted) or **Assumed** (not verified, with how to check it). No private data was used.

## Observed symptom (assumed, A1)

Some trial users may reach the end of their first session without viewing or sending a draft, even though drafts were generated for their To do emails.

This is **not observed data**. It's the hypothesis that the 48–72h plan tests first. If it's false, the chain below stops here.

## The chain

| Why? | Answer | Status |
|---|---|---|
| 1. Why might a user not send a first draft in session one? | They didn't view one. | **Assumed** (A1). Check: `draft_generated` without `draft_viewed` within 24h |
| 2. Why might they not view one when drafts exist? | Drafts live in the email client: under Drafts or attached to To do / To respond emails (E2). After connecting, the user has to go and look. | **Documented** location (E2). **Assumed** that users don't look (A1) |
| 3. Why might they not find or recognise it when they look? | (a) Labels can be hidden in Gmail (E9). (b) Conversation view off prevents threading and drafting (E3). (c) With no To do email in the last 300, there's nothing to find (E2, E5). (d) A draft with no visible reasoning may not look trustworthy (A2). | (a)–(c) **Documented** as conditions. How common they are is **assumed** (A3). (d) **Assumed** (A2) |
| 4. Why don't users fix those conditions themselves? | The fixes are documented in help pages, but the in-inbox experience doesn't necessarily say which condition applies to *this* user. | Help pages are **documented** (E3, E9). That the product doesn't surface it in context is **assumed**, and may already be untrue (E8) |
| 5. Why does that matter for growth? | The trial is 7 days (E7). Light editing is how drafts learn tone (E11), so a late first draft delays both the first value and the learning loop. The link to conversion is unproven. | Trial length and edit-learning are **documented**. The link to conversion is **assumed** (A4) |

## Root cause (a hypothesis)

At the moment of connection, the value (categorisation and drafts) is created in the email client, while the explanation of that value (why this draft, and what setup is limiting it) lives in help docs. If a busy user doesn't bridge that gap alone, naming the threads that need them, and why, inside the welcome email already in their inbox might help. That is the hypothesis the experiment tests, not a finding.

## Competing explanations to rule out

| If this is true instead | Then | How the plan checks it |
|---|---|---|
| Users see the draft but don't need to reply yet | Recognition is fine and the timing metric is the wrong target | Day 0: views vs sends; moderated sessions |
| The draft quality, not its visibility, stops the send | Naming the threads won't help; heavy-edit and discard guardrails would rise | Session task 3; heavy-edit guardrail |
| Setup gaps are rare | Readiness feedback adds little; the start-here email has to carry the effect | Day 0: prevalence of each readiness state (A3) |
| The live product already surfaces the first draft (E8) | Re-scope to improving that surface | Day 0 desk check |

## What this does **not** say

- It doesn't say drafts wait for a new email. The docs say the last 300 are categorised and drafts are written for To do / To respond (E1, E2).
- It doesn't say existing unanswered threads are excluded. Nothing public says that.
- It doesn't say anything is broken. The treatment adds visibility and changes no behaviour.

## Evidence register

| ID | Claim | Source |
|---|---|---|
| E1 | The 300 most recent emails are categorised on connection | [Checklist](https://docs.fyxer.com/get-started/checklist): "Fyxer organizes your 300 most recent emails so you see results right away." |
| E2 | Drafts are written for To do / To respond emails, under Drafts or on the email | [Checklist](https://docs.fyxer.com/get-started/checklist): "Fyxer drafts replies for emails requiring a response in your To do or To respond category, depending on your setup." |
| E3 | Conversation view is needed to thread emails and generate drafts | [Drafts](https://docs.fyxer.com/using-fyxer/work-with-drafts): "Fyxer needs this turned on to thread emails correctly and generate drafts." |
| E4 | Email and calendar connect separately | [Checklist](https://docs.fyxer.com/get-started/checklist) |
| E5 | FYI and similar emails don't get drafts; users can relabel them or add rules | [Drafts](https://docs.fyxer.com/using-fyxer/work-with-drafts) |
| E6 | Outlook admin approval should be sorted out first to save trial time | [Get started](https://docs.fyxer.com/get-started) |
| E7 | Standard and Pro plans have a 7-day free trial | [Pricing](https://www.fyxer.com/pricing) |
| E8 | Experiences vary because Fyxer tests and refines | [Gmail guide](https://docs.fyxer.com/get-started/using-fyxer-with-gmail) |
| E9 | Gmail labels can be hidden | [Gmail guide](https://docs.fyxer.com/get-started/using-fyxer-with-gmail) |
| E10 | Nothing sends without review | [Checklist](https://docs.fyxer.com/get-started/checklist) |
| E11 | Light edits teach tone; rewrites don't | [Drafts](https://docs.fyxer.com/using-fyxer/work-with-drafts) |
| E12 | Manual routes exist: Chat, forward, custom rules | [Drafts](https://docs.fyxer.com/using-fyxer/work-with-drafts) |
| E13 | The role asks for prototypes, fake doors, experiments and behavioural analysis | [Role](https://jobs.ashbyhq.com/fyxer/e957fec9-e327-44c9-b12d-268fbc762c4e) |

## Assumption register

| ID | Assumption | How to check |
|---|---|---|
| A1 | Some users don't view a first draft in session one, even when one exists | `draft_generated` without `draft_viewed` in 24h |
| A2 | Seeing why a draft was written may raise willingness to send | Moderated sessions, then the A/B test |
| A3 | Readiness gaps are common enough in week one to matter | Prevalence of each `readiness_check_evaluated` status, by provider |
| A4 | First draft sent in 24h leads trial-to-paid | Historical cohort analysis (needs internal data) |
| A5 | A more specific welcome email adds little onboarding friction | Time to first `draft_viewed`; dismiss rate |
| A6 | Some users have no To do email in their last 300 | Distribution of `to_do_bucket` |
| A7 | The simulator's paths are scripted illustrations, not predictions | No test needed: it's a statement of limitation |
