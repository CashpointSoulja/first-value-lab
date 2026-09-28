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

  it("follows the user's job in the inbox: job, unchanged system, gap, start-here, trust, calendar, readiness, empty, decision", () => {
    expect(STORYBOARD.map((s) => s.id)).toEqual(["job", "system", "gap", "start", "trust", "schedule", "readiness", "empty", "decision"]);
    expect(STORYBOARD[1].after.toLowerCase()).toContain("identical");
    for (const s of STORYBOARD.slice(0, 3)) expect(s.reveal, s.id).toEqual([]);
  });

  it("keeps sending human and invents no automation", () => {
    const all = STORYBOARD.map((s) => `${s.before} ${s.after} ${s.why}`).join(" ");
    expect(all).toMatch(/presses Send/);
    expect(all).toMatch(/nothing sends without review/i);
    expect(all).not.toMatch(/\b(auto-?sends?|sends automatically|books automatically|automatically (sends|replies|books))\b/i);
    const stage = html.slice(html.indexOf('id="stage"'), html.indexOf('id="story-text"'));
    expect(stage).toContain('class="gt-send">Send<');
    expect(stage).toContain("Nothing sends until you press it");
    expect(stage).toContain("Only your availability is checked, not other attendees'");
  });

  it("shows control and treatment in the same Gmail inbox, with the thread and draft shared by both arms", () => {
    const stage = html.slice(html.indexOf('id="stage"'), html.indexOf('id="story-text"'));
    expect(stage.match(/class="gm st-el shown"/g)?.length).toBe(2);
    expect(stage.match(/1: to respond/g)!.length).toBeGreaterThanOrEqual(6);
    const sys = stage.slice(stage.indexOf('data-el="sys"'));
    expect(sys).toContain("Same in both arms");
    expect(sys).toContain("Looking at your calendar, you're free");
    expect(stage).toContain("You've connected your email");
    expect(stage).toContain("not a screenshot of Fyxer or Gmail");
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

describe("product UI references", () => {
  it("cites first-party screenshots and video frames, each with what it shows", async () => {
    const { UI_REFERENCES } = await import("../public/engine/evidence.js");
    expect(UI_REFERENCES.length).toBeGreaterThanOrEqual(6);
    for (const r of UI_REFERENCES) {
      expect(r.url, r.id).toMatch(/^https:\/\/(content\.gitbook\.com|vimeo\.com\/11407|docs\.fyxer\.com|www\.fyxer\.com)/);
      expect(r.shows.length, r.id).toBeGreaterThan(40);
      expect(doc("evidence-and-assumptions")).toContain(r.url);
    }
    for (const id of ["R1", "R2", "R4"]) expect(html).toContain(id);
    expect(html).toContain('id="ref-list"');
  });
  it("the hero keeps product value, growth hypothesis, instrumentation and guardrails separate", () => {
    const layers = html.slice(html.indexOf('class="layers"'), html.indexOf("</section>", html.indexOf('class="layers"')));
    for (const k of ["Product value · documented", "Growth hypothesis · to test", "Instrumentation", "Trust guardrails", "Nothing has been measured", "within 24h of email connection, among exposed new trials"]) expect(layers).toContain(k);
    expect(layers).not.toMatch(/\d+(\.\d+)?\s*%/);
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
