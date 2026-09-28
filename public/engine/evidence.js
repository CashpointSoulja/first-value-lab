// Public sources only. Every "documented" claim in the lab links to one of these.
// Retrieved 2026-09-28. Fyxer notes that experiences vary because it regularly tests (E8),
// so anything here may already differ from the live product.

export const SOURCES = {
  checklist: "https://docs.fyxer.com/get-started/checklist",
  gmail: "https://docs.fyxer.com/get-started/using-fyxer-with-gmail",
  drafts: "https://docs.fyxer.com/using-fyxer/work-with-drafts",
  newUser: "https://docs.fyxer.com/get-started",
  pricing: "https://www.fyxer.com/pricing",
  quickstart: "https://docs.fyxer.com/get-started/quickstart",
  outlook: "https://docs.fyxer.com/get-started/using-fyxer-with-outlook",
  scheduling: "https://docs.fyxer.com/using-fyxer/scheduling",
  dashboardTour: "https://docs.fyxer.com/get-started/dashboard-tour",
  product: "https://www.fyxer.com/ai-email-assistant",
  videoDrafts: "https://vimeo.com/1140776018",
  videoScheduling: "https://vimeo.com/1140777928",
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
  { id: "E14", source: "quickstart", claim: "Action emails sit at the top in To do / To respond; FYI comes next; notifications and marketing sit in the bottom categories.", quote: "Your most important emails, ones that require an action, sit at the top in To do or To respond, depending on your setup. FYI emails come next." },
  { id: "E15", source: "quickstart", claim: "Drafts are written in the user's tone from the thread and prior context, for the user to review, edit and send.", quote: "Emails in your To do/To respond category that need a response get a suggested draft, written using the conversation thread and prior context." },
  { id: "E16", source: "quickstart", claim: "Right after connection, if no drafts show yet, the docs say more will appear as emails come through.", quote: "If you've only just connected your inbox and don't see any drafts yet, Fyxer's still waiting for an email that needs a response. Draft emails will appear as more emails come through." },
  { id: "E17", source: "gmail", claim: "In Gmail, Fyxer labels are colour-coded, and emails appear both in the inbox and under their label.", quote: "Labels are color-coded ... Emails appear in both your inbox and under their label" },
  { id: "E18", source: "outlook", claim: "In Outlook, Fyxer uses folders and coloured category tags, and an email lives in only one place.", quote: "Colored category tags show on each email ... Emails can only exist in one place" },
  { id: "E19", source: "scheduling", claim: "Scheduling drafts propose times from the user's live calendar, respecting working hours and time zone.", quote: "Scheduling drafts propose times inside an email reply. Fyxer checks your calendar and writes a draft with available windows" },
  { id: "E20", source: "scheduling", claim: "Fyxer does not check the availability of added attendees; booking uses the user's availability only.", quote: "Fyxer does not check the availability of added attendees. The meeting will be booked based on your availability only." },
  { id: "E21", source: "dashboardTour", claim: "Day-to-day triage, drafts and scheduling happen in the existing email client; the Dashboard is for setup and settings.", quote: "The Dashboard is where you customize how Fyxer works" },
  { id: "E13", source: "role", claim: "The role asks for validation through prototypes, fake doors, experiments and behavioural analysis, with full-stack A/B experience.", quote: "Use the right tools to validate ideas and reduce risk: interviews, prototypes, experiments, product analytics, fake doors, usability testing, and behavioural analysis" },
];

/**
 * First-party product UI references (screenshots and video frames) the mocks are recreated from.
 * The lab embeds none of these images; it links them and describes what each frame shows.
 * @type {{id:string, kind:string, url:string, where:string, shows:string}[]}
 */
