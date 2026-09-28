import { describe, expect, it } from "vitest";
import worker from "../src/worker";
import { DOCS } from "../src/docs";
import { EVENTS } from "../public/engine/taxonomy.js";
import { renderTaxonomyDoc } from "../scripts/taxonomy-doc.mjs";

const DISCLAIMER = "Independent concept by Ayo Ahmed; not affiliated with Fyxer.";
const env = { ASSETS: { fetch: async () => new Response("asset") } } as unknown as { ASSETS: Fetcher };
const call = (path: string, method = "GET") =>
  worker.fetch!(new Request(`https://lab.test${path}`, { method }) as Parameters<NonNullable<typeof worker.fetch>>[0], env);

describe("worker", () => {
  it("serves health with the disclaimer", async () => {
    const r = await call("/api/health");
    expect(r.status).toBe(200);
    expect(await r.json()).toMatchObject({ ok: true, disclaimer: DISCLAIMER, data: "synthetic", backendAi: false });
    expect(r.headers.get("x-disclaimer")).toBe(DISCLAIMER);
  });

  it("lists and serves docs", async () => {
    const list = (await (await call("/api/docs")).json()) as { slug: string }[];
    expect(list.map((d) => d.slug)).toContain("experiment-design");
    const doc = (await (await call("/api/docs/prd")).json()) as { markdown: string };
    expect(doc.markdown).toMatch(/^# PRD/);
    expect((await call("/api/docs/nope")).status).toBe(404);
    expect((await call("/api/nope")).status).toBe(404);
    expect((await call("/api/health", "POST")).status).toBe(405);
  });

  it("falls through to static assets", async () => {
    expect(await (await call("/")).text()).toBe("asset");
  });
});

describe("docs", () => {
  it("every document carries the disclaimer", () => {
    for (const d of DOCS) expect(d.markdown, d.slug).toContain(DISCLAIMER);
  });

  it("no document claims measured lift or uses private metrics", () => {
    for (const d of DOCS) expect(d.markdown, d.slug).not.toMatch(/\b(we|it) (increased|improved|lifted) [a-z ]*by \d/i);
  });

  it("EVENT_TAXONOMY.md is generated from the taxonomy and documents every event", () => {
    const doc = DOCS.find((d) => d.slug === "event-taxonomy")!.markdown;
    expect(doc).toBe(renderTaxonomyDoc());
    for (const e of EVENTS) expect(doc).toContain(`\`${e.name}\``);
  });

  it("the experiment design covers metric, guardrails, segmentation and decision criteria", () => {
    const doc = DOCS.find((d) => d.slug === "experiment-design")!.markdown;
    for (const h of ["## Primary metric", "## Guardrails", "## Segmentation", "## Decision criteria"]) expect(doc).toContain(h);
  });
});
