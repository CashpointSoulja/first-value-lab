import { marked } from "/vendor/marked.esm.js";
import { EVIDENCE, ASSUMPTIONS, SOURCES, DISCLAIMER } from "/engine/evidence.js";
import { PERSONAS, CATEGORY_LABELS } from "/engine/personas.js";
import { ARMS, READINESS_CHECKS, simulateJourney } from "/engine/journey.js";
import { EVENTS, COMMON_PROPERTIES, EXPERIMENT_ID, validateEvent } from "/engine/taxonomy.js";
import { EXPERIMENT, GUARDRAILS, SEGMENTS } from "/engine/experiment.js";
import { sampleSizePerArm, runtimeDays, decide } from "/engine/stats.js";
import { STORYBOARD, revealedAt } from "/engine/storyboard.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const CLAIMS = new Map([...EVIDENCE.map((e) => [e.id, e]), ...ASSUMPTIONS.map((a) => [a.id, a])]);

/** Escapes text and turns E#/A# references into linked evidence chips. */
function tagged(text) {
  return esc(text).replace(/\b([EA])(\d{1,2})\b/g, (m, kind) => {
    const c = CLAIMS.get(m);
    if (!c) return m;
    if (kind === "E") return `<a class="chip doc" href="${SOURCES[c.source]}" target="_blank" rel="noopener" title="Documented: ${esc(c.claim)}">${m}</a>`;
    return `<span class="chip amb" title="Assumption: ${esc(c.text)}">${m}</span>`;
  });
}
const yes = (b) => (b ? '<span class="chip ok">Yes</span>' : '<span class="chip bad">No</span>');

/* ---------------- Router ---------------- */
const TABS = ["overview", "story", "simulator", "events", "experiment", "validate", "docs"];
const TITLES = { overview: "Overview", story: "Before/after walkthrough", simulator: "Trial simulator", events: "Event taxonomy", experiment: "Experiment design", validate: "48–72h validation plan", docs: "Docs" };
const loaded = new Set();
let currentTab = null;

