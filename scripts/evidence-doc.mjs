// Generates docs/EVIDENCE_AND_ASSUMPTIONS.md from public/engine/evidence.js so the doc cannot drift.
import { writeFileSync } from "node:fs";
import { EVIDENCE, ASSUMPTIONS, SOURCES } from "../public/engine/evidence.js";

const cell = (s) => String(s).replace(/\|/g, "\\|");

export function renderEvidenceDoc() {
  const lines = [
    "# Evidence and assumptions register",
    "",
    "> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.** Synthetic data only. Generated from `public/engine/evidence.js` by `npm run docs:evidence`. Do not edit by hand.",
    "",
    "Every claim in the lab has one of two tags. `E#` means **documented** in a public source, linked, with the supporting quote. `A#` means **assumed**: plausible but unverified, with the check that would confirm or reject it. There are no internal Fyxer data, metrics or baselines anywhere in the lab.",
    "",
    "## Documented (public sources)",
    "",
    "| ID | Claim | Supporting quote | Source |",
    "|---|---|---|---|",
    ...EVIDENCE.map((e) => `| ${e.id} | ${cell(e.claim)} | "${cell(e.quote)}" | [${new URL(SOURCES[e.source]).hostname}${new URL(SOURCES[e.source]).pathname}](${SOURCES[e.source]}) |`),
    "",
    "## Assumptions (to test)",
    "",
    "| ID | Assumption | How to check |",
    "|---|---|---|",
    ...ASSUMPTIONS.map((a) => `| ${a.id} | ${cell(a.text)} | ${cell(a.test)} |`),
    "",
    "## Rules",
    "",
    "- A public page can go stale (E8: Fyxer says it regularly tests and refines). Check the live product flow before building anything (48–72h plan, day 0).",
    "- An assumption never becomes evidence because the simulator shows it. The simulator's paths are scripted (A7).",
    "- Nothing in the lab states that the treatment increases any metric. Where an increase is discussed, it is a hypothesis for the A/B test.",
    "",
  ];
  return lines.join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL("../docs/EVIDENCE_AND_ASSUMPTIONS.md", import.meta.url), renderEvidenceDoc());
  console.log("wrote docs/EVIDENCE_AND_ASSUMPTIONS.md");
}
