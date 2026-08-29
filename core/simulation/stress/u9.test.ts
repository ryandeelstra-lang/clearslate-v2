// Regression tests for the U9 stress findings.
//
// These exist so the 28 Aug 2026 corrections cannot silently revert. Each one
// is written to FAIL if someone re-tunes the model back toward a flattering
// answer, or re-publishes a single-seed headline.

import { test } from "node:test";
import assert from "node:assert/strict";
import { H3_BASELINE } from "../scenarios/h3-baseline.ts";
import { generatePortfolio } from "../generators/portfolio.ts";
import { runSimulation } from "../operational/simulate.ts";
import { CONSUMER_BEHAVIOR } from "../calibration.ts";
import { breakEvenBps, sweep, MARKET_REGIME } from "./u9.ts";
import { servicingCost, sumComponents, ANNUAL_FIXED, ANNUAL_FIXED_LEAN } from "./u6-servicing.ts";

test("sigmoid point estimates stay inside their own stated ranges", () => {
  // The bug this pins: baseline_k was 1.5 against k_range [0.5, 1.2], and
  // baseline_R0 was 1.5 against R0_range [2.0, 3.5]. Both outside, both in the
  // direction that makes more people pay, with a comment admitting they were
  // "calibrated to produce ... >11¢ to beat break-even".
  const el = CONSUMER_BEHAVIOR.match_elasticity;

  assert.ok(
    el.baseline_k >= el.k_range[0] && el.baseline_k <= el.k_range[1],
    `baseline_k ${el.baseline_k} is outside k_range [${el.k_range.join(", ")}]. ` +
      `A point estimate outside its own uncertainty range is a tuned number, not a prior.`,
  );
  assert.ok(
    el.baseline_R0 >= el.R0_range[0] && el.baseline_R0 <= el.R0_range[1],
    `baseline_R0 ${el.baseline_R0} is outside R0_range [${el.R0_range.join(", ")}].`,
  );
});

test("no single seed may be reported as the model's answer", () => {
  // The published headline was "R=2 clears break-even at 11.66¢". Across seeds
  // at the same parameters the spread was 9.55–11.83¢, so 11.66¢ was near the
  // top of the distribution and the median did not clear. This test asserts the
  // spread is wide enough that a point estimate is meaningless — i.e. it fails
  // if someone narrows the model until one seed looks authoritative.
  const cash: number[] = [];
  for (let s = 1; s <= 12; s++) {
    cash.push(runSimulation(H3_BASELINE, 2, s).summary.cash_per_dollar_face * 10_000);
  }
  const lo = Math.min(...cash);
  const hi = Math.max(...cash);
  assert.ok(
    hi - lo > 50,
    `seed spread is only ${((hi - lo) / 100).toFixed(2)}¢. If this collapsed, ` +
      `re-check the model before quoting any single run.`,
  );
});

test("H3 does not clear against the SUPERSEDED 541bps servicing placeholder", () => {
  // Retained as a regression on the old regime only. MARKET_REGIME still carries
  // SERVICING_BPS = 541, which docs/research/u6-servicing.md showed is 2.3–8.3×
  // too high for a digital operation and expressed in the wrong unit.
  //
  // So this test documents WHY the original "0% clears" verdict was reached, not
  // whether H3 works. The live question is scale — see the next test.
  const results = sweep(H3_BASELINE, {
    trials: 12,
    matchRatios: [2, 3, 4],
    seed: "u9-regression",
  });

  const best = results.reduce((a, b) => (b.clearRate > a.clearRate ? b : a));
  assert.ok(
    best.clearRate < 0.5,
    `Against the 541bps placeholder H3 now clears in ${(best.clearRate * 100).toFixed(0)}% ` +
      `of trials at R=${best.matchRatio}. Confirm that came from evidence and not ` +
      `from re-tuning calibration.ts.`,
  );
});