function route() {
  const [tab = "overview", ...rest] = location.hash.replace(/^#/, "").split("/");
  const active = TABS.includes(tab) ? tab : "overview";
  for (const t of TABS) $(`#tab-${t}`).hidden = t !== active;
  $$(".tabs a").forEach((a) => (a.dataset.tab === active ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  document.title = `${TITLES[active]} · First Value Lab · ${DISCLAIMER}`;
  if (!loaded.has(active)) {
    loaded.add(active);
    INIT[active]?.(rest);
  } else ROUTE[active]?.(rest);
  if (active !== "story") story.stop?.();
  const link = $(`.tabs a[data-tab="${active}"]`);
  const bar = $(".tabs");
  if (link && bar) {
    const right = link.getBoundingClientRect().right - bar.getBoundingClientRect().left + bar.scrollLeft;
    bar.scrollLeft = right > bar.clientWidth ? right - bar.clientWidth + 24 : 0;
  }
  if (currentTab !== null && currentTab !== active) window.scrollTo(0, 0);
  currentTab = active;
}

/* ---------------- Overview ---------------- */
function initOverview() {
  $("#evidence-list").innerHTML = EVIDENCE.map(
    (e) => `<li><a class="chip doc" href="${SOURCES[e.source]}" target="_blank" rel="noopener">${e.id}</a><div><p>${esc(e.claim)}</p><a href="${SOURCES[e.source]}" target="_blank" rel="noopener">${esc(new URL(SOURCES[e.source]).hostname + new URL(SOURCES[e.source]).pathname)}</a></div></li>`,
  ).join("");
  $("#assumption-list").innerHTML = ASSUMPTIONS.map(
    (a) => `<li><span class="chip amb">${a.id}</span><div><p>${esc(a.text)}</p><p class="test">How to check: ${esc(a.test)}</p></div></li>`,
  ).join("");
}

/* ---------------- Before / after ---------------- */
const disclaimer = $("[data-disclaimer]");
const syncDisclaimerHeight = () => document.documentElement.style.setProperty("--dis-h", `${disclaimer.offsetHeight}px`);
new ResizeObserver(syncDisclaimerHeight).observe(disclaimer);
syncDisclaimerHeight();

const story = { i: 0, timer: null, reduce: false, seen: new Set([0]), stop: null };
const STORY_MS = 7000;

function initStory(rest) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const box = $("#story");
  const setReduce = (on) => {
    story.reduce = on;
    box.classList.toggle("reduce", on);
    $("#story-reduce").checked = on;
    if (on) $("#story-text").open = true;
  };
  setReduce(mq.matches);
  mq.addEventListener?.("change", (e) => setReduce(e.matches));
  $("#story-reduce").addEventListener("change", (e) => setReduce(e.target.checked));

  $("#story-dots").innerHTML = STORYBOARD.map(
    (s, i) => `<li><button type="button" data-i="${i}" aria-label="Scene ${i + 1} of ${STORYBOARD.length}: ${esc(s.title)}"><span class="n">${i + 1}</span><span class="t">${esc(s.short)}</span></button></li>`,
  ).join("");
  $("#story-dots").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]");
    if (b) { stopStory(); showScene(Number(b.dataset.i)); }
  });
  $("#story-text-list").innerHTML = STORYBOARD.map(
    (s) => `<li><b>${esc(s.title)}</b><p><b>Before (control):</b> ${tagged(s.before)}</p><p><b>After (treatment):</b> ${tagged(s.after)}</p><p><b>Why it matters:</b> ${tagged(s.why)}</p></li>`,
  ).join("");
  $("#story-prev").addEventListener("click", () => { stopStory(); showScene(story.i - 1); });
  $("#story-next").addEventListener("click", () => { stopStory(); showScene(story.i + 1); });
  $("#story-play").addEventListener("click", () => (story.timer ? stopStory() : playStory()));
  box.addEventListener("keydown", (e) => {
    if (e.target.closest("input, summary")) return;
    if (e.key === "ArrowRight") { stopStory(); showScene(story.i + 1); e.preventDefault(); }
    if (e.key === "ArrowLeft") { stopStory(); showScene(story.i - 1); e.preventDefault(); }
  });
  story.stop = stopStory;
  routeStory(rest);
}
function routeStory([id]) {
  const i = STORYBOARD.findIndex((s) => s.id === id);
  showScene(i >= 0 ? i : story.i, false);
}
function showScene(i, updateHash = true) {
  story.i = Math.max(0, Math.min(i, STORYBOARD.length - 1));
  story.seen.add(story.i);
  const s = STORYBOARD[story.i];
  const stage = $("#stage");
  stage.dataset.scene = String(story.i);
  const shown = revealedAt(story.i);
  const focus = new Set(s.focus);
  $$(".st-el", stage).forEach((el) => {
    const k = el.dataset.el;
    if (k.startsWith("a-")) {
      el.classList.toggle("shown", shown.has(k));
      el.classList.toggle("past", shown.has(k) && !s.reveal.includes(k));
    }
    el.classList.remove("focus");
    if (focus.has(k)) { void el.offsetWidth; el.classList.add("focus"); }
  });
  stage.classList.toggle("focusing", focus.size > 0);
  $$("#story-dots button").forEach((b) => {
    const n = Number(b.dataset.i);
    n === story.i ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current");
    b.classList.toggle("seen", story.seen.has(n));
  });
  $("#story-prev").disabled = story.i === 0;
  $("#story-next").disabled = story.i === STORYBOARD.length - 1;
  $("[data-now=before]", stage).textContent = s.before;
  $("[data-now=after]", stage).textContent = s.after;
  $("#story-caption").innerHTML = `<div class="cap-head"><p class="label">Scene ${story.i + 1} of ${STORYBOARD.length}</p><h2>${esc(s.title)}</h2></div>
    <p class="cap-why"><b>Why it matters:</b> ${tagged(s.why)}</p>
    <p class="sr-only">Before (control): ${esc(s.before)} After (treatment): ${esc(s.after)}</p>`;
  if (updateHash) history.replaceState(null, "", `#story/${s.id}`);
}
function playStory() {
  if (story.i === STORYBOARD.length - 1) showScene(0);
  const btn = $("#story-play");
  btn.textContent = "Pause";
  btn.setAttribute("aria-pressed", "true");
  story.timer = setInterval(() => {
    if (story.i >= STORYBOARD.length - 1) return stopStory();
    showScene(story.i + 1);
  }, STORY_MS);
}
function stopStory() {
  clearInterval(story.timer);
  story.timer = null;
  const btn = $("#story-play");
  if (!btn) return;
  btn.textContent = "Play";
  btn.setAttribute("aria-pressed", "false");
}

/* ---------------- Simulator ---------------- */
const sim = { persona: "maya", arm: "treatment", idx: 0, journey: null };

function simFromHash(rest) {
  const [p, a] = rest;
  if (PERSONAS.some((x) => x.id === p)) sim.persona = p;
  if (a in ARMS) sim.arm = a;
}

