// Debt-portfolio entry pricing and match-mechanic math for H3
// (docs/decisions/h3-ownership-as-product.md).
//
// All money is integer cents — no floats. All rates are integer BASIS POINTS of
// face value: 500 bps = 5¢ per $1 of face = 5% of face. Basis points are used
// rather than "cents per dollar" because the servicing figure (5.41¢) is not a
// whole number of cents, and a float there would leak into every downstream sum.

// ---------------------------------------------------------------------------
// ⚠️ GROSS RECOVERY HAS NO DEFAULT. Corrected 28 Aug 2026.
//
// This module previously exported `GROSS_RECOVERY_BPS = 1680` (16.8¢ per $1 of
// face) and defaulted to it. That number came from a 7¢ price × 2.4× multiple.
// Both inputs are stale.
//
// Jefferson Capital's Q2 2026 10-Q — a buyer whose stated strategy IS small-
// balance paper — reports H1 2026 purchases at 5.4% of face (down from 6.7%)
// against US Distressed collection multiples of 2.0–2.3×. Implied all-channel
// gross recovery is ≈11–12¢, roughly 30% below the old constant.
//
// `underwrite()` is LINEAR in gross recovery, so every price ceiling this repo
// printed under 1680 was proportionally too generous — the flattering direction.
//
// WHY THERE IS NO REPLACEMENT CONSTANT. notes.md correction 12 and
// u13-asset-class-selection.md §1(a) are explicit: 5.4¢ is JCAP's blended price
// across four countries and two business lines, while 2.0–2.3× is US Distressed
// only. Multiplying them mixes populations. The finding is sound as "1680 is too
// high"; it is NOT sound as a replacement constant, and a US-only price is not
// public. Hard-coding 1150 would swap one unsourced number for another and hide
// that it was a choice.
//
// So callers pass it explicitly, exactly as they already must for
// legalShareBps below. The band constants are reference points to choose from,
// not defaults to fall back on.
// ---------------------------------------------------------------------------

/** Superseded. 7¢ × 2.4×, both inputs stale. Retained so old runs stay reproducible. */
export const GROSS_RECOVERY_BPS_STALE_1680 = 1680;

/** Low end of the JCAP-implied band (≈11¢). Population-mixed — see note above. */
export const GROSS_RECOVERY_BPS_JCAP_LOW = 1100;

/** High end of the JCAP-implied band (≈12¢). Population-mixed — see note above. */
export const GROSS_RECOVERY_BPS_JCAP_HIGH = 1200;

// Fully-loaded servicing stack per $1 of face, per v2-plan.md.
// NOTE: this is a PLACEHOLDER pending U6. It is not an observed figure.
export const SERVICING_BPS = 541;

// ---------------------------------------------------------------------------
// ⚠️ UNRESOLVED CONTRADICTION — the legal channel's share of collections.
//
// The repo carries two incompatible values for the same parameter:
//
//   v2-plan.md entry-price model:  "Less legal channel @ L=25%  × 0.75"
//   notes.md verified fact:        legal = 48.2% of PRA US Core collections
//                                  (FY2025 10-K; trend 38.7% -> 45.0% -> 48.2%)
//
// They differ by roughly 2x and drive the baseline a voluntary-only book must
// clear. At L=25% the baseline is 12.60c per $1 face; at L=48.2% it is 8.70c,
// and net of servicing the difference is 7.19c versus 3.29c -- less than half.
//
// Neither is obviously right. L=25% may have been an unlabelled attempt to model
// SUBSTITUTION: some accounts that would have paid under legal pressure pay
// voluntarily instead, so the true forfeit sits somewhere BELOW the full legal
// share. That is a defensible modelling choice and an indefensible silent one.
//
// Until U3 resolves it, callers pass the share explicitly. No default is
// exported, deliberately -- a wrong default here silently changes the verdict.
// ---------------------------------------------------------------------------

/** v2-plan.md's entry-price assumption. Unsourced; possibly substitution-adjusted. */
export const LEGAL_SHARE_BPS_PLAN = 2500;

