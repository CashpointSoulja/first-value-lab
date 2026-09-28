import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { STORYBOARD, STORY_ELEMENTS, revealedAt } from "../public/engine/storyboard.js";
import { EVIDENCE, ASSUMPTIONS, DISCLAIMER } from "../public/engine/evidence.js";
import { DOCS } from "../src/docs";
import { renderStoryboardDoc } from "../scripts/storyboard-doc.mjs";
import { renderEvidenceDoc } from "../scripts/evidence-doc.mjs";

const html = readFileSync("public/index.html", "utf8");
const claimIds = new Set([...EVIDENCE.map((e) => e.id), ...ASSUMPTIONS.map((a) => a.id)]);
const doc = (slug: string) => DOCS.find((d) => d.slug === slug)!.markdown;

describe("before/after storyboard", () => {
  it("has unique scenes, each with before, after, rationale and known refs", () => {
    expect(new Set(STORYBOARD.map((s) => s.id)).size).toBe(STORYBOARD.length);
    for (const s of STORYBOARD) {
      for (const f of [s.title, s.before, s.after, s.why]) expect(f.length, s.id).toBeGreaterThan(10);
      expect(s.refs.length, s.id).toBeGreaterThan(0);
      for (const r of s.refs) expect(claimIds.has(r), `${s.id} ${r}`).toBe(true);
      for (const m of s.why.matchAll(/\b[EA]\d{1,2}\b/g)) expect(claimIds.has(m[0]), `${s.id} ${m[0]}`).toBe(true);
    }
  });

  it("covers the problem, the unchanged system, preview, readiness, empty state and decision, in that order", () => {
    expect(STORYBOARD.map((s) => s.id)).toEqual(["problem", "system", "preview", "rationale", "readiness", "empty", "decision"]);
    expect(STORYBOARD[1].after.toLowerCase()).toContain("identical");
  });

  it("reveals treatment elements cumulatively, and every element exists in the stage markup", () => {
    expect(revealedAt(0).size).toBe(0);
    expect([...revealedAt(STORYBOARD.length - 1)].sort()).toEqual(STORY_ELEMENTS.filter((e) => e.startsWith("a-")).sort());
    for (const el of STORY_ELEMENTS) expect(html, el).toContain(`data-el="${el}"`);
    for (const s of STORYBOARD) for (const el of [...s.reveal, ...s.focus]) expect(STORY_ELEMENTS, `${s.id} ${el}`).toContain(el);
  });

  it("states no numeric outcome or uplift", () => {
    for (const s of STORYBOARD) expect(`${s.before} ${s.after} ${s.why}`, s.id).not.toMatch(/\d+(\.\d+)?\s?(%|pp|percentage points)|\bx\d|uplift of|\blift of/i);
  });

  it("keeps the disclaimer inside the stage and has a text fallback and reduced-motion control", () => {
    const stage = html.slice(html.indexOf('id="stage"'), html.indexOf('id="story-text"'));
    expect(stage).toContain("Independent concept by Ayo Ahmed; not affiliated with Fyxer. Synthetic data.");
    expect(html).toContain('id="story-text"');
    expect(html).toContain('id="story-reduce"');
    expect(html).toContain('aria-live="polite"');
    expect(readFileSync("public/style.css", "utf8")).toContain("prefers-reduced-motion: reduce");
  });
});

describe("generated docs", () => {
  it("ANIMATION_STORYBOARD.md and EVIDENCE_AND_ASSUMPTIONS.md match their sources", () => {
    expect(doc("animation-storyboard")).toBe(renderStoryboardDoc());
    expect(doc("evidence-and-assumptions")).toBe(renderEvidenceDoc());
    for (const s of STORYBOARD) expect(doc("animation-storyboard")).toContain(s.title);
    for (const id of claimIds) expect(doc("evidence-and-assumptions")).toContain(`| ${id} |`);
  });

  it("includes every requested document", () => {
    for (const slug of ["readme", "prd", "five-whys", "evidence-and-assumptions", "event-taxonomy", "experiment-design", "validation-48-72h", "animation-storyboard", "walkthrough", "design-and-brand"])
      expect(DOCS.map((d) => d.slug)).toContain(slug);
  });
});

describe("no uplift stated as fact", () => {
  const ui = [html, readFileSync("public/app.js", "utf8"), ...["evidence", "journey", "experiment", "personas", "storyboard"].map((f) => readFileSync(`public/engine/${f}.js`, "utf8"))];
  const texts = [...ui, ...DOCS.map((d) => d.markdown)];
  it("never labels a hypothesis as tested or measured", () => {
    for (const t of texts) expect(t).not.toMatch(/>\s*(Tested|Measured|Proven|Result)\s*</);
  });
  it("uses no present-tense uplift verbs about the treatment", () => {
    for (const t of texts) expect(t).not.toMatch(/\b(raises|increases|improves|boosts|lifts|drives up|doubles)\s+(the\s+)?(first|share|conversion|sends?|drafts?|activation|trial)/i);
  });
});

describe("brand use", () => {
  it("shows the Fyxer logo once, framed as not affiliated, next to the lab's own mark", () => {
    expect(html.match(/fyxer-wordmark-orange\.webp/g)?.length).toBe(1);
    const subject = html.slice(html.indexOf("data-subject"), html.indexOf("</div>", html.indexOf("data-subject")));
    expect(subject).toContain("Concept about");
    expect(subject).toContain("Not affiliated");
    expect(html.slice(html.indexOf("<footer"))).toContain("imply no endorsement");
    expect(DISCLAIMER).toBe("Independent concept by Ayo Ahmed; not affiliated with Fyxer.");
  });
  it("puts the labelled Fyxer subject top-left in the header, with First Value Lab as the concept title", () => {
    const brand = html.slice(html.indexOf('<div class="brand">'), html.indexOf('<nav class="tabs"'));
    expect(brand).toContain("data-subject");
    expect(brand).toContain("fyxer-wordmark-orange.webp");
    expect(brand.indexOf("fyxer-wordmark")).toBeLessThan(brand.indexOf("First Value Lab"));
    expect(brand).toContain("Not affiliated");
  });

  it("explains where the concept adds value without claiming an outcome", () => {
    const value = html.slice(html.indexOf('id="value"'), html.indexOf("What changes, and what doesn't"));
    for (const s of ["Hypothesis, not a measured Fyxer bottleneck", "First Fyxer draft sent within 24h", "among exposed new trials", "Secondary, downstream", "Trial-to-paid", "Trust guardrails", "Why validate before shipping", "What it hands a growth team", "Fit with the role", "E7", "E13", "A4"]) expect(value).toContain(s);
    expect(value).not.toMatch(/\d+(\.\d+)?\s*%/);
  });
});