function initSimulator(rest) {
  simFromHash(rest);
  $("#persona-row").innerHTML = PERSONAS.map(
    (p) => `<button type="button" class="persona-btn" role="radio" data-persona="${p.id}"><b>${esc(p.name)}</b><small>${esc(p.provider === "gmail" ? "Gmail" : "Outlook")} · ${esc(p.platform)}</small></button>`,
  ).join("");
  $("#persona-row").addEventListener("click", (e) => {
    const b = e.target.closest("[data-persona]");
    if (b) setSim({ persona: b.dataset.persona });
  });
  $("#arm-seg").addEventListener("click", (e) => {
    const b = e.target.closest("[data-arm]");
    if (b) setSim({ arm: b.dataset.arm });
  });
  radioKeys($("#persona-row"), "[data-persona]");
  radioKeys($("#arm-seg"), "[data-arm]");
  $("#step-list").addEventListener("click", (e) => {
    const b = e.target.closest("[data-idx]");
    if (b) goStep(Number(b.dataset.idx));
  });
  $("#prev-step").addEventListener("click", () => goStep(sim.idx - 1));
  $("#next-step").addEventListener("click", () => goStep(sim.idx + 1));
  $("#play-all").addEventListener("click", () => goStep(sim.journey.steps.length - 1));
  document.addEventListener("keydown", (e) => {
    if ($("#tab-simulator").hidden || e.target.closest("input, textarea, [role=radiogroup]")) return;
    if (e.key === "ArrowRight") goStep(sim.idx + 1);
    if (e.key === "ArrowLeft") goStep(sim.idx - 1);
  });
  setSim({}, false);
}

function radioKeys(group, sel) {
  group.addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
    const items = $$(sel, group);
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const n = items[(i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length];
    n.focus();
    n.click();
  });
}

function setSim(patch, updateHash = true) {
  Object.assign(sim, patch);
  sim.journey = simulateJourney(sim.persona, sim.arm);
  sim.idx = 0;
  $$("#persona-row [data-persona]").forEach((b) => {
    const on = b.dataset.persona === sim.persona;
    b.setAttribute("aria-checked", String(on));
    b.tabIndex = on ? 0 : -1;
  });
  $$("#arm-seg [data-arm]").forEach((b) => {
    const on = b.dataset.arm === sim.arm;
    b.setAttribute("aria-checked", String(on));
    b.tabIndex = on ? 0 : -1;
  });
  const p = sim.journey.persona;
  $("#persona-summary").innerHTML = `<b>${esc(p.name)}</b>, ${esc(p.role)}. ${tagged(p.summary)} <span class="muted">${esc(ARMS[sim.arm].label)}: ${tagged(ARMS[sim.arm].description)}</span>`;
  $("#persona-lesson").innerHTML = `<b>What this persona shows:</b> ${tagged(p.lesson)}`;
  renderOutcomes();
  renderStep();
  if (updateHash) history.replaceState(null, "", `#simulator/${sim.persona}/${sim.arm}`);
}

function goStep(i) {
  sim.idx = Math.max(0, Math.min(sim.journey.steps.length - 1, i));
  renderStep();
}

const SURFACE = { product: "Product (concept mock)", email_client: "Email client (mock)", system: "System: not shown to the user" };

function renderStep() {
  const { steps } = sim.journey;
  const s = steps[sim.idx];
  $("#step-list").innerHTML = steps
    .map((st, i) => `<li class="${i < sim.idx ? "done" : i === sim.idx ? "current" : ""}"><button type="button" data-idx="${i}" ${i === sim.idx ? 'aria-current="step"' : ""}>${esc(st.title)}<span class="surface">Day ${st.trialDay} · ${esc(SURFACE[st.surface].split(" (")[0].split(":")[0])}</span></button></li>`)
    .join("");
  $("#prev-step").disabled = sim.idx === 0;
  $("#next-step").disabled = sim.idx === steps.length - 1;
  $("#device").innerHTML = deviceFrame(s);
  $("#screen-caption").innerHTML = `<b>Step ${sim.idx + 1} of ${steps.length}.</b> ${tagged(s.caption)}`;

  const shown = steps.slice(0, sim.idx + 1).flatMap((st, i) => st.events.map((e) => ({ e, fresh: i === sim.idx })));
  const problems = shown.flatMap(({ e }) => validateEvent(e));
  $("#stream-valid").textContent = `${shown.length} events · ${problems.length ? `${problems.length} problems` : "all valid"}`;
  $("#stream-valid").className = `chip ${problems.length ? "bad" : "ok"}`;
  $("#event-stream").innerHTML = shown.length
    ? shown
        .slice()
        .reverse()
        .map(({ e, fresh }) => {
          const errs = validateEvent(e);
          return `<li class="${fresh ? "new" : ""}"><div class="ev-head"><span class="ev-name">${esc(e.event_name)}</span><span class="chip ${errs.length ? "bad" : "ok"}">${errs.length ? "invalid" : "valid"}</span></div><div class="muted">Day ${e.trial_day} · ${esc(e.variant)}</div><pre>${esc(JSON.stringify(e.properties))}</pre></li>`;
        })
        .join("")
    : '<li class="empty">No events yet.</li>';
}