/** Verified from PRA FY2025 10-K. Assumes zero substitution — the pessimistic bound. */
export const LEGAL_SHARE_BPS_VERIFIED = 4820;

// Gross recovery available to a book that never litigates, per $1 of face.
// legalShareBps is the fraction of collections forfeited by not suing.
// grossRecoveryBps has NO DEFAULT — see the note at the top of this file.
export function voluntaryBaselineBps(
  legalShareBps: number,
  grossRecoveryBps: number,
): number {
  if (legalShareBps < 0 || legalShareBps > 10_000) {
    throw new Error("legalShareBps must be between 0 and 10000");
  }
  if (!Number.isFinite(grossRecoveryBps) || grossRecoveryBps <= 0) {
    throw new Error("grossRecoveryBps must be > 0 and passed explicitly");
  }
  return Math.round((grossRecoveryBps * (10_000 - legalShareBps)) / 10_000);
}

// ---------------------------------------------------------------------------
// Ratio semantics — read this before touching anything below.
//
// A match of ratio R:1 means: for every $1 the consumer pays, ClearSlate cancels
// R additional dollars, so $(R + 1) of balance disappears per $1 paid.
//
//   R = 1  →  each $1 paid cancels $2  →  clear the balance by paying face / 2
//   R = 4  →  each $1 paid cancels $5  →  clear the balance by paying face / 5
//
// The divisor is (R + 1), NOT R. An earlier draft of the H3 document used
// face / R and overstated the 4:1 clearing payment as $1,059.25 instead of
// $847.40 — an error that made the account look more profitable than it is.
// ---------------------------------------------------------------------------

// Integer cents equal to `bps` basis points of `faceCents`.
export function bpsOfFace(faceCents: number, bps: number): number {
  return Math.round((faceCents * bps) / 10_000);
}

// What we pay the seller for the paper.
export function purchasePriceCents(faceCents: number, priceBps: number): number {
  return bpsOfFace(faceCents, priceBps);
}

// Fully-loaded cost to service the account through its life.
export function servicingCostCents(faceCents: number, servicingBps = SERVICING_BPS): number {
  return bpsOfFace(faceCents, servicingBps);
}

// Cash we must collect on this account just to get our money back: purchase
// price plus servicing. Anything above this is profit; anything below is loss.
export function breakEvenCents(
  faceCents: number,
  priceBps: number,
  servicingBps = SERVICING_BPS,
): number {
  return purchasePriceCents(faceCents, priceBps) + servicingCostCents(faceCents, servicingBps);
}

// What the consumer pays, out of pocket, to take the balance to zero at ratio R.
// Rounded UP: rounding down would leave a stub balance the consumer believes
// they cleared, which is exactly the kind of "technically still owes $0.01"
// trap this project exists to not build.
export function clearingPaymentCents(faceCents: number, ratio: number): number {
  if (ratio < 0) throw new Error("ratio must be >= 0");
  return Math.ceil(faceCents / (ratio + 1));
}

export type MatchOutcome = {
  consumerPaidCents: number;
  cancelledCents: number; // total balance removed, including the consumer's own payment
  matchedCents: number; // the portion ClearSlate forgave on top of what they paid
  remainingCents: number;
  clearsBalance: boolean;
};

// Apply a payment under a match at ratio R. Cancellation is capped at face:
// a consumer can never be credited past zero, and overpayment never produces a
// negative balance.
export function matchOutcome(
  faceCents: number,
  ratio: number,
  consumerPaidCents: number,
): MatchOutcome {
  if (ratio < 0) throw new Error("ratio must be >= 0");
  if (consumerPaidCents < 0) throw new Error("payment must be >= 0");

  const uncapped = consumerPaidCents * (ratio + 1);
  const cancelledCents = Math.min(uncapped, faceCents);
  const remainingCents = Math.max(faceCents - cancelledCents, 0);

  return {
    consumerPaidCents,
    cancelledCents,
    matchedCents: Math.max(cancelledCents - consumerPaidCents, 0),
    remainingCents,
    clearsBalance: remainingCents === 0,
  };
}

