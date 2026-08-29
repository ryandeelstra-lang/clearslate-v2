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

test("H3 does not clear break-even under the stated uncertainty", () => {
  // ⚠️ THIS TEST PASSING IS BAD NEWS. It documents that the simulation, run
  // honestly across its own stated parameter ranges, gives no support for H3.
  //
  // It is written this way deliberately: if a future change makes H3 clear,
  // this test FAILS and forces someone to explain what changed and why — new
  // evidence, or new tuning. Do not "fix" it by widening a range.
  const results = sweep(H3_BASELINE, {
    trials: 12,
    matchRatios: [2, 3, 4],
    seed: "u9-regression",
  });

  const best = results.reduce((a, b) => (b.clearRate > a.clearRate ? b : a));
  assert.ok(
    best.clearRate < 0.5,
    `H3 now clears break-even in ${(best.clearRate * 100).toFixed(0)}% of trials at ` +
      `R=${best.matchRatio}. That would be a REVERSAL of the 28 Aug 2026 finding. ` +
      `Confirm it came from evidence (U9 field data) and not from re-tuning ` +
      `calibration.ts, then update docs/research/u9-stress.md.`,
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