function deviceFrame(s) {
  const who = sim.journey.persona;
  const label = s.surface === "email_client" ? (who.provider === "gmail" ? "Gmail-style inbox (mock)" : "Outlook-style inbox (mock)") : SURFACE[s.surface];
  return `<div class="device-bar"><span class="dots"><i></i><i></i><i></i></span><b>${esc(label)}</b><span class="mock chip neutral">Synthetic</span></div><div class="device-body">${screen(s)}<p class="small muted" style="margin:0">${esc(DISCLAIMER)}</p></div>`;
}

function bars(counts) {
  const max = Math.max(...Object.values(counts), 1);
  return `<div class="bars">${Object.entries(counts)
    .map(([k, v]) => `<div class="bar ${k === "to_do" ? "top" : ""}"><span>${esc(CATEGORY_LABELS[k])}</span><span class="track"><span class="fill" style="width:${(v / max) * 100}%"></span></span><span>${v}</span></div>`)
    .join("")}</div>`;
}

const total = (counts) => Object.values(counts).reduce((a, b) => a + b, 0);

function checksList(checks) {
  return `<ul class="checks">${Object.entries(checks)
    .map(([k, st]) => `<li>${st === "ok" ? '<span class="chip ok">OK</span>' : '<span class="chip amb">Fix</span>'}<div><b>${esc(READINESS_CHECKS[k].label)}</b><p>${tagged(READINESS_CHECKS[k].why)}${st === "ok" ? "" : ` ${esc(READINESS_CHECKS[k].fix)}.`}</p></div></li>`)
    .join("")}</ul>`;
}

function draftBlock(thread, withWhy, client) {
  const where = client === "Gmail" ? `Gmail → label "${CATEGORY_LABELS.to_do}" → this thread, or Drafts` : `Outlook → "${CATEGORY_LABELS.to_do}" folder → this thread, or Drafts`;
  return `<div class="mock-card"><div class="split-head" style="margin:0"><b>Re: ${esc(thread.subject)}</b><span class="lbl to_do">${esc(CATEGORY_LABELS.to_do)}</span></div><div class="muted small">From ${esc(thread.from)} · ${thread.messages} messages · ${thread.ageHours}h ago</div><pre class="draft">${esc(thread.draft.body)}</pre>${
    withWhy
      ? `<details open><summary><b>Why this draft</b></summary><ul class="why">${thread.draft.context.map((c) => `<li>${esc(c)}</li>`).join("")}</ul><p class="small muted" style="margin:6px 0 0">Where it lives: ${esc(where)}. Nothing sends without your review (${tagged("E10")}).</p></details>`
      : ""
  }</div>`;
}