// Net cents retained per $1 of face, expressed in basis points of face.
// Net = cash collected − servicing. The purchase price is deliberately excluded:
// this measures collection performance against the baseline, and price is the
// separate question of what we should have paid.
export function netPerDollarFaceBps(
  collectedCents: number,
  faceCents: number,
  servicingBps = SERVICING_BPS,
): number {
  if (faceCents <= 0) throw new Error("faceCents must be > 0");
  const net = collectedCents - servicingCostCents(faceCents, servicingBps);
  return Math.round((net * 10_000) / faceCents);
}

export type BaselineComparison = {
  collectedBps: number;
  baselineBps: number;
  beatsBaseline: boolean;
  marginBps: number; // positive = ahead of the no-match baseline
};

// THE CENTRAL RESULT of H3, and the counter-intuitive one.
//
// Under a match, net = collected − servicing. The match ratio does not appear:
// cancelled balance is not an expense, it is forgiveness of face we never
// expected to collect. So a match is worth running if and only if it lifts CASH
// COLLECTED above the voluntary-only baseline for the assumed legal share.
//
// The ratio is therefore behaviourally free — it costs nothing directly, and
// matters only through (a) its effect on how much people actually pay and
// (b) the clearing cap, where a generous ratio lets a high-intent account zero
// out for less than it would otherwise have paid.
// baselineBps is REQUIRED — derive it with voluntaryBaselineBps() and an explicit
// legal share. See the contradiction note at the top of this file.
export function matchBeatsBaseline(
  collectedCents: number,
  faceCents: number,
  baselineBps: number,
): BaselineComparison {
  if (faceCents <= 0) throw new Error("faceCents must be > 0");
  const collectedBps = Math.round((collectedCents * 10_000) / faceCents);
  return {
    collectedBps,
    baselineBps,
    beatsBaseline: collectedBps > baselineBps,
    marginBps: collectedBps - baselineBps,
  };
}

// ---------------------------------------------------------------------------
// Underwriting — is a quoted price worth paying?
//
// Rev. 1 died on TIMING, not on gross recovery: a voluntary-only book forfeits
// the post-48-month tail rather than compressing it, because that tail is
// disproportionately judgment plans and garnishment. So a model that compares
// undiscounted totals will approve deals that actually lose money. Everything
// below discounts.
// ---------------------------------------------------------------------------

/** Effective hurdle from notes.md: SOFR 3.62% + 6.40%. */
export const HURDLE_ANNUAL_BPS = 1002;

/**
 * Up-front servicing incurred PER ACCOUNT at acquisition, whether or not the
 * account ever pays: Reg F §1006.34 validation notice (print + postage) plus
 * pre-contact scrubs (bankruptcy, deceased, SCRA, attorney-represented).
 *
 * PLACEHOLDER pending U6, and the weakest input in this model.
 *
 * Two independent research passes produced DIFFERENT ranges, recorded rather
 * than reconciled because neither is authoritative:
 *
 *     $1.30 - $2.50   market research (docs/research/notes.md)
 *     $1.23 - $1.63   adversarial review round 2
 *
 * They agree on the mailing half (USPS 2026 First-Class $0.78; print and
 * fulfilment $0.20-$0.35 at volume, vendor-quoted). They disagree on the
 * compliance scrubs, and NEITHER could source that component: LexisNexis,
 * Experian, TransUnion, RNN, BankruptcyWatch and LocateSmarter all quote
 * privately with nothing public. That half is an estimate.
 *
 * 175 sits at or above the top of both ranges, so the model errs conservative.
 * Deliberate: a too-high cost declines a deal we could have done, a too-low one
 * buys paper that loses money.
 *
 * ⚠️ THIS IS PER ACCOUNT, NOT PER DOLLAR OF FACE, and that distinction is
 * load-bearing for H3. Because it is a flat per-account charge, its drag in
 * bps of face scales INVERSELY with average balance:
 *
 *     $2,500 avg balance  ->   7 bps of face
 *     $833   avg balance  ->  21 bps
 *     $400   avg balance  ->  44 bps
 *
 * H3 proposes buying SMALL balances. This cost lands hardest precisely there —
 * roughly 14% of the entire price ceiling at a $400 average. Any model that
 * expresses servicing purely as bps of face hides this, and hides it in the
 * direction that flatters the thesis.
 */
