import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync("public/index.html", "utf8");
const DISCLAIMER = "Independent concept by Ayo Ahmed; not affiliated with Fyxer.";

describe("static shell", () => {
  it("shows the disclaimer in a persistent banner outside every tab, in the footer and in the title", () => {
    const main = html.indexOf("<main");
    const banner = html.indexOf("data-disclaimer");
    expect(banner).toBeGreaterThan(-1);
    expect(banner).toBeLessThan(main);
    expect(html.slice(banner, main)).toContain(DISCLAIMER);
    expect(html.slice(html.indexOf("<footer"))).toContain(DISCLAIMER);
    expect(html.match(/<title>[^<]*<\/title>/)?.[0]).toContain(DISCLAIMER);
  });

  it("has a section for every tab in the nav", () => {
    for (const m of html.matchAll(/data-tab="([a-z]+)"/g)) expect(html).toContain(`id="tab-${m[1]}"`);
  });
});
