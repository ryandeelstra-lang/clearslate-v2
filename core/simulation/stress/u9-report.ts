#!/usr/bin/env node
// U9 stress report. Run: node core/simulation/stress/u9-report.ts

import { H3_BASELINE } from "../scenarios/h3-baseline.ts";
import { generatePortfolio } from "../generators/portfolio.ts";
import { CONSUMER_BEHAVIOR } from "../calibration.ts";
import {
  breakEvenBps,
  voluntaryBaselineBps,
  requiredLiftMultiple,
  sweep,
  sensitivity,
  MARKET_REGIME,
} from "./u9.ts";

const c = (bps: number) => `${(bps / 100).toFixed(2)}¢`;
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

function main() {
  const p = generatePortfolio(H3_BASELINE);
  const face = p.metadata.actual_face_cents;
  const n = p.accounts.length;

  console.log("U9 STRESS TEST — does the match lift survive its own uncertainty?\n");
  console.log(`Portfolio: ${n} accounts, $${(face / 100).toLocaleString()} face\n`);

  // ── 1. What has to happen ──
  console.log("── 1. THE BAR ──\n");
  const be = breakEvenBps(face, n, MARKET_REGIME);
  console.log(`Break-even:                 ${c(be)} per $1 face`);
  console.log(`  purchase                  ${c(MARKET_REGIME.priceBps)}`);
  console.log(`  variable servicing        ${c(MARKET_REGIME.servicingBps)}`);
  console.log(
    `  up-front ($${(MARKET_REGIME.upfrontCentsPerAccount / 100).toFixed(2)}/acct)  ` +
      `${c(be - MARKET_REGIME.priceBps - MARKET_REGIME.servicingBps)}`,
  );
  console.log();
  for (const gr of [825, 1_100, 1_200]) {
    const vb = voluntaryBaselineBps(gr);
    const lift = requiredLiftMultiple(face, n, gr, MARKET_REGIME);
    console.log(
      `At ${c(gr)} gross recovery: voluntary baseline ${c(vb)} → match must deliver ${lift.toFixed(2)}× it`,
    );
  }
  console.log();

  // ── 2. Tuned point vs stated ranges ──
  console.log("── 2. THE TUNED POINT VS ITS OWN STATED RANGE ──\n");
  const el = CONSUMER_BEHAVIOR.match_elasticity;
  console.log(`  baseline_k  = ${el.baseline_k}   k_range  = [${el.k_range.join(", ")}]  ${el.baseline_k > el.k_range[1] ? "← OUTSIDE, high" : ""}`);
  console.log(`  baseline_R0 = ${el.baseline_R0}   R0_range = [${el.R0_range.join(", ")}]  ${el.baseline_R0 < el.R0_range[0] ? "← OUTSIDE, low" : ""}`);
  console.log("\n  Higher k and lower R0 both mean MORE PEOPLE PAY.\n");

  const ratios = [1, 2, 3, 4];
  const TRIALS = 60;

  console.log(`  Tuned point (k=${el.baseline_k}, R0=${el.baseline_R0}):`);
  console.log("   R |    cash | cleared | clears break-even");
  console.log("  ---|---------|---------|------------------");
  for (const r of sweep(H3_BASELINE, { trials: 1, matchRatios: [1, 2, 3, 4], useTunedPoint: true })) {
    console.log(
      `   ${r.matchRatio} | ${c(r.cashBpsMedian).padStart(7)} | ${String(r.medianCleared).padStart(7)} | ${r.cashBpsMedian >= be ? "YES" : "no"}`,
    );
  }
  console.log();

  // ── 3. Monte Carlo over honest ranges ──
  console.log("── 3. MONTE CARLO OVER THE STATED RANGES ──\n");
  console.log(`  ${TRIALS} trials per ratio. k~U[${el.k_range.join(",")}], R0~U[${el.R0_range.join(",")}],`);
  console.log("  plus price, servicing and up-front cost sampled across their ranges.\n");
  console.log("   R | P10 cash | median | P90 cash | cleared | P(clears break-even)");
  console.log("  ---|----------|--------|----------|---------|---------------------");
  const mc = sweep(H3_BASELINE, { trials: TRIALS, matchRatios: ratios });
  for (const r of mc) {
    console.log(
      `   ${r.matchRatio} | ${c(r.cashBpsP10).padStart(8)} | ${c(r.cashBpsMedian).padStart(6)} | ` +
        `${c(r.cashBpsP90).padStart(8)} | ${String(r.medianCleared).padStart(7)} | ${pct(r.clearRate).padStart(19)}`,
    );
  }
  console.log();

  const best = mc.reduce((a, b) => (b.clearRate > a.clearRate ? b : a));
  console.log(`  Best ratio by P(clears): R=${best.matchRatio} at ${pct(best.clearRate)}\n`);

  // ── 4. Sensitivity ──
  console.log("── 4. WHAT ACTUALLY DRIVES THE ANSWER (R=2) ──\n");
  const rows = sensitivity(H3_BASELINE, 2).sort((a, b) => b.swingBps - a.swingBps);
  console.log("  parameter       | range           | cash swing");
  console.log("  ----------------|-----------------|------------");
  for (const r of rows) {
    console.log(
      `  ${r.parameter.padEnd(15)} | ${`${r.lowValue}–${r.highValue}`.padEnd(15)} | ${c(r.swingBps)}`,
    );
  }
  console.log();

  // ── 5. Verdict ──
  console.log("── 5. VERDICT ──\n");
  const r2 = mc.find((x) => x.matchRatio === 2)!;
  console.log(`  Headline in the docs:        11.66¢ at R=2 (tuned point, single seed)`);
  console.log(`  Median across stated ranges: ${c(r2.cashBpsMedian)} at R=2`);
  console.log(`  P(clears break-even) at R=2: ${pct(r2.clearRate)}`);
  console.log();
  if (best.clearRate < 0.5) {
    console.log("  ⚠ Under its own stated uncertainty the model does NOT support H3");
    console.log("    at any tested ratio. The 11.66¢ headline is a property of the");
    console.log("    tuned parameters, not a property of the business.");
  }
}

main();
