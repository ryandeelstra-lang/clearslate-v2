// Debt-portfolio entry pricing and match-mechanic math for H3
// (docs/decisions/h3-ownership-as-product.md).
//
// All money is integer cents — no floats. All rates are integer BASIS POINTS of
// face value: 500 bps = 5¢ per $1 of face = 5% of face. Basis points are used
// rather than "cents per dollar" because the servicing figure (5.41¢) is not a
// whole number of cents, and a float there would leak into every downstream sum.

// Voluntary-channel gross recovery, per v2-plan.md: 16.8¢ industry gross × 0.75
// for removing the legal channel at L=25% = 12.6¢ per $1 of face.
//
// This is the number a match has to beat. See matchBeatsBaseline below for why
// it is the ONLY number a match has to beat.
export const VOLUNTARY_BASELINE_BPS = 1260;

// Fully-loaded servicing stack per $1 of face, per v2-plan.md.
// NOTE: this is a PLACEHOLDER pending U6. It is not an observed figure.
export const SERVICING_BPS = 541;

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
// COLLECTED above the voluntary-only baseline of 12.6¢ per $1 of face.
//
// The ratio is therefore behaviourally free — it costs nothing directly, and
// matters only through (a) its effect on how much people actually pay and
// (b) the clearing cap, where a generous ratio lets a high-intent account zero
// out for less than it would otherwise have paid.
export function matchBeatsBaseline(
  collectedCents: number,
  faceCents: number,
  baselineBps = VOLUNTARY_BASELINE_BPS,
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
