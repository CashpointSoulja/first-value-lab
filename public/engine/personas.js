// Synthetic trial users. Names, companies, threads and drafts are invented.
// Category labels follow Fyxer's public Gmail guide (E1, E2); Outlook uses folders/categories.

/**
 * @typedef {"to_do"|"fyi"|"notification"|"follow_up"|"marketing"} Category
 * @typedef {{id:string, from:string, subject:string, category:Category, ageHours:number, messages:number,
 *   draft?: {body:string, context:string[]}}} Thread
 * @typedef {{id:string, name:string, role:string, provider:"gmail"|"outlook", accountType:"workspace"|"personal"|"m365",
 *   plan:"standard"|"pro", platform:"desktop"|"mobile", summary:string, lesson:string,
 *   setup:{conversationView:boolean, labelsVisible:boolean, calendarConnected:boolean, adminApproval:"not_required"|"required",
 *     toneSet:boolean},
 *   counts:Record<Category, number>, threads:Thread[]}} Persona
 */

export const CATEGORY_LABELS = {
  to_do: "1: to do",
  fyi: "2: FYI",
  notification: "3: notification",
  follow_up: "4: to follow up",
  marketing: "5: marketing",
};

/** @type {Persona[]} */
export const PERSONAS = [
  {
    id: "maya",
    name: "Maya Okafor",
    role: "Founder, 6-person design agency",
    provider: "gmail",
    accountType: "workspace",
    plan: "standard",
    platform: "desktop",
    summary: "Setup is clean and three client threads need replies. The draft exists; the question is whether she notices it and trusts it.",
    lesson: "Even on the happy path, the control asks Maya to go and find the draft in Gmail. The preview shows it, with its reasoning, in the moment she connects.",
    setup: { conversationView: true, labelsVisible: true, calendarConnected: true, adminApproval: "not_required", toneSet: false },
    counts: { to_do: 3, fyi: 41, notification: 118, follow_up: 7, marketing: 131 },
    threads: [
      {
        id: "t-maya-1", from: "Leo Hart (Northwind Foods)", subject: "Revised brand deck: Thursday?", category: "to_do", ageHours: 5, messages: 4,
        draft: {
          body: "Hi Leo,\n\nThursday works. I'll bring the revised deck with the two palette options we discussed and the packaging mock-ups. Would 2pm suit you?\n\nBest,\nMaya",
          context: ["4 messages in this thread", "Your last 3 replies to Leo (tone: short, warm)", "Mentions of 'palette options' earlier in the thread"],
        },
      },
      { id: "t-maya-2", from: "Aisha Rahman", subject: "Invoice #1042 query", category: "to_do", ageHours: 20, messages: 2 },
      { id: "t-maya-3", from: "Figma", subject: "Weekly activity digest", category: "notification", ageHours: 2, messages: 1 },
    ],
  },
  {
    id: "tom",
    name: "Tom Becker",
    role: "Agency recruiter",
    provider: "outlook",
    accountType: "m365",
    plan: "pro",
    platform: "desktop",
    summary: "His Microsoft 365 tenant needs admin approval, so he cannot connect on day one.",
    lesson: "Admin approval blocks him before the arms split, so this experiment cannot help Tom: he is exposed on trial day 2 either way. A pre-connection check is a separate bet, and his segment should be read separately.",
    setup: { conversationView: true, labelsVisible: true, calendarConnected: false, adminApproval: "required", toneSet: false },
    counts: { to_do: 9, fyi: 64, notification: 77, follow_up: 21, marketing: 129 },
    threads: [
      {
        id: "t-tom-1", from: "Hannah Price (candidate)", subject: "Re: Senior Analyst role: second interview", category: "to_do", ageHours: 3, messages: 6,
        draft: {
          body: "Hi Hannah,\n\nGreat news: the team would like to see you for a second interview. Are you free Tuesday or Wednesday afternoon next week? I'll send the details once we've confirmed a time.\n\nThanks,\nTom",
          context: ["6 messages in this thread", "Interview feedback email from the hiring manager (same week)", "Calendar not connected, so no specific times are offered"],
        },
      },
      { id: "t-tom-2", from: "Brightline Talent", subject: "Candidate shortlist", category: "to_do", ageHours: 9, messages: 3 },
    ],
  },
  {
    id: "priya",
    name: "Priya Nair",
    role: "Independent strategy consultant",
    provider: "gmail",
    accountType: "personal",
    plan: "standard",
    platform: "desktop",
    summary: "Conversation view is off in her Gmail, which Fyxer's docs say it needs to thread emails and generate drafts (E3).",
    lesson: "In the scripted control she sees To do labels but no draft, and nothing tells her why. The preview's readiness check names the cause and links the fix, and once conversation view is on, the draft appears.",
    setup: { conversationView: false, labelsVisible: true, calendarConnected: true, adminApproval: "not_required", toneSet: false },
    counts: { to_do: 5, fyi: 88, notification: 61, follow_up: 12, marketing: 134 },
    threads: [
      {
        id: "t-priya-1", from: "Marcus Webb (Halden Group)", subject: "Scope for phase 2", category: "to_do", ageHours: 11, messages: 5,
        draft: {
          body: "Hi Marcus,\n\nThanks for sending this over. I can put together a phase 2 scope by Friday. Could you confirm whether the retail workstream is in or out?\n\nBest,\nPriya",
          context: ["5 messages in this thread (available once conversation view is on)", "Your sent emails to Marcus (tone: formal)"],
        },
      },
    ],
  },
  {
    id: "dan",
    name: "Dan Reyes",
    role: "Account executive, B2B SaaS",
    provider: "gmail",
    accountType: "workspace",
    plan: "pro",
    platform: "mobile",
    summary: "He signs up on his phone, and his Gmail hides new labels from the label list (E9), so the categorisation is invisible to him.",
    lesson: "The value exists, but he cannot see it. The preview shows what was sorted and where it went, and a readiness check tells him how to show the labels.",
    setup: { conversationView: true, labelsVisible: false, calendarConnected: false, adminApproval: "not_required", toneSet: false },
    counts: { to_do: 12, fyi: 52, notification: 96, follow_up: 30, marketing: 110 },
    threads: [
      {
        id: "t-dan-1", from: "Jess Liu (Acme Logistics)", subject: "Pricing for 40 seats", category: "to_do", ageHours: 1, messages: 3,
        draft: {
          body: "Hi Jess,\n\nThanks for the detail. For 40 seats I can share our volume pricing. Would a 20-minute call this week work to walk through it?\n\nCheers,\nDan",
          context: ["3 messages in this thread", "Your previous pricing replies (tone: brief, friendly)"],
        },
      },
    ],
  },
  {
    id: "sam",
    name: "Sam Kowalski",
    role: "Operations manager",
    provider: "outlook",
    accountType: "m365",
    plan: "standard",
    platform: "desktop",
    summary: "His last 300 emails are almost all notifications and FYI. Nothing is labelled To do, so there is nothing to draft yet (E2, E5).",
    lesson: "This is the honest limit. A preview cannot invent value. It can explain what was sorted and offer the documented manual routes (E12), but his first draft will come later.",
    setup: { conversationView: true, labelsVisible: true, calendarConnected: true, adminApproval: "not_required", toneSet: false },
    counts: { to_do: 0, fyi: 97, notification: 161, follow_up: 4, marketing: 38 },
    threads: [
      { id: "t-sam-1", from: "Facilities", subject: "Fire alarm test Friday", category: "fyi", ageHours: 6, messages: 1 },
      { id: "t-sam-2", from: "Jira", subject: "12 issues updated", category: "notification", ageHours: 1, messages: 1 },
    ],
  },
];

export const personaById = (id) => PERSONAS.find((p) => p.id === id);
