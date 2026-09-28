import { ASSUMPTIONS } from "./evidence.js";
import { CATEGORY_LABELS, personaById } from "./personas.js";
import { EXPERIMENT_ID } from "./taxonomy.js";

// Deterministic, scripted journeys. Nothing here is a forecast: the same persona and arm always
// produce the same steps and events. Clock offsets are illustrative.

export const ARMS = {
  control: {
    id: "control",
    label: "Control: documented setup flow",
    short: "Control",
    description:
      "The lab's rendering of Fyxer's public setup checklist: connect, the 300 most recent emails are categorised (E1), drafts are written for To do / To respond emails and found in the inbox or Drafts (E2). Not Fyxer's actual UI.",
  },
  treatment: {
    id: "treatment",
    label: "Treatment: transparent first-value preview",
    short: "Treatment",
    description:
      "Same system behaviour. After categorisation, an in-product preview shows what was sorted, the first draft with 'why this draft', where it lives in the inbox, and setup-readiness feedback. It changes what the user sees, not what the system does.",
  },
};

const START = Date.UTC(2026, 9, 5, 9, 0, 0); // Mon 5 Oct 2026 09:00 UTC, synthetic
const DAY = 86400;

export const READINESS_CHECKS = {
  conversation_view: { label: "Conversation view on", why: "Needed to thread emails correctly and generate drafts (E3).", fix: "Turn on conversation view in your email settings" },
  labels_visible: { label: "Labels visible in Gmail", why: "Hidden labels make the categorisation invisible (E9).", fix: "Gmail settings → Labels → Show in label list and message list" },
  calendar_connected: { label: "Calendar connected", why: "Email and calendar connect separately (E4). Needed for scheduling replies.", fix: "Connect calendar in Settings → Integrations" },
  admin_approval: { label: "Workspace approval", why: "Some Microsoft 365 tenants need IT approval before connecting (E6).", fix: "Send your IT admin the approval guide" },
  tone_set: { label: "Tone and role added", why: "Recommended: adding role and tone makes drafts more accurate from the start.", fix: "Dashboard → Drafts → Custom tone" },
};

const IN_SESSION_FIXES = new Set(["conversation_view", "labels_visible"]);

export const toDoBucket = (n) => (n === 0 ? "0" : n <= 4 ? "1-4" : "5+");

function readiness(persona, overrides = {}) {
  const s = { ...persona.setup, ...overrides };
  return {
    conversation_view: s.conversationView ? "ok" : "needs_action",
    labels_visible: persona.provider === "outlook" ? "ok" : s.labelsVisible ? "ok" : "needs_action",
    calendar_connected: s.calendarConnected ? "ok" : "needs_action",
    admin_approval: "ok", // evaluated after connection succeeded, so approval has been granted by now
    tone_set: s.toneSet ? "ok" : "needs_action",
  };
}

/**
 * @param {string} personaId
 * @param {"control"|"treatment"} arm
 */
