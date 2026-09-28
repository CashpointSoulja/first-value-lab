# Walkthrough and demo script (about 6 minutes)

> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.** Synthetic data only. Every name, thread and draft is invented. Nothing in the demo is a measured result.

## Before you start

- Run `npm run dev` and open `http://localhost:8787`. Each step below has a deep link.
- Say this up front: "This is an outside-in concept built from Fyxer's public docs. I have no internal data. Everything tagged E is public and linked. Everything tagged A is an assumption I'd want to test."

## Script

1. **Overview (`#overview`, 45s).** "The docs say the last 300 emails are categorised, and drafts are written for To do / To respond (E1, E2). So this isn't about generating a draft sooner. It's about whether people *recognise* and *trust* the first one." Point at the Hypothesis card, which is a proposed test with nothing measured, and at the evidence and assumption lists. Then "Where this adds value": the lever is the 7-day trial (E7); what the team gets is a spec, events, a test and kill rules; and each part maps to the posting's toolkit (E13). There's no uplift claim.
2. **Before/after (`#story`, 90s).** Step through manually. Both panes are the same Gmail inbox, recreated from Fyxer's own product-guide frames (R1, R2, R4): numbered colour-coded labels, red Draft markers, the draft in Gmail's reply box, Gmail's Send, and Fyxer's in-thread calendar note. Scene 1 is the founder's job: find the thread that needs them, trust the draft, send. Scene 2 is the key frame: the shared thread (draft, Send, calendar note) is identical in both arms. Scene 3 names where session one might stall, as an assumption. Scenes 4–8 are the interface choices, all inside Fyxer's existing welcome email: name the To respond threads that already have drafts, say why each needs a reply and what the draft used, flag what scheduling does and doesn't check, name setup gaps, and be honest when there's nothing to show. Scene 9 says what would decide it, and that there is no result yet.
3. **Simulator: Maya, control then treatment (`#simulator/maya/control`, 60s).** On the happy path, the control asks her to go and find the draft. The treatment shows it with "Why this draft". The system behaviour is identical in both.
4. **Priya (`#simulator/priya/control`, 45s).** Conversation view is off (E3). In the scripted control she sees To do labels but no draft, and nothing explains why. In the treatment, the readiness check names the cause.
5. **Sam and Tom (`#simulator/sam/treatment`, 45s).** These are the honest limits. Sam has no To do email in his last 300, so he gets an empty state, not a fake draft. Tom is blocked by admin approval before the arms split, so this test can't help him. He's a separate bet.
6. **Events (`#events`, 45s).** Every step emits events, validated live. Press "Try an invalid event" to show that message content and names are rejected.
7. **Experiment (`#experiment`, 60s).** Primary metric, guardrails, segments, then the decision rules. The calculator needs a real baseline, and the lab ships none. The rule-check buttons show each branch using made-up inputs.
8. **Close (`#validate`, 20s).** "The 48–72h plan decides whether this A/B test is worth building at all. If the day-0 read shows almost everyone already sees a draft on day 1, I'd drop it."

## Likely questions

| Question | Answer |
|---|---|
| "Does Fyxer already do this?" | Possibly, since the product changes (E8). Day 0 of the validation plan is a desk check of the live flow, and the concept would re-scope to improving whatever exists. |
| "Why is the primary metric *sent*, not *viewed*?" | The treatment displays the draft, so "viewed" would inflate by construction. "Sent within 24h" is the first behaviour that means value was accepted. |
| "What if more people send drafts they then regret?" | That's the guardrails' job: heavy-edit share, first-draft discards, disconnects, support contacts and cancellations. Each can stop the test. |
| "What lift do you expect?" | I don't claim one. The calculator sizes the test from a real baseline and a minimum effect worth shipping, both agreed before launch. |

## Why the redesign is inbox-native

- **It starts from the job, not the feature.** A founder with ten minutes wants the thread that needs them, a reply they trust, and to be back in their day. Fyxer already does the sorting and drafting inside Gmail/Outlook; the concept only makes that value findable in session one.
- **It adds no surface.** The treatment reuses the "You've connected your email" message Fyxer already puts in the inbox (R1), and links into the user's own threads.
- **It claims nothing Fyxer already does.** The calendar note in the thread is shown in both arms (R2). The treatment only adds what isn't checked (other attendees, E20) and whether the calendar is connected (E4).
- **Sources:** every mock detail traces to R1–R9 in the [evidence register](EVIDENCE_AND_ASSUMPTIONS.md).