function screen(s) {
  const p = sim.journey.persona;
  const d = s.data ?? {};
  const first = p.name.split(" ")[0];
  switch (s.kind) {
    case "signup":
      return `<p class="mock-h">Start your 7-day trial</p><div class="mock-card"><p>${esc(p.plan === "pro" ? "Pro" : "Standard")} plan · ${esc(p.platform)}</p><button class="btn primary sm" type="button" disabled>Continue with ${p.provider === "gmail" ? "Google" : "Microsoft"} (mock: no OAuth)</button></div>`;
    case "connect_blocked":
      return `<p class="mock-h">Couldn't connect your email</p><div class="mock-card bad"><b>Need admin approval</b><p style="margin:4px 0 0">Your organisation's IT admin needs to approve the app before you can connect. ${tagged("E6")}</p></div>`;
    case "connect":
      return `<p class="mock-h">Connecting email</p><div class="mock-card good"><b>${p.provider === "gmail" ? "Gmail" : "Outlook"} connected</b> (simulated)</div>`;
    case "calendar":
      return `<p class="mock-h">Connect calendar</p><div class="mock-card good"><b>Calendar connected</b> (simulated). A separate step from email ${tagged("E4")}.</div>`;
    case "categorised":
      return `<p class="mock-h">${total(d.counts)} most recent emails categorised</p><div class="mock-card">${bars(d.counts)}</div><div class="mock-card ${p.threads.some((t) => t.draft) && p.setup.conversationView ? "good" : "warn"}">${
        p.counts.to_do === 0 ? "No To do emails, so no drafts yet." : p.setup.conversationView ? "Draft ready for the most recent To do email." : "To do emails found, but conversation view is off, so no drafts yet."
      }</div>`;
    case "control_connected":
      return `<p class="mock-h">You're connected</p><div class="mock-card"><p><b>Next steps</b></p><ol style="margin:0;padding-left:18px"><li>Check your inbox: your emails are being organised.</li><li>Review your first drafts in ${p.provider === "gmail" ? "Gmail" : "Outlook"}.</li></ol></div><p class="small muted" style="margin:0">Lab rendering of the public checklist's steps ${tagged("E1")} ${tagged("E2")}, not Fyxer's actual screen.</p>`;
    case "client_inbox":
      return `<p class="mock-h">Inbox</p><div class="inbox">${d.threads
        .map((t) => `<div class="inbox-row"><span class="from">${esc(t.from)}</span><span class="subj">${esc(t.subject)}</span>${d.labelsVisible ? `<span class="lbl ${t.category}">${esc(CATEGORY_LABELS[t.category])}</span>` : "<span></span>"}</div>`)
        .join("")}</div>${d.labelsVisible ? "" : `<div class="mock-card warn small">Labels exist but are hidden in this Gmail's settings ${tagged("E9")}.</div>`}`;
    case "stuck":
      return `<p class="mock-h">Session ends</p><div class="mock-card bad">${tagged(s.caption)}</div>`;
    case "client_draft":
      return `<p class="mock-h">Draft on a To do email</p>${draftBlock(d.thread, false)}`;
    case "sent":
      return `<p class="mock-h">Sent</p><div class="mock-card good"><b>First draft sent after review.</b> Simulated: nothing left this browser.</div>`;
    case "preview": {
      const blocked = d.thread && !d.draftReady;
      return `<p class="mock-h">Here's what we did with your last ${total(d.counts)} emails</p><div class="mock-card">${bars(d.counts)}</div>${
        d.thread
          ? blocked
            ? `<div class="mock-card warn"><b>${p.counts.to_do} emails need a reply, but drafts are waiting on setup.</b><p class="small" style="margin:4px 0 0">Fix the item below and your first draft will appear here.</p></div>`
            : `<div class="mock-card dark"><b>Your first draft is ready</b><div class="small" style="opacity:.8">Reply to ${esc(d.thread.from)}: "${esc(d.thread.subject)}"</div></div>`
          : `<div class="mock-card"><b>Nothing in your last ${total(d.counts)} emails needs a reply yet.</b><p class="small" style="margin:4px 0 0">Drafts are written for To do emails. You'll see the first one here when one arrives.</p></div>`
      }<div class="mock-card"><p style="margin:0 0 8px"><b>Setup readiness</b></p>${checksList(d.checks)}</div>`;
    }
    case "fix":
      return `<p class="mock-h">Setup readiness</p><div class="mock-card good"><b>${esc(READINESS_CHECKS[d.check].label)}</b>: done (simulated). ${tagged(READINESS_CHECKS[d.check].why)}</div>${
        d.check === "conversation_view" ? '<div class="mock-card dark"><b>Your first draft is ready</b></div>' : `<div class="mock-card">Labels now show in ${first}'s inbox, so the categorisation is visible.</div>`
      }`;
    case "empty":
      return `<p class="mock-h">No first draft yet, and here's why</p><div class="mock-card">${bars(d.counts)}</div><div class="mock-card"><b>Nothing labelled To do in your last ${total(d.counts)} emails.</b> ${tagged("E2")} ${tagged("E5")}<p class="small" style="margin:6px 0 0">If you want a draft for a specific email, you can ask for one in Chat, forward it, or add a custom rule ${tagged("E12")}.</p></div>`;
    case "rationale":
      return `<p class="mock-h">Your first draft</p>${draftBlock(d.thread, true, d.client)}`;
    default:
      return `<p>${esc(s.title)}</p>`;
  }
}