export const UPFRONT_CENTS_PER_ACCOUNT = 175;

/** Collection horizon for a voluntary-only book. Incumbents underwrite to 180. */
export const DEFAULT_HORIZON_MONTHS = 48;

/**
 * Monthly share of total collections, as bps of the total, over `months`.
 * Geometric decay: each month retains `retentionBps` of the prior month's rate.
 * Normalised so the series sums to exactly 10_000 bps — the remainder lands on
 * month 1 so the sum is exact rather than approximately right.
 */
export function decayScheduleBps(months: number, retentionBps: number): number[] {
  if (months <= 0) throw new Error("months must be > 0");
  if (retentionBps <= 0 || retentionBps > 10_000) {
    throw new Error("retentionBps must be in (0, 10000]");
  }
  const raw: number[] = [];
  let w = 1;
  for (let m = 0; m < months; m++) {
    raw.push(w);
    w *= retentionBps / 10_000;
  }
  const total = raw.reduce((a, b) => a + b, 0);
  const out = raw.map((x) => Math.round((x * 10_000) / total));
  const drift = 10_000 - out.reduce((a, b) => a + b, 0);
  out[0] += drift;
  return out;
}

/** Present value of a cashflow series (index 0 = now) at a monthly rate in bps. */
export function npvCents(cashflowsCents: number[], monthlyRateBps: number): number {
  const r = monthlyRateBps / 10_000;
  let pv = 0;
  for (let t = 0; t < cashflowsCents.length; t++) {
    pv += cashflowsCents[t] / Math.pow(1 + r, t);
  }
  return Math.round(pv);
}

/**
 * Annualised IRR in bps, by bisection on the monthly rate.
 * Returns null when the series has no sign change — an all-negative or
 * all-positive series has no IRR, and returning a number there would be a lie.
 */
export function irrAnnualBps(cashflowsCents: number[]): number | null {
  const hasPos = cashflowsCents.some((c) => c > 0);
  const hasNeg = cashflowsCents.some((c) => c < 0);
  if (!hasPos || !hasNeg) return null;

  const f = (r: number) =>
    cashflowsCents.reduce((acc, c, t) => acc + c / Math.pow(1 + r, t), 0);

  // A conventional series (one outflow, then inflows) has exactly one root and
  // f is strictly decreasing in r, so we bracket it explicitly.
  //
  // The previous implementation fixed the bracket at [-0.9999, 1.0] and tested
  // it with f(lo) * f(mid) <= 0. At long horizons that is catastrophic: with
  // 180 periods, (1 + -0.9999)^180 = 1e-720 underflows to zero, f(lo) becomes
  // Infinity, the product becomes NaN, `NaN <= 0` is false, so the search drove
  // lo upward every iteration and converged on the UPPER bound — reporting
  // 409,500% annual on a deal with negative NPV. Every intermediate value is
  // now checked for finiteness, and bracketing uses signs, never products.
  let hi = 1.0;
  for (let i = 0; i < 60 && f(hi) > 0; i++) hi *= 2;
  const fHi = f(hi);
  if (!Number.isFinite(fHi) || fHi > 0) return null;

  let lo = -0.5;
  for (let i = 0; i < 60; i++) {
    const v = f(lo);
    if (!Number.isFinite(v)) return null; // cannot bracket without overflow
    if (v > 0) break;
    lo = (lo - 1) / 2; // step halfway toward -1
  }
  const fLo = f(lo);
  if (!Number.isFinite(fLo) || fLo <= 0) return null;

  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    const v = f(mid);
    if (!Number.isFinite(v)) return null;
    if (v > 0) lo = mid;
    else hi = mid;
  }

  const monthly = (lo + hi) / 2;
  if (!Number.isFinite(monthly) || monthly <= -1) return null;
  const annual = Math.pow(1 + monthly, 12) - 1;
  if (!Number.isFinite(annual)) return null;
  return Math.round(annual * 10_000);
}

