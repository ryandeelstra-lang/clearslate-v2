// The IRR bridge: what each structural choice does to the return on a
// charged-off portfolio, one step at a time.
//
// docs/research/notes.md carries this bridge as a hand-typed table. Two
// problems with that. It was built on legal share L=25%, and the verified
// figure from PRA's FY2025 10-K is 48.2% (correction #10). And nothing
// regenerates it, so when an input is corrected the table silently goes stale.
//
// This module recomputes it from parameters. Money is integer cents; rates are
// integer basis points. Reuses the discounting primitives in portfolio.ts.

import { decayScheduleBps, irrAnnualBps, npvCents } from "./portfolio.ts";

export type BridgeConfig = {
  faceCents: number;
  /** Purchase price, bps of face. Industry baseline 700 = 7¢. */
  priceBps: number;
  /** All-channel gross recovery, bps of face. 1680 = 16.8¢ = 7¢ × 2.4. */
  grossRecoveryBps: number;
  /** Servicing as a share of COLLECTIONS. Encore FY2025 = 4410 (44.1%). */
  costToCollectBps: number;
  /** Legal channel's share of COLLECTIONS. Verified 4820; plan assumed 2500. */
  legalShareOfCollectionsBps: number;
  /**
   * Legal channel's share of OPEX. PRA: 3100 (31%).
   *
   * This is the parameter that keeps the bridge honest. Dropping litigation
   * removes a large slice of revenue AND a smaller slice of cost. A model that
   * subtracts only the revenue overstates the damage; one that forgets the
   * revenue understates it. notes.md states the asymmetry in words — "deletes a
   * large share of the denominator to save a small share of the numerator" —
   * and this is that sentence as arithmetic.
   */
  legalShareOfOpexBps: number;
  horizonMonths: number;
  retentionBps: number;
  /** Uplift applied to price for full-media paper. 3000 = +30%. */
  mediaPremiumBps: number;
  /** Annual discount rate for NPV. Residual securitisation coupon = 1100. */
  hurdleAnnualBps: number;
};

/** notes.md's stated baseline, with the legal share corrected to the verified figure. */
export const BRIDGE_BASELINE: BridgeConfig = {
  faceCents: 100_000_000, // $1,000,000 face
  priceBps: 700,
  grossRecoveryBps: 1_680,
  costToCollectBps: 4_410,
  legalShareOfCollectionsBps: 4_820,
  legalShareOfOpexBps: 3_100,
  horizonMonths: 180,
  retentionBps: 9_800,
  mediaPremiumBps: 3_000,
  hurdleAnnualBps: 1_100,
};

export type Scenario = {
  horizonMonths: number;
  /** Collections retained after any channel removal, bps of face. */
  grossBps: number;
  /** Servicing, bps of face. */
  costBps: number;
  priceBps: number;
};

export type BridgeRow = {
  label: string;
  irrAnnualBps: number | null;
  /** Change from the previous row. Null on the first row. */
  deltaBps: number | null;
  /** Net collections ÷ price. Below 1.0 loses principal at any horizon. */
  netMultiple: number;
  grossMultiple: number;
  npvCents: number;
};

/** Cashflows for one scenario: price out at t=0, net collections in on the decay curve. */
export function scenarioCashflows(cfg: BridgeConfig, s: Scenario): number[] {
  const priceCents = Math.round((cfg.faceCents * s.priceBps) / 10_000);
  const netCents = Math.round((cfg.faceCents * (s.grossBps - s.costBps)) / 10_000);
  const schedule = decayScheduleBps(s.horizonMonths, cfg.retentionBps);
  return [-priceCents, ...schedule.map((w) => Math.round((netCents * w) / 10_000))];
}

