# 5-minute demo script

> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.**

1. **Overview (45s).** "The docs say the last 300 emails are categorised and drafts are written for To do / To respond (E1, E2). So this isn't about generating a draft sooner. It's about whether people *recognise* and *trust* the first one." Point at the evidence and assumptions lists.
2. **Simulator, Maya, control → treatment (60s).** On the happy path, the control asks her to go and find the draft. The treatment shows the draft plus "Why this draft". The system behaviour is identical in both.
3. **Priya (45s).** Conversation view is off (E3). In the control she sees To do labels but no draft, and nothing explains why. The readiness check names the cause.
4. **Sam and Tom (45s).** These are honest limits. Sam has no To do email in his last 300, so he gets an empty state, not a fake draft. Tom is blocked by admin approval before the arms split, so this test can't help him, and he's a separate bet.
5. **Event stream and taxonomy (45s).** Every step emits events, validated live. There's no message content in analytics: try the invalid example.
6. **Experiment (60s).** Primary metric, guardrails, segments, then the decision rules. The calculator needs a real baseline, and the lab ships none. The rule-check buttons show each branch with made-up inputs.
7. **Close (20s).** The 48–72h plan decides whether the A/B test is worth building at all.
