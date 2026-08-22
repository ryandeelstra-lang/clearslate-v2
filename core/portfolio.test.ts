// Tests for core/portfolio.ts. Zero dependencies — node:test + node:assert.
// Run: node --experimental-strip-types --test core/portfolio.test.ts
//
// The v1 web app shipped with zero tests and several math bugs reached a
// rendered page. The v1 backend had 215. Follow the backend's precedent.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  decayScheduleBps,
  irrAnnualBps,
  npvCents,
  stressTest,
  underwrite,
  GROSS_RECOVERY_BPS,
  HURDLE_ANNUAL_BPS,
  LEGAL_SHARE_BPS_PLAN,
  LEGAL_SHARE_BPS_VERIFIED,
  SERVICING_BPS,
  breakEvenCents,
  bpsOfFace,
  clearingPaymentCents,
  matchBeatsBaseline,
  matchOutcome,
  netPerDollarFaceBps,
  purchasePriceCents,
  servicingCostCents,
  voluntaryBaselineBps,
} from "./portfolio.ts";

// Derived, not hardcoded — see the contradiction note in portfolio.ts.
const BASELINE_PLAN = voluntaryBaselineBps(LEGAL_SHARE_BPS_PLAN); // 1260 bps
const BASELINE_VERIFIED = voluntaryBaselineBps(LEGAL_SHARE_BPS_VERIFIED); // 870 bps

// The worked example from docs/decisions/h3-ownership-as-product.md.
const FACE = 423_700; // $4,237.00
const PRICE_BPS = 500; // 5¢ per $1 of face

test("worked example: purchase price, servicing, and break-even", () => {
  assert.equal(purchasePriceCents(FACE, PRICE_BPS), 21_185); // $211.85
  assert.equal(servicingCostCents(FACE), 22_922); // $229.22
  assert.equal(breakEvenCents(FACE, PRICE_BPS), 44_107); // $441.07
});

test("break-even is 10.4¢ of face", () => {
  const breakEven = breakEvenCents(FACE, PRICE_BPS);
  const bps = Math.round((breakEven * 10_000) / FACE);
  assert.equal(bps, 1041); // 10.41¢ per $1 of face
});

// The regression this file exists for. An earlier draft of the H3 document used
// face / R and reported $1,059.25 at 4:1. The correct divisor is (R + 1).
test("clearing payment uses (ratio + 1), not ratio", () => {
  assert.equal(clearingPaymentCents(FACE, 4), 84_740); // $847.40, NOT $1,059.25
  assert.equal(clearingPaymentCents(FACE, 3), 105_925); // $1,059.25 is the 3:1 figure
  assert.equal(clearingPaymentCents(FACE, 1), 211_850); // $2,118.50
  assert.equal(clearingPaymentCents(FACE, 0), FACE); // no match = pay it all
});

test("clearing payment as a share of face matches the documented ladder", () => {
  const share = (ratio: number) =>
    Math.round((clearingPaymentCents(FACE, ratio) * 10_000) / FACE);
  assert.equal(share(1), 5000); // 50¢
  assert.equal(share(3), 2500); // 25¢
  assert.equal(share(4), 2000); // 20¢
});

test("paying the clearing amount takes the balance to exactly zero", () => {
  for (const ratio of [0, 1, 2, 3, 4, 7]) {
    const pay = clearingPaymentCents(FACE, ratio);
    const out = matchOutcome(FACE, ratio, pay);
    assert.equal(out.remainingCents, 0, `ratio ${ratio} should clear`);
    assert.equal(out.clearsBalance, true);
  }
});

test("cancellation caps at face — a consumer is never credited past zero", () => {
  const out = matchOutcome(FACE, 4, 100_000); // overpays the $847.40 clearing amount
  assert.equal(out.cancelledCents, FACE); // capped, not 500_000
  assert.equal(out.remainingCents, 0);
  assert.ok(out.remainingCents >= 0, "balance must never go negative");
});

