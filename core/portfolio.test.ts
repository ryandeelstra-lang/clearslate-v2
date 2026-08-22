// Tests for core/portfolio.ts. Zero dependencies — node:test + node:assert.
// Run: node --experimental-strip-types --test core/portfolio.test.ts
//
// The v1 web app shipped with zero tests and several math bugs reached a
// rendered page. The v1 backend had 215. Follow the backend's precedent.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  SERVICING_BPS,
  VOLUNTARY_BASELINE_BPS,
  breakEvenCents,
  bpsOfFace,
  clearingPaymentCents,
  matchBeatsBaseline,
  matchOutcome,
  netPerDollarFaceBps,
  purchasePriceCents,
  servicingCostCents,
} from "./portfolio.ts";

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
test("net per $1 face is invariant to ratio at fixed collections", () => {
  const collected = 84_740;
  const baseline = netPerDollarFaceBps(collected, FACE);
  // Whatever ratio produced this collection, the net is identical — the ratio
  // never enters the calculation.
  for (const _ratio of [1, 2, 3, 4, 7]) {
    assert.equal(netPerDollarFaceBps(collected, FACE), baseline);
  }
  // 84_740 collected − 22_922 servicing = 61_818 net on 423_700 face = 1459 bps
  assert.equal(baseline, 1459);
});

test("match beats baseline iff cash collected exceeds 12.6¢ of face", () => {
  const atBaseline = bpsOfFace(FACE, VOLUNTARY_BASELINE_BPS); // exactly 12.6¢
  assert.equal(matchBeatsBaseline(atBaseline, FACE).beatsBaseline, false);
  assert.equal(matchBeatsBaseline(atBaseline + 1_000, FACE).beatsBaseline, true);
  assert.equal(matchBeatsBaseline(atBaseline - 1_000, FACE).beatsBaseline, false);

  // The 4:1 clearing payment comfortably beats the baseline.
  const clearing = matchBeatsBaseline(clearingPaymentCents(FACE, 4), FACE);
  assert.equal(clearing.beatsBaseline, true);
  assert.equal(clearing.collectedBps, 2000);
  assert.equal(clearing.marginBps, 2000 - VOLUNTARY_BASELINE_BPS);
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
