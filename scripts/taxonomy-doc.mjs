// Generates docs/EVENT_TAXONOMY.md from public/engine/taxonomy.js so the doc cannot drift.
import { writeFileSync } from "node:fs";
import { COMMON_PROPERTIES, EVENTS, EXPERIMENT_ID } from "../public/engine/taxonomy.js";

const type = (s) => (s.type === "enum" ? s.values.map((v) => `\`${v}\``).join(" · ") : s.type);

export function renderTaxonomyDoc() {
  const lines = [
    "# Event taxonomy",
    "",
    "> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.** Generated from `public/engine/taxonomy.js` by `npm run docs:taxonomy`. Do not edit by hand.",
    "",
    `Experiment key: \`${EXPERIMENT_ID}\`.`,
    "",
    "## Conventions",
    "",
    "- Names are `object_action`, snake_case, past tense.",
    "- **No message content or PII.** Events carry opaque ids, enums, counts and buckets only. `validateEvent()` rejects property keys that look like subjects, bodies, content, addresses, senders, recipients or names.",
    "- `variant` is `unassigned` before `experiment_exposed`, then the arm. Events marked *treatment* must never fire in control.",
    "- `readiness_check_evaluated` fires in **both** arms, so readiness segments exist for control.",
    "- Every event in the simulator is validated against this schema in the browser and in `test/engine.test.ts`.",
    "",
    "## Common properties (every event)",
    "",
    "| Property | Type | Description |",
    "|---|---|---|",
    ...Object.entries(COMMON_PROPERTIES).map(([k, s]) => `| \`${k}\` | ${type(s)} | ${s.description} |`),
    "",
    "## Events",
    "",
  ];
  for (const group of [...new Set(EVENTS.map((e) => e.group))]) {
    lines.push(`### ${group[0].toUpperCase()}${group.slice(1)}`, "");
    for (const e of EVENTS.filter((x) => x.group === group)) {
      lines.push(`#### \`${e.name}\``, "", `${e.trigger} Arms: ${e.arms.length === 2 ? "both" : e.arms.join(", ")}.`, "");
      lines.push("| Property | Type | Required | Description |", "|---|---|---|---|");
      for (const [k, s] of Object.entries(e.properties)) lines.push(`| \`${k}\` | ${type(s)} | ${s.required ? "yes" : "no"} | ${s.description} |`);
      lines.push("");
    }
  }
  lines.push(
    "## Metric mapping",
    "",
    "| Metric | Events |",
    "|---|---|",
    "| Primary: first draft sent within 24h | `draft_sent{is_first=true}` within 24h of `integration_connected{integration=email}` / `experiment_exposed` |",
    "| Time to first view | `integration_connected{integration=email}` → first `draft_viewed` |",
    "| Heavy-edit share | `draft_sent{is_first, edit_bucket=heavy}` / `draft_sent{is_first}` |",
    "| First-draft discard | `draft_discarded{is_first}` / `draft_viewed{is_first}` |",
    "| Disconnect within 72h | `integration_disconnected{integration=email}`, trial days 1–3 |",
    "| Support contact by day 3 | `support_contacted`, trial days 1–3 |",
    "| Trial cancellation | `trial_cancelled` |",
    "| Trial-to-paid (secondary) | `trial_converted` |",
    "",
  );
  return lines.join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL("../docs/EVENT_TAXONOMY.md", import.meta.url), renderTaxonomyDoc());
  console.log("wrote docs/EVENT_TAXONOMY.md");
}