test("partial payment leaves the expected remainder", () => {
  const out = matchOutcome(FACE, 1, 50_000); // $500 at 1:1
  assert.equal(out.cancelledCents, 100_000); // $1,000 off the balance
  assert.equal(out.matchedCents, 50_000); // half of it forgiven by us
  assert.equal(out.remainingCents, 323_700); // $3,237.00
  assert.equal(out.clearsBalance, false);
});

// The central claim of H3: net is independent of the match ratio.
//
// An earlier version of this test looped over ratios without using the loop
// variable — it called one pure function five times with identical arguments
// and proved nothing. Flagged in adversarial review. This version actually
// varies the ratio: different ratios, SAME cash collected, and checks that both
// the cancelled balance differs (so the ratio genuinely did something) and the
// net is unchanged (so it did nothing to us).
test("net is invariant to ratio at fixed cash collected", () => {
  const collected = 84_740; // what the consumer actually pays, held constant
  const nets = new Set<number>();
  const cancellations = new Set<number>();

  for (const ratio of [1, 2, 3, 4, 7]) {
    const out = matchOutcome(FACE, ratio, collected);
    cancellations.add(out.cancelledCents);
    nets.add(netPerDollarFaceBps(out.consumerPaidCents, FACE));
  }

  assert.equal(nets.size, 1, "net must not vary with ratio");
  assert.ok(cancellations.size > 1, "ratio must actually change the balance cancelled");
  // 84_740 collected − 22_922 servicing = 61_818 net on 423_700 face = 1459 bps
  assert.equal([...nets][0], 1459);
});

test("match beats baseline iff cash collected exceeds the baseline", () => {
  const atBaseline = bpsOfFace(FACE, BASELINE_PLAN); // exactly 12.6¢
  assert.equal(matchBeatsBaseline(atBaseline, FACE, BASELINE_PLAN).beatsBaseline, false);
  assert.equal(matchBeatsBaseline(atBaseline + 1_000, FACE, BASELINE_PLAN).beatsBaseline, true);
  assert.equal(matchBeatsBaseline(atBaseline - 1_000, FACE, BASELINE_PLAN).beatsBaseline, false);

  // The 4:1 clearing payment comfortably beats the baseline.
  const clearing = matchBeatsBaseline(clearingPaymentCents(FACE, 4), FACE, BASELINE_PLAN);
  assert.equal(clearing.beatsBaseline, true);
  assert.equal(clearing.collectedBps, 2000);
  assert.equal(clearing.marginBps, 2000 - BASELINE_PLAN);
});

// The contradiction this model exists to keep visible.
test("the two legal-share assumptions give materially different baselines", () => {
  assert.equal(BASELINE_PLAN, 1260); // 16.8¢ × (1 − 0.25)
  assert.equal(BASELINE_VERIFIED, 870); // 16.8¢ × (1 − 0.482)
  // Net of servicing the gap is more than 2×, which is why no default is exported.
  const netPlan = BASELINE_PLAN - SERVICING_BPS; // 719 bps
  const netVerified = BASELINE_VERIFIED - SERVICING_BPS; // 329 bps
  assert.equal(netPlan, 719);
  assert.equal(netVerified, 329);
  assert.ok(netPlan > netVerified * 2, "the choice of legal share more than doubles net");
});

test("voluntaryBaselineBps rejects impossible shares", () => {
  assert.throws(() => voluntaryBaselineBps(-1));
  assert.throws(() => voluntaryBaselineBps(10_001));
  assert.equal(voluntaryBaselineBps(0), GROSS_RECOVERY_BPS); // litigate everything
  assert.equal(voluntaryBaselineBps(10_000), 0); // legal is the only channel
});

