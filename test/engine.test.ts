import { describe, expect, it } from "vitest";
import { PERSONAS, personaById } from "../public/engine/personas.js";
import { ARMS, simulateJourney } from "../public/engine/journey.js";
import { EVENTS, validateEvent } from "../public/engine/taxonomy.js";
import { EVIDENCE, ASSUMPTIONS, SOURCES } from "../public/engine/evidence.js";
import { GUARDRAILS } from "../public/engine/experiment.js";

const arms = Object.keys(ARMS) as ("control" | "treatment")[];

describe("personas", () => {
  it("has five synthetic personas with unique ids", () => {
    expect(PERSONAS).toHaveLength(5);
    expect(new Set(PERSONAS.map((p) => p.id)).size).toBe(5);
    expect(personaById("maya")?.name).toBe("Maya Okafor");
    expect(personaById("nope")).toBeUndefined();
  });

  it("never considers more than 300 emails (E1)", () => {
    for (const p of PERSONAS) expect(Object.values(p.counts).reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(300);
  });

  it("only has drafts on To do threads (E2)", () => {
    for (const p of PERSONAS) for (const t of p.threads) if (t.draft) expect(t.category).toBe("to_do");
  });
});

describe("journeys", () => {
  for (const p of PERSONAS)
    for (const arm of arms) {
      it(`${p.id}/${arm}: every event is valid against the taxonomy`, () => {
        const j = simulateJourney(p.id, arm);
        expect(j.events.length).toBeGreaterThan(0);
        for (const e of j.events) expect(validateEvent(e), `${e.event_name}`).toEqual([]);
      });

      it(`${p.id}/${arm}: is deterministic and exposes exactly once`, () => {
        const a = simulateJourney(p.id, arm);
        expect(simulateJourney(p.id, arm)).toEqual(a);
        expect(a.events.filter((e) => e.event_name === "experiment_exposed")).toHaveLength(1);
        const exposedAt = a.events.findIndex((e) => e.event_name === "experiment_exposed");
        for (const [i, e] of a.events.entries()) expect(e.variant).toBe(i < exposedAt ? "unassigned" : arm);
      });
    }

  it("keeps the system behaviour identical before exposure in both arms", () => {
    for (const p of PERSONAS) {
      const pre = (arm: "control" | "treatment") => {
        const ev = simulateJourney(p.id, arm).events;
        return ev.slice(0, ev.findIndex((e) => e.event_name === "experiment_exposed")).map((e) => [e.event_name, e.properties, e.ts]);
      };
      expect(pre("treatment")).toEqual(pre("control"));
    }
  });

  it("never invents a draft when there is no To do email (Sam)", () => {
    for (const arm of arms) {
      const j = simulateJourney("sam", arm);
      expect(j.events.some((e) => e.event_name === "draft_generated")).toBe(false);
      expect(j.outcome.firstDraftSent).toBe(false);
    }
  });

  it("exposes Tom on trial day 2 in both arms: admin approval is upstream of the experiment", () => {
    for (const arm of arms) expect(simulateJourney("tom", arm).outcome.exposedOnTrialDay).toBe(2);
  });

  it("does not describe the control as waiting for a new email", () => {
    for (const p of PERSONAS) {
      const text = JSON.stringify(simulateJourney(p.id, "control").steps.map((s) => [s.title, s.caption])).toLowerCase();
      expect(text).not.toMatch(/new email|wait(s|ing)? for/);
    }
  });

  it("surfaces readiness only in treatment", () => {
    for (const p of PERSONAS) {
      expect(simulateJourney(p.id, "control").outcome.readinessSurfaced).toEqual([]);
      const t = simulateJourney(p.id, "treatment").outcome;
      expect(t.readinessSurfaced).toEqual(t.readinessNeedsAction);
    }
  });

  it("rejects unknown personas and arms", () => {
    expect(() => simulateJourney("nope", "control")).toThrow();
    // @ts-expect-error invalid arm
    expect(() => simulateJourney("maya", "nope")).toThrow();
  });
});

describe("taxonomy", () => {
  const good = simulateJourney("maya", "treatment").events.find((e) => e.event_name === "draft_sent")!;

  it("has unique event names in object_action snake_case", () => {
    expect(new Set(EVENTS.map((e) => e.name)).size).toBe(EVENTS.length);
    for (const e of EVENTS) expect(e.name).toMatch(/^[a-z]+(_[a-z]+)+$/);
  });

  it("rejects unknown events, missing fields and bad enums", () => {
    expect(validateEvent({ ...good, event_name: "made_up" })).toEqual(["unknown event made_up"]);
    const { anon_user_id: _drop, ...missing } = good;
    expect(validateEvent(missing)).toContain("anon_user_id is required");
    expect(validateEvent({ ...good, properties: { ...good.properties, edit_bucket: "some" } }).join()).toMatch(/edit_bucket must be one of/);
  });

  it("rejects message content and personal data", () => {
    for (const key of ["subject", "body", "sender_email_address", "recipient", "content", "sender_name"]) {
      const problems = validateEvent({ ...good, properties: { ...good.properties, [key]: "x" } });
      expect(problems.join(), key).toMatch(/looks like personal or message data/);
    }
  });

  it("rejects treatment-only events in control", () => {
    const e = simulateJourney("maya", "treatment").events.find((x) => x.event_name === "draft_rationale_opened")!;
    expect(validateEvent({ ...e, variant: "control" })).toContain("draft_rationale_opened should not fire in control");
  });

  it("defines every event a guardrail refers to", () => {
    const names = new Set(EVENTS.map((e) => e.name));
    for (const g of GUARDRAILS) for (const m of g.event.matchAll(/([a-z]+(?:_[a-z]+)+)(?=\{|,|\s|$)/g)) if (m[1].includes("_") && !["edit_bucket", "is_first", "trial_days"].includes(m[1])) expect(names.has(m[1]), m[1]).toBe(true);
  });
});

describe("evidence", () => {
  it("links every documented claim to a public source and quote", () => {
    for (const e of EVIDENCE) {
      expect(SOURCES[e.source]).toMatch(/^https:\/\//);
      expect(e.quote.length).toBeGreaterThan(5);
    }
  });

  it("gives every assumption a way to test it", () => {
    for (const a of ASSUMPTIONS) expect(a.test.length).toBeGreaterThan(5);
  });

  it("only references evidence and assumptions that exist", () => {
    const ids = new Set([...EVIDENCE.map((e) => e.id), ...ASSUMPTIONS.map((a) => a.id)]);
    const text = JSON.stringify(PERSONAS.map((p) => simulateJourney(p.id, "control").steps.concat(simulateJourney(p.id, "treatment").steps)));
    for (const m of text.matchAll(/\b([EA]\d{1,2})\b/g)) expect(ids.has(m[1]), m[1]).toBe(true);
  });
});