export type UnderwriteInput = {
  faceCents: number;
  /** Price the seller is asking, in bps of face. */
  priceBps: number;
  /** Share of collections forfeited by never litigating. NO DEFAULT — see note above. */
  legalShareBps: number;
  /**
   * All-channel gross recovery in bps of face. NO DEFAULT — see the note at the
   * top of this file. underwrite() is linear in this, so a wrong value scales
   * every ceiling proportionally. Choose from GROSS_RECOVERY_BPS_JCAP_LOW/HIGH
   * or pass your own sourced figure.
   */
  grossRecoveryBps: number;
  /** Collection-proportional servicing, in bps of face. Excludes up-front costs. */
  servicingBps?: number;
  /**
   * Account count. Required to model up-front per-account servicing. Omit only
   * when `upfrontCentsPerAccount` is 0 — otherwise the model silently ignores a
   * cost that dominates small-balance portfolios.
   */
  accounts?: number;
  upfrontCentsPerAccount?: number;
  horizonMonths?: number;
  /** Monthly retention of the collection rate. 9000 = each month is 90% of the last. */
  retentionBps?: number;
  hurdleAnnualBps?: number;
};

export type UnderwriteResult = {
  purchasePriceCents: number;
  /** Charged at t=0 on every account, paying or not. */
  upfrontServicingCents: number;
  upfrontServicingBps: number;
  /** Spread pro-rata with collections. */
  variableServicingCents: number;
  servicingCents: number; // upfront + variable
  breakEvenCents: number;
  breakEvenBps: number;
  expectedGrossCents: number;
  expectedGrossBps: number;
  expectedNetCents: number;
  /** Undiscounted gross collections ÷ purchase price. The industry's "multiple". */
  grossMultiple: number;
  npvCents: number;
  irrAnnualBps: number | null;
  /** PV of net inflows — the most we can pay and still clear the hurdle. */
  maxPriceCents: number;
  maxPriceBps: number;
  clearsHurdle: boolean;
  /**
   * True when the PV of net inflows does not even cover up-front servicing —
   * the paper loses money at a price of zero. Reported rather than thrown: a
   * worthless tape is a real answer you want to see, not an exception to catch.
   * When true, `maxPriceCents` is negative and is NOT a price. It is the
   * subsidy the seller would have to pay us to take it.
   */
  unacquirableAtAnyPrice: boolean;
};

/**
 * Underwrite one portfolio (or one account) at a quoted price.
 *
 * `maxPriceBps` is the output that matters: it is what we can pay and still
 * clear the hurdle, so it is the number to take into a negotiation. If the
 * seller's `priceBps` exceeds it, the deal does not clear — regardless of how
 * healthy the gross multiple looks.
 */
export type Scenario = {
  label: string;
  legalShareBps: number;
  grossRecoveryBps: number;
  maxPriceBps: number;
  clearsHurdle: boolean;
  unacquirableAtAnyPrice: boolean;
};

/**
 * Max price across the two most uncertain inputs.
 *
 * A single number implies a precision this model does not have. Its three most
 * load-bearing inputs are a contradiction (legal share: 25% vs 48.2%), an
 * unsourced estimate (the scrub half of up-front cost), and a placeholder
 * (servicing). Quote a RANGE to a broker, not a point.
 *
 * `input.legalShareBps` and `input.grossRecoveryBps` are ignored — this sweeps
 * them deliberately.
 */
