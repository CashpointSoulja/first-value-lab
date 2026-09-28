import { describe, expect, it } from "vitest";
import { decide, normCdf, normInv, runtimeDays, sampleSizePerArm, srm, twoProportion } from "../public/engine/stats.js";

const plan = { mde: 0.03, alpha: 0.05, perArm: 4000, minDays: 7 };
const guard = (cx: number, gcx: number, tx: number, gtx: number) => [
  { id: "heavy", label: "Heavy-edit share", control: { n: cx, x: gcx }, treatment: { n: tx, x: gtx }, maxRelativeIncrease: 0.1 },
];

describe("normal distribution", () => {
  it("matches known quantiles", () => {
    expect(normInv(0.975)).toBeCloseTo(1.959964, 5);
    expect(normInv(0.8)).toBeCloseTo(0.841621, 5);
    expect(normInv(0.01)).toBeCloseTo(-2.326348, 5);
    expect(normCdf(1.959964)).toBeCloseTo(0.975, 5);
    expect(normCdf(0)).toBeCloseTo(0.5, 6);
    expect(() => normInv(1)).toThrow();
  });
});

describe("sample size and runtime", () => {
  it("matches the standard two-proportion formula", () => {
    expect(sampleSizePerArm({ baseline: 0.4, mde: 0.05, alpha: 0.05, power: 0.8 })).toBe(1534);
    expect(sampleSizePerArm({ baseline: 0.1, mde: 0.02 })).toBe(3841);
  });

  it("needs more users for smaller effects", () => {
    expect(sampleSizePerArm({ baseline: 0.3, mde: 0.02 })).toBeGreaterThan(sampleSizePerArm({ baseline: 0.3, mde: 0.04 }));
  });

  it("rejects impossible inputs", () => {
    expect(() => sampleSizePerArm({ baseline: 0, mde: 0.02 })).toThrow();
    expect(() => sampleSizePerArm({ baseline: 0.99, mde: 0.02 })).toThrow();
    expect(() => sampleSizePerArm({ baseline: 0.3, mde: 0 })).toThrow();
  });

  it("rounds runtime up to whole weeks, minimum 7 days", () => {
    expect(runtimeDays({ perArm: 1000, dailyEligible: 1000 })).toEqual({ raw: 2, recommended: 7 });
    expect(runtimeDays({ perArm: 4000, dailyEligible: 500 })).toEqual({ raw: 16, recommended: 21 });
    expect(() => runtimeDays({ perArm: 10, dailyEligible: 0 })).toThrow();
  });
});

describe("tests", () => {
  it("computes a two-proportion difference with CI", () => {
    const r = twoProportion({ n: 1000, x: 300 }, { n: 1000, x: 350 });
    expect(r.diff).toBeCloseTo(0.05, 10);
    expect(r.ciLow).toBeGreaterThan(0.008);
    expect(r.ciHigh).toBeLessThan(0.092);
    expect(r.pValue).toBeLessThan(0.05);
    expect(() => twoProportion({ n: 10, x: 11 }, { n: 10, x: 1 })).toThrow();
  });

  it("flags sample ratio mismatch", () => {
    expect(srm(5000, 5000).pValue).toBeCloseTo(1, 6);
    expect(srm(4000, 4400).pValue).toBeLessThan(0.001);
  });
});

describe("decision rule", () => {
  const run = (cx: number, tx: number, gcx: number, gtx: number, days = 14, cn = 4100, tn = 4080) =>
    decide({ plan, daysRun: days, control: { n: cn, x: cx }, treatment: { n: tn, x: tx }, guardrails: guard(cx, gcx, tx, gtx) });

  it("is invalid under sample ratio mismatch", () => expect(run(1200, 1320, 150, 160, 14, 4000, 4400).verdict).toBe("invalid"));
  it("keeps running before the planned days or sample", () => {
    expect(run(1230, 1400, 150, 165, 4).verdict).toBe("keep_running");
    expect(run(450, 480, 55, 58, 14, 1500, 1510).verdict).toBe("keep_running");
  });
  it("stops early on a guardrail breach", () => expect(run(1230, 1310, 150, 260, 4).verdict).toBe("stop"));
  it("stops on a guardrail breach at full sample", () => expect(run(1230, 1310, 150, 260).verdict).toBe("stop"));
  it("ships when the primary CI is above zero and guardrails hold", () => expect(run(1230, 1400, 150, 165).verdict).toBe("ship"));
  it("stops when the primary is significantly negative", () => expect(run(1230, 1100, 150, 135).verdict).toBe("stop"));
  it("iterates when the CI spans zero and the MDE", () => expect(run(1230, 1290, 150, 158).verdict).toBe("iterate"));
  it("stops and re-scopes when the CI rules out the MDE", () => {
    const r = decide({ plan: { ...plan, perArm: 20000 }, daysRun: 14, control: { n: 20000, x: 6000 }, treatment: { n: 20000, x: 6040 }, guardrails: [] });
    expect(r.verdict).toBe("stop");
    expect(r.reasons[0]).toMatch(/rules out/);
  });
});