test("the binding constraint is scale, not behaviour", () => {
  // The finding that replaced "0% clears at every ratio". With servicing built
  // bottom-up instead of inherited from a litigating call-centre operator, the
  // honest untuned medians DO clear — but only once annual volume is large
  // enough for fixed costs to amortise.
  const shape = {
    avgBalanceDollars: 660.57,
    paymentRate: 0.20,
    avgPaymentDollars: 165,
    bound: "low" as const,
  };
  const PRICE_BPS = 540;

  const pilot = servicingCost({
    ...shape,
    annualAccountVolume: 1_000,
    structure: "incumbent",
  });
  const atScale = servicingCost({
    ...shape,
    annualAccountVolume: 100_000,
    structure: "incumbent",
  });

  // A 1,000-account pilot is hopeless under an INCUMBENT cost structure.
  assert.ok(
    pilot.servicingBpsOfFace > 1_000,
    `pilot servicing is ${(pilot.servicingBpsOfFace / 100).toFixed(2)}¢; expected >10¢. ` +
      `If this dropped, re-check the annual-fixed components in u6-servicing.ts.`,
  );

  // At 100k/yr the bar drops below the honest median at R=3–4.
  const barAtScale = PRICE_BPS + atScale.servicingBpsOfFace;
  assert.ok(
    barAtScale < 620,
    `bar at 100k/yr is ${(barAtScale / 100).toFixed(2)}¢; expected <6.20¢`,
  );

  const results = sweep(H3_BASELINE, {
    trials: 10,
    matchRatios: [3, 4],
    seed: "scale-regression",
  });
  const clearsAtScale = results.filter((r) => r.cashBpsMedian >= barAtScale);
  assert.ok(
    clearsAtScale.length > 0,
    `No ratio's MEDIAN clears ${(barAtScale / 100).toFixed(2)}¢ at scale. That would ` +
      `reverse docs/research/u6-servicing.md — update it before changing this test.`,
  );

  // And the ordering that matters: scale changes the answer by orders of magnitude.
  assert.ok(
    pilot.servicingBpsOfFace > atScale.servicingBpsOfFace * 10,
    "scale must dominate: pilot servicing should exceed at-scale by >10×",
  );
});

test("a lean structure makes a pilot fundable — the incumbent assumption did not", () => {
  // Pins the correction prompted by "why does it cost any money to maintain?".
  // Pricing 30 state licences and a bought collections platform inflated the
  // scale threshold by more than an order of magnitude. TX needs a $10k bond
  // and no licence; NY State needs no licence; we are building the software.
  const shape = {
    avgBalanceDollars: 660.57,
    paymentRate: 0.20,
    avgPaymentDollars: 165,
    bound: "low" as const,
  };

  const leanAnnual = sumComponents(ANNUAL_FIXED_LEAN, "low");
  const incumbentAnnual = sumComponents(ANNUAL_FIXED, "low");
  assert.ok(
    incumbentAnnual > leanAnnual * 5,
    `incumbent annual fixed (${incumbentAnnual}) should exceed lean (${leanAnnual}) by >5×`,
  );

  // At 5,000 accounts the lean bar must fall below the honest R=3 median.
  const lean = servicingCost({ ...shape, annualAccountVolume: 5_000, structure: "lean" });
  const bar = 540 + lean.servicingBpsOfFace;
  assert.ok(
    bar < 613,
    `lean bar at 5k accounts is ${(bar / 100).toFixed(2)}¢; expected below the ~6.13¢ ` +
      `honest R=3 median. If this rose, re-check ANNUAL_FIXED_LEAN.`,
  );

  // And the capital required must stay within reach of a founder-funded pilot.
  const capital = 5_000 * 660.57 * 0.054 + leanAnnual;
  assert.ok(
    capital < 250_000,
    `pilot capital is $${capital.toFixed(0)}; expected under $250k. The earlier ` +
      `incumbent model implied ~$3.6M and drove a strategic conclusion that a ` +
      `pilot was unaffordable.`,
  );
});

test("break-even is computed from the actual tape, not a remembered constant", () => {
  // The docs carried 11.25¢, derived from a $400 average balance. The H3
  // baseline portfolio averages ~$660, so its up-front drag is 26bps rather
  // than 44bps and the true bar is 11.07¢. Quoting the wrong bar in either
  // direction misstates the verdict.
  const p = generatePortfolio(H3_BASELINE);
  const be = breakEvenBps(p.metadata.actual_face_cents, p.accounts.length, MARKET_REGIME);
  assert.ok(be > 1_100 && be < 1_115, `break-even ${be}bps outside expected 1100–1115`);
});