test("decay schedule sums to exactly 10000 bps and declines", () => {
  for (const [months, ret] of [[48, 9_000], [12, 5_000], [180, 9_800], [1, 9_000]] as const) {
    const s = decayScheduleBps(months, ret);
    assert.equal(s.length, months);
    assert.equal(s.reduce((a, b) => a + b, 0), 10_000, `${months}/${ret} must sum to 10000`);
    for (let i = 1; i < s.length; i++) {
      assert.ok(s[i] <= s[i - 1], "weights must be non-increasing");
    }
  }
  assert.throws(() => decayScheduleBps(0, 9_000));
  assert.throws(() => decayScheduleBps(48, 0));
});

test("npv discounts — later money is worth less", () => {
  assert.equal(npvCents([1_000], 100), 1_000); // t=0 is undiscounted
  assert.ok(npvCents([0, 1_000], 100) < 1_000);
  assert.equal(npvCents([0, 1_000], 0), 1_000); // zero rate = no discount
});

test("irr returns null when there is no sign change", () => {
  assert.equal(irrAnnualBps([100, 200, 300]), null); // all positive
  assert.equal(irrAnnualBps([-100, -200]), null); // all negative
  assert.equal(irrAnnualBps([]), null);
});

test("irr recovers a known rate", () => {
  // Pay 100 now, receive 110 in 12 months => ~10% annual.
  const cf = [-10_000, ...Array(11).fill(0), 11_000];
  const irr = irrAnnualBps(cf);
  assert.ok(irr !== null);
  assert.ok(Math.abs(irr! - 1_000) < 20, `expected ~1000bps, got ${irr}`);
});

test("underwrite: max price is the decision output", () => {
  const r = underwrite({
    faceCents: 100_000_000, // $1,000,000 face
    accounts: 1_200, // avg $833
    priceBps: 500, // asking 5¢
    legalShareBps: LEGAL_SHARE_BPS_VERIFIED,
  });
  // Discounting must reduce what we can pay below the undiscounted net.
  assert.ok(r.maxPriceCents < r.expectedNetCents, "PV must be below undiscounted net");
  assert.equal(r.clearsHurdle, r.purchasePriceCents <= r.maxPriceCents);
  // NPV and the verdict must never disagree.
  assert.equal(r.clearsHurdle, r.npvCents >= 0, "NPV sign must match the verdict");
});

test("underwrite: the verified legal share is harsher than the plan's", () => {
  const base = { faceCents: 100_000_000, accounts: 1_200, priceBps: 500 };
  const plan = underwrite({ ...base, legalShareBps: LEGAL_SHARE_BPS_PLAN });
  const verified = underwrite({ ...base, legalShareBps: LEGAL_SHARE_BPS_VERIFIED });
  assert.ok(verified.maxPriceBps < plan.maxPriceBps, "48.2% must permit a lower price than 25%");
  assert.ok(verified.expectedGrossBps < plan.expectedGrossBps);
});

test("underwrite: a free portfolio always clears, an absurd price never does", () => {
  const base = { faceCents: 100_000_000, accounts: 1_200, legalShareBps: LEGAL_SHARE_BPS_VERIFIED };
  assert.equal(underwrite({ ...base, priceBps: 0 }).clearsHurdle, true);
  assert.equal(underwrite({ ...base, priceBps: 10_000 }).clearsHurdle, false); // paying face
});

test("underwrite: a longer horizon at equal total collections is worth less", () => {
  const base = {
    faceCents: 100_000_000,
    accounts: 1_200,
    priceBps: 300,
    legalShareBps: LEGAL_SHARE_BPS_VERIFIED,
    retentionBps: 9_900, // slow decay, so horizon genuinely extends the tail
  };
  const short = underwrite({ ...base, horizonMonths: 48 });
  const long = underwrite({ ...base, horizonMonths: 180 });
  assert.equal(short.expectedGrossCents, long.expectedGrossCents, "same total collected");
  assert.ok(long.maxPriceCents < short.maxPriceCents, "the same money later is worth less");
});

