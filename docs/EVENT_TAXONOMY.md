# Event taxonomy

> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.** Generated from `public/engine/taxonomy.js` by `npm run docs:taxonomy`. Do not edit by hand.

Experiment key: `fvl_first_value_preview_v1`.

## Conventions

- Names are `object_action`, snake_case, past tense.
- **No message content or PII.** Events carry opaque ids, enums, counts and buckets only. `validateEvent()` rejects property keys that look like subjects, bodies, content, addresses, senders, recipients or names.
- `variant` is `unassigned` before `experiment_exposed`, then the arm. Events marked *treatment* must never fire in control.
- `readiness_check_evaluated` fires in **both** arms, so readiness segments exist for control.
- Every event in the simulator is validated against this schema in the browser and in `test/engine.test.ts`.

## Common properties (every event)

| Property | Type | Description |
|---|---|---|
| `event_id` | string | UUID, generated client-side, used for de-duplication |
| `event_name` | string | One of the names in this taxonomy |
| `ts` | string | ISO-8601 UTC timestamp |
| `anon_user_id` | string | Pseudonymous user id, never an email address |
| `trial_id` | string | Id of the trial this event belongs to |
| `trial_day` | integer | 1-7; day of the 7-day trial (E7) |
| `provider` | `gmail` · `outlook` | Email provider |
| `account_type` | `workspace` · `personal` · `m365` | Account type |
| `plan` | `standard` · `pro` | Plan being trialled |
| `platform` | `desktop` · `mobile` | Surface at time of event |
| `variant` | `control` · `treatment` · `unassigned` | Arm; 'unassigned' before exposure |

## Events

### Lifecycle

#### `trial_started`

Account created and trial clock starts. Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `signup_method` | `google` · `microsoft` · `email` | yes | How the user signed up |

#### `integration_connect_started`

User begins OAuth for email or calendar (E4: they are separate). Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `integration` | `email` · `calendar` | yes | Which integration |

#### `integration_connected`

Integration connected successfully. Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `integration` | `email` · `calendar` | yes | Which integration |

#### `initial_categorization_completed`

First categorisation pass over the most recent emails finishes (E1). Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `emails_considered` | integer | yes | Emails categorised, at most 300 |
| `to_do_count` | integer | yes | Emails labelled To do / To respond |
| `to_do_bucket` | `0` · `1-4` · `5+` | yes | Pre-registered segment for the experiment |

#### `trial_converted`

First successful payment. Secondary, long-horizon metric only. Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `billing_period` | `monthly` · `annual` | yes | Billing period |

### Guardrail

#### `integration_connect_failed`

OAuth or permission step fails. Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `integration` | `email` · `calendar` | yes | Which integration |
| `reason` | `admin_approval_required` · `permission_denied` · `unsupported_account` · `other` | yes | Failure reason (E6) |

#### `draft_discarded`

User deletes a draft or replies without it. Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `draft_id` | string | yes | Opaque draft id |
| `is_first` | boolean | yes | The user's first viewed draft |

#### `integration_disconnected`

User or system disconnects an integration. Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `integration` | `email` · `calendar` | yes | Which integration |
| `initiated_by` | `user` · `system` | yes | User action or token loss |

#### `support_contacted`

User opens a support conversation during the trial. Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `topic` | `setup` · `drafts` · `billing` · `privacy` · `other` | yes | Topic |

#### `trial_cancelled`

User cancels during the trial. Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `reason` | `not_useful` · `privacy` · `price` · `setup` · `other` · `none_given` | yes | Stated reason |

### Readiness

#### `readiness_check_evaluated`

Each setup check is evaluated once after categorisation, in both arms, so segments exist for control too. Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `check_id` | `conversation_view` · `labels_visible` · `calendar_connected` · `admin_approval` · `tone_set` | yes | Which check |
| `status` | `ok` · `needs_action` · `unknown` | yes | Result |

#### `readiness_feedback_shown`

Treatment shows the readiness panel. Arms: treatment.

| Property | Type | Required | Description |
|---|---|---|---|
| `needs_action_count` | integer | yes | Checks with status needs_action |

#### `readiness_action_taken`

User acts on a readiness item. Arms: treatment.

| Property | Type | Required | Description |
|---|---|---|---|
| `check_id` | `conversation_view` · `labels_visible` · `calendar_connected` · `admin_approval` · `tone_set` | yes | Which check |
| `action` | `opened_guide` · `marked_done` · `dismissed` | yes | What they did |

### Exposure

#### `experiment_exposed`

Fires once, at the first screen where arms differ (after categorisation). This is the analysis denominator. Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `experiment_id` | string | yes | Experiment key |
| `assigned_variant` | `control` · `treatment` | yes | Arm served |

### Activation

#### `first_value_preview_shown`

Treatment preview renders: what was sorted, the first draft (if any), and where it lives. Arms: treatment.

| Property | Type | Required | Description |
|---|---|---|---|
| `has_draft` | boolean | yes | False when no To do email exists |
| `to_do_bucket` | `0` · `1-4` · `5+` | yes | Same bucket as categorisation |

#### `draft_rationale_opened`

User expands 'Why this draft' (context used, tone source). Arms: treatment.

| Property | Type | Required | Description |
|---|---|---|---|
| `draft_id` | string | yes | Opaque draft id |

#### `draft_generated`

A draft reply exists for a To do email (system event, E2). Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `draft_id` | string | yes | Opaque draft id |
| `thread_age_bucket` | `<24h` · `1-3d` · `>3d` | yes | Age of the latest message |

#### `draft_viewed`

User opens a draft in the email client or in the preview. Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `draft_id` | string | yes | Opaque draft id |
| `surface` | `email_client` · `preview` | yes | Where it was viewed |
| `is_first` | boolean | yes | First draft this user has viewed |

#### `draft_sent`

User sends a Fyxer draft after review (E10). is_first=true is the first-value moment. Arms: both.

| Property | Type | Required | Description |
|---|---|---|---|
| `draft_id` | string | yes | Opaque draft id |
| `edit_bucket` | `none` · `light` · `heavy` | yes | Edit distance bucket (E11) |
| `is_first` | boolean | yes | First draft this user has sent |
| `hours_since_email_connected_bucket` | `<1h` · `1-24h` · `>24h` | yes | Time from email connection |

## Metric mapping

| Metric | Events |
|---|---|
| Primary: first draft sent within 24h | `draft_sent{is_first=true}` within 24h of `integration_connected{integration=email}` / `experiment_exposed` |
| Time to first view | `integration_connected{integration=email}` → first `draft_viewed` |
| Heavy-edit share | `draft_sent{is_first, edit_bucket=heavy}` / `draft_sent{is_first}` |
| First-draft discard | `draft_discarded{is_first}` / `draft_viewed{is_first}` |
| Disconnect within 72h | `integration_disconnected{integration=email}`, trial days 1–3 |
| Support contact by day 3 | `support_contacted`, trial days 1–3 |
| Trial cancellation | `trial_cancelled` |
| Trial-to-paid (secondary) | `trial_converted` |
