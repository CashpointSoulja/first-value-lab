// Pre-registered experiment definition. Shared by the UI, the docs test and the decision sandbox.
import { EXPERIMENT_ID } from "./taxonomy.js";

export const EXPERIMENT = {
  id: EXPERIMENT_ID,
  unit: "user (anon_user_id), assigned at trial_started, analysed from experiment_exposed",
  split: 0.5,
  primary: {
    id: "first_draft_sent_24h",
    label: "First draft sent within 24h of connecting email",
    numerator: "exposed users with draft_sent{is_first=true} within 24h of integration_connected{integration=email}",
    denominator: "users with experiment_exposed",
  },
  minDays: 7,
};

/** One-sided guardrails: each is a rate that must not rise by more than maxRelativeIncrease. */
export const GUARDRAILS = [
  { id: "heavy_edit_share", label: "Heavy-edit share of first sends", event: "draft_sent{is_first, edit_bucket=heavy} / draft_sent{is_first}", maxRelativeIncrease: 0.1, why: "Over-trust: a preview that nudges sending of drafts users then rewrite (E11)." },
  { id: "first_draft_discard", label: "First-draft discard rate", event: "draft_discarded{is_first} / draft_viewed{is_first}", maxRelativeIncrease: 0.1, why: "Seeing the draft sooner should not mean rejecting it more." },
  { id: "disconnect_72h", label: "Email disconnect within 72h", event: "integration_disconnected{integration=email}, trial days 1-3", maxRelativeIncrease: 0.1, why: "A preview of email content could raise privacy discomfort." },
  { id: "support_contact_d3", label: "Support contact by trial day 3", event: "support_contacted, trial days 1-3", maxRelativeIncrease: 0.15, why: "Readiness feedback could create confusion or tickets." },
  { id: "trial_cancel", label: "Trial cancellation", event: "trial_cancelled", maxRelativeIncrease: 0.1, why: "Catches net harm the primary metric misses." },
];

/** Pre-registered segments. Anything else is exploratory. */
export const SEGMENTS = [
  { id: "provider", label: "Provider", values: "gmail · outlook", why: "Label and folder mechanics differ (E9)." },
  { id: "account_type", label: "Account type", values: "workspace · personal · m365", why: "Admin approval only applies to some tenants (E6)." },
  { id: "platform", label: "Platform at connection", values: "desktop · mobile", why: "A preview may matter more where the inbox is harder to scan." },
  { id: "to_do_bucket", label: "To do count in the last 300", values: "0 · 1-4 · 5+", why: "With 0 there is no draft to show, so read that bucket as a guardrail check, not for lift." },
  { id: "readiness", label: "Readiness at connection", values: "all ok · ≥1 needs_action", why: "Tests whether the lift, if any, comes from readiness feedback or from the preview itself." },
];