// The load-bearing invariant: maxPrice is the price at which NPV crosses zero.
// If these ever disagree, the verdict is meaningless. Flagged in adversarial review.
test("underwrite: NPV is ~0 when priced exactly at maxPrice", () => {
  const base = {
    faceCents: 100_000_000,
    accounts: 1_200,
    legalShareBps: LEGAL_SHARE_BPS_VERIFIED,
  };
  const r = underwrite({ ...base, priceBps: 500 });
  const atMax = underwrite({ ...base, priceBps: r.maxPriceBps });
  // Within rounding of one bps of face on a $1M tape.
  assert.ok(
    Math.abs(atMax.npvCents) < 10_000,
    `NPV at maxPrice should be ~0, got ${atMax.npvCents}`,
  );
  assert.equal(atMax.clearsHurdle, true, "pricing at the ceiling must still clear");
  assert.equal(underwrite({ ...base, priceBps: r.maxPriceBps + 25 }).clearsHurdle, false);
});

// Up-front servicing is charged PER ACCOUNT, so its drag in bps of face scales
// inversely with average balance. This is the finding adversarial review
// understated: it lands hardest on exactly the small balances H3 wants to buy.
test("up-front servicing punishes small balances", () => {
  const face = 100_000_000; // $1,000,000 held constant
  const drag = (accounts: number) =>
    underwrite({
      faceCents: face,
      accounts,
      priceBps: 300,
      legalShareBps: LEGAL_SHARE_BPS_VERIFIED,
    }).upfrontServicingBps;

  const big = drag(400); // avg $2,500
  const mid = drag(1_200); // avg $833
  const small = drag(2_500); // avg $400

  assert.ok(small > mid && mid > big, "smaller balances must carry more drag per $1 of face");
  assert.equal(big, 7); // 7 bps
  assert.equal(small, 44); // 44 bps — over 6x
  // At a ~305 bps ceiling this is ~14% of the entire budget.
  assert.ok(small > 40, "small-balance drag must remain visible, not rounded away");
});

test("underwrite refuses to silently ignore per-account cost", () => {
  // accounts omitted while upfront cost is non-zero => throw, never a quiet zero.
  assert.throws(
    () => underwrite({ faceCents: 100_000_000, priceBps: 300, legalShareBps: 4_820 }),
    /accounts is required/,
  );
  // Opting out explicitly is allowed.
  const optedOut = underwrite({
    faceCents: 100_000_000,
    priceBps: 300,
    legalShareBps: 4_820,
    upfrontCentsPerAccount: 0,
  });
  assert.equal(optedOut.upfrontServicingCents, 0);
  assert.throws(() =>
    underwrite({ faceCents: 100_000_000, accounts: 0, priceBps: 300, legalShareBps: 4_820 }),
  );
});

test("underwrite: up-front cost lowers what we can pay", () => {
  const base = {
    faceCents: 100_000_000,
    accounts: 2_500,
    priceBps: 300,
    legalShareBps: LEGAL_SHARE_BPS_VERIFIED,
  };
  const withCost = underwrite(base);
  const without = underwrite({ ...base, upfrontCentsPerAccount: 0 });
  assert.ok(
    withCost.maxPriceBps < without.maxPriceBps,
    "modelling up-front cost must reduce the ceiling, not raise it",
  );
});

// Every gap here failed in the direction that makes a bad tape look buyable.
// A negative cost reads as revenue. Found in adversarial review round 2.
// Round 3: grossRecoveryBps was unbounded. At 50000 (a claimed 500% recovery)
// the model recommended paying 235% of FACE for charged-off paper.
test("underwrite rejects recovery/price/servicing above 100% of face", () => {
  const ok = {
    faceCents: 100_000_000,
    accounts: 1_200,
    priceBps: 300,
    legalShareBps: LEGAL_SHARE_BPS_VERIFIED,
  };
  assert.throws(() => underwrite({ ...ok, grossRecoveryBps: 50_000 }), /<= 10000/);
  assert.throws(() => underwrite({ ...ok, grossRecoveryBps: 10_001 }), /<= 10000/);
  assert.throws(() => underwrite({ ...ok, priceBps: 10_001 }), /<= 10000/);
  assert.throws(() => underwrite({ ...ok, servicingBps: 10_001 }), /<= 10000/);
  assert.throws(() => underwrite({ ...ok, retentionBps: 10_000 }), /< 10000/);
  assert.throws(() => underwrite({ ...ok, upfrontCentsPerAccount: 0.5 }), /integer/);
  assert.throws(() => underwrite({ ...ok, horizonMonths: 48.5 }), /integer/);
  // Sanity: we can never be told to pay more than face.
  const r = underwrite({ ...ok, grossRecoveryBps: 10_000 });
  assert.ok(r.maxPriceBps <= 10_000, "max price must never exceed face value");
});

