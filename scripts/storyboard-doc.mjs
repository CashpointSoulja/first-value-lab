// Generates docs/ANIMATION_STORYBOARD.md from public/engine/storyboard.js so the doc and the animation cannot drift.
import { writeFileSync } from "node:fs";
import { STORYBOARD } from "../public/engine/storyboard.js";

export function renderStoryboardDoc() {
  const lines = [
    "# Before/after decision walkthrough: rationale and storyboard",
    "",
    "> **Independent concept by Ayo Ahmed; not affiliated with Fyxer.** Synthetic data only. Generated from `public/engine/storyboard.js` by `npm run docs:storyboard`. Do not edit by hand.",
    "",
    "## What it is for",
    "",
    "A short, interview-friendly walkthrough of **design reasoning**. It shows the first-session problem, the underlying categorisation and drafts (the same in both arms), the treatment's transparent preview and readiness cues, and why each interface choice is there. It is not a result. No scene shows or implies a measured outcome, conversion rate or uplift, because none exists. The A/B test and its pre-registered decision rule are what would decide.",
    "",
    "## Design principles",
    "",
    "- **Hold the system constant.** The strip labelled \"Same in both arms\" stays on screen in every scene. The treatment is a visibility layer. It never generates, speeds up or sends a draft.",
    "- **One idea per scene.** Each scene adds one or two treatment elements and highlights them. Everything else is dimmed, not hidden, so the before/after comparison stays in view.",
    "- **Reasoning is sourced.** Each \"why it matters\" cites public evidence (`E#`) or a named assumption (`A#`) from the [evidence and assumptions register](EVIDENCE_AND_ASSUMPTIONS.md).",
    "- **Honest limits are part of the story.** The empty state (no To do email in the last 300) is a scene of its own.",
    "- **The disclaimer stays visible.** The site-wide sticky banner stays on screen, and the stage carries its own line: \"Independent concept by Ayo Ahmed; not affiliated with Fyxer. Synthetic data.\"",
    "",
    "## Accessibility",
    "",
    "- **No autoplay.** The walkthrough starts paused on scene 1. Play advances every 7 seconds and stops at the last scene. Play/Pause, Back, Next and numbered scene buttons are all keyboard operable, and ←/→ step through scenes when the walkthrough has focus (WCAG 2.2.2 Pause, Stop, Hide).",
    "- **Reduced motion.** If `prefers-reduced-motion: reduce` is set, or the \"Reduce motion\" box is ticked, fades, slides and the highlight pulse are switched off. State changes are instant, and the text version opens automatically.",
    "- **Text fallback.** The visual stage is decorative (`aria-hidden`). Each scene's title, before, after and rationale are announced in a polite live region. The full storyboard is also available as an ordered list under \"Text version\", and in this document.",
    "- **Deep links.** `#story/<scene-id>` opens a given scene, for example `#story/readiness`.",
    "",
    "## Storyboard",
    "",
    "| # | Scene | Before (control: documented setup flow) | After (treatment: transparent preview) | Why it matters | Refs | Appears |",
    "|---|---|---|---|---|---|---|",
    ...STORYBOARD.map((s, i) => `| ${i + 1} | **${s.title}** (\`${s.id}\`) | ${s.before} | ${s.after} | ${s.why} | ${s.refs.join(", ")} | ${s.reveal.length ? s.reveal.map((r) => `\`${r}\``).join(", ") : "none"} |`),
    "",
    "## Presenting it (about 90 seconds)",
    "",
    "Step through manually rather than pressing Play, so each rationale can be said out loud. Scenes 1–2 set the frame: the product already categorises email and writes drafts, and the question is recognition. Scenes 3–6 are the interface choices. Scene 7 hands over to the [experiment design](EXPERIMENT_DESIGN.md) and the [48–72h validation plan](VALIDATION_48_72H.md).",
    "",
  ];
  return lines.join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL("../docs/ANIMATION_STORYBOARD.md", import.meta.url), renderStoryboardDoc());
  console.log("wrote docs/ANIMATION_STORYBOARD.md");
}