function renderOutcomes() {
  const c = simulateJourney(sim.persona, "control").outcome;
  const t = simulateJourney(sim.persona, "treatment").outcome;
  const row = (label, f) => `<tr><th scope="row">${label}</th><td>${f(c)}</td><td>${f(t)}</td></tr>`;
  const list = (a) => (a.length ? a.map((k) => esc(READINESS_CHECKS[k].label)).join(", ") : '<span class="muted">none</span>');
  $("#outcome-table").innerHTML = `<thead><tr><th>Property of the scripted path</th><th>Control</th><th>Treatment</th></tr></thead><tbody>${[
    row("Exposed on trial day", (o) => o.exposedOnTrialDay),
    row("A draft existed at exposure", (o) => yes(o.draftExistedAtExposure)),
    row("First draft viewed in session", (o) => yes(o.firstDraftViewed)),
    row("First draft sent in session", (o) => yes(o.firstDraftSent)),
    row("Steps the user had to find on their own", (o) => o.selfNavigationSteps),
    row("Setup issues present", (o) => list(o.readinessNeedsAction)),
    row("Setup issues shown to the user", (o) => list(o.readinessSurfaced)),
    row("Where it ends", (o) => (o.stopReason ? tagged(o.stopReason) : "First draft sent")),
  ].join("")}</tbody>`;
}