export const UI_REFERENCES = [
  { id: "R1", kind: "Video · Fyxer Product Guide", url: SOURCES.videoDrafts, where: "\"Your Email Drafts\" (2:31), about 0:32 and 2:01", shows: "Gmail inbox after connection. To respond rows show the sender, a red \"Draft\" marker and \"Fyxer\", then a salmon \"1: to respond\" label chip before the subject. FYI rows carry an orange \"2: FYI\" chip, notifications a green \"4: notification\" chip. The inbox also holds Fyxer's own \"You've connected your email · Here's what to expect\" message, labelled 2: FYI." },
  { id: "R2", kind: "Video · Fyxer Product Guide", url: SOURCES.videoDrafts, where: "\"Your Email Drafts\", about 0:56", shows: "A Gmail thread (\"Calendar request\") with Fyxer's draft reply already open in Gmail's own reply box, under the original message. It offers times and a scheduling link. The blue Send button is Gmail's and the user presses it. Below, a note from Fyxer AI explains the times: the sender's likely time zone, the overlap with working hours, and \"Looking at your calendar, you're free\"." },
  { id: "R3", kind: "Video · Fyxer Product Guide", url: SOURCES.videoDrafts, where: "\"Your Email Drafts\", about 1:05", shows: "Dashboard → Drafts: tone instructions in a text box (\"I am concise in my communication, polite but direct\"), draft frequency and email threading (conversation view) help." },
  { id: "R4", kind: "Video · Fyxer Product Guide", url: SOURCES.videoDrafts, where: "\"Your Email Drafts\" sidebar", shows: "Gmail label list with Fyxer's numbered, colour-coded labels: 1: to respond, 2: FYI, 3: comment, 4: notification, 5: meeting update, 6: awaiting reply, 7: actioned, 8: marketing. A FYXER button sits in Gmail's top bar." },
  { id: "R5", kind: "Docs screenshot", url: "https://content.gitbook.com/content/zJXfZmKnv60AZ37bghx1/blobs/N3L9xFNPYhZ7EzCjlYHM/Screenshot%202026-03-26%20at%2010.57.44.png", where: "Using Fyxer with Gmail", shows: "Gmail inbox with Fyxer label chips on each row and a Draft marker on rows that have a Fyxer draft." },
  { id: "R6", kind: "Docs screenshot", url: "https://content.gitbook.com/content/zJXfZmKnv60AZ37bghx1/blobs/7p67ODNrWj4AYcqZ2lxC/Screenshot%202026-03-26%20at%2010.46.02.png", where: "Using Fyxer with Gmail", shows: "Gmail label pane: 1: to do, 2: FYI, 3: notification, 4: to follow up, 5: marketing, each with its own colour." },
  { id: "R7", kind: "Docs screenshot", url: "https://content.gitbook.com/content/zJXfZmKnv60AZ37bghx1/blobs/V8VYih4otj2eBEzSNB9l/Screenshot%202026-03-26%20at%2012.11.08.png", where: "Using Fyxer with Outlook", shows: "Outlook folder pane with the same five Fyxer categories as folders, each with an unread count." },
  { id: "R8", kind: "Docs screenshot", url: "https://content.gitbook.com/content/zJXfZmKnv60AZ37bghx1/blobs/ke0WAFsbfEPa9ozy5K6W/Screenshot%202026-03-26%20at%2012.27.28.png", where: "Dashboard tour", shows: "Dashboard → Categorization: left navigation, \"Move these out of my Inbox\" and \"Keep these in my Inbox\" toggles per category, pale parchment card headers." },
  { id: "R9", kind: "Video · Fyxer Product Guide", url: SOURCES.videoScheduling, where: "\"Scheduling with Fyxer\" (1:02), about 0:30", shows: "A Gmail thread where the scheduling link and booking confirmations arrive as ordinary emails; Dashboard → Scheduling shows team links and meeting windows." },
];

/** Things this lab assumes and has not verified. Each needs data Ayo does not have. */
export const ASSUMPTIONS = [
  { id: "A1", text: "Some new users do not notice or open their first draft in the first session, even when one exists.", test: "Share of connected users with draft_generated but no draft_viewed within 24h." },
  { id: "A2", text: "A user may be more likely to send a first draft if they can see why it was written and what context it used.", test: "Moderated sessions (48-72h plan), then the A/B test." },
  { id: "A3", text: "Setup gaps (conversation view off, labels hidden, calendar unconnected, admin approval pending) are common enough in week one to matter.", test: "Prevalence of each readiness_check_evaluated status at connection, by provider." },
  { id: "A4", text: "Sending a first Fyxer draft in the first 24h is a leading indicator of trial-to-paid conversion.", test: "Historical cohort analysis (needs internal data); trial_converted is a secondary read in the test." },
  { id: "A5", text: "A one-screen in-product preview adds little onboarding friction.", test: "Time to first draft_viewed and preview dismiss rate." },
  { id: "A6", text: "Some new users have no To do / To respond email in their last 300, so there is no draft to show.", test: "Distribution of to_do_bucket at initial_categorization_completed." },
  { id: "A8", text: "A time-poor founder or executive who opens the inbox after connecting will not scan 300 sorted emails for red Draft markers; they need the few threads that matter, named, in the place they already work.", test: "Moderated sessions: time to open the first To respond thread with a draft, unaided (48-72h plan)." },
  { id: "A7", text: "The simulator's user behaviour is scripted: in control, a user who cannot see labels or has no draft stops for that session. Real users will vary.", test: "No test: a statement of the simulator's limits. Real behaviour comes from funnel data by readiness segment." },
];

export const DISCLAIMER = "Independent concept by Ayo Ahmed; not affiliated with Fyxer.";
