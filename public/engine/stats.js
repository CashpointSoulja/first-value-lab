// Experiment maths. Pure functions, no dependencies. Inputs are always user-supplied: the lab
// ships no baseline rates, because it has none.

/** Inverse standard normal CDF (Acklam's rational approximation, |error| < 1.2e-9). */
export function normInv(p) {
  if (!(p > 0 && p < 1)) throw new RangeError("p must be in (0, 1)");
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - lo) return -normInv(1 - p);
  const q = p - 0.5;
  const r = q * q;
  return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/** Standard normal CDF (Abramowitz-Stegun 7.1.26 via erf). */
export function normCdf(z) {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(z * z) / 2);
  return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}

/**
 * Users per arm for a two-sided two-proportion z-test with equal allocation.
 * @param {{baseline:number, mde:number, alpha?:number, power?:number}} o  mde is absolute (0.03 = +3pp)
 */
export function sampleSizePerArm({ baseline, mde, alpha = 0.05, power = 0.8 }) {
  const p1 = baseline;
  const p2 = baseline + mde;
  if (!(p1 > 0 && p1 < 1)) throw new RangeError("baseline must be between 0 and 1");
  if (!(mde > 0) || !(p2 < 1)) throw new RangeError("mde must be positive and baseline + mde below 1");
  if (!(alpha > 0 && alpha < 1) || !(power > 0 && power < 1)) throw new RangeError("alpha and power must be between 0 and 1");
  const za = normInv(1 - alpha / 2);
  const zb = normInv(power);
  const pbar = (p1 + p2) / 2;
  const n = (za * Math.sqrt(2 * pbar * (1 - pbar)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2 / mde ** 2;
  return Math.ceil(n);
}

/** Calendar days to reach n per arm, rounded up to whole weeks to cover weekday/weekend mix. */
export function runtimeDays({ perArm, dailyEligible, arms = 2 }) {
  if (!(dailyEligible > 0)) throw new RangeError("dailyEligible must be positive");
  const raw = Math.ceil((perArm * arms) / dailyEligible);
  return { raw, recommended: Math.max(7, Math.ceil(raw / 7) * 7) };
}

/** Two-sided two-proportion z-test with a Wald CI on the difference (treatment − control). */
export function twoProportion(control, treatment, alpha = 0.05) {
  for (const g of [control, treatment])
    if (!(Number.isInteger(g.n) && g.n > 0 && Number.isInteger(g.x) && g.x >= 0 && g.x <= g.n)) throw new RangeError("each arm needs integer n > 0 and 0 ≤ x ≤ n");
  const pC = control.x / control.n;
  const pT = treatment.x / treatment.n;
  const diff = pT - pC;
  const se = Math.sqrt((pC * (1 - pC)) / control.n + (pT * (1 - pT)) / treatment.n);
  const pooled = (control.x + treatment.x) / (control.n + treatment.n);
  const sePooled = Math.sqrt(pooled * (1 - pooled) * (1 / control.n + 1 / treatment.n));
  const z = sePooled === 0 ? 0 : diff / sePooled;
  const pValue = 2 * (1 - normCdf(Math.abs(z)));
  const zc = normInv(1 - alpha / 2);
  return { pC, pT, diff, relative: pC === 0 ? null : diff / pC, ciLow: diff - zc * se, ciHigh: diff + zc * se, z, pValue };
}

/** Sample-ratio-mismatch check: chi-square (1 df) against the planned split. */
export function srm(nControl, nTreatment, expectedTreatmentShare = 0.5) {
  const total = nControl + nTreatment;
  const eT = total * expectedTreatmentShare;
  const eC = total - eT;
  const chi = (nControl - eC) ** 2 / eC + (nTreatment - eT) ** 2 / eT;
  return { chi, pValue: 2 * (1 - normCdf(Math.sqrt(chi))) };
}

/**
 * Pre-registered decision rule. Returns one verdict with reasons.
 * @param {{plan:{mde:number, alpha:number, perArm:number, minDays:number},
 *   daysRun:number, control:{n:number,x:number}, treatment:{n:number,x:number},
 *   guardrails:{id:string,label:string,control:{n:number,x:number},treatment:{n:number,x:number},maxRelativeIncrease:number}[]}} input
 */
export function decide({ plan, daysRun, control, treatment, guardrails = [] }) {
  const reasons = [];
  const ratio = srm(control.n, treatment.n);
  if (ratio.pValue < 0.001) {
    return { verdict: "invalid", reasons: [`Sample ratio mismatch (p=${ratio.pValue.toExponential(1)}). Fix assignment or logging before reading any result.`], srm: ratio };
  }
  const primary = twoProportion(control, treatment, plan.alpha);
  const guards = guardrails.map((g) => {
    const t = twoProportion(g.control, g.treatment, plan.alpha);
    const relIncrease = t.pC === 0 ? (t.pT > 0 ? Infinity : 0) : t.diff / t.pC;
    const breached = t.ciLow > 0 && relIncrease > g.maxRelativeIncrease;
    const watch = !breached && relIncrease > g.maxRelativeIncrease;
    return { ...g, test: t, relIncrease, breached, watch };
  });
  const pct = (v) => `${(v * 100).toFixed(1)}pp`;

  if (daysRun < plan.minDays || control.n < plan.perArm || treatment.n < plan.perArm) {
    if (daysRun < plan.minDays) reasons.push(`Ran ${daysRun} of ${plan.minDays} planned days.`);
    if (control.n < plan.perArm || treatment.n < plan.perArm) reasons.push(`Below planned ${plan.perArm} users per arm.`);
    reasons.push("Do not peek-and-ship. Keep running to the planned sample, unless a guardrail is breached.");
    const breach = guards.find((g) => g.breached);
    if (breach) return { verdict: "stop", reasons: [`Guardrail breached early: ${breach.label}.`, ...reasons], primary, guardrails: guards, srm: ratio };
    return { verdict: "keep_running", reasons, primary, guardrails: guards, srm: ratio };
  }
  const breach = guards.filter((g) => g.breached);
  if (breach.length) {
    return { verdict: "stop", reasons: breach.map((g) => `Guardrail breached: ${g.label} up ${(g.relIncrease * 100).toFixed(0)}% relative, above the ${(g.maxRelativeIncrease * 100).toFixed(0)}% limit.`), primary, guardrails: guards, srm: ratio };
  }
  if (primary.ciLow > 0) {
    reasons.push(`Primary metric up ${pct(primary.diff)} (CI ${pct(primary.ciLow)} to ${pct(primary.ciHigh)}), and no guardrail breached.`);
    if (primary.ciLow < plan.mde) reasons.push("The lower bound is below the MDE, so size the rollout claim to the lower bound, not the point estimate.");
    const watch = guards.filter((g) => g.watch);
    if (watch.length) reasons.push(`Watch: ${watch.map((g) => g.label).join(", ")} moved the wrong way but not significantly.`);
    return { verdict: "ship", reasons, primary, guardrails: guards, srm: ratio };
  }
  if (primary.ciHigh < 0) {
    return { verdict: "stop", reasons: [`Primary metric down ${pct(-primary.diff)} (CI ${pct(primary.ciLow)} to ${pct(primary.ciHigh)}).`], primary, guardrails: guards, srm: ratio };
  }
  if (primary.ciHigh < plan.mde) {
    return { verdict: "stop", reasons: [`Inconclusive, and the CI upper bound (${pct(primary.ciHigh)}) rules out the ${pct(plan.mde)} effect we powered for. Stop and re-scope.`], primary, guardrails: guards, srm: ratio };
  }
  return { verdict: "iterate", reasons: [`Inconclusive: CI ${pct(primary.ciLow)} to ${pct(primary.ciHigh)} still includes both zero and the MDE. Iterate on the design, or extend only if that was pre-registered.`], primary, guardrails: guards, srm: ratio };
}
