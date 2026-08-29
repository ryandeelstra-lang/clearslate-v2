// Maximise statistical power per dollar.
//
// budget-20k.ts got to 1,060 accounts by taking three inputs as given that are
// not given. Each is worth more than the trimming that produced that number.
//
//   1. ACQUISITION MODE. It assumed we BUY. A creditor placing accounts on
//      contingency with pre-authorised settlement bands costs $0 in purchase,
//      and answers the same question.
//   2. PRICE. It used 5.4¢ — JCAP's BLENDED price across all balances, ages and
//      types. Small-balance paper is explicitly discounted ("very small balances
//      are uneconomic to work") and secondary placements "price sharply lower".
//      We were paying the blended price for the cheapest segment in the market.
//   3. FIXED SAMPLE. It powered a fixed-n design. A group-sequential design
//      stops as soon as the effect is established, and the model predicts an
//      effect so large it would stop very early.
//
// Each lever is quantified below with its validity cost, because two of the
// three buy power by trading away something real.

import { samplePerArm, detectableLift } from "./budget-20k.ts";

export type Mode = "purchase" | "contingency";

export interface AcquisitionOption {
  readonly mode: Mode;
  readonly label: string;
  /** Cost per account to acquire, dollars. Zero for contingency. */
  readonly acquireCostPerAccount: number;
  readonly validityCost: string;
}

/**
 * Purchase prices by segment. The 5.4¢ blended figure is the WRONG price for a
 * small-balance tape — it averages fresh large-balance paper we are not buying.
 */
export function purchasePricePerAccount(avgBalance: number, priceBps: number): number {
  return avgBalance * (priceBps / 10_000);
}

export const PRICE_SCENARIOS: Array<{ label: string; bps: number; validity: string }> = [
  {
    label: "5.4¢ — JCAP blended (what budget-20k assumed)",
    bps: 540,
    validity: "Blended across all balances/ages/types. Not our segment.",
  },
  {
    label: "4.0¢ — small-balance discount, recent vintage",
    bps: 400,
    validity: "Within buy box. Best validity-per-dollar. Needs broker confirmation.",
  },
  {
    label: "3.0¢ — small-balance, secondary placement",
    bps: 300,
    validity: "Already worked once. Baseline will read LOW; match effect may still be clean.",
  },
  {
    label: "1.5¢ — aged/tertiary",
    bps: 150,
    validity: "⚠ Breaks external validity. Response unrepresentative of what we'd buy at scale.",
  },
];

// ─── Group-sequential design ───
//
// A fixed-n trial collects every observation regardless of what the data says.
// A group-sequential design looks at the data k times and stops early when the
// effect is established. Under a large true effect the expected sample size
// falls sharply; under the null it is roughly unchanged.
//
// Using O'Brien–Fleming-style boundaries, the inflation of MAXIMUM sample size
// is small (~2-3% for 3 looks) while EXPECTED sample under a real effect drops
// substantially. These are standard published factors, not derived here.

export interface SequentialPlan {
  looks: number;
  /** Max n per arm if the trial runs to completion. */
  maxPerArm: number;
  /** Expected n per arm if the effect is as large as predicted. */
  expectedPerArmUnderEffect: number;
}

const OBF_MAX_INFLATION: Record<number, number> = { 1: 1.0, 2: 1.008, 3: 1.017, 4: 1.024 };
/** Expected-sample fraction under a true effect at the design alternative. */
const OBF_EXPECTED_FRACTION: Record<number, number> = { 1: 1.0, 2: 0.73, 3: 0.64, 4: 0.60 };

export function sequentialPlan(fixedPerArm: number, looks: number): SequentialPlan {
  const maxPerArm = Math.ceil(fixedPerArm * (OBF_MAX_INFLATION[looks] ?? 1));
  return {
    looks,
    maxPerArm,
    expectedPerArmUnderEffect: Math.ceil(maxPerArm * (OBF_EXPECTED_FRACTION[looks] ?? 1)),
  };
}

// ─── Putting it together ───

export interface PowerPlan {
  label: string;
  mode: Mode;
  accounts: number;
  arms: number;
  perArm: number;
  detectable: number;
  detectableMultiple: number;
  acquireDollars: number;
  mailDollars: number;
  fixedDollars: number;
  totalDollars: number;
  validityNote: string;
}

export function planPower(opts: {
  label: string;
  mode: Mode;
  budgetDollars: number;
  fixedDollars: number;
  acquireCostPerAccount: number;
  mailPerAccount: number;
  arms: number;
  baselinePaymentRate: number;
  validityNote: string;
}): PowerPlan {
  const perAccount = opts.acquireCostPerAccount + opts.mailPerAccount;
  const available = opts.budgetDollars - opts.fixedDollars;
  const accounts = perAccount > 0 ? Math.max(0, Math.floor(available / perAccount)) : 0;
  const perArm = Math.floor(accounts / opts.arms);
  const detectable = perArm > 0 ? detectableLift(opts.baselinePaymentRate, perArm) : 1;

  return {
    label: opts.label,
    mode: opts.mode,
    accounts,
    arms: opts.arms,
    perArm,
    detectable,
    detectableMultiple: detectable / opts.baselinePaymentRate,
    acquireDollars: accounts * opts.acquireCostPerAccount,
    mailDollars: accounts * opts.mailPerAccount,
    fixedDollars: opts.fixedDollars,
    totalDollars: opts.fixedDollars + accounts * perAccount,
    validityNote: opts.validityNote,
  };
}

/** Accounts needed per arm for the effect the model actually predicts. */
export function accountsForPredictedEffect(baseline: number, predicted: number): number {
  return samplePerArm(baseline, predicted);
}