// Round 3: at a 180-month horizon this reported 409,500% IRR on a deal with
// -$2.16M NPV. Root cause: (1 + -0.9999)^180 underflows to 0, f(lo) becomes
// Infinity, `NaN <= 0` is false, and the bisection converged on the UPPER bound.
test("IRR never contradicts NPV, at any horizon", () => {
  for (const horizonMonths of [12, 48, 120, 180, 360]) {
    for (const priceBps of [50, 300, 900, 5_000]) {
      const r = underwrite({
        faceCents: 100_000_000,
        accounts: 1_200,
        priceBps,
        horizonMonths,
        legalShareBps: LEGAL_SHARE_BPS_VERIFIED,
      });
      if (r.irrAnnualBps === null) continue;
      const label = `${horizonMonths}mo @ ${priceBps}bps -> npv ${r.npvCents}, irr ${r.irrAnnualBps}`;
      if (r.npvCents < 0) {
        assert.ok(r.irrAnnualBps <= HURDLE_ANNUAL_BPS, `negative NPV needs IRR <= hurdle: ${label}`);
      }
      if (r.npvCents > 0) {
        assert.ok(r.irrAnnualBps >= HURDLE_ANNUAL_BPS, `positive NPV needs IRR >= hurdle: ${label}`);
      }
    }
  }
});

// The exact scenario round 3 broke the model with. Kept as a named regression
// rather than a magnitude bound: an earlier draft of the test above asserted
// IRR < 10,000%, which FAILED on a legitimately spectacular deal (12 months at
// 0.5¢ returns ~4.6x, so the monthly rate is ~53% and annualising compounds it
// to ~18,000%). That is correct arithmetic, not a bug. The pathology to catch
// is the bisection pinning to its own search ceiling, which the NPV/IRR
// agreement invariant detects and a magnitude threshold does not.
test("the 180-month IRR pathology stays fixed", () => {
  const r = underwrite({
    faceCents: 100_000_000,
    accounts: 1_200,
    priceBps: 900,
    horizonMonths: 180,
    legalShareBps: LEGAL_SHARE_BPS_VERIFIED,
  });
  assert.ok(r.npvCents < 0, "this tape should lose money");
  // Previously reported 409,500% (monthly pinned at the 1.0 search ceiling).
  assert.ok(
    r.irrAnnualBps === null || r.irrAnnualBps <= HURDLE_ANNUAL_BPS,
    `losing tape must not report a rate above the hurdle, got ${r.irrAnnualBps}`,
  );
});

test("irr survives long horizons without overflowing", () => {
  // 180 monthly inflows after one outflow — the shape that broke the old search.
  const cf = [-100_000, ...Array(180).fill(1_000)];
  const irr = irrAnnualBps(cf);
  assert.ok(irr !== null, "should find a rate");
  assert.ok(irr! > 0 && irr! < 100_000, `expected a sane positive rate, got ${irr}`);
});

