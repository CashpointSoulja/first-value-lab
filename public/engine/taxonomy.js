// Event taxonomy for the First Value experiment. Names are object_action, snake_case, past tense.
// No email content, subjects, addresses or names are ever captured: only ids, enums, counts and buckets.

export const EXPERIMENT_ID = "fvl_first_value_preview_v1";

/** Properties on every event. */
export const COMMON_PROPERTIES = {
  event_id: { type: "string", required: true, description: "UUID, generated client-side, used for de-duplication" },
  event_name: { type: "string", required: true, description: "One of the names in this taxonomy" },
  ts: { type: "string", required: true, description: "ISO-8601 UTC timestamp" },
  anon_user_id: { type: "string", required: true, description: "Pseudonymous user id, never an email address" },
  trial_id: { type: "string", required: true, description: "Id of the trial this event belongs to" },
  trial_day: { type: "integer", required: true, description: "1-7; day of the 7-day trial (E7)" },
  provider: { type: "enum", values: ["gmail", "outlook"], required: true, description: "Email provider" },
  account_type: { type: "enum", values: ["workspace", "personal", "m365"], required: true, description: "Account type" },
  plan: { type: "enum", values: ["standard", "pro"], required: true, description: "Plan being trialled" },
  platform: { type: "enum", values: ["desktop", "mobile"], required: true, description: "Surface at time of event" },
  variant: { type: "enum", values: ["control", "treatment", "unassigned"], required: true, description: "Arm; 'unassigned' before exposure" },
};

const bucket = (values, description) => ({ type: "enum", values, required: true, description });

/**
 * @typedef {{type:"string"|"integer"|"boolean"|"enum", values?:string[], required:boolean, description:string}} PropSpec
 * @typedef {{name:string, group:"lifecycle"|"exposure"|"activation"|"readiness"|"guardrail", arms:("control"|"treatment")[], trigger:string, properties:Record<string, PropSpec>}} EventSpec
 */

const BOTH = ["control", "treatment"];
const TREATMENT = ["treatment"];