function row(label: string, cfg: BridgeConfig, s: Scenario, prev: number | null): BridgeRow {
  const cashflows = scenarioCashflows(cfg, s);
  const irr = irrAnnualBps(cashflows);
  const monthlyRateBps = Math.round(
    (Math.pow(1 + cfg.hurdleAnnualBps / 10_000, 1 / 12) - 1) * 10_000,
  );
  return {
    label,
    irrAnnualBps: irr,
    deltaBps: prev !== null && irr !== null ? irr - prev : null,
    netMultiple: s.priceBps > 0 ? (s.grossBps - s.costBps) / s.priceBps : Infinity,
    grossMultiple: s.priceBps > 0 ? s.grossBps / s.priceBps : Infinity,
    npvCents: npvCents(cashflows, monthlyRateBps),
  };
}

/**
 * The four-step bridge, in the order notes.md states it.
 *
 * Each step changes exactly one structural thing, so the delta is attributable.
 */
export function irrBridge(cfg: BridgeConfig = BRIDGE_BASELINE): BridgeRow[] {
  const fullCost = Math.round((cfg.grossRecoveryBps * cfg.costToCollectBps) / 10_000);

  // 1. Industry baseline: long horizon, litigation intact.
  const base: Scenario = {
    horizonMonths: cfg.horizonMonths,
    grossBps: cfg.grossRecoveryBps,
    costBps: fullCost,
    priceBps: cfg.priceBps,
  };

  // 2. Compress the horizon, hold the multiple. The only step that helps.
  const compressed: Scenario = { ...base, horizonMonths: 48 };

  // 3. Remove the legal channel. Collections fall by its share of collections;
  //    cost falls by its (smaller) share of opex.
  const grossNoLegal = Math.round(
    (cfg.grossRecoveryBps * (10_000 - cfg.legalShareOfCollectionsBps)) / 10_000,
  );
  const costNoLegal = Math.round((fullCost * (10_000 - cfg.legalShareOfOpexBps)) / 10_000);
  const noLegal: Scenario = {
    ...compressed,
    grossBps: grossNoLegal,
    costBps: costNoLegal,
  };

  // 4. Pay the full-media premium on top.
  const withMedia: Scenario = {
    ...noLegal,
    priceBps: Math.round((cfg.priceBps * (10_000 + cfg.mediaPremiumBps)) / 10_000),
  };

  const rows: BridgeRow[] = [];
  let prev: number | null = null;
  const steps: Array<[string, Scenario]> = [
    [`${cfg.horizonMonths}mo, legal intact`, base],
    ["compress to 48mo, multiple held", compressed],
    [`remove legal @ L=${(cfg.legalShareOfCollectionsBps / 100).toFixed(1)}%`, noLegal],
    [`add media premium @ +${(cfg.mediaPremiumBps / 100).toFixed(0)}%`, withMedia],
  ];
  for (const [label, s] of steps) {
    const r = row(label, cfg, s, prev);
    rows.push(r);
    if (r.irrAnnualBps !== null) prev = r.irrAnnualBps;
  }
  return rows;
}

/**
 * The gross voluntary multiple a voluntary-only book must hit to clear the
 * hurdle over `horizonMonths`.
 *
 * notes.md states this as 1.94× over 48 months — "81% of what the entire
 * industry collects WITH courts, in 48 months instead of 180" — and that
 * sentence is the sharpest single argument against a non-litigating thesis.
 * It was computed at L=25%, so it is worth recomputing.
 */
export function requiredVoluntaryMultiple(cfg: BridgeConfig = BRIDGE_BASELINE): number {
  const monthlyRateBps = Math.round(
    (Math.pow(1 + cfg.hurdleAnnualBps / 10_000, 1 / 12) - 1) * 10_000,
  );
  const schedule = decayScheduleBps(48, cfg.retentionBps);
  // PV of one unit of net collections spread on the curve.
  const pvPerUnit = npvCents(
    [0, ...schedule.map((w) => Math.round((1_000_000 * w) / 10_000))],
    monthlyRateBps,
  ) / 1_000_000;
  // Need PV(net) >= price. net = gross × (1 − costToCollect after legal removal).
  const costRatio =
    (cfg.costToCollectBps * (10_000 - cfg.legalShareOfOpexBps)) / 100_000_000;
  if (pvPerUnit <= 0 || 1 - costRatio <= 0) return Infinity;
  return 1 / (pvPerUnit * (1 - costRatio));
}
