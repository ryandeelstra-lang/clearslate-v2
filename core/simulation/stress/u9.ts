// U9 STRESS TEST — how much lift must the match produce, and do we believe it?
//
// WHY THIS EXISTS.
//
// The 28 Aug 2026 gross-recovery correction (notes.md #14) removed all margin
// from beneath H3. A voluntary-only book now covers neither purchase nor
// servicing: max affordable price is 2.43¢ at L=25% and 0.06¢ at L=48.2%,
// against a 5.4¢ market. So H3 is not "improved by" the match mechanic — it is
// entirely dependent on it. Everything rests on U9.
//
// The simulation's answer to U9 is 11.66¢ at R=2. This module asks whether that
// number survives contact with its own stated uncertainty.
//
// ⚠️ THE FINDING THAT PROMPTED THIS MODULE.
//
// calibration.ts carries BOTH a point estimate and an uncertainty range for the
// sigmoid, and the point estimate sits OUTSIDE the range — in the flattering
// direction, on both parameters:
//
//     baseline_k:  1.5   but   k_range:  [0.5, 1.2]
//     baseline_R0: 1.5   but   R0_range: [2.0, 3.5]
//
// Higher k = steeper sigmoid = more responsive to the match. Lower R0 = the 50%
// pay threshold arrives at a shallower ratio. Both mean MORE PEOPLE PAY. The
// comment sitting directly above them says so outright: "Calibrated to produce
// ... R=3 target: >11¢ to beat break-even."
//
// The parameters were tuned until the model returned the answer the thesis
// needed, and the honest range was left underneath, contradicting them. That is
// the exact failure CLAUDE.md names: when an error flatters the product, that's
// a signal.
//
// So this harness sweeps the STATED RANGES, not the tuned point. If H3 only
// clears at k=1.5/R0=1.5, we have not found a business — we have found a
// parameter choice.

import seedrandom from "seedrandom";
import type { PortfolioConfig } from "../types.ts";
import { generatePortfolio } from "../generators/portfolio.ts";
import { assignArchetypes } from "../behavioral/consumer.ts";
import { simulateAllPayments, aggregatePaymentStats } from "../behavioral/payment.ts";
import type { ElasticityParams } from "../behavioral/match-response.ts";
import { CONSUMER_BEHAVIOR, MARKET_PARAMS } from "../calibration.ts";

// ─── Break-even, stated in one place ───

export interface CostRegime {
  /** Purchase price, bps of face. */
  priceBps: number;
  /** Collection-proportional servicing, bps of face. */
  servicingBps: number;
  /** Up-front servicing per account, cents. */
  upfrontCentsPerAccount: number;
}

export const MARKET_REGIME: CostRegime = {
  priceBps: 540, // JCAP H1 2026 blended
  servicingBps: MARKET_PARAMS.costs.variable_bps, // 541
  upfrontCentsPerAccount: MARKET_PARAMS.costs.upfront_per_account_cents, // 175
};

/** Cash in bps of face required to break even on a given tape and cost regime. */
export function breakEvenBps(
  faceCents: number,
  accounts: number,
  regime: CostRegime = MARKET_REGIME,
): number {
  const upfrontBps = (regime.upfrontCentsPerAccount * accounts * 10_000) / faceCents;
  return regime.priceBps + regime.servicingBps + upfrontBps;
}

/**
 * The voluntary baseline: what a no-match book collects, in bps of face.
 * This is the number the match has to beat, and by how much is the U9 question.
 */
export function voluntaryBaselineBps(grossRecoveryBps: number): number {
  return Math.round(grossRecoveryBps * MARKET_PARAMS.recovery.voluntary_share);
}

/** How many times the voluntary baseline must the match deliver to break even? */
export function requiredLiftMultiple(
  faceCents: number,
  accounts: number,
  grossRecoveryBps: number,
  regime: CostRegime = MARKET_REGIME,
): number {
  return breakEvenBps(faceCents, accounts, regime) / voluntaryBaselineBps(grossRecoveryBps);
}

// ─── Monte Carlo over the stated uncertainty ───

export interface DrawnParams {
  k: number;
  R0: number;
  grossRecoveryBps: number;
  priceBps: number;
  servicingBps: number;
  upfrontCents: number;
}

export interface TrialResult extends DrawnParams {
  matchRatio: number;
  cashBps: number;
  breakEvenBps: number;
  clears: boolean;
  cleared: number;
  liftMultiple: number;
}

function uniform(rng: () => number, lo: number, hi: number): number {
  return lo + (hi - lo) * rng();
}

/**
 * One trial: draw parameters from their stated ranges, run the portfolio at
 * `matchRatio`, and record whether it clears break-even.
 */