export function simulateJourney(personaId, arm) {
  const persona = personaById(personaId);
  if (!persona) throw new Error(`unknown persona ${personaId}`);
  if (!(arm in ARMS)) throw new Error(`unknown arm ${arm}`);

  const steps = [];
  let seq = 0;
  let clock = 0;
  let variant = "unassigned";
  const base = {
    anon_user_id: `anon_${persona.id}`,
    trial_id: `trial_${persona.id}`,
    provider: persona.provider,
    account_type: persona.accountType,
    plan: persona.plan,
    platform: persona.platform,
  };
  const trialDay = () => Math.min(7, Math.floor(clock / DAY) + 1);
  const ev = (event_name, properties) => ({
    event_id: `${persona.id}-${arm}-${String(++seq).padStart(2, "0")}`,
    event_name,
    ts: new Date(START + clock * 1000).toISOString(),
    ...base,
    trial_day: trialDay(),
    variant,
    properties,
  });
  const step = (advance, s) => {
    clock += advance;
    const events = (s.events ?? []).map(([n, p]) => ev(n, p));
    steps.push({ ...s, at: new Date(START + clock * 1000).toISOString(), trialDay: trialDay(), events });
  };

  const client = persona.provider === "gmail" ? "Gmail" : "Outlook";
  const drafted = persona.threads.filter((t) => t.category === "to_do" && t.draft);
  const first = drafted[0];
  const emailsConsidered = Object.values(persona.counts).reduce((a, b) => a + b, 0);
  let convOn = persona.setup.conversationView;
  const draftExists = () => Boolean(first) && convOn;
  const draftEvents = () =>
    draftExists() ? [["draft_generated", { draft_id: `d_${first.id}`, thread_age_bucket: first.ageHours < 24 ? "<24h" : first.ageHours < 72 ? "1-3d" : ">3d" }]] : [];

  // Shared prefix (identical in both arms, before exposure).
  step(0, {
    id: "signup", kind: "signup", surface: "product", title: "Start the 7-day trial",
    caption: `${persona.name} signs up on ${persona.platform} to trial the ${persona.plan} plan (E7).`,
    events: [["trial_started", { signup_method: persona.provider === "gmail" ? "google" : "microsoft" }]],
  });

  if (persona.setup.adminApproval === "required") {
    step(60, {
      id: "connect-blocked", kind: "connect_blocked", surface: "product", title: "Connection blocked: admin approval required",
      caption: "His Microsoft 365 tenant needs an IT admin to approve the app (E6). Both arms see this, because it happens before the arms split.",
      events: [["integration_connect_started", { integration: "email" }], ["integration_connect_failed", { integration: "email", reason: "admin_approval_required" }]],
    });
    step(DAY + 30 * 60 - 60, {
      id: "connect-approved", kind: "connect", surface: "product", title: "IT approves; he reconnects on trial day 2",
      caption: "Assumed for illustration: approval arrives the next working morning. One of seven trial days is gone.",
      events: [["integration_connect_started", { integration: "email" }], ["integration_connected", { integration: "email" }]],
    });
  } else {
    step(90, {
      id: "connect", kind: "connect", surface: "product", title: `Connect ${client}`,
      caption: "Simulated connection. This lab uses no real OAuth and reads no mailbox.",
      events: [["integration_connect_started", { integration: "email" }], ["integration_connected", { integration: "email" }]],
    });
  }
  if (persona.setup.calendarConnected)
    step(40, {
      id: "calendar", kind: "calendar", surface: "product", title: "Connect calendar",
      caption: "Email and calendar connect separately (E4).",
      events: [["integration_connect_started", { integration: "calendar" }], ["integration_connected", { integration: "calendar" }]],
    });

  const checks = readiness(persona);
  step(20, {
    id: "categorised", kind: "categorised", surface: "system", title: `The ${emailsConsidered} most recent emails are categorised`,
    caption: "Per the public docs, this happens within seconds of connection (E1). Drafts exist for To do emails when setup allows (E2, E3).",
    data: { counts: persona.counts, labels: CATEGORY_LABELS },
    events: [
      ["initial_categorization_completed", { emails_considered: emailsConsidered, to_do_count: persona.counts.to_do, to_do_bucket: toDoBucket(persona.counts.to_do) }],
      ...Object.entries(checks).map(([check_id, status]) => ["readiness_check_evaluated", { check_id, status }]),
      ...draftEvents(),
    ],
  });

  variant = arm;
  const needsAction = Object.entries(checks).filter(([, s]) => s === "needs_action").map(([k]) => k);
  let selfNavigation = 0;
  let viewed = false;
  let sent = false;
  let stopReason = null;
  const surfaced = [];

  if (arm === "control") {
    step(5, {
      id: "connected", kind: "control_connected", surface: "product", title: "Connected. Next: check your inbox",
      caption: "The public checklist's next steps are 'check your inbox' and 'review your first drafts' in the email client. The lab renders them as text.",
      events: [["experiment_exposed", { experiment_id: EXPERIMENT_ID, assigned_variant: "control" }]],
    });
    selfNavigation++;
    const labelsSeen = checks.labels_visible === "ok";
    step(120, {
      id: "inbox", kind: "client_inbox", surface: "email_client", title: `${persona.name.split(" ")[0]} opens ${client}`,
      caption: labelsSeen
        ? `Categories appear as ${persona.provider === "gmail" ? "labels" : "folders and categories"}. They have to find a To do email and its draft themselves.`
        : "The labels are hidden in this Gmail (E9), so the inbox looks unchanged. Nothing on screen points to the categorisation.",
      data: { labelsVisible: labelsSeen, threads: persona.threads },
    });
    if (!labelsSeen) stopReason = "Could not see any labels, so did not find the categorisation or a draft (scripted, A7).";
    else if (!first) stopReason = "No To do email in the last 300, so there is no draft to find (E2, E5). Nothing explains why (scripted, A7).";
    else if (!draftExists()) stopReason = "Found a To do email but no draft. Conversation view is off (E3) and nothing on screen says so (scripted, A7).";
    if (stopReason) {
      step(60, { id: "stuck", kind: "stuck", surface: "email_client", title: "Session ends without a first draft", caption: stopReason });
    } else {
      selfNavigation++;
      viewed = true;
      step(90, {
        id: "open-draft", kind: "client_draft", surface: "email_client", title: "Finds the draft on a To do email",
        caption: "Attached to the email or under Drafts (E2). No explanation of what context it used.",
        data: { thread: first },
        events: [["draft_viewed", { draft_id: `d_${first.id}`, surface: "email_client", is_first: true }]],
      });
      sent = true;
      step(120, {
        id: "send", kind: "sent", surface: "email_client", title: "Reviews, lightly edits, sends",
        caption: "Simulated. Nothing is sent. Fyxer's docs say it never sends without review (E10).",
        events: [["draft_sent", { draft_id: `d_${first.id}`, edit_bucket: "light", is_first: true, hours_since_email_connected_bucket: "<1h" }]],
      });
    }
  } else {
    surfaced.push(...needsAction);
    step(5, {
      id: "preview", kind: "preview", surface: "product", title: "First-value preview",
      caption: first
        ? "Shows what was sorted, the first To do email and its draft, where it lives in the inbox, and anything in setup that is holding drafts back."
        : "Shows what was sorted and says plainly that nothing in the last 300 needs a reply yet.",
      data: { counts: persona.counts, labels: CATEGORY_LABELS, checks, thread: first ?? null, draftReady: draftExists(), client },
      events: [
        ["experiment_exposed", { experiment_id: EXPERIMENT_ID, assigned_variant: "treatment" }],
        ["first_value_preview_shown", { has_draft: Boolean(first), to_do_bucket: toDoBucket(persona.counts.to_do) }],
        ["readiness_feedback_shown", { needs_action_count: needsAction.length }],
      ],
    });
    for (const check of needsAction.filter((c) => IN_SESSION_FIXES.has(c))) {
      if (check === "conversation_view") convOn = true;
      step(90, {
        id: `fix-${check}`, kind: "fix", surface: "product", title: `Fixes: ${READINESS_CHECKS[check].label.toLowerCase()}`,
        caption: `${READINESS_CHECKS[check].why} The preview links the fix: ${READINESS_CHECKS[check].fix}.`,
        data: { check },
        events: [["readiness_action_taken", { check_id: check, action: "marked_done" }], ...(check === "conversation_view" ? draftEvents() : [])],
      });
    }
    if (!first) {
      stopReason = "No To do email in the last 300, so there is no first draft yet. The preview explains why and offers the documented routes (E12).";
      step(45, { id: "empty", kind: "empty", surface: "product", title: "Honest empty state", caption: stopReason, data: { counts: persona.counts } });
    } else {
      viewed = true;
      step(40, {
        id: "rationale", kind: "rationale", surface: "product", title: "Opens 'Why this draft'",
        caption: "Shows the context behind the draft and where to find it. The user can judge it before sending.",
        data: { thread: first, client },
        events: [
          ["draft_viewed", { draft_id: `d_${first.id}`, surface: "preview", is_first: true }],
          ["draft_rationale_opened", { draft_id: `d_${first.id}` }],
        ],
      });
      sent = true;
      step(120, {
        id: "send", kind: "sent", surface: "email_client", title: `Opens it in ${client}, lightly edits, sends`,
        caption: "Sending still happens in the email client after review (E10). Simulated: nothing is sent.",
        events: [["draft_sent", { draft_id: `d_${first.id}`, edit_bucket: "light", is_first: true, hours_since_email_connected_bucket: "<1h" }]],
      });
    }
  }

  const exposure = steps.find((s) => s.events.some((e) => e.event_name === "experiment_exposed"));
  return {
    persona,
    arm: ARMS[arm],
    steps,
    events: steps.flatMap((s) => s.events),
    outcome: {
      exposedOnTrialDay: exposure?.trialDay ?? null,
      draftExistedAtExposure: Boolean(first) && persona.setup.conversationView,
      firstDraftViewed: viewed,
      firstDraftSent: sent,
      selfNavigationSteps: selfNavigation,
      readinessNeedsAction: needsAction,
      readinessSurfaced: surfaced,
      stopReason,
    },
    assumptions: ASSUMPTIONS.filter((a) => a.id === "A7"),
  };
}