export function stressTest(input: UnderwriteInput): Scenario[] {
  const legalShares: Array<[string, number]> = [
    ["plan L=25%", LEGAL_SHARE_BPS_PLAN],
    ["moderate substitution L=35%", 3_500],
    ["verified, no substitution L=48.2%", LEGAL_SHARE_BPS_VERIFIED],
  ];
  // Sweeps the JCAP-implied band, plus a point BELOW it. The band itself mixes
  // populations (blended price × US-only multiple), so the true uncertainty is
  // wider than the band, not narrower. A sweep that only spans 1100–1200 would
  // understate how little we know.
  const recoveries: Array<[string, number]> = [
    ["recovery below band (8.25¢)", Math.round(GROSS_RECOVERY_BPS_JCAP_LOW * 0.75)],
    ["JCAP band low (11¢)", GROSS_RECOVERY_BPS_JCAP_LOW],
    ["JCAP band high (12¢)", GROSS_RECOVERY_BPS_JCAP_HIGH],
  ];

  const out: Scenario[] = [];
  for (const [lLabel, legalShareBps] of legalShares) {
    for (const [rLabel, grossRecoveryBps] of recoveries) {
      const r = underwrite({ ...input, legalShareBps, grossRecoveryBps });
      out.push({
        label: `${lLabel} · ${rLabel}`,
        legalShareBps,
        grossRecoveryBps,
        maxPriceBps: r.maxPriceBps,
        clearsHurdle: r.clearsHurdle,
        unacquirableAtAnyPrice: r.unacquirableAtAnyPrice,
      });
    }
  }
  return out;
}