export function runTrial(
  config: PortfolioConfig,
  matchRatio: number,
  drawn: DrawnParams,
  seed: string,
): TrialResult {
  const rng = seedrandom(seed);
  const portfolio = generatePortfolio(config);
  const archetypes = assignArchetypes(portfolio.accounts.length, rng);

  const elasticity: ElasticityParams = { k: drawn.k, R0: drawn.R0 };
  const outcomes = simulateAllPayments(
    portfolio.accounts,
    archetypes,
    matchRatio,
    rng,
    elasticity,
  );
  const stats = aggregatePaymentStats(portfolio.accounts, outcomes);

  const faceCents = portfolio.metadata.actual_face_cents;
  const accounts = portfolio.accounts.length;
  const regime: CostRegime = {
    priceBps: drawn.priceBps,
    servicingBps: drawn.servicingBps,
    upfrontCentsPerAccount: drawn.upfrontCents,
  };

  const be = breakEvenBps(faceCents, accounts, regime);
  const cashBps = stats.cash_per_dollar_face * 10_000;

  return {
    ...drawn,
    matchRatio,
    cashBps,
    breakEvenBps: be,
    clears: cashBps >= be,
    cleared: stats.accounts_cleared_count,
    liftMultiple: cashBps / voluntaryBaselineBps(drawn.grossRecoveryBps),
  };
}

export interface SweepOptions {
  trials: number;
  matchRatios: number[];
  /** Use the tuned point estimate instead of sampling the stated ranges. */
  useTunedPoint?: boolean;
  seed?: string;
}

/** Draw one parameter set from the stated ranges (or the tuned point). */
export function drawParams(rng: () => number, useTunedPoint: boolean): DrawnParams {
  const el = CONSUMER_BEHAVIOR.match_elasticity;
  return {
    k: useTunedPoint ? el.baseline_k : uniform(rng, el.k_range[0], el.k_range[1]),
    R0: useTunedPoint ? el.baseline_R0 : uniform(rng, el.R0_range[0], el.R0_range[1]),
    // Gross recovery band, widened below the band because it mixes populations
    // (notes.md #12). Only used for the lift denominator, not for cash.
    grossRecoveryBps: useTunedPoint ? 1_150 : uniform(rng, 825, 1_200),
    priceBps: useTunedPoint ? 540 : uniform(rng, 500, 670),
    servicingBps: useTunedPoint
      ? MARKET_PARAMS.costs.variable_bps
      : uniform(rng, 373, 541),
    upfrontCents: useTunedPoint
      ? MARKET_PARAMS.costs.upfront_per_account_cents
      : uniform(rng, 130, 250),
  };
}

export interface SweepResult {
  matchRatio: number;
  trials: number;
  clearRate: number;
  cashBpsP10: number;
  cashBpsMedian: number;
  cashBpsP90: number;
  medianCleared: number;
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return NaN;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.floor(q * sorted.length)));
  return sorted[i];
}

export function sweep(config: PortfolioConfig, opts: SweepOptions): SweepResult[] {
  const master = seedrandom(opts.seed ?? "u9-stress");
  const out: SweepResult[] = [];

  for (const matchRatio of opts.matchRatios) {
    const cash: number[] = [];
    const cleared: number[] = [];
    let clears = 0;

    for (let t = 0; t < opts.trials; t++) {
      const drawn = drawParams(master, opts.useTunedPoint ?? false);
      const r = runTrial(config, matchRatio, drawn, `u9-R${matchRatio}-t${t}`);
      cash.push(r.cashBps);
      cleared.push(r.cleared);
      if (r.clears) clears++;
    }

    cash.sort((a, b) => a - b);
    cleared.sort((a, b) => a - b);

    out.push({
      matchRatio,
      trials: opts.trials,
      clearRate: clears / opts.trials,
      cashBpsP10: quantile(cash, 0.1),
      cashBpsMedian: quantile(cash, 0.5),
      cashBpsP90: quantile(cash, 0.9),
      medianCleared: quantile(cleared, 0.5),
    });
  }

  return out;
}

// ─── One-at-a-time sensitivity ───

export interface SensitivityRow {
  parameter: string;
  lowValue: number;
  highValue: number;
  cashBpsAtLow: number;
  cashBpsAtHigh: number;
  swingBps: number;
}

/**
 * Hold everything at the tuned point, move one parameter across its stated
 * range, and record the swing in cash. Ranks what actually drives the answer.
 */
export function sensitivity(
  config: PortfolioConfig,
  matchRatio: number,
): SensitivityRow[] {
  const el = CONSUMER_BEHAVIOR.match_elasticity;
  const base = drawParams(seedrandom("unused"), true);

  const vary: Array<[string, [number, number], (p: DrawnParams, v: number) => DrawnParams]> = [
    ["sigmoid k", [el.k_range[0], el.k_range[1]], (p, v) => ({ ...p, k: v })],
    ["sigmoid R0", [el.R0_range[0], el.R0_range[1]], (p, v) => ({ ...p, R0: v })],
    ["servicing bps", [373, 541], (p, v) => ({ ...p, servicingBps: v })],
    ["price bps", [500, 670], (p, v) => ({ ...p, priceBps: v })],
    ["upfront cents", [130, 250], (p, v) => ({ ...p, upfrontCents: v })],
  ];

  return vary.map(([parameter, [lo, hi], apply]) => {
    const atLow = runTrial(config, matchRatio, apply(base, lo), "sens-low");
    const atHigh = runTrial(config, matchRatio, apply(base, hi), "sens-high");
    return {
      parameter,
      lowValue: lo,
      highValue: hi,
      cashBpsAtLow: atLow.cashBps,
      cashBpsAtHigh: atHigh.cashBps,
      swingBps: Math.abs(atHigh.cashBps - atLow.cashBps),
    };
  });
}