test("underwrite rejects inputs that would flatter a bad deal", () => {
  const ok = {
    faceCents: 100_000_000,
    accounts: 1_200,
    priceBps: 300,
    legalShareBps: LEGAL_SHARE_BPS_VERIFIED,
  };
  // Negative costs read as revenue and inflate maxPrice.
  assert.throws(() => underwrite({ ...ok, upfrontCentsPerAccount: -100 }), /must be >= 0/);
  assert.throws(() => underwrite({ ...ok, servicingBps: -100 }), /must be >= 0/);
  assert.throws(() => underwrite({ ...ok, hurdleAnnualBps: -1 }), /must be >= 0/);
  // Nonsense scalars.
  assert.throws(() => underwrite({ ...ok, grossRecoveryBps: 0 }), /must be > 0/);
  assert.throws(() => underwrite({ ...ok, horizonMonths: 0 }), /must be > 0/);
  assert.throws(() => underwrite({ ...ok, retentionBps: 0 }), /must be > 0/);
  assert.throws(() => underwrite({ ...ok, faceCents: NaN }), /must be > 0/);
  // You cannot mail half a validation notice.
  assert.throws(() => underwrite({ ...ok, accounts: 1_200.7 }), /positive integer/);
  assert.throws(() => underwrite({ ...ok, accounts: -5 }), /positive integer/);
});

test("a tape that loses money at zero price is flagged, not thrown", () => {
  // Tiny balances: per-account up-front cost swamps everything collectable.
  const r = underwrite({
    faceCents: 1_000_000, // $10,000 face
    accounts: 5_000, // avg $2.00 — absurd on purpose
    priceBps: 0,
    legalShareBps: LEGAL_SHARE_BPS_VERIFIED,
  });
  assert.equal(r.unacquirableAtAnyPrice, true);
  assert.ok(r.maxPriceCents < 0, "max price is negative — a required subsidy, not a price");
  assert.equal(r.clearsHurdle, false, "free is still too expensive");
});

test("a healthy tape is not flagged unacquirable", () => {
  const r = underwrite({
    faceCents: 100_000_000,
    accounts: 400,
    priceBps: 100,
    legalShareBps: LEGAL_SHARE_BPS_VERIFIED,
  });
  assert.equal(r.unacquirableAtAnyPrice, false);
  assert.ok(r.maxPriceCents > 0);
});

test("underwrite rejects invalid input", () => {
  assert.throws(() => underwrite({ faceCents: 0, priceBps: 500, legalShareBps: 4_820 }));
  assert.throws(() => underwrite({ faceCents: 1_000, priceBps: -1, legalShareBps: 4_820 }));
  assert.throws(() => underwrite({ faceCents: 1_000, priceBps: 500, legalShareBps: 10_001 }));
});

test("no floats leak — every money value is an integer", () => {
  const values = [
    bpsOfFace(FACE, SERVICING_BPS),
    purchasePriceCents(FACE, PRICE_BPS),
    servicingCostCents(FACE),
    breakEvenCents(FACE, PRICE_BPS),
    clearingPaymentCents(FACE, 4),
    netPerDollarFaceBps(84_740, FACE),
    matchBeatsBaseline(84_740, FACE).collectedBps,
  ];
  for (const v of values) {
    assert.ok(Number.isInteger(v), `${v} must be an integer`);
  }
  const out = matchOutcome(FACE, 4, 50_000);
  for (const v of [out.cancelledCents, out.matchedCents, out.remainingCents]) {
    assert.ok(Number.isInteger(v), `${v} must be an integer`);
  }
});

// Odd face values are where rounding bugs hide.
test("rounding is deterministic on awkward balances", () => {
  const odd = 41_733; // $417.33
  assert.ok(Number.isInteger(servicingCostCents(odd)));
  assert.ok(Number.isInteger(clearingPaymentCents(odd, 3)));
  // ceil, so the consumer never ends a cent short of clearing
  const pay = clearingPaymentCents(odd, 3);
  assert.ok(pay * 4 >= odd, "clearing payment must fully cover the balance");
  assert.equal(matchOutcome(odd, 3, pay).remainingCents, 0);
});

test("invalid inputs throw rather than returning nonsense", () => {
  assert.throws(() => clearingPaymentCents(FACE, -1));
  assert.throws(() => matchOutcome(FACE, 4, -1));
  assert.throws(() => netPerDollarFaceBps(1_000, 0));
  assert.throws(() => matchBeatsBaseline(1_000, 0));
});

