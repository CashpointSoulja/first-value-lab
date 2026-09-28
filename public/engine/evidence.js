// Public sources only. Every "documented" claim in the lab links to one of these.
// Retrieved 2026-09-28. Fyxer notes that experiences vary because it regularly tests (E8),
// so anything here may already differ from the live product.

export const SOURCES = {
  checklist: "https://docs.fyxer.com/get-started/checklist",
  gmail: "https://docs.fyxer.com/get-started/using-fyxer-with-gmail",
  drafts: "https://docs.fyxer.com/using-fyxer/work-with-drafts",
  newUser: "https://docs.fyxer.com/get-started",
  pricing: "https://www.fyxer.com/pricing",
  role: "https://jobs.ashbyhq.com/fyxer/e957fec9-e327-44c9-b12d-268fbc762c4e",
};

/** @type {{id:string, claim:string, quote:string, source:keyof typeof SOURCES}[]} */
export const EVIDENCE = [
  { id: "E1", source: "checklist", claim: "On connection, the 300 most recent emails are categorised so results show right away.", quote: "Fyxer organizes your 300 most recent emails so you see results right away." },
  { id: "E2", source: "checklist", claim: "Drafts are written for emails needing a response in To do / To respond, found under Drafts or attached to the email.", quote: "Fyxer drafts replies for emails requiring a response in your To do or To respond category, depending on your setup. Find them under Drafts in your inbox or attached to any To do/To respond email." },
  { id: "E3", source: "drafts", claim: "Conversation view is needed to thread emails correctly and generate drafts.", quote: "Conversation view isn't enabled. Fyxer needs this turned on to thread emails correctly and generate drafts." },
  { id: "E4", source: "checklist", claim: "Email and calendar are connected separately.", quote: "Email and calendar are connected separately – make sure you do both." },
  { id: "E5", source: "drafts", claim: "Emails recognised as not needing a reply (e.g. FYI) do not get drafts; users can relabel or add custom rules.", quote: "The email is labeled FYI. Fyxer won't draft a response to emails it recognizes as not needing a reply" },
  { id: "E6", source: "newUser", claim: "Some Outlook users hit an admin-approval error and are advised to resolve it first to avoid using up trial time.", quote: "Your organization's IT admin needs to approve Fyxer. You should do this first to avoid using up trial time." },
  { id: "E7", source: "pricing", claim: "Standard and Pro plans have a 7-day free trial.", quote: "7 day free trial" },
  { id: "E8", source: "gmail", claim: "Fyxer regularly tests and refines how it works, so experiences vary.", quote: "We regularly test and refine how Fyxer works, so experiences can vary." },
  { id: "E9", source: "gmail", claim: "In Gmail, Fyxer labels can be hidden and should be set to show in the label and message lists.", quote: "Check that labels aren't hidden ... make sure your Fyxer labels are set to Show in label list and Show in message list." },
  { id: "E10", source: "checklist", claim: "Nothing is sent without the user's review.", quote: "Fyxer never sends emails or books meetings without your review." },
  { id: "E11", source: "drafts", claim: "Light edits teach tone; full rewrites give little to learn from.", quote: "The key is to edit drafts rather than delete or rewrite them from scratch." },
  { id: "E12", source: "drafts", claim: "A draft can be requested manually via Chat or by forwarding, and custom rules can guarantee drafts.", quote: "If a draft hasn't appeared for a specific email, you have a few options" },
  { id: "E13", source: "role", claim: "The role asks for validation through prototypes, fake doors, experiments and behavioural analysis, with full-stack A/B experience.", quote: "Use the right tools to validate ideas and reduce risk: interviews, prototypes, experiments, product analytics, fake doors, usability testing, and behavioural analysis" },
];

/** Things this lab assumes and has not verified. Each needs data Ayo does not have. */
export const ASSUMPTIONS = [
  { id: "A1", text: "Some new users do not notice or open their first draft in the first session, even when one exists.", test: "Share of connected users with draft_generated but no draft_viewed within 24h." },
  { id: "A2", text: "A user may be more likely to send a first draft if they can see why it was written and what context it used.", test: "Moderated sessions (48-72h plan), then the A/B test." },
  { id: "A3", text: "Setup gaps (conversation view off, labels hidden, calendar unconnected, admin approval pending) are common enough in week one to matter.", test: "Prevalence of each readiness_check_evaluated status at connection, by provider." },
  { id: "A4", text: "Sending a first Fyxer draft in the first 24h is a leading indicator of trial-to-paid conversion.", test: "Historical cohort analysis (needs internal data); trial_converted is a secondary read in the test." },
  { id: "A5", text: "A one-screen in-product preview adds little onboarding friction.", test: "Time to first draft_viewed and preview dismiss rate." },
  { id: "A6", text: "Some new users have no To do / To respond email in their last 300, so there is no draft to show.", test: "Distribution of to_do_bucket at initial_categorization_completed." },
  { id: "A7", text: "The simulator's user behaviour is scripted: in control, a user who cannot see labels or has no draft stops for that session. Real users will vary.", test: "No test: a statement of the simulator's limits. Real behaviour comes from funnel data by readiness segment." },
];

export const DISCLAIMER = "Independent concept by Ayo Ahmed; not affiliated with Fyxer.";