/* ---------------- Events ---------------- */
let taxGroup = "all";
function initEvents() {
  const groups = ["all", ...new Set(EVENTS.map((e) => e.group))];
  $("#group-filter").innerHTML = groups.map((g) => `<button type="button" data-group="${g}" aria-pressed="${g === taxGroup}">${g === "all" ? `All (${EVENTS.length})` : `${g} (${EVENTS.filter((e) => e.group === g).length})`}</button>`).join("");
  $("#group-filter").addEventListener("click", (e) => {
    const b = e.target.closest("[data-group]");
    if (!b) return;
    taxGroup = b.dataset.group;
    $$("#group-filter button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    renderTaxonomy();
  });
  renderTaxonomy();
  $("#common-table").innerHTML = `<thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead><tbody>${Object.entries(COMMON_PROPERTIES)
    .map(([k, s]) => `<tr><td><code>${k}</code></td><td>${s.type === "enum" ? s.values.join(" · ") : s.type}</td><td>${tagged(s.description)}</td></tr>`)
    .join("")}</tbody>`;
  const sample = simulateJourney("maya", "treatment").events.find((e) => e.event_name === "draft_sent");
  $("#validate-input").value = JSON.stringify(sample, null, 2);
  $("#validate-btn").addEventListener("click", runValidate);
  $("#validate-bad").addEventListener("click", () => {
    const bad = { ...sample, variant: "control", properties: { ...sample.properties, subject: "Revised brand deck", edit_bucket: "some" } };
    delete bad.anon_user_id;
    $("#validate-input").value = JSON.stringify(bad, null, 2);
    runValidate();
  });
  const blob = new Blob([JSON.stringify({ experiment_id: EXPERIMENT_ID, disclaimer: DISCLAIMER, common_properties: COMMON_PROPERTIES, events: EVENTS }, null, 2)], { type: "application/json" });
  $("#taxonomy-download").href = URL.createObjectURL(blob);
}

function renderTaxonomy() {
  const rows = EVENTS.filter((e) => taxGroup === "all" || e.group === taxGroup);
  $("#taxonomy-table").innerHTML = `<thead><tr><th>Event</th><th>Group</th><th>Arms</th><th>Fires when</th><th>Properties</th></tr></thead><tbody>${rows
    .map(
      (e) =>
        `<tr><td><code>${e.name}</code></td><td><span class="chip ${e.group === "guardrail" ? "bad" : e.group === "activation" ? "teal" : "neutral"}">${e.group}</span></td><td>${e.arms.length === 2 ? "both" : e.arms[0]}</td><td>${tagged(e.trigger)}</td><td><div class="props">${Object.entries(e.properties)
          .map(([k, s]) => `<span><code>${k}</code> <span class="muted">${s.type === "enum" ? s.values.join(" · ") : s.type}</span></span>`)
          .join("")}</div></td></tr>`,
    )
    .join("")}</tbody>`;
}

function runValidate() {
  const out = $("#validate-out");
  let ev;
  try {
    ev = JSON.parse($("#validate-input").value);
  } catch (err) {
    out.innerHTML = `<p class="err">Not valid JSON: ${esc(err.message)}</p>`;
    return;
  }
  if (!ev || typeof ev !== "object" || Array.isArray(ev)) {
    out.innerHTML = '<p class="err">Expected a single event object.</p>';
    return;
  }
  const problems = validateEvent(ev);
  out.innerHTML = problems.length
    ? `<span class="chip bad">${problems.length} problem${problems.length > 1 ? "s" : ""}</span><ul>${problems.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`
    : `<span class="chip ok">Valid</span> <span class="muted">${esc(ev.event_name)} matches the taxonomy.</span>`;
}

/* ---------------- Experiment ---------------- */
const SCENARIOS = [
  { id: "srm", label: "Rule check: SRM", v: { cn: 4000, cx: 1200, tn: 4400, tx: 1320, gcx: 150, gtx: 160, days: 14, per: 4000 } },
  { id: "early", label: "Rule check: too early", v: { cn: 1500, cx: 450, tn: 1510, tx: 480, gcx: 55, gtx: 58, days: 4, per: 4000 } },
  { id: "guard", label: "Rule check: guardrail", v: { cn: 4100, cx: 1230, tn: 4080, tx: 1310, gcx: 150, gtx: 260, days: 14, per: 4000 } },
  { id: "ship", label: "Rule check: ship", v: { cn: 4100, cx: 1230, tn: 4080, tx: 1400, gcx: 150, gtx: 165, days: 14, per: 4000 } },
  { id: "iterate", label: "Rule check: inconclusive", v: { cn: 4100, cx: 1230, tn: 4080, tx: 1290, gcx: 150, gtx: 158, days: 14, per: 4000 } },
  { id: "neg", label: "Rule check: negative", v: { cn: 4100, cx: 1230, tn: 4080, tx: 1100, gcx: 150, gtx: 135, days: 14, per: 4000 } },
];

function initExperiment() {
  $("#exp-id").textContent = EXPERIMENT.id;
  $("#guardrail-list").innerHTML = GUARDRAILS.map((g) => `<li><b>${esc(g.label)}</b>: must not rise more than ${Math.round(g.maxRelativeIncrease * 100)}% relative. <span class="muted">${tagged(g.why)}</span><br /><code>${esc(g.event)}</code></li>`).join("");
  $("#segment-list").innerHTML = SEGMENTS.map((s) => `<li><b>${esc(s.label)}</b> (${esc(s.values)}): <span class="muted">${tagged(s.why)}</span></li>`).join("");
  $("#rule-buttons").innerHTML = SCENARIOS.map((s) => `<button class="btn sm" type="button" data-scn="${s.id}">${esc(s.label)}</button>`).join("");
  $("#rule-buttons").addEventListener("click", (e) => {
    const b = e.target.closest("[data-scn]");
    if (!b) return;
    const s = SCENARIOS.find((x) => x.id === b.dataset.scn);
    for (const [k, v] of Object.entries(s.v)) $(`#decide-form [name=${k}]`).value = v;
    runDecide(`${s.label}: made-up inputs, not a result.`);
  });
  $("#power-form").addEventListener("submit", (e) => {
    e.preventDefault();
    runPower();
  });
  $("#decide-form").addEventListener("submit", (e) => {
    e.preventDefault();
    runDecide("Your inputs.");
  });
}

function readNums(form, names) {
  const out = {};
  const bad = [];
  for (const n of names) {
    const el = form.elements.namedItem(n);
    const v = Number(el.value);
    const ok = el.value.trim() !== "" && Number.isFinite(v) && (el.min === "" || v >= Number(el.min)) && (el.max === "" || v <= Number(el.max)) && (el.step !== "1" || Number.isInteger(v));
    el.setAttribute("aria-invalid", String(!ok));
    if (ok) out[n] = v;
    else bad.push(el.closest("label").childNodes[0].textContent.trim());
  }
  return { out, bad };
}

function planInputs() {
  const f = $("#power-form");
  const mde = Number(f.elements.namedItem("mde").value) / 100 || 0.03;
  const alpha = Number(f.elements.namedItem("alpha").value) || 0.05;
  return { mde, alpha };
}

function runPower() {
  const { out, bad } = readNums($("#power-form"), ["baseline", "mde", "alpha", "power", "daily"]);
  const box = $("#power-out");
  if (bad.length) {
    box.innerHTML = `<p class="err">Check: ${bad.map(esc).join(", ")}.</p>`;
    return;
  }
  try {
    const baseline = out.baseline / 100;
    const mde = out.mde / 100;
    const perArm = sampleSizePerArm({ baseline, mde, alpha: out.alpha, power: out.power });
    const days = runtimeDays({ perArm, dailyEligible: out.daily });
    box.innerHTML = `<div class="result"><div class="big">${perArm.toLocaleString("en-GB")} users per arm</div><ul><li>${(perArm * 2).toLocaleString("en-GB")} exposed users in total</li><li>${days.raw} days at ${out.daily.toLocaleString("en-GB")}/day. Run <b>${days.recommended} days</b>, rounded up to whole weeks.</li><li>Detects ${out.baseline}% → ${(out.baseline + out.mde).toFixed(1)}% (${((mde / baseline) * 100).toFixed(0)}% relative), with alpha ${out.alpha} and power ${out.power}.</li></ul><p class="small muted" style="margin:8px 0 0">Two-sided two-proportion z-test. Your inputs; the lab has no baseline data.</p></div>`;
  } catch (err) {
    box.innerHTML = `<p class="err">${esc(err.message)}</p>`;
  }
}

function runDecide(note) {
  const { out, bad } = readNums($("#decide-form"), ["cn", "cx", "tn", "tx", "gcx", "gtx", "days", "per"]);
  const box = $("#decide-out");
  if (bad.length) {
    box.innerHTML = `<p class="err">Check: ${bad.map(esc).join(", ")}.</p>`;
    return;
  }
  const { mde, alpha } = planInputs();
  try {
    const heavy = GUARDRAILS[0];
    const r = decide({
      plan: { mde, alpha, perArm: out.per, minDays: EXPERIMENT.minDays },
      daysRun: out.days,
      control: { n: out.cn, x: out.cx },
      treatment: { n: out.tn, x: out.tx },
      guardrails: [{ id: heavy.id, label: heavy.label, control: { n: out.cx, x: out.gcx }, treatment: { n: out.tx, x: out.gtx }, maxRelativeIncrease: heavy.maxRelativeIncrease }],
    });
    const pct = (v) => `${(v * 100).toFixed(1)}%`;
    const pp = (v) => `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}pp`;
    box.innerHTML = `<div class="result"><span class="verdict ${r.verdict}">${r.verdict.replace("_", " ")}</span><ul>${r.reasons.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${
      r.primary ? `<p class="small" style="margin:8px 0 0">Primary: control ${pct(r.primary.pC)}, treatment ${pct(r.primary.pT)}, diff ${pp(r.primary.diff)} (${Math.round((1 - alpha) * 100)}% CI ${pp(r.primary.ciLow)} to ${pp(r.primary.ciHigh)}), ${r.primary.pValue < 0.001 ? "p<0.001" : `p=${r.primary.pValue.toFixed(3)}`}.</p>` : ""
    }<p class="small muted" style="margin:6px 0 0">${esc(note)}</p></div>`;
  } catch (err) {
    box.innerHTML = `<p class="err">${esc(err.message)}</p>`;
  }
}

/* ---------------- Docs ---------------- */
let docIndex = null;
async function getDocs() {
  if (!docIndex) {
    const r = await fetch("/api/docs");
    if (!r.ok) throw new Error(`docs index ${r.status}`);
    docIndex = await r.json();
  }
  return docIndex;
}
async function renderDoc(el, slug) {
  try {
    const r = await fetch(`/api/docs/${slug}`);
    if (!r.ok) throw new Error(`${r.status}`);
    const doc = await r.json();
    el.innerHTML = marked.parse(doc.markdown);
    for (const a of $$("a[href]", el)) {
      const href = a.getAttribute("href");
      const m = href.match(/^(?:\.\.\/)?(?:docs\/)?([A-Z0-9_]+)\.md$/i);
      if (m) {
        const slug = m[1].toLowerCase().replace(/_/g, "-");
        if (docIndex?.some((d) => d.slug === slug)) a.setAttribute("href", `#docs/${slug}`);
      } else if (/^https?:/.test(href)) {
        a.target = "_blank";
        a.rel = "noopener";
      }
    }
  } catch (err) {
    el.innerHTML = `<p class="err">Couldn't load this document (${esc(err.message)}).</p>`;
  }
}
async function initDocs(rest) {
  try {
    const docs = await getDocs();
    $("#doc-list").innerHTML = docs.map((d) => `<li><a href="#docs/${d.slug}" data-slug="${d.slug}">${esc(d.title)}</a></li>`).join("");
  } catch (err) {
    $("#doc-list").innerHTML = `<li class="err">${esc(err.message)}</li>`;
  }
  routeDocs(rest);
}
function routeDocs([slug]) {
  const s = docIndex?.some((d) => d.slug === slug) ? slug : "readme";
  $$("#doc-list a").forEach((a) => (a.dataset.slug === s ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  renderDoc($("#doc-body"), s);
}
async function initValidate() {
  await getDocs().catch(() => null);
  await renderDoc($("#validate-doc"), "validation-48-72h");
  const h1 = $("#validate-doc h1");
  if (h1) h1.remove();
}

const INIT = { overview: initOverview, story: initStory, simulator: initSimulator, events: initEvents, experiment: initExperiment, validate: initValidate, docs: initDocs };
const ROUTE = { story: routeStory, simulator: (rest) => rest.length && (simFromHash(rest), setSim({}, false)), docs: routeDocs };

window.addEventListener("hashchange", route);
route();
