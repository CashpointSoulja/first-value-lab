# First Value Lab

> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.**
> A speculative growth-product prototype built for a conversation about Fyxer's Principal Growth Product Manager role. It is not Fyxer's product, UI, code or data. It makes no claim of internal access or measured lift. **Synthetic data only**: no real OAuth, no email is read or sent, no backend AI, no private metrics.

## The question

Fyxer's public setup guide describes what happens when someone connects their inbox. The 300 most recent emails are categorised, and drafts are written for emails in **To do / To respond**, found under Drafts or attached to the email ([checklist](https://docs.fyxer.com/get-started/checklist)).

So the growth question here is **not** "how do we get a draft generated sooner?" The product already generates drafts from the last 300 emails. The question is:

> **After connecting, do new trial users recognise a first draft they can trust, and act on it in the first session?**

First Value Lab starts from the user's job: a time-poor founder needs to find the thread that needs them, trust a draft in their own tone, verify scheduling times against the calendar, edit and send, without leaving Gmail or Outlook. It prototypes one testable answer: **Fyxer's existing welcome email, made specific** (the threads that already have drafts, why each needs a reply, and setup readiness). The mocks recreate Fyxer's real Gmail workflow from first-party screenshots and product-guide videos (R1–R9 in `docs/EVIDENCE_AND_ASSUMPTIONS.md`). Everything the system does stays the same in both arms. Only what the user sees changes.

| | Control: Gmail/Outlook as documented | Treatment: specific start-here welcome email |
|---|---|---|
| Categorisation of the last 300 emails | Same | Same |
| Drafts for To do / To respond emails | Same | Same |
| Thread, draft, Send, Fyxer's calendar note | Same | Same |
| After connecting, the user sees | Labelled inbox, drafts in threads, Fyxer's generic welcome email | The same welcome email naming the To respond threads that already have drafts, why each needs a reply, calendar and readiness notes (conversation view, label visibility, calendar, tone), each linking into the thread |

## What's in the site

- **Before/after**: a nine-scene decision walkthrough of a founder's first inbox session in both arms, recreated in Gmail, with the reason for each interface choice. It has Play/Pause, keyboard steps, reduced-motion support and a full text version.
- **Overview**: the bet, plus the four layers kept separate (product value, growth hypothesis, instrumentation, guardrails), the first-party product UI sources (`R1`–`R9`), and every documented claim (`E1`–`E21`) set apart from every assumption (`A1`–`A8`).
- **Trial simulator**: five synthetic personas × two arms. The journeys are deterministic and scripted, and each step emits analytics events that are validated live against the taxonomy. The side-by-side table shows structural properties of each path, never rates.
- **Event taxonomy**: 19 events, filterable, with a live validator and a JSON download. It rejects anything that looks like message content or personal data.
- **Experiment**: hypothesis, primary metric, guardrails, segmentation and decision rules. Also a sample-size and runtime calculator and a decision sandbox. Both use only numbers you type in. The "rule check" buttons fill in made-up inputs, one per decision branch.
- **48–72h plan**: cheap validation to run before building the A/B test.
- **Docs**: every document below, rendered in the app.

## Documents

- [PRD](docs/PRD.md)
- [5 Whys: evidence versus assumptions](docs/FIVE_WHYS.md)
- [Event taxonomy](docs/EVENT_TAXONOMY.md)
- [Experiment design](docs/EXPERIMENT_DESIGN.md)
- [48–72h validation plan](docs/VALIDATION_48_72H.md)
- [Evidence and assumptions register](docs/EVIDENCE_AND_ASSUMPTIONS.md) (generated)
- [Before/after walkthrough: rationale and storyboard](docs/ANIMATION_STORYBOARD.md) (generated)
- [Walkthrough and demo script](docs/WALKTHROUGH.md)
- [Design and brand notes](docs/DESIGN_AND_BRAND.md)

## Honesty rules this repo follows

1. **Documented vs assumed.** Anything described as Fyxer behaviour cites a public page (`E#`). Anything else is an assumption (`A#`) with a stated way to test it. Fyxer says it regularly tests and refines how it works, so experiences vary (E8), and the live product may already differ.
2. **No numbers pretending to be results.** There are no baselines, conversion rates or uplift figures anywhere. The calculators take your inputs.
3. **The simulator is a script, not a model** (A7). It shows *where* recognition can break. It does not predict how often.
4. **The treatment does not fix existing behaviour.** It doesn't change when or whether drafts are generated. Two personas show its limits: Tom is blocked by admin approval before the arms split, so the treatment can't help him, and Sam has no To do email in his last 300, so he gets an honest empty state rather than an invented draft.
5. **Privacy by design.** Events carry ids, enums, counts and buckets only. The validator rejects subjects, bodies, addresses, names and senders.

## Run locally

Requires Node 20+.

```bash
npm install
npm run dev        # wrangler dev → http://localhost:8787
npm test           # vitest: engine, taxonomy, stats, docs, worker
npm run typecheck  # tsc --noEmit
npm run docs:generate  # regenerate the generated docs after engine changes
```

## Architecture

- `src/worker.ts`: Cloudflare Worker. Serves `public/` as static assets and `/api/health`, `/api/docs` and `/api/docs/:slug`. The Markdown docs are bundled at build time. No storage, no secrets, no outbound calls.
- `public/engine/*.js`: a pure, dependency-free ES-module engine, shared by the browser and the tests.
  - `evidence.js`: public sources, documented claims (E#) and assumptions (A#)
  - `personas.js`: five synthetic personas with invented threads and drafts
  - `journey.js`: deterministic journeys for each arm, emitting taxonomy events
  - `taxonomy.js`: event definitions and `validateEvent()`
  - `experiment.js`: primary metric, guardrails and segments
  - `stats.js`: sample size, runtime, two-proportion test, SRM check and the decision rule
  - `storyboard.js`: the before/after scenes, shared by the animation, its text version and the storyboard doc
- `public/app.js`: vanilla JS UI with hash routing. `public/style.css`: responsive layout using fyxer.com's public colour tokens and Poppins (OFL). See [design and brand notes](docs/DESIGN_AND_BRAND.md).
- `scripts/*-doc.mjs`: generate the taxonomy, evidence and storyboard docs from the engine (`npm run docs:generate`). Tests fail if a doc drifts.

## Deploy

The site targets the Cloudflare Workers free tier (`wrangler.jsonc`: static assets plus a small Worker, no bindings that need a paid plan).

```bash
npx wrangler login     # or set CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
npm run deploy         # → https://first-value-lab.<your-subdomain>.workers.dev
```

## Sources (public, retrieved 28 Sep 2026)

- Setup checklist: https://docs.fyxer.com/get-started/checklist
- Using Fyxer with Gmail: https://docs.fyxer.com/get-started/using-fyxer-with-gmail
- Working with drafts: https://docs.fyxer.com/using-fyxer/work-with-drafts
- Getting started (admin approval): https://docs.fyxer.com/get-started
- Pricing (7-day trial): https://www.fyxer.com/pricing
- Role description: https://jobs.ashbyhq.com/fyxer/e957fec9-e327-44c9-b12d-268fbc762c4e

Built by Devin (an AI agent) at Ayo Ahmed's direction. MIT licence. Fyxer is a trademark of its owner, used here only to identify the product being discussed.
