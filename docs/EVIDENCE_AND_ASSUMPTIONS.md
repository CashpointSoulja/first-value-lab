# Evidence and assumptions register

> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.** Synthetic data only. Generated from `public/engine/evidence.js` by `npm run docs:evidence`. Do not edit by hand.

Every claim in the lab has one of two tags. `E#` means **documented** in a public source, linked, with the supporting quote. `A#` means **assumed**: plausible but unverified, with the check that would confirm or reject it. There are no internal Fyxer data, metrics or baselines anywhere in the lab.

## Documented (public sources)

| ID | Claim | Supporting quote | Source |
|---|---|---|---|
| E1 | On connection, the 300 most recent emails are categorised so results show right away. | "Fyxer organizes your 300 most recent emails so you see results right away." | [docs.fyxer.com/get-started/checklist](https://docs.fyxer.com/get-started/checklist) |
| E2 | Drafts are written for emails needing a response in To do / To respond, found under Drafts or attached to the email. | "Fyxer drafts replies for emails requiring a response in your To do or To respond category, depending on your setup. Find them under Drafts in your inbox or attached to any To do/To respond email." | [docs.fyxer.com/get-started/checklist](https://docs.fyxer.com/get-started/checklist) |
| E3 | Conversation view is needed to thread emails correctly and generate drafts. | "Conversation view isn't enabled. Fyxer needs this turned on to thread emails correctly and generate drafts." | [docs.fyxer.com/using-fyxer/work-with-drafts](https://docs.fyxer.com/using-fyxer/work-with-drafts) |
| E4 | Email and calendar are connected separately. | "Email and calendar are connected separately – make sure you do both." | [docs.fyxer.com/get-started/checklist](https://docs.fyxer.com/get-started/checklist) |
| E5 | Emails recognised as not needing a reply (e.g. FYI) do not get drafts; users can relabel or add custom rules. | "The email is labeled FYI. Fyxer won't draft a response to emails it recognizes as not needing a reply" | [docs.fyxer.com/using-fyxer/work-with-drafts](https://docs.fyxer.com/using-fyxer/work-with-drafts) |
| E6 | Some Outlook users hit an admin-approval error and are advised to resolve it first to avoid using up trial time. | "Your organization's IT admin needs to approve Fyxer. You should do this first to avoid using up trial time." | [docs.fyxer.com/get-started](https://docs.fyxer.com/get-started) |
| E7 | Standard and Pro plans have a 7-day free trial. | "7 day free trial" | [www.fyxer.com/pricing](https://www.fyxer.com/pricing) |
| E8 | Fyxer regularly tests and refines how it works, so experiences vary. | "We regularly test and refine how Fyxer works, so experiences can vary." | [docs.fyxer.com/get-started/using-fyxer-with-gmail](https://docs.fyxer.com/get-started/using-fyxer-with-gmail) |
| E9 | In Gmail, Fyxer labels can be hidden and should be set to show in the label and message lists. | "Check that labels aren't hidden ... make sure your Fyxer labels are set to Show in label list and Show in message list." | [docs.fyxer.com/get-started/using-fyxer-with-gmail](https://docs.fyxer.com/get-started/using-fyxer-with-gmail) |
| E10 | Nothing is sent without the user's review. | "Fyxer never sends emails or books meetings without your review." | [docs.fyxer.com/get-started/checklist](https://docs.fyxer.com/get-started/checklist) |
| E11 | Light edits teach tone; full rewrites give little to learn from. | "The key is to edit drafts rather than delete or rewrite them from scratch." | [docs.fyxer.com/using-fyxer/work-with-drafts](https://docs.fyxer.com/using-fyxer/work-with-drafts) |
| E12 | A draft can be requested manually via Chat or by forwarding, and custom rules can guarantee drafts. | "If a draft hasn't appeared for a specific email, you have a few options" | [docs.fyxer.com/using-fyxer/work-with-drafts](https://docs.fyxer.com/using-fyxer/work-with-drafts) |
| E13 | The role asks for validation through prototypes, fake doors, experiments and behavioural analysis, with full-stack A/B experience. | "Use the right tools to validate ideas and reduce risk: interviews, prototypes, experiments, product analytics, fake doors, usability testing, and behavioural analysis" | [jobs.ashbyhq.com/fyxer/e957fec9-e327-44c9-b12d-268fbc762c4e](https://jobs.ashbyhq.com/fyxer/e957fec9-e327-44c9-b12d-268fbc762c4e) |

## Assumptions (to test)

| ID | Assumption | How to check |
|---|---|---|
| A1 | Some new users do not notice or open their first draft in the first session, even when one exists. | Share of connected users with draft_generated but no draft_viewed within 24h. |
| A2 | A user may be more likely to send a first draft if they can see why it was written and what context it used. | Moderated sessions (48-72h plan), then the A/B test. |
| A3 | Setup gaps (conversation view off, labels hidden, calendar unconnected, admin approval pending) are common enough in week one to matter. | Prevalence of each readiness_check_evaluated status at connection, by provider. |
| A4 | Sending a first Fyxer draft in the first 24h is a leading indicator of trial-to-paid conversion. | Historical cohort analysis (needs internal data); trial_converted is a secondary read in the test. |
| A5 | A one-screen in-product preview adds little onboarding friction. | Time to first draft_viewed and preview dismiss rate. |
| A6 | Some new users have no To do / To respond email in their last 300, so there is no draft to show. | Distribution of to_do_bucket at initial_categorization_completed. |
| A7 | The simulator's user behaviour is scripted: in control, a user who cannot see labels or has no draft stops for that session. Real users will vary. | No test: a statement of the simulator's limits. Real behaviour comes from funnel data by readiness segment. |

## Rules

- A public page can go stale (E8: Fyxer says it regularly tests and refines). Check the live product flow before building anything (48–72h plan, day 0).
- An assumption never becomes evidence because the simulator shows it. The simulator's paths are scripted (A7).
- Nothing in the lab states that the treatment increases any metric. Where an increase is discussed, it is a hypothesis for the A/B test.
