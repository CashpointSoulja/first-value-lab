# 48–72h validation plan

> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.** The goal is to decide within three days, cheaply, whether the A/B test is worth building. Thresholds are set **before** looking at any data. The percentages below are starting proposals from Ayo, to be agreed with the team. They are not Fyxer benchmarks.

## Day 0, first 24h: does the problem exist? (A1, A3, A6)

**Desk check (2h).** Walk through the current signup and connection flow on Gmail and Outlook test accounts. Is there already an in-product view of the first draft or readiness (E8)? If so, re-scope this to improving that view.

**Instrumentation read (half a day, internal data).** For the last 4–8 weeks of new trials, measure:

- the share with `draft_generated` but no `draft_viewed` within 24h (A1)
- the prevalence of each readiness gap at connection, by provider (A3)
- the distribution of To do count in the last 300 (A6)

| Go if | No-go if |
|---|---|
| ≥ 20% of connected users with a draft don't view it within 24h, **or** ≥ 15% have a readiness gap | Almost everyone views a draft on day 1 and readiness gaps are rare. The problem is elsewhere |

*If event data isn't available in this form, substitute a one-question in-product survey on day 2 of the trial: "Have you seen a draft from Fyxer yet?"*

## 24–48h: does the preview make sense to users? (A2, A5)

**Five to six moderated sessions**, 30 minutes each, with recent trial users or matched recruits. Use a clickable prototype (this lab's simulator screens, re-skinned).

Tasks:

1. Connect a (test) inbox. What do you think happened?
2. Find a reply you could send now.
3. Would you send it? Why or why not? (Show with and without "Why this draft".)
4. Readiness list: what would you do next?

Record time-to-find, verbatim trust statements, and any privacy discomfort.

| Go if | No-go if |
|---|---|
| ≥ 4 of 6 find the draft faster with the preview **and** ≥ 4 of 6 say the context makes them more willing to send | Most ignore the preview, or several say it feels invasive |

## 48–72h: will people use it? (fake door, if traffic allows)

For a small share of new trials, show a single "See your first draft and why" entry point on the post-connection screen. It links to a short explanation, not the full build. Measure the click-through rate and the dismiss rate.

| Go if | No-go if |
|---|---|
| A meaningful click-through, with the threshold set in advance from similar in-product prompts, **and** no support spike | Clicks far below comparable prompts |

## Output at 72h

A one-page decision:

- **Build the A/B test**, with this design and a baseline from day 0.
- **Re-scope**, e.g. only readiness feedback, or only the Gmail label visibility fix.
- **Drop**, because the problem isn't there.

## Explicitly out of scope for 72h

- Any claim of lift. That needs the powered A/B test.
- Conversion impact (A4). That needs historical cohorts, and a longer read.