test("stressTest sweeps both uncertain inputs and sweeps them monotonically", () => {
  const grid = stressTest({
    faceCents: 100_000_000,
    accounts: 2_500,
    priceBps: 300,
    legalShareBps: LEGAL_SHARE_BPS_VERIFIED, // ignored — the sweep overrides it
  });
  assert.equal(grid.length, 9, "3 legal shares x 3 recovery levels");

  // A higher legal share forfeits more, so it must never permit a higher price.
  for (const recovery of new Set(grid.map((s) => s.grossRecoveryBps))) {
    const row = grid
      .filter((s) => s.grossRecoveryBps === recovery)
      .sort((a, b) => a.legalShareBps - b.legalShareBps);
    for (let i = 1; i < row.length; i++) {
      assert.ok(
        row[i].maxPriceBps <= row[i - 1].maxPriceBps,
        "more legal share forfeited must not raise the ceiling",
      );
    }
  }
  // Higher recovery must never lower the ceiling.
  for (const legal of new Set(grid.map((s) => s.legalShareBps))) {
    const col = grid
      .filter((s) => s.legalShareBps === legal)
      .sort((a, b) => a.grossRecoveryBps - b.grossRecoveryBps);
    for (let i = 1; i < col.length; i++) {
      assert.ok(
        col[i].maxPriceBps >= col[i - 1].maxPriceBps,
        "more recovery must not lower the ceiling",
      );
    }
  }
});

test("stress spread is wide enough that a point estimate would mislead", () => {
  const grid = stressTest({
    faceCents: 100_000_000,
    accounts: 2_500,
    priceBps: 300,
    legalShareBps: LEGAL_SHARE_BPS_VERIFIED,
  });
  const ceilings = grid.map((s) => s.maxPriceBps);
  const lo = Math.min(...ceilings);
  const hi = Math.max(...ceilings);
  // ~0.60c to ~9.16c on the documented placeholders: a 15x spread driven
  // entirely by unresolved assumptions. This is why the CLI quotes a range.
  assert.ok(hi > lo * 5, `expected a wide spread, got ${lo}-${hi} bps`);
});

// The CLI is a second surface over the same math and can drift from it.
// Round 4 found --json always exiting 0 even on a failing tape, so a script
// parsing JSON could not branch the way a human reading the verdict does.
test("CLI agrees with the API, and its exit code matches the verdict", async () => {
  const { execFileSync } = await import("node:child_process");
  const cli = new URL("./underwrite.ts", import.meta.url).pathname;

  const run = (args: string[]) => {
    try {
      const stdout = execFileSync(
        process.execPath,
        ["--experimental-strip-types", cli, ...args],
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );
      return { code: 0, stdout };
    } catch (e) {
      const err = e as { status: number; stdout: string };
      return { code: err.status, stdout: err.stdout };
    }
  };

  for (const [priceBps, expectClears] of [[100, true], [900, false]] as const) {
    const args = [
      "--face", "1000000",
      "--accounts", "1200",
      "--price-bps", String(priceBps),
      "--legal-share-bps", String(LEGAL_SHARE_BPS_VERIFIED),
      "--json",
    ];
    const { code, stdout } = run(args);
    const parsed = JSON.parse(stdout);

    const direct = underwrite({
      faceCents: 100_000_000,
      accounts: 1_200,
      priceBps,
      legalShareBps: LEGAL_SHARE_BPS_VERIFIED,
    });

    assert.equal(parsed.result.maxPriceBps, direct.maxPriceBps, "CLI must not drift from the API");
    assert.equal(parsed.result.clearsHurdle, direct.clearsHurdle);
    assert.equal(parsed.result.npvCents, direct.npvCents);
    assert.equal(direct.clearsHurdle, expectClears);
    // Exit code must carry the verdict, in JSON mode too.
    assert.equal(code, expectClears ? 0 : 1, `exit code should reflect the verdict at ${priceBps}bps`);
  }
});