/** @type {EventSpec[]} */
export const EVENTS = [
  {
    name: "trial_started", group: "lifecycle", arms: BOTH,
    trigger: "Account created and trial clock starts.",
    properties: { signup_method: bucket(["google", "microsoft", "email"], "How the user signed up") },
  },
  {
    name: "integration_connect_started", group: "lifecycle", arms: BOTH,
    trigger: "User begins OAuth for email or calendar (E4: they are separate).",
    properties: { integration: bucket(["email", "calendar"], "Which integration") },
  },
  {
    name: "integration_connect_failed", group: "guardrail", arms: BOTH,
    trigger: "OAuth or permission step fails.",
    properties: {
      integration: bucket(["email", "calendar"], "Which integration"),
      reason: bucket(["admin_approval_required", "permission_denied", "unsupported_account", "other"], "Failure reason (E6)"),
    },
  },
  {
    name: "integration_connected", group: "lifecycle", arms: BOTH,
    trigger: "Integration connected successfully.",
    properties: { integration: bucket(["email", "calendar"], "Which integration") },
  },
  {
    name: "initial_categorization_completed", group: "lifecycle", arms: BOTH,
    trigger: "First categorisation pass over the most recent emails finishes (E1).",
    properties: {
      emails_considered: { type: "integer", required: true, description: "Emails categorised, at most 300" },
      to_do_count: { type: "integer", required: true, description: "Emails labelled To do / To respond" },
      to_do_bucket: bucket(["0", "1-4", "5+"], "Pre-registered segment for the experiment"),
    },
  },
  {
    name: "readiness_check_evaluated", group: "readiness", arms: BOTH,
    trigger: "Each setup check is evaluated once after categorisation, in both arms, so segments exist for control too.",
    properties: {
      check_id: bucket(["conversation_view", "labels_visible", "calendar_connected", "admin_approval", "tone_set"], "Which check"),
      status: bucket(["ok", "needs_action", "unknown"], "Result"),
    },
  },
  {
    name: "experiment_exposed", group: "exposure", arms: BOTH,
    trigger: "Fires once, at the first screen where arms differ (after categorisation). This is the analysis denominator.",
    properties: {
      experiment_id: { type: "string", required: true, description: "Experiment key" },
      assigned_variant: bucket(["control", "treatment"], "Arm served"),
    },
  },
  {
    name: "first_value_preview_shown", group: "activation", arms: TREATMENT,
    trigger: "Treatment preview renders: what was sorted, the first draft (if any), and where it lives.",
    properties: {
      has_draft: { type: "boolean", required: true, description: "False when no To do email exists" },
      to_do_bucket: bucket(["0", "1-4", "5+"], "Same bucket as categorisation"),
    },
  },
  {
    name: "draft_rationale_opened", group: "activation", arms: TREATMENT,
    trigger: "User expands 'Why this draft' (context used, tone source).",
    properties: { draft_id: { type: "string", required: true, description: "Opaque draft id" } },
  },
  {
    name: "readiness_feedback_shown", group: "readiness", arms: TREATMENT,
    trigger: "Treatment shows the readiness panel.",
    properties: { needs_action_count: { type: "integer", required: true, description: "Checks with status needs_action" } },
  },
  {
    name: "readiness_action_taken", group: "readiness", arms: TREATMENT,
    trigger: "User acts on a readiness item.",
    properties: {
      check_id: bucket(["conversation_view", "labels_visible", "calendar_connected", "admin_approval", "tone_set"], "Which check"),
      action: bucket(["opened_guide", "marked_done", "dismissed"], "What they did"),
    },
  },
  {
    name: "draft_generated", group: "activation", arms: BOTH,
    trigger: "A draft reply exists for a To do email (system event, E2).",
    properties: {
      draft_id: { type: "string", required: true, description: "Opaque draft id" },
      thread_age_bucket: bucket(["<24h", "1-3d", ">3d"], "Age of the latest message"),
    },
  },
  {
    name: "draft_viewed", group: "activation", arms: BOTH,
    trigger: "User opens a draft in the email client or in the preview.",
    properties: {
      draft_id: { type: "string", required: true, description: "Opaque draft id" },
      surface: bucket(["email_client", "preview"], "Where it was viewed"),
      is_first: { type: "boolean", required: true, description: "First draft this user has viewed" },
    },
  },
  {
    name: "draft_sent", group: "activation", arms: BOTH,
    trigger: "User sends a Fyxer draft after review (E10). is_first=true is the first-value moment.",
    properties: {
      draft_id: { type: "string", required: true, description: "Opaque draft id" },
      edit_bucket: bucket(["none", "light", "heavy"], "Edit distance bucket (E11)"),
      is_first: { type: "boolean", required: true, description: "First draft this user has sent" },
      hours_since_email_connected_bucket: bucket(["<1h", "1-24h", ">24h"], "Time from email connection"),
    },
  },
  {
    name: "draft_discarded", group: "guardrail", arms: BOTH,
    trigger: "User deletes a draft or replies without it.",
    properties: {
      draft_id: { type: "string", required: true, description: "Opaque draft id" },
      is_first: { type: "boolean", required: true, description: "The user's first viewed draft" },
    },
  },
  {
    name: "integration_disconnected", group: "guardrail", arms: BOTH,
    trigger: "User or system disconnects an integration.",
    properties: {
      integration: bucket(["email", "calendar"], "Which integration"),
      initiated_by: bucket(["user", "system"], "User action or token loss"),
    },
  },
  {
    name: "support_contacted", group: "guardrail", arms: BOTH,
    trigger: "User opens a support conversation during the trial.",
    properties: { topic: bucket(["setup", "drafts", "billing", "privacy", "other"], "Topic") },
  },
  {
    name: "trial_converted", group: "lifecycle", arms: BOTH,
    trigger: "First successful payment. Secondary, long-horizon metric only.",
    properties: { billing_period: bucket(["monthly", "annual"], "Billing period") },
  },
  {
    name: "trial_cancelled", group: "guardrail", arms: BOTH,
    trigger: "User cancels during the trial.",
    properties: { reason: bucket(["not_useful", "privacy", "price", "setup", "other", "none_given"], "Stated reason") },
  },
];

export const eventSpec = (name) => EVENTS.find((e) => e.name === name);

const FORBIDDEN_KEYS = /(^|_)(email_address|address|subject|body|content|recipient|sender|name)$/;

function checkValue(key, spec, value) {
  if (value === undefined || value === null) return spec.required ? [`${key} is required`] : [];
  switch (spec.type) {
    case "string":
      return typeof value === "string" && value.length > 0 ? [] : [`${key} must be a non-empty string`];
    case "integer":
      return Number.isInteger(value) && value >= 0 ? [] : [`${key} must be a non-negative integer`];
    case "boolean":
      return typeof value === "boolean" ? [] : [`${key} must be boolean`];
    case "enum":
      return spec.values?.includes(value) ? [] : [`${key} must be one of ${spec.values?.join(", ")}`];
  }
  return [`${key} has unknown type`];
}

/** Validates an event against the taxonomy. Returns a list of problems (empty = valid). */
export function validateEvent(event) {
  const problems = [];
  const spec = eventSpec(event.event_name);
  if (!spec) return [`unknown event ${event.event_name}`];
  for (const [k, s] of Object.entries(COMMON_PROPERTIES)) problems.push(...checkValue(k, s, event[k]));
  for (const [k, s] of Object.entries(spec.properties)) problems.push(...checkValue(k, s, event.properties?.[k]));
  const allowed = new Set(Object.keys(spec.properties));
  for (const k of Object.keys(event.properties ?? {})) {
    if (!allowed.has(k)) problems.push(`${k} is not in the taxonomy for ${spec.name}`);
    if (FORBIDDEN_KEYS.test(k)) problems.push(`${k} looks like personal or message data`);
  }
  if (event.variant !== "unassigned" && !spec.arms.includes(event.variant))
    problems.push(`${spec.name} should not fire in ${event.variant}`);
  if (typeof event.trial_day === "number" && (event.trial_day < 1 || event.trial_day > 7)) problems.push("trial_day must be 1-7");
  return problems;
}