export function underwrite(input: UnderwriteInput): UnderwriteResult {
  const {
    faceCents,
    priceBps,
    legalShareBps,
    grossRecoveryBps,
    servicingBps = SERVICING_BPS,
    accounts,
    upfrontCentsPerAccount = UPFRONT_CENTS_PER_ACCOUNT,
    horizonMonths = DEFAULT_HORIZON_MONTHS,
    retentionBps = 9_000,
    hurdleAnnualBps = HURDLE_ANNUAL_BPS,
  } = input;

  // Validate every input that can move the answer. A negative cost reads as
  // revenue and inflates what we would pay — i.e. every gap here fails in the
  // direction that makes a bad tape look buyable. Adversarial review found
  // three of these; treat the whole surface as hostile.
  const positive: Array<[string, number]> = [
    ["faceCents", faceCents],
    ["grossRecoveryBps", grossRecoveryBps],
    ["horizonMonths", horizonMonths],
    ["retentionBps", retentionBps],
  ];
  for (const [name, v] of positive) {
    if (!Number.isFinite(v) || v <= 0) throw new Error(`${name} must be > 0`);
  }
  const nonNegative: Array<[string, number]> = [
    ["priceBps", priceBps],
    ["servicingBps", servicingBps],
    ["upfrontCentsPerAccount", upfrontCentsPerAccount],
    ["hurdleAnnualBps", hurdleAnnualBps],
  ];
  for (const [name, v] of nonNegative) {
    if (!Number.isFinite(v) || v < 0) throw new Error(`${name} must be >= 0`);
  }
  // Upper bounds. Round 2 closed the negative-cost hole but left the parameter
  // that most directly drives price unbounded: grossRecoveryBps = 50000 (a
  // claimed 500% recovery) produced a recommendation to pay 235% of FACE for
  // charged-off paper. The industry's best recover ~17%.
  const atMostFace: Array<[string, number]> = [
    ["grossRecoveryBps", grossRecoveryBps],
    ["priceBps", priceBps],
    ["servicingBps", servicingBps],
  ];
  for (const [name, v] of atMostFace) {
    if (v > 10_000) throw new Error(`${name} must be <= 10000 (100% of face)`);
  }
  // retentionBps == 10000 means no decay at all — a flat annuity, not a
  // collection curve, and it makes the schedule's rounding drift visible.
  if (retentionBps >= 10_000) throw new Error("retentionBps must be < 10000");
  if (!Number.isInteger(upfrontCentsPerAccount)) {
    throw new Error("upfrontCentsPerAccount must be an integer number of cents");
  }
  if (!Number.isInteger(horizonMonths)) {
    throw new Error("horizonMonths must be an integer");
  }
  if (accounts !== undefined) {
    if (!Number.isInteger(accounts) || accounts <= 0) {
      // Fractional accounts were silently rounded before. You cannot mail half
      // a validation notice.
      throw new Error("accounts must be a positive integer");
    }
  }
  // Refuse to silently drop a cost that dominates small-balance portfolios.
  if (accounts === undefined && upfrontCentsPerAccount > 0) {
    throw new Error(
      "accounts is required when upfrontCentsPerAccount > 0 — " +
        "per-account up-front servicing cannot be modelled without a count. " +
        "Pass accounts, or set upfrontCentsPerAccount: 0 to opt out explicitly.",
    );
  }

  const purchasePriceCents = bpsOfFace(faceCents, priceBps);
  const upfrontServicingCents = accounts
    ? Math.round(accounts * upfrontCentsPerAccount)
    : 0;
  const variableServicingCents = bpsOfFace(faceCents, servicingBps);
  const servicingCents = upfrontServicingCents + variableServicingCents;
  const breakEven = purchasePriceCents + servicingCents;

  const expectedGrossBps = voluntaryBaselineBps(legalShareBps, grossRecoveryBps);
  const expectedGrossCents = bpsOfFace(faceCents, expectedGrossBps);
  const expectedNetCents = expectedGrossCents - servicingCents;

  // Variable servicing is spread in proportion to collections — you do not pay
  // to work an account you never collect on. Up-front servicing is NOT: the
  // validation notice goes out on every account at t=0 whether it ever pays.
  const schedule = decayScheduleBps(horizonMonths, retentionBps);
  const netOfVariable = expectedGrossCents - variableServicingCents;
  const netInflows = schedule.map((wBps) =>
    Math.round((netOfVariable * wBps) / 10_000),
  );

  const monthlyRateBps = Math.round(
    (Math.pow(1 + hurdleAnnualBps / 10_000, 1 / 12) - 1) * 10_000,
  );

  // Up-front servicing is spent at t=0 alongside the purchase price, so it
  // reduces what is left over for the seller one-for-one, undiscounted.
  const maxPriceCents =
    npvCents([0, ...netInflows], monthlyRateBps) - upfrontServicingCents;
  const cashflows = [-purchasePriceCents - upfrontServicingCents, ...netInflows];

  const npv = npvCents(cashflows, monthlyRateBps);
  let irr = irrAnnualBps(cashflows);

  // NPV and IRR must agree about whether the deal clears: NPV < 0 at the hurdle
  // implies IRR < hurdle, and vice versa. If they disagree the IRR search has
  // gone wrong, and reporting NO number is safer than reporting a wrong one on
  // a page someone uses to decide what to pay.
  if (irr !== null) {
    const disagrees =
      (npv < 0 && irr > hurdleAnnualBps) || (npv > 0 && irr < hurdleAnnualBps);
    if (disagrees) irr = null;
  }

  return {
    purchasePriceCents,
    upfrontServicingCents,
    upfrontServicingBps: Math.round((upfrontServicingCents * 10_000) / faceCents),
    variableServicingCents,
    servicingCents,
    breakEvenCents: breakEven,
    breakEvenBps: Math.round((breakEven * 10_000) / faceCents),
    expectedGrossCents,
    expectedGrossBps,
    expectedNetCents,
    grossMultiple:
      purchasePriceCents > 0 ? expectedGrossCents / purchasePriceCents : Infinity,
    npvCents: npv,
    irrAnnualBps: irr,
    maxPriceCents,
    // FLOOR, not round. This is a CEILING — the most we can pay and still clear
    // the hurdle — so rounding up quotes a broker a price above our true limit
    // and we overpay. The flattering direction, again. Caught 28 Aug 2026 when
    // the gross-recovery correction pushed maxPriceBps down to single digits,
    // where rounding 5.9 up to 6 is a 1.6% overpay instead of a rounding crumb.
    // Math.floor of a negative stays correctly negative for unacquirable tapes.
    maxPriceBps: Math.floor((maxPriceCents * 10_000) / faceCents),
    clearsHurdle: purchasePriceCents <= maxPriceCents,
    unacquirableAtAnyPrice: maxPriceCents < 0,
  };
}
