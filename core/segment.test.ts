// Tests for core/segment.ts. Zero dependencies — node:test + node:assert.
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_HORIZON_MONTHS,
  GROSS_RECOVERY_BPS_JCAP_LOW,
  LEGAL_SHARE_BPS_VERIFIED,
  UPFRONT_CENTS_PER_ACCOUNT,
  underwrite,
} from "./portfolio.ts";
import {
  DEFAULT_BANDS,
  priceBpsOnSubset,
  segmentTape,
  underwriteBuyBox,
  underwriteSegments,
  upfrontDragBps,
} from "./segment.ts";
import { SOL_TABLE_VERIFIED, coveredStates as coveredStatesOf, type SolTable } from "./sol.ts";
import { JURISDICTION_COUNT, buildTape, type TapeAccount, type Ymd } from "./tape.ts";

const ASOF: Ymd = { y: 2026, m: 8, d: 26 };
// grossRecoveryBps became required on 28 Aug 2026 — see the note at the top of
// portfolio.ts. It is stated here rather than defaulted so these tests declare
// the recovery assumption they run on.
const INPUT = {
  priceBps: 200,
  legalShareBps: LEGAL_SHARE_BPS_VERIFIED,
  grossRecoveryBps: GROSS_RECOVERY_BPS_JCAP_LOW,
};

/**
 * A recovery regime in which the BLENDED verdict still clears.
 *
 * Several tests below exercise the central point of segmentation: "the blend
 * looks fine, but a band inside it is worthless at any price." That phenomenon
 * can only exist where the blend clears — `hiddenUnbuyable` is deliberately
 * empty when `blended.unacquirableAtAnyPrice` is true, because then the problem
 * is not hidden (segment.ts:312).
 *
 * At the corrected ~11¢ recovery the barbell fixture is unacquirable outright
 * (maxPriceBps −114), so there is nothing left to hide and nothing to detect.
 * 16.8¢ is the SUPERSEDED figure — used here purely as a parameter regime to
 * keep the mechanism testable, never as a claim about the market. Tests that
 * assert real-world economics use INPUT above.
 */
const INPUT_BLEND_CLEARS = { ...INPUT, grossRecoveryBps: 1_680 };

function accounts(
  n: number,
  balanceCents: number,
  over: Partial<TapeAccount> = {},
): TapeAccount[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `a${i}-${balanceCents}`,
    balanceCents,
    state: "TX",
    debtType: "credit_card" as const,
    lastPaymentDate: { y: 2024, m: 1, d: 15 },
    chargeOffDate: { y: 2024, m: 7, d: 1 },
    defects: [],
    ...over,
  }));
}

/** The barbell: 100 x $5,000 plus 4,000 x $50. Mean $171, median $50. */
function barbell() {
  return buildTape([...accounts(100, 500_000), ...accounts(4_000, 5_000)], {
    label: "barbell",
    asOf: ASOF,
  });
}

test("bands partition the balance line exactly — no gaps, no overlaps", () => {
  const edges = [0, 24_999, 25_000, 49_999, 50_000, 99_999, 100_000, 249_999, 250_000, 499_999, 500_000, 10_000_000];
  for (const cents of edges) {
    const hits = DEFAULT_BANDS.filter(
      (b) => cents >= b.minCents && (b.maxCents === null || cents < b.maxCents),
    );
    assert.equal(hits.length, 1, `${cents} landed in ${hits.length} bands`);
  }
});

test("segment face and counts sum to the tape exactly", () => {
  const tape = barbell();
  const s = segmentTape(tape);
  assert.equal(
    s.segments.reduce((x, y) => x + y.faceCents, 0),
    tape.faceCents,
  );
  assert.equal(
    s.segments.reduce((x, y) => x + y.accountCount, 0),
    tape.accountCount,
  );
});

test("up-front drag per band reproduces the documented ladder", () => {
  // portfolio.ts:221-232 asserts these in a comment. If comment and code ever
  // disagree, this test says so.
  assert.equal(upfrontDragBps(250_000), 7);
  assert.equal(upfrontDragBps(83_300), 21);
  assert.equal(upfrontDragBps(40_000), 44);
  // Extended into the range H3 actually proposes buying.
  assert.equal(upfrontDragBps(10_000), 175);
  assert.equal(upfrontDragBps(5_000), 350);
  assert.equal(UPFRONT_CENTS_PER_ACCOUNT, 175);
});

/**
 * A tape with the SAME face and SAME account count as the barbell, but spread
 * evenly. The remainder lands on one account so the totals match exactly —
 * without that, the two tapes differ in face and the comparison is vacuous.
 */
function uniformLike(bar: ReturnType<typeof barbell>) {
  const n = bar.accountCount;
  const each = Math.floor(bar.faceCents / n);
  const remainder = bar.faceCents - each * n;
  const all = accounts(n - 1, each);
  all.push(...accounts(1, each + remainder));
  return buildTape(all, { label: "uniform", asOf: ASOF });
}

test("the average balance is the statistic that lies", () => {
  // Two tapes, identical face and identical account count, so identical mean.
  const bar = barbell();
  const uniform = uniformLike(bar);
  assert.equal(uniform.faceCents, bar.faceCents, "fixture must match face exactly");
  const a = segmentTape(bar);
  const b = segmentTape(uniform);
  assert.equal(a.tapeAccountCount, b.tapeAccountCount);
  assert.equal(a.avgBalanceCents, b.avgBalanceCents, "means match by construction");
  // The mean matches; the median and the segmentation do not.
  assert.notEqual(a.medianBalanceCents, b.medianBalanceCents);
  assert.notEqual(a.segments.length, b.segments.length);
});

test("underwrite() alone is structurally blind to mix", () => {
  const bar = barbell();
  const uniform = uniformLike(bar);
  // Same face, same count -> byte-identical blended verdict, despite completely
  // different tapes. This is the gap segmentation exists to close.
  const x = underwrite({ ...INPUT_BLEND_CLEARS, faceCents: bar.faceCents, accounts: bar.accountCount });
  const y = underwrite({ ...INPUT_BLEND_CLEARS, faceCents: uniform.faceCents, accounts: uniform.accountCount });
  assert.deepEqual(x, y, "the blended model cannot tell a barbell from a uniform tape");
  // And yet one of them has a band that is worthless at any price.
  assert.ok(underwriteSegments(bar, INPUT_BLEND_CLEARS).hiddenUnbuyable.length > 0);
  assert.equal(underwriteSegments(uniform, INPUT_BLEND_CLEARS).hiddenUnbuyable.length, 0);
});

test("the blend hides an unbuyable sub-band", () => {
  const tape = barbell();
  const r = underwriteSegments(tape, INPUT_BLEND_CLEARS);
  assert.equal(r.blended.unacquirableAtAnyPrice, false, "the blend looks fine");
  assert.ok(r.hiddenUnbuyable.length > 0, "but a band inside it is worthless at any price");
  const worst = r.hiddenUnbuyable[0];
  assert.equal(worst.segment.band.label, "<$250");
  // That band holds the overwhelming majority of ACCOUNTS and a minority of FACE.
  assert.ok(worst.segment.shareOfAccountsBps > 9_500, "holds >95% of accounts");
  assert.ok(worst.segment.shareOfFaceBps < 3_000, "holds <30% of face");
});

test("summing band ceilings does not manufacture price out of rounding", () => {
  // underwrite() is linear in face and accounts, so the sum must reproduce the
  // blend. A large residual is a bug, not an insight.
  //
  // The rounding budget is principled, not fitted: underwrite() rounds each
  // month's net inflow to a whole cent, so each extra segment can drift by at
  // most one cent per month of horizon.
  const r = underwriteSegments(barbell(), INPUT_BLEND_CLEARS);
  const budget = r.segments.length * DEFAULT_HORIZON_MONTHS;
  assert.ok(
    Math.abs(r.linearityResidualCents) <= budget,
    `residual ${r.linearityResidualCents} exceeds the ${budget}-cent rounding budget`,
  );
  // And it must be negligible against the numbers being decided on: well under
  // a single basis point of face.
  assert.ok(
    Math.abs(r.linearityResidualCents) * 10_000 < r.blended.maxPriceCents,
    "residual is not negligible relative to the ceiling",
  );
});

test("an empty band is skipped, never underwritten at face 0", () => {
  // underwrite() throws on faceCents <= 0. A tape with no $5k+ accounts must
  // not blow up.
  const tape = buildTape(accounts(10, 5_000), { label: "small only", asOf: ASOF });
  const r = underwriteSegments(tape, INPUT);
  assert.equal(r.segments.length, 1);
  assert.equal(r.segments[0].segment.band.label, "<$250");
});

test("priceBpsOnSubset is exact and refuses an empty subset", () => {
  // Paying 200bps of $1,000,000 = $20,000. Against a $500,000 subset that is 400bps.
  assert.equal(priceBpsOnSubset(100_000_000, 50_000_000, 200), 400);
  assert.throws(() => priceBpsOnSubset(1_000, 0, 100), /decline/);
});

test("the buy-box cheque is accurate to one cent at any box size, and never over", () => {
  // Sweeps configurations rather than asserting one. The previous version of
  // this test listed three and two of them hit `continue` on a declined box, so
  // it pinned exactness on a single degenerate case where cheque and truth were
  // both 10000 — which is why the 1c undercharge below survived it.
  let asserted = 0;
  for (let seed = 1; seed <= 400; seed++) {
    const nIn = 1 + ((seed * 7) % 40);
    const balIn = 1_000 + ((seed * 104_729) % 900_000);
    const nOut = 1 + ((seed * 13) % 60);
    const balOut = 1_000 + ((seed * 15_485_863) % 900_000);
    const priceBps = 1 + ((seed * 37) % 900);
    const tape = buildTape(
      [
        ...accounts(nIn, balIn, { state: "TX", lastPaymentDate: { y: 2024, m: 1, d: 15 } }),
        ...accounts(nOut, balOut, { state: "CA" }),
      ],
      { label: `fuzz${seed}`, asOf: ASOF },
    );
    const box = underwriteBuyBox(tape, "H3_within_sol", SOL_TABLE_VERIFIED, { ...INPUT, priceBps });
    if (box.resultInBoxDenominated === null) continue;
    asserted++;
    const trueCheque = Math.round((tape.faceCents * priceBps) / 10_000);
    const delta = box.resultInBoxDenominated.purchasePriceCents - trueCheque;
    assert.ok(Math.abs(delta) <= 1, `seed ${seed}: cheque off by ${delta}c`);
  }
  // This sweep establishes the BOUND across many shapes. It does not exercise
  // the drift itself — the seeded configurations never hit an exact half-cent
  // tie — so the 1c case is pinned separately in the next test. An earlier
  // version tracked a `low` counter and asserted `low <= asserted`, which is a
  // tautology: low was only ever incremented inside the loop that incremented
  // asserted.
  assert.ok(asserted > 100, `only ${asserted} configurations actually priced`);
});

test("the documented 1-cent undercharge is real, and is the flattering direction", () => {
  // The seeded sweep above never generates it: the drift occurs only at exact
  // half-cent ties, where F x priceBps is congruent to 5000 mod 10000. That is
  // why the module doc's claim went unverified for a round. Reproduced exactly.
  const tape = buildTape(
    [
      ...accounts(1, 1_881_562, { state: "TX", lastPaymentDate: { y: 2024, m: 1, d: 15 } }),
      ...accounts(1, 1_881_563, { state: "CA" }),
    ],
    { label: "tie", asOf: ASOF },
  );
  assert.equal(tape.faceCents, 3_763_125);
  const box = underwriteBuyBox(tape, "H3_within_sol", SOL_TABLE_VERIFIED, {
    ...INPUT,
    priceBps: 136,
  });
  assert.ok(box.resultInBoxDenominated);
  const trueCheque = Math.round((tape.faceCents * 136) / 10_000);
  assert.equal(trueCheque, 51_179);
  const delta = box.resultInBoxDenominated!.purchasePriceCents - trueCheque;
  assert.equal(delta, -1, "one cent LOW — a smaller apparent cheque raises the apparent ceiling");
  // And it is bounded there, regardless of tape size.
  assert.ok(Math.abs(delta) <= 1);
});

test("the buy-box cheque matches on the configurations fuzzing flagged", () => {
  let priced = 0;
  // An earlier version rounded the subset price UP to a whole basis point. One
  // bps OF THE SUBSET is unbounded relative to the true price when the box is
  // small: adversarial fuzzing found a case where it DOUBLED the reported
  // cheque. Conservative, but wrong — and it broke the exact-equality invariant
  // the wedge test below asserts.
  for (const [nIn, balIn, nOut, balOut, priceBps] of [
    [100, 999_999, 1, 103, 1],
    [1, 4_900, 99, 100_000, 200],
    [3, 1_237, 500, 250_000, 37],
  ] as const) {
    const tape = buildTape(
      [
        ...accounts(nIn, balIn, { state: "TX", lastPaymentDate: { y: 2024, m: 1, d: 15 } }),
        ...accounts(nOut, balOut, { state: "CA" }),
      ],
      { label: "fuzz", asOf: ASOF },
    );
    const box = underwriteBuyBox(tape, "H3_within_sol", SOL_TABLE_VERIFIED, {
      ...INPUT,
      priceBps,
    });
    if (box.resultInBoxDenominated === null) continue;
    priced++;
    const trueCheque = Math.round((tape.faceCents * priceBps) / 10_000);
    assert.ok(
      Math.abs(box.resultInBoxDenominated.purchasePriceCents - trueCheque) <= 1,
      `cheque wrong for box ${nIn}x${balIn} / ${nOut}x${balOut} @ ${priceBps}bps`,
    );
  }
  // Without this, a change that made every configuration DECLINE would leave
  // the test asserting nothing and still passing.
  assert.ok(priced > 0, "no configuration actually priced — this test asserted nothing");
});

test("out-of-box face is charged, not discarded", () => {
  // THE flattering error: filter the tape to the buy box, then underwrite the
  // filtered face at the quoted price. That discards the out-of-box face AND
  // its mailing cost, and can turn an unbuyable tape into a clearing one.
  const inBox = accounts(500, 200_000, { state: "TX", lastPaymentDate: { y: 2024, m: 1, d: 15 } });
  const outOfBox = accounts(500, 200_000, { state: "CA" }); // CA not in the table -> unknown
  const tape = buildTape([...inBox, ...outOfBox], { label: "half covered", asOf: ASOF });

  const box = underwriteBuyBox(tape, "H3_within_sol", SOL_TABLE_VERIFIED, INPUT);
  assert.ok(box.resultInBoxDenominated, "should price");
  assert.equal(box.inBoxAccountCount, 500);
  assert.equal(box.inBoxFaceCents, tape.faceCents / 2);
  assert.equal(box.uncoveredStateFaceCents, tape.faceCents / 2);
  assert.deepEqual(box.uncoveredStates, ["CA"]);

  // You paid for the whole file.
  const blended = underwrite({ ...INPUT, faceCents: tape.faceCents, accounts: tape.accountCount });
  assert.equal(
    box.resultInBoxDenominated!.purchasePriceCents,
    blended.purchasePriceCents,
    "the buy box must not shrink the cheque",
  );
  // And you mailed every account, in-box or not.
  assert.equal(box.resultInBoxDenominated!.upfrontServicingCents, blended.upfrontServicingCents);
  // So the ceiling on the whole tape is strictly worse than the naive blend.
  assert.ok(
    box.maxPriceBpsOfWholeTape! < blended.maxPriceBps,
    "ignoring the wedge flatters the deal",
  );
});

test("a buy box that selects nothing is a decline, not a division by zero", () => {
  const tape = buildTape(accounts(100, 100_000, { state: "CA" }), { label: "none", asOf: ASOF });
  const empty: SolTable = new Map();
  const box = underwriteBuyBox(tape, "H3_within_sol", empty, INPUT);
  assert.equal(box.resultInBoxDenominated, null);
  assert.equal(box.boxTooSmallToPrice, true);
  assert.equal(box.inBoxFaceCents, 0);
});

test("a buy box too small to price is reported, not thrown", () => {
  // 1% of face in the box, at 200bps of the whole tape = 20000bps of the subset,
  // which underwrite() would reject. Report it instead.
  const inBox = accounts(1, 100_000, { state: "TX" });
  const outOfBox = accounts(99, 100_000, { state: "CA" });
  const tape = buildTape([...inBox, ...outOfBox], { label: "tiny box", asOf: ASOF });
  const box = underwriteBuyBox(tape, "H3_within_sol", SOL_TABLE_VERIFIED, {
    ...INPUT,
    priceBps: 500,
  });
  assert.equal(box.boxTooSmallToPrice, true);
  assert.equal(box.resultInBoxDenominated, null);
});

test("legalShareBps is threaded identically to every band, whatever the SOL mix", () => {
  // Guards the refactor warned about at segment.ts:204-211: zeroing
  // legalShareBps on paper nobody can sue would assert the full 16.8c recovery
  // on the weakest paper on the file.
  //
  // Retitled after adversarial review. This was called "time-barred bands do
  // not get a free legal share" and built an all-time-barred fixture — but
  // underwriteSegments never calls assessSol, so swapping the fixture to fresh
  // within-SOL paper left it passing. The time-barred framing was decorative;
  // the real invariant is that recovery does not vary by band at all.
  const timeBarred = buildTape(accounts(60, 100_000, { lastPaymentDate: { y: 2015, m: 1, d: 1 } }), { label: "barred", asOf: ASOF });
  const fresh = buildTape(accounts(60, 100_000, { lastPaymentDate: { y: 2026, m: 7, d: 1 } }), { label: "fresh", asOf: ASOF });
  const mixed = buildTape(
    [...accounts(30, 5_000, { lastPaymentDate: { y: 2015, m: 1, d: 1 } }), ...accounts(30, 600_000)],
    { label: "mixed", asOf: ASOF },
  );
  const expected = underwrite({ ...INPUT, faceCents: 100_000, accounts: 1 }).expectedGrossBps;
  for (const tape of [timeBarred, fresh, mixed]) {
    for (const s of underwriteSegments(tape, INPUT).segments) {
      assert.equal(s.result.expectedGrossBps, expected, `band ${s.segment.band.label} of ${tape.label}`);
    }
  }
  // And the mixed tape really does span more than one band, or the loop above
  // proves nothing about per-band variation.
  assert.ok(underwriteSegments(mixed, INPUT).segments.length > 1);
});

test("maxPriceBpsOfWholeTape is denominated in WHOLE-tape face", () => {
  // The natural mistake is dividing by inBoxFaceCents — the value that was just
  // passed to underwrite() as faceCents. That mutation passed the entire suite
  // and reported 2.00x the true ceiling on the number you take into a
  // negotiation. Pinned here by ratio: with exactly half the face in the box,
  // the whole-tape ceiling must be exactly half the in-box ceiling.
  const tape = buildTape(
    [
      ...accounts(500, 200_000, { state: "TX", lastPaymentDate: { y: 2024, m: 1, d: 15 } }),
      ...accounts(500, 200_000, { state: "CA" }),
    ],
    { label: "half", asOf: ASOF },
  );
  const box = underwriteBuyBox(tape, "H3_within_sol", SOL_TABLE_VERIFIED, INPUT);
  assert.equal(box.inBoxFaceCents * 2, tape.faceCents, "fixture must be exactly half");
  assert.equal(
    box.maxPriceBpsOfWholeTape,
    Math.round(box.resultInBoxDenominated!.maxPriceBps / 2),
    "whole-tape bps must be half the in-box bps when the box is half the face",
  );
});

test("buy-box face accounting is exact", () => {
  // outOfBoxFaceCents -> 0 and inBoxShareOfFaceBps -> 10000 both survived the
  // suite before this test existed.
  const tape = buildTape(
    [
      ...accounts(300, 100_000, { state: "TX", lastPaymentDate: { y: 2024, m: 1, d: 15 } }),
      ...accounts(700, 100_000, { state: "CA" }),
    ],
    { label: "30/70", asOf: ASOF },
  );
  const box = underwriteBuyBox(tape, "H3_within_sol", SOL_TABLE_VERIFIED, INPUT);
  assert.equal(box.inBoxFaceCents + box.outOfBoxFaceCents, tape.faceCents);
  assert.equal(box.inBoxFaceCents, 30_000_000);
  assert.equal(box.outOfBoxFaceCents, 70_000_000);
  assert.equal(box.inBoxShareOfFaceBps, 3_000);
  assert.equal(box.uncoveredStateFaceCents, 70_000_000);
});

test("segment shares, mean and median are exact", () => {
  // Every value here is deliberately ODD or unequal. The previous fixture used
  // three identical 10,000c accounts, where floor === ceil and the two middle
  // elements were the same number — so the mutants this test was written to
  // kill (avgBalanceCents floor->ceil, even-length median -> upper element)
  // both survived it. An equal-valued fixture cannot test an averaging rule.
  const tape = buildTape(
    [
      ...accounts(1, 10_001),
      ...accounts(1, 10_002),
      ...accounts(1, 30_000),
      ...accounts(1, 600_000),
    ],
    { label: "shares", asOf: ASOF },
  );
  const s = segmentTape(tape);
  assert.equal(tape.faceCents, 650_003);

  const small = s.segments.find((x) => x.band.label === "<$250")!;
  assert.equal(small.faceCents, 20_003);
  assert.equal(small.shareOfFaceBps, Math.round((20_003 * 10_000) / 650_003));
  assert.equal(small.shareOfAccountsBps, 5_000);
  // 20003 / 2 = 10001.5 — floor is 10001, ceil would be 10002.
  assert.equal(small.avgBalanceCents, 10_001);
  // Two middle elements 10001 and 10002: the average floors to 10001, whereas
  // returning the upper element would give 10002.
  assert.equal(small.medianBalanceCents, 10_001);

  // Whole tape: middles are 10002 and 30000 -> 20001, upper element would be 30000.
  assert.equal(s.medianBalanceCents, 20_001);
  // 650003 / 4 = 162500.75 — floor 162500, ceil would be 162501.
  assert.equal(s.avgBalanceCents, 162_500);

  const odd = segmentTape(
    buildTape([...accounts(1, 10_000), ...accounts(1, 30_001), ...accounts(1, 600_000)], { label: "odd", asOf: ASOF }),
  );
  assert.equal(odd.medianBalanceCents, 30_001);
});

test("a band's defect count is reported per band, where bad paper hides", () => {
  // Was computed and read by nothing. Per-band defect concentration is exactly
  // the "bad paper hides in the small band" signal this module exists for.
  const tape = buildTape(
    [
      ...accounts(50, 5_000, { lastPaymentDate: null, defects: ["missing_last_payment_date"] }),
      ...accounts(5, 600_000),
    ],
    { label: "defects", asOf: ASOF },
  );
  const s = segmentTape(tape);
  assert.equal(s.segments.find((x) => x.band.label === "<$250")!.accountsWithDefects, 50);
  assert.equal(s.segments.find((x) => x.band.label === "$5k+")!.accountsWithDefects, 0);
});

test("subsidised bands are named", () => {
  const r = underwriteSegments(barbell(), INPUT);
  assert.ok(r.subsidisedBands.includes("<$250"), "the small band is carried by the large one");
  assert.equal(r.subsidisedBands.includes("$2.5k-$5k"), false);
});

test("no floats leak from a segmented underwrite", () => {
  const r = underwriteSegments(barbell(), INPUT);
  const ints = [r.summedMaxPriceCents, r.blendedMaxPriceCents, r.linearityResidualCents];
  for (const v of ints) assert.ok(Number.isInteger(v), `${v} is not an integer`);
  for (const s of r.segments) {
    for (const v of [s.segment.faceCents, s.segment.avgBalanceCents, s.segment.medianBalanceCents, s.result.maxPriceCents]) {
      assert.ok(Number.isInteger(v), `${v} is not an integer`);
    }
  }
});

test("a tape with no accounts is refused", () => {
  const tape = buildTape([], { label: "empty", asOf: ASOF });
  assert.throws(() => segmentTape(tape), /no accounts/);
});

// ---------------------------------------------------------------------------
// CLI. The tape path is a second surface over the same math and can drift, so
// it is tested by subprocess exactly as portfolio.test.ts:522-565 tests the
// --face path.

import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "underwrite.ts");

const CSV = [
  "ACCT,BAL,ST,LPD,CODATE,TYPE",
  "A1,100.00,TX,01/15/2024,07/01/2024,creditcard",
  "A2,5000.00,TX,01/15/2024,07/01/2024,creditcard",
].join("\n");

const COLS = "id=ACCT,balance=BAL,state=ST,lastPaymentDate=LPD,chargeOffDate=CODATE,debtType=TYPE";

function runCli(args: string[], input = CSV) {
  try {
    // stderr must be captured on the SUCCESS path too: under --json the human
    // report moves there, and a helper that only kept it on failure made the
    // assertion silently vacuous (r.stderr ?? "" was always "").
    const res = spawnSync(process.execPath, ["--experimental-strip-types", CLI, ...args], {
      input,
      encoding: "utf8",
    });
    if (res.status === 0) return { code: 0, stdout: res.stdout, stderr: res.stderr };
    return { code: res.status ?? -1, stdout: res.stdout ?? "", stderr: res.stderr ?? "" };
  } catch (e) {
    const err = e as { status: number; stdout: string; stderr: string };
    return { code: err.status, stdout: err.stdout ?? "", stderr: err.stderr ?? "" };
  }
}


/** Set a flag, replacing any existing occurrence — parseArgs now refuses repeats. */
function withFlag(args: string[], key: string, value?: string): string[] {
  const out = args.filter((a, i) => a !== key && args[i - 1] !== key);
  return value === undefined ? [...out, key] : [...out, key, value];
}

/**
 * BASE without --gross-recovery-bps, for the few tests that supply their own.
 * The CLI treats a repeated flag as an error rather than last-wins, so
 * spreading BASE and appending the flag again crashes it — the parser behaving
 * correctly, not a test bug.
 */
const BASE_NO_GR = [
  "--tape", "-",
  "--tape-declared-face", "5100.00",
  "--tape-declared-accounts", "2",
  "--tape-date-format", "MM/DD/YYYY",
  "--tape-columns", COLS,
  "--tape-as-of", "2026-08-26",
  "--legal-share-bps", String(LEGAL_SHARE_BPS_VERIFIED),
];

const BASE = [
  ...BASE_NO_GR,
  "--gross-recovery-bps", String(GROSS_RECOVERY_BPS_JCAP_LOW),
];

/**
 * CLI counterpart to INPUT_BLEND_CLEARS. Same reasoning: a handful of tests
 * assert behaviour that only EXISTS when the blended verdict clears — "a
 * worthless band survives the buy box", "the blend CLEARS while a band does
 * not", "this band is subsidised by that one". At the corrected ~11¢ these
 * fixtures are unacquirable outright, so there is no blend left to hide
 * anything and the branch under test is unreachable.
 *
 * 1680 is the SUPERSEDED constant, used purely as a regime to keep those
 * branches reachable. It is not a claim about the market.
 */
const GR_BLEND_CLEARS = ["--gross-recovery-bps", "1680"];

test("CLI --tape agrees with the API", () => {
  const r = runCli([...BASE, "--price-bps", "200", "--segments", "--json"]);
  const json = JSON.parse(r.stdout.slice(r.stdout.indexOf("{")));
  const tape = buildTape(
    [
      { id: "A1", balanceCents: 10_000, state: "TX", debtType: "credit_card", lastPaymentDate: { y: 2024, m: 1, d: 15 }, chargeOffDate: { y: 2024, m: 7, d: 1 }, defects: [] },
      { id: "A2", balanceCents: 500_000, state: "TX", debtType: "credit_card", lastPaymentDate: { y: 2024, m: 1, d: 15 }, chargeOffDate: { y: 2024, m: 7, d: 1 }, defects: [] },
    ],
    { label: "-", asOf: ASOF },
  );
  const api = underwriteSegments(tape, INPUT);
  assert.equal(json.segmented.blended.maxPriceBps, api.blended.maxPriceBps);
  assert.equal(json.segmented.blended.clearsHurdle, api.blended.clearsHurdle);
  assert.equal(json.segmented.blended.npvCents, api.blended.npvCents);
  assert.equal(json.segmented.segments.length, api.segments.length);
});

test("CLI exits 2 on a reconciliation mismatch and names both numbers", () => {
  const args = [...BASE, "--price-bps", "200"];
  args[args.indexOf("5100.00")] = "5100.01";
  const r = runCli(args);
  assert.equal(r.code, 2);
  assert.match(r.stdout, /RECONCILIATION FAILED/);
  assert.match(r.stdout, /\$5,100\.01/);
  assert.match(r.stdout, /\$5,100\.00/);
});

test("CLI refuses --face together with --tape", () => {
  const r = runCli([...BASE, "--price-bps", "200", "--face", "5100"]);
  assert.equal(r.code, 2);
  assert.match(r.stderr ?? "", /mutually exclusive/);
});

test("CLI refuses to sniff the date format", () => {
  const args = [...BASE, "--price-bps", "200"];
  args[args.indexOf("MM/DD/YYYY")] = "DD-MM-YY";
  const r = runCli(args);
  assert.equal(r.code, 2);
  assert.match(r.stderr ?? "", /never sniffed/);
});

test("CLI applies no buy box by default and says so", () => {
  const r = runCli([...BASE, "--price-bps", "200", "--segments"]);
  assert.match(r.stdout, /No buy box applied/);
  assert.match(r.stdout, /mutually\s+exclusive/);
});

test("CLI --hypothesis h3 reports the wedge", () => {
  const r = runCli([...BASE, "--price-bps", "200", "--hypothesis", "h3"]);
  assert.match(r.stdout, /BUY BOX — H3_within_sol/);
  assert.match(r.stdout, /cannot be worked/);
});

test("CLI names the uniform-recovery assumption on every segmented run", () => {
  const r = runCli([...BASE, "--price-bps", "200", "--segments"]);
  assert.match(r.stdout, /ASSUMED, NOT MEASURED/);
});

test("CLI --json carries the buy box whenever one was computed", () => {
  // It used to emit only { reconciliation, segmented }, so a script parsing
  // --json saw the blended, wedge-free numbers — including a clearing verdict
  // on a tape the text output declined.
  const r = runCli([...BASE, "--price-bps", "200", "--hypothesis", "h3", "--json"]);
  const json = JSON.parse(r.stdout.slice(r.stdout.indexOf("{")));
  assert.ok("buyBox" in json, `payload keys were [${Object.keys(json).join(", ")}]`);
  assert.notEqual(json.buyBox, undefined);
  assert.equal(json.buyBox.hypothesis, "H3_within_sol");
  assert.equal(
    json.buyBox.inBoxFaceCents + json.buyBox.outOfBoxFaceCents,
    json.segmented.blended.purchasePriceCents / 200 * 10_000,
  );
});

test("CLI --json omits the buy box only when none was requested", () => {
  const r = runCli([...BASE, "--price-bps", "200", "--segments", "--json"]);
  const json = JSON.parse(r.stdout.slice(r.stdout.indexOf("{")));
  assert.equal(json.buyBox, null);
});

test("CLI validates --tape-type instead of casting it", () => {
  // `--tape-type banana` used to produce a clean per-band report with a
  // "clears" verdict on accounts whose debtType was the string "banana";
  // `--tape-type creditcard` crashed with an opaque TypeError from sol.ts.
  const noTypeCol = "id=ACCT,balance=BAL,state=ST,lastPaymentDate=LPD,chargeOffDate=CODATE";
  const args = withFlag([...BASE, "--price-bps", "200", "--segments"], "--tape-columns", noTypeCol);
  for (const bad of ["banana", "creditcard"]) {
    const r = runCli(withFlag(args, "--tape-type", bad));
    assert.equal(r.code, 2, `--tape-type ${bad} should be refused`);
    assert.match(r.stderr ?? "", /is not a debt type/);
  }
  const good = runCli(withFlag(args, "--tape-type", "credit_card"));
  assert.notEqual(good.code, 2, "a valid type must still work");
});

test("CLI rejects an unknown --hypothesis", () => {
  const r = runCli([...BASE, "--price-bps", "200", "--hypothesis", "h9"]);
  assert.equal(r.code, 2);
  assert.match(r.stderr ?? "", /must be h1 or h3/);
});

test("CLI exit code: a worthless band survives the buy box", () => {
  // The flattering bug this pins. On a barbell where 97.56% of accounts are
  // unacquirable at ANY price, `--segments` exited 1 and warned — but adding
  // `--hypothesis h3` both SUPPRESSED the warning and flipped the exit code to
  // 0. Passing the flag the tool itself recommends turned a decline into a buy.
  const rows = [
    "ACCT,BAL,ST,LPD,CODATE,TYPE",
    ...Array.from({ length: 40 }, (_, i) => `S${i},50.00,TX,01/15/2024,07/01/2024,creditcard`),
    "L1,5000.00,TX,01/15/2024,07/01/2024,creditcard",
  ].join("\n");
  const face = (40 * 5_000 + 500_000) / 100;
  const base = [
    "--tape", "-",
    "--tape-declared-face", face.toFixed(2),
    "--tape-declared-accounts", "41",
    "--tape-date-format", "MM/DD/YYYY",
    "--tape-columns", COLS,
    "--tape-as-of", "2026-08-26",
    "--legal-share-bps", String(LEGAL_SHARE_BPS_VERIFIED),
    ...GR_BLEND_CLEARS,
    "--price-bps", "200",
  ];
  const segs = runCli([...base, "--segments"], rows);
  assert.equal(segs.code, 1, "segments path must decline");
  assert.match(segs.stdout, /unacquirable\s+at ANY price/);

  for (const extra of [["--hypothesis", "h3"], ["--hypothesis", "h3", "--segments"], ["--hypothesis", "h1"]]) {
    const r = runCli([...base, ...extra], rows);
    assert.equal(r.code, 1, `${extra.join(" ")} must not flip the verdict to 0`);
    assert.match(r.stdout, /unacquirable\s+at ANY price/, `${extra.join(" ")} must still warn`);
  }
});

test("CLI refuses --face-only flags on the tape path instead of ignoring them", () => {
  for (const flag of [["--stress"], ["--ratio", "3"], ["--accounts", "2"]]) {
    const r = runCli([...BASE, "--price-bps", "200", ...flag]);
    assert.equal(r.code, 2, `${flag[0]} should be refused`);
    assert.match(r.stderr ?? "", /not supported with --tape/);
  }
});

test("linearityResidualCents follows the documented convention: blended minus summed", () => {
  // A sign flip survived the suite because the only assertion was on Math.abs.
  const r = underwriteSegments(barbell(), INPUT);
  assert.equal(
    r.linearityResidualCents,
    r.blendedMaxPriceCents - r.summedMaxPriceCents,
    "residual must be blended - summed, not the reverse",
  );
  // On this fixture the sum slightly exceeds the blend, so the residual is
  // negative. Pins the direction, not just the magnitude.
  assert.ok(r.linearityResidualCents < 0, `expected negative, got ${r.linearityResidualCents}`);
});

test("a subset price just over 100% of face is reported, not thrown", () => {
  // underwrite() throws on priceBps > 10000. The only prior test used a 50000bps
  // subset, so raising the guard's threshold to 20000 survived — leaving a
  // reachable 10000-20000 band that would have reached underwrite() and thrown.
  const tape = buildTape(
    [
      ...accounts(10, 100_000, { state: "TX", lastPaymentDate: { y: 2024, m: 1, d: 15 } }),
      ...accounts(90, 100_000, { state: "CA" }),
    ],
    { label: "10pct", asOf: ASOF },
  );
  // 10% in box at 1500bps of the whole tape = 15000bps of the subset.
  assert.equal(priceBpsOnSubset(tape.faceCents, tape.faceCents / 10, 1_500), 15_000);
  const box = underwriteBuyBox(tape, "H3_within_sol", SOL_TABLE_VERIFIED, {
    ...INPUT,
    priceBps: 1_500,
  });
  assert.equal(box.boxTooSmallToPrice, true);
  assert.equal(box.resultInBoxDenominated, null);
  // And just under the threshold it still prices rather than declining.
  const ok = underwriteBuyBox(tape, "H3_within_sol", SOL_TABLE_VERIFIED, { ...INPUT, priceBps: 900 });
  assert.equal(ok.boxTooSmallToPrice, false);
  assert.notEqual(ok.resultInBoxDenominated, null);
});

test("a misconfigured band set is refused, not silently survived", () => {
  const tape = buildTape([...accounts(2, 10_000), ...accounts(2, 60_000)], { label: "b", asOf: ASOF });

  // THE LIVE BUG. Buckets were keyed by LABEL, so two bands sharing one shared
  // a bucket — and the loop emitted a segment for EACH band reading the same
  // merged accounts. This tape reported 8 accounts and $2,800 against a real 4
  // and $1,400: double the face, silently, in the flattering direction.
  assert.throws(
    () =>
      segmentTape(tape, [
        { label: "x", minCents: 0, maxCents: 50_000 },
        { label: "x", minCents: 50_000, maxCents: null },
      ]),
    /duplicate band label/,
  );

  // Overlaps silently merged into whichever band came first, so a band could
  // report zero accounts while holding some.
  assert.throws(
    () =>
      segmentTape(tape, [
        { label: "a", minCents: 0, maxCents: 100_000 },
        { label: "b", minCents: 50_000, maxCents: null },
      ]),
    /overlap/,
  );

  assert.throws(
    () => segmentTape(tape, [{ label: "a", minCents: 100_000, maxCents: 5_000 }]),
    /maxCents must exceed minCents/,
  );
  assert.throws(
    () => segmentTape(tape, [{ label: "a", minCents: -100, maxCents: null }]),
    /non-negative integer/,
  );
  assert.throws(() => segmentTape(tape, []), /must not be empty/);

  // A gap is only an error when an account falls into it — that is bucket()'s
  // "falls in no band" guard. The tape's 10,000c accounts land in this one.
  assert.throws(
    () =>
      segmentTape(tape, [
        { label: "a", minCents: 0, maxCents: 5_000 },
        { label: "b", minCents: 30_000, maxCents: null },
      ]),
    /falls in no band/,
  );
  // A gap NO account falls into is not an error — the band set covers the tape.
  const withHarmlessGap = segmentTape(tape, [
    { label: "a", minCents: 0, maxCents: 20_000 },
    { label: "b", minCents: 30_000, maxCents: null },
  ]);
  assert.equal(
    withHarmlessGap.segments.reduce((a, b) => a + b.faceCents, 0),
    tape.faceCents,
  );
});

test("duplicate-label double counting cannot recur: totals reconcile on any valid band set", () => {
  const tape = buildTape([...accounts(3, 10_000), ...accounts(2, 60_000), ...accounts(1, 900_000)], { label: "b", asOf: ASOF });
  const sets = [
    DEFAULT_BANDS,
    [{ label: "lo", minCents: 0, maxCents: 50_000 }, { label: "hi", minCents: 50_000, maxCents: null }],
    [{ label: "all", minCents: 0, maxCents: null }],
  ];
  for (const bands of sets) {
    const s = segmentTape(tape, bands);
    assert.equal(s.segments.reduce((a, b) => a + b.faceCents, 0), tape.faceCents, `face for ${bands.length} bands`);
    assert.equal(s.segments.reduce((a, b) => a + b.accountCount, 0), tape.accountCount, `count for ${bands.length} bands`);
  }
});

// --- Round-3 regressions -------------------------------------------------

test("CLI parses --flag=value and refuses an unknown flag", () => {
  // parseArgs took a.slice(2) as the whole key, so "--upfront-cents=100000"
  // registered the key "upfront-cents=100000". REQUIRED flags then failed
  // loudly but OPTIONAL ones fell silently to their defaults — and every
  // default is the more favourable value. Measured: a run that should give
  // maxPriceBps -11465 / does not clear instead gave 298 / clears.
  const both: string[][] = [];
  for (const form of [["--upfront-cents", "100000"], ["--upfront-cents=100000"]]) {
    const r = runCli([...BASE, "--price-bps", "200", "--segments", "--json", ...form]);
    const json = JSON.parse(r.stdout.slice(r.stdout.indexOf("{")));
    both.push([String(json.segmented.blended.maxPriceBps), String(r.code)]);
  }
  assert.deepEqual(both[0], both[1], "--flag value and --flag=value must agree");

  // And the value must actually bite: absent, the tape looks far better.
  const absent = runCli([...BASE, "--price-bps", "200", "--segments", "--json"]);
  const absentJson = JSON.parse(absent.stdout.slice(absent.stdout.indexOf("{")));
  assert.ok(
    absentJson.segmented.blended.maxPriceBps > Number(both[0][0]),
    "omitting --upfront-cents must not match supplying a large one",
  );

  // A typo is an error, never a silent no-op that exits 0.
  for (const bad of ["--hypothsis", "--segement", "--not-a-flag=1"]) {
    const r = runCli([...BASE, "--price-bps", "200", bad]);
    assert.equal(r.code, 2, `${bad} should be refused`);
    assert.match(r.stderr ?? "", /unknown flag/);
  }
});

test("CLI says when the duplicate-account check did NOT run", () => {
  // The id column is optional, so the DEFAULT invocation is the unchecked one,
  // and duplicateIdCount of 0 read as "checked, none found". Byte-identical
  // duplicated paper: exit 2 with an id column, a clean "clears" exit 0 without.
  const dupes = [
    "ACCT,BAL,ST,LPD,CODATE,TYPE",
    "A1,5000.00,TX,01/15/2024,07/01/2024,creditcard",
    "A1,5000.00,TX,01/15/2024,07/01/2024,creditcard",
  ].join("\n");
  const base = [
    "--tape", "-",
    "--tape-declared-face", "10000.00",
    "--tape-declared-accounts", "2",
    "--tape-date-format", "MM/DD/YYYY",
    "--tape-as-of", "2026-08-26",
    "--legal-share-bps", String(LEGAL_SHARE_BPS_VERIFIED),
    "--gross-recovery-bps", String(GROSS_RECOVERY_BPS_JCAP_LOW),
    "--price-bps", "200",
  ];
  const withId = runCli([...base, "--tape-columns", COLS], dupes);
  assert.equal(withId.code, 2);
  assert.match(withId.stdout, /duplicate ids\s+1/);

  const withoutId = runCli(
    [...base, "--tape-columns", "balance=BAL,state=ST,lastPaymentDate=LPD,debtType=TYPE"],
    dupes,
  );
  assert.match(withoutId.stdout, /Duplicate accounts NOT FULLY CHECKED/, "must not imply it checked");
});

test("CLI prints the recovery assumption on the run that produces the verdict", () => {
  // The banner and the barbell warning lived inside the --segments block, so
  // `--hypothesis h3` alone — the invocation someone acts on — carried the
  // FEWEST caveats.
  for (const extra of [["--hypothesis", "h3"], ["--hypothesis", "h1"], ["--segments"]]) {
    const r = runCli([...BASE, "--price-bps", "200", ...extra]);
    assert.match(r.stdout, /ASSUMED, NOT MEASURED/, `${extra.join(" ")} must disclose`);
  }
});

test("CLI caveats H1 pricing against a litigating book's recovery", () => {
  const r = runCli([...BASE, "--price-bps", "200", "--hypothesis", "h1"]);
  assert.match(r.stdout, /TIME-BARRED PAPER, PRICED AT A LITIGATING BOOK'S RECOVERY/);
  const h3 = runCli([...BASE, "--price-bps", "200", "--hypothesis", "h3"]);
  assert.equal(/LITIGATING BOOK/.test(h3.stdout), false, "H3 buys within-SOL paper; not applicable");
});

test("CLI surfaces SOL caveats instead of computing and discarding them", () => {
  // assessSol produced every caveat and underwriteBuyBox threw them away, so
  // near_boundary — paper that qualifies today and is barred before onboarding
  // finishes — reached no report and no JSON.
  const rows = [
    "ACCT,BAL,ST,LPD,CODATE,TYPE",
    // TX, 4-year clock, 46 months elapsed as of 2026-08-26: 2 months of room.
    "N1,100000.00,TX,10/26/2022,01/01/2023,creditcard",
  ].join("\n");
  const r = runCli(
    [
      "--tape", "-",
      "--tape-declared-face", "100000.00",
      "--tape-declared-accounts", "1",
      "--tape-date-format", "MM/DD/YYYY",
      "--tape-columns", COLS,
      "--tape-as-of", "2026-08-26",
      "--legal-share-bps", String(LEGAL_SHARE_BPS_VERIFIED),
    "--gross-recovery-bps", String(GROSS_RECOVERY_BPS_JCAP_LOW),
      "--price-bps", "200",
      "--hypothesis", "h3",
    ],
    rows,
  );
  assert.match(r.stdout, /SOL caveats/);
  assert.match(r.stdout, /near_boundary/);
});

test("CLI exit code: the buy box's unacquirable branch exits non-zero", () => {
  // No test protected `exitCode = 1` on this branch — flipping it to 0 left the
  // suite green. The existing worthless-band test covers only the
  // hiddenUnbuyable route, which is a different path.
  const rows = [
    "ACCT,BAL,ST,LPD,CODATE,TYPE",
    ...Array.from({ length: 4 }, (_, i) => `T${i},500.00,TX,01/15/2024,07/01/2024,creditcard`),
    ...Array.from({ length: 96 }, (_, i) => `C${i},296.00,CA,01/15/2024,07/01/2024,creditcard`),
  ].join("\n");
  const face = (4 * 50_000 + 96 * 29_600) / 100;
  const base = [
    "--tape", "-",
    "--tape-declared-face", face.toFixed(2),
    "--tape-declared-accounts", "100",
    "--tape-date-format", "MM/DD/YYYY",
    "--tape-columns", COLS,
    "--tape-as-of", "2026-08-26",
    "--legal-share-bps", String(LEGAL_SHARE_BPS_VERIFIED),
    ...GR_BLEND_CLEARS,
    "--price-bps", "200",
  ];
  const plain = runCli(base, rows);
  assert.equal(plain.code, 0, "the whole tape clears with no hidden-unbuyable band");
  const box = runCli([...base, "--hypothesis", "h3"], rows);
  assert.equal(box.code, 1, "the buy box is unacquirable and must exit non-zero");
  assert.match(box.stdout, /UNACQUIRABLE AT ANY PRICE/);
});

test("upfrontDragBps is denominated on the band's AVERAGE balance, and guards zero", () => {
  // The displayed DRAG column: switching avg->median changed a printed number
  // with nothing to catch it.
  const tape = buildTape([...accounts(3, 5_000), ...accounts(1, 20_000)], { label: "d", asOf: ASOF });
  const s = segmentTape(tape);
  const band = s.segments[0];
  assert.equal(band.avgBalanceCents, Math.floor(35_000 / 4));
  assert.notEqual(band.avgBalanceCents, band.medianBalanceCents, "avg and median must differ here");
  assert.equal(band.upfrontDragBps, upfrontDragBps(band.avgBalanceCents));
  assert.notEqual(band.upfrontDragBps, upfrontDragBps(band.medianBalanceCents));
  assert.throws(() => upfrontDragBps(0), /must be > 0/);
  assert.throws(() => upfrontDragBps(-1), /must be > 0/);
});

test("subsidised is strict: a band exactly at the asking price is not subsidised", () => {
  const tape = buildTape(accounts(20, 400_000), { label: "s", asOf: ASOF });
  const r = underwriteSegments(tape, INPUT);
  const seg = r.segments[0];
  // Re-run at a price exactly equal to this band's ceiling.
  const atCeiling = underwriteSegments(tape, { ...INPUT, priceBps: seg.result.maxPriceBps });
  assert.equal(atCeiling.segments[0].subsidised, false, "equal is not below");
  const justOver = underwriteSegments(tape, { ...INPUT, priceBps: seg.result.maxPriceBps + 1 });
  assert.equal(justOver.segments[0].subsidised, true);
});

test("coveredStates is sorted regardless of table insertion order", () => {
  const unsorted: SolTable = new Map([
    ["WY", SOL_TABLE_VERIFIED.get("TX")!],
    ["AK", SOL_TABLE_VERIFIED.get("NY")!],
    ["MO", SOL_TABLE_VERIFIED.get("TX")!],
  ]);
  assert.deepEqual(coveredStatesOf(unsorted), ["AK", "MO", "WY"]);
});

test("CLI rejects malformed --tape-as-of and --tape-columns", () => {
  for (const [flag, val, pattern] of [
    ["--tape-as-of", "26/08/2026", /tape-as-of must be YYYY-MM-DD/],
    ["--tape-as-of", "2026-13-01", /tape-as-of must be YYYY-MM-DD/],
    ["--tape-columns", "balanceBAL", /must be k=v/],
  ] as const) {
    const args = [...BASE, "--price-bps", "200"];
    const i = args.indexOf(flag);
    if (i === -1) args.push(flag, val);
    else args[i + 1] = val;
    const r = runCli(args);
    assert.equal(r.code, 2, `${flag} ${val} should be refused`);
    assert.match(r.stderr ?? "", pattern);
  }
});

test("CLI prints the barbell warning when mean and median diverge", () => {
  const rows = [
    "ACCT,BAL,ST,LPD,CODATE,TYPE",
    ...Array.from({ length: 40 }, (_, i) => `S${i},50.00,TX,01/15/2024,07/01/2024,creditcard`),
    "L1,5000.00,TX,01/15/2024,07/01/2024,creditcard",
  ].join("\n");
  const r = runCli(
    [
      "--tape", "-", "--tape-declared-face", "7000.00", "--tape-declared-accounts", "41",
      "--tape-date-format", "MM/DD/YYYY", "--tape-columns", COLS, "--tape-as-of", "2026-08-26",
      "--legal-share-bps", String(LEGAL_SHARE_BPS_VERIFIED), "--gross-recovery-bps", String(GROSS_RECOVERY_BPS_JCAP_LOW), "--price-bps", "200", "--segments",
    ],
    rows,
  );
  assert.match(r.stdout, /Mean balance .* vs median/);
  assert.match(r.stdout, /it is a barbell/);
});

test("an empty flag value is refused, never silently read as zero", () => {
  // Number("") is 0 and Number.isFinite(0) is true, so "--price-bps=" used to
  // become a price of ZERO — a $0.00 purchase price and a CLEARS verdict on any
  // tape. A free portfolio always clears: the maximally flattering failure, and
  // it was introduced BY the fix that added --key=value parsing (before that,
  // an empty value was an unknown key and errored).
  for (const flag of ["--price-bps=", "--legal-share-bps=", "--horizon=", "--upfront-cents="]) {
    const key = flag.slice(0, -1);
    const r = runCli([...withFlag([...BASE, "--price-bps", "200"], key).filter((a) => a !== key), flag]);
    assert.equal(r.code, 2, `${flag} should be refused`);
    assert.match(r.stderr ?? "", /empty value/);
  }
  // An explicit zero is still a legal value — this must not over-correct.
  const zero = runCli([...BASE, "--price-bps=0", "--segments", "--json"]);
  const json = JSON.parse(zero.stdout.slice(zero.stdout.indexOf("{")));
  assert.equal(json.segmented.blended.purchasePriceCents, 0);
});

test("--key=value and --key value agree across every numeric flag", () => {
  for (const [k, v] of [
    ["horizon", "60"],
    ["retention-bps", "8500"],
    ["hurdle-bps", "1200"],
    ["gross-recovery-bps", "1400"],
    ["servicing-bps", "600"],
    ["upfront-cents", "250"],
  ] as const) {
    // gross-recovery-bps is already in BASE, and a repeated flag is a hard
    // error, so that one iteration must start from the variant without it.
    const b0 = k === "gross-recovery-bps" ? BASE_NO_GR : BASE;
    const spaced = runCli([...b0, "--price-bps", "200", "--segments", "--json", `--${k}`, v]);
    const equals = runCli([...b0, "--price-bps", "200", "--segments", "--json", `--${k}=${v}`]);
    const a = JSON.parse(spaced.stdout.slice(spaced.stdout.indexOf("{")));
    const b = JSON.parse(equals.stdout.slice(equals.stdout.indexOf("{")));
    assert.equal(a.segmented.blended.maxPriceBps, b.segmented.blended.maxPriceBps, `--${k}`);
    assert.equal(spaced.code, equals.code, `--${k} exit code`);
  }
});

test("an empty value on a STRING flag fails closed too", () => {
  // The numeric fix closed --price-bps=; these are the other half of the
  // surface. None may fall through to a default.
  for (const [flag, pattern] of [
    ["--tape-type=", /is not a debt type/],
    ["--tape-as-of=", /must be YYYY-MM-DD/],
    ["--hypothesis=", /must be h1 or h3/],
    ["--tape-date-format=", /never sniffed/],
  ] as const) {
    const args = [...BASE, "--price-bps", "200"];
    const dup = args.indexOf(flag.slice(0, -1));
    if (dup !== -1) args.splice(dup, 2);
    const r = runCli([...args, flag]);
    assert.equal(r.code, 2, `${flag} should be refused`);
    assert.match(r.stderr ?? "", pattern);
  }
});

test("--tape-columns splits on the first = and refuses an unknown slot", () => {
  // Two silent-ambiguity bugs of the same family as the duplicate-header one.
  // `const [k, v] = pair.split("=")` dropped everything after the second "=",
  // and a typo'd SLOT key (balanace=) was simply added to the map while the
  // real `balance` slot kept its default — a silent fallback to the default,
  // which is the shape every flattering bug in this CLI has taken.
  const bad = runCli([
    ...withFlag(BASE, "--tape-columns", "balanace=BAL,state=ST,lastPaymentDate=LPD"),
    "--tape-type", "credit_card",
    "--price-bps", "200",
  ]);
  assert.equal(bad.code, 2);
  assert.match(bad.stderr ?? "", /is not a column slot/);

  // A value containing "=" is preserved rather than truncated: the column is
  // then correctly reported as absent from the header, not silently renamed.
  const weird = runCli([
    ...withFlag(BASE, "--tape-columns", "balance=A=B,state=ST,lastPaymentDate=LPD"),
    "--tape-type", "credit_card",
    "--price-bps", "200",
  ]);
  assert.equal(weird.code, 2);
  assert.match(weird.stderr ?? "", /"A=B" for balance: it does not look like a balance column/);
});

test("the --face path refuses tape-only flags instead of dropping them", () => {
  // It accepted and silently discarded all of these. --hypothesis and
  // --segments are exactly the two that can only make a verdict WORSE, so
  // dropping them always resolved toward the flattering blended answer; and
  // --tape-declared-face gave someone who believed they were getting
  // reconciliation none at all.
  const face = [
    "--face", "192196.97", "--price-bps", "200",
    "--legal-share-bps", String(LEGAL_SHARE_BPS_VERIFIED),
    "--gross-recovery-bps", String(GROSS_RECOVERY_BPS_JCAP_LOW),
    "--accounts", "200",
  ];
  for (const extra of [
    ["--hypothesis", "h3"],
    ["--segments"],
    ["--tape-declared-face", "999999"],
    ["--tape-date-format", "MM/DD/YYYY"],
  ]) {
    const r = runCli([...face, ...extra]);
    assert.equal(r.code, 2, `${extra[0]} should be refused on the --face path`);
    assert.match(r.stderr ?? "", /require --tape/);
  }
  // The plain --face path still works.
  const ok = runCli(face);
  assert.notEqual(ok.code, 2);
});

test("a repeated flag is an error, not last-wins", () => {
  // `--price-bps 9000 --price-bps 200` silently priced at 200 and exited 0.
  const r = runCli([...BASE, "--price-bps", "9000", "--price-bps", "200"]);
  assert.equal(r.code, 2);
  assert.match(r.stderr ?? "", /given more than once/);
  // Including across the two syntaxes.
  const mixed = runCli([...BASE, "--price-bps", "9000", "--price-bps=200"]);
  assert.equal(mixed.code, 2);
});

test("a switch with an attached value is refused rather than read as OFF", () => {
  // `--json=false` still emitted JSON and `--segments=false` still printed
  // bands, because presence is what they are tested on.
  for (const flag of ["--json=false", "--segments=false", "--stress=0"]) {
    const r = runCli([...BASE, "--price-bps", "200", flag]);
    assert.equal(r.code, 2, `${flag} should be refused`);
    assert.match(r.stderr ?? "", /is a switch and takes no value/);
  }
  // The bare switches still work.
  const bare = runCli([...BASE, "--price-bps", "200", "--segments"]);
  assert.notEqual(bare.code, 2);
});

test("an unbounded band that is not last is caught as an overlap", () => {
  // Every maxCents:null in the suite sat in the LAST position, so the
  // `prev.maxCents === null` disjunct of the overlap check was never exercised
  // — and under a mutation removing it, bandIndexOf's first-match rule gives
  // the later band zero accounts while it holds some.
  const tape = buildTape([...accounts(2, 10_000), ...accounts(2, 60_000)], { label: "u", asOf: ASOF });
  assert.throws(
    () =>
      segmentTape(tape, [
        { label: "lo", minCents: 0, maxCents: null },
        { label: "hi", minCents: 50_000, maxCents: null },
      ]),
    /overlap/,
  );
  // A single unbounded band is still fine.
  const single = segmentTape(tape, [{ label: "all", minCents: 0, maxCents: null }]);
  assert.equal(single.segments[0].faceCents, tape.faceCents);
});

test("CLI states which columns it read and what it assumed", () => {
  // Omitting --tape-columns silently applies BAL/ST/LPD, and an unmapped
  // optional slot silently disables everything downstream of it.
  const r = runCli([
    ...withFlag(BASE, "--tape-columns", "balance=BAL,state=ST,lastPaymentDate=LPD"),
    "--tape-type", "credit_card",
    "--price-bps", "200",
  ]);
  assert.match(r.stdout, /Columns read:/);
  assert.match(r.stdout, /id=\(unmapped\)/);
  assert.match(r.stdout, /chargeOffDate=\(unmapped\)/);
  assert.match(r.stdout, /Debt type ASSUMED "credit_card"/);

  // Fully mapped: no assumption line.
  const full = runCli([...BASE, "--price-bps", "200"]);
  assert.match(full.stdout, /debtType=TYPE/);
  assert.equal(/Debt type ASSUMED/.test(full.stdout), false);
});

test("the assumed-debt-type claim names the branch it is actually in", () => {
  // The previous assertion matched /written vs open-account periods/, which
  // appears in BOTH branches of the ternary — so it could not tell "cannot
  // change" from "IS changing", and three mutations of that logic survived it.
  const noType = withFlag(BASE, "--tape-columns", "balance=BAL,state=ST,lastPaymentDate=LPD");

  // A real type, on a tape whose states do not split the two periods.
  const inert = runCli([...noType, "--tape-type", "credit_card", "--price-bps", "200"]);
  assert.match(inert.stdout, /No state ON THIS TAPE splits/);
  assert.equal(/IS changing the SOL result/.test(inert.stdout), false);

  // "unknown" is an accepted --tape-type and has NO limitations period at all,
  // which the old whole-table predicate did not model: it printed "cannot
  // change the SOL result" on the very run where the assumption flipped
  // CLEARS/exit 0 to DECLINE/exit 1.
  const unknown = runCli([...noType, "--tape-type", "unknown", "--price-bps", "200", "--hypothesis", "h3"]);
  assert.match(unknown.stdout, /has NO limitations period/);
  assert.match(unknown.stdout, /disqualifies/);
  assert.equal(/cannot change the SOL result/.test(unknown.stdout), false);
  assert.match(unknown.stdout, /In box\s+0 accounts/, "and it really does disqualify everything");
  assert.equal(unknown.code, 1);
});

test("provenance claims are made only about values that ARE the default", () => {
  // The disclosures used to assert the DEFAULT's pedigree about the
  // OPERATOR's number: --gross-recovery-bps 1200 printed "12.00c/$1
  // all-channel" (the 1680 default's provenance), --retention-bps 8500 printed
  // "held fixed and undocumented", --servicing-bps 700 printed "is a
  // PLACEHOLDER pending U6". Attaching a sourced figure's pedigree to a number
  // someone typed is this module's own error, pointed the other way.
  // Gross recovery is NOT in this list any more: as of 28 Aug 2026 it has no
  // default at all, so there is no pedigree to misattribute. It is always the
  // operator's number, and the CLI must say so — asserted below.
  const defaults = runCli([...BASE, "--price-bps", "200"]);
  assert.match(defaults.stdout, /all-channel — a figure you chose/);
  assert.match(defaults.stdout, /Retention 9000 \(default, undocumented\)/);
  assert.match(defaults.stdout, /servicing .* \(default, PLACEHOLDER pending U6\)/);
  assert.match(defaults.stdout, /up-front 175c\/account \(default, PLACEHOLDER pending U6\)/);
  assert.match(defaults.stdout, /weakest input in the model/);

  const overridden = runCli([
    ...BASE_NO_GR, "--price-bps", "200",
    "--gross-recovery-bps", "1200",
    "--retention-bps", "8500",
    "--servicing-bps", "700",
    "--upfront-cents", "250",
  ]);
  // Whatever the operator passes, the claim is the same — it is their figure.
  assert.match(overridden.stdout, /12\.00¢\/\$1 all-channel — a figure you chose/);
  assert.equal(/the default\)/.test(overridden.stdout.split("Retention")[0]), false);
  assert.match(overridden.stdout, /Retention 8500 \(supplied by you\)/);
  assert.match(overridden.stdout, /servicing .* \(supplied by you\)/);
  assert.match(overridden.stdout, /up-front 250c\/account \(supplied by you\)/);
  assert.equal(
    /PLACEHOLDER pending U6/.test(overridden.stdout),
    false,
    "a supplied value is not the placeholder",
  );
  assert.equal(/weakest input in the model/.test(overridden.stdout), false);
});

test("the H1 recovery caveat reads as whole sentences", () => {
  // Was "in both branches". There is only ONE branch now: gross recovery lost
  // its default on 28 Aug 2026, so the supplied-vs-default fork this test was
  // built around no longer exists. The sentence-completeness check survives,
  // because the original bug was a continuation line orphaned from its opener.
  const supplied = runCli([...BASE_NO_GR, "--price-bps", "200", "--hypothesis", "h1", "--gross-recovery-bps", "1200"]);
  assert.match(supplied.stdout, /12\.00¢\/\$1 is an all-channel rate, measured on/);
  assert.match(supplied.stdout, /portfolios that retained the option to sue\./);

  const other = runCli([...BASE, "--price-bps", "200", "--hypothesis", "h1"]);
  assert.match(other.stdout, /11\.00¢\/\$1 is an all-channel rate, measured on/);

  // Neither run may leave an unmatched parenthesis in the printed block.
  for (const out of [supplied.stdout, other.stdout]) {
    const block = out.slice(out.indexOf("H1 SELECTS TIME-BARRED"));
    const opens = (block.match(/\(/g) ?? []).length;
    const closes = (block.match(/\)/g) ?? []).length;
    assert.equal(opens, closes, `unbalanced parens in H1 caveat: ${opens} open, ${closes} close`);
  }
});

// --- Round-6 regressions ---------------------------------------------------

test("the DRAG column tracks --upfront-cents instead of freezing at the default", () => {
  // segmentTape never received the UnderwriteInput, so per-band DRAG was frozen
  // at 175c/account regardless of the flag: at 1000c on a $124.35 average band
  // it printed 141bps where the truth is 804bps — a 5.7x understatement in the
  // number segment.ts says it exists to surface. The BLENDED row tracked the
  // flag correctly, so the table contradicted itself.
  const tape = buildTape([...accounts(100, 12_435), ...accounts(10, 645_033)], { label: "d", asOf: ASOF });
  for (const upfront of [0, 175, 1_000]) {
    const s = segmentTape(tape, DEFAULT_BANDS, upfront);
    const small = s.segments.find((x) => x.band.label === "<$250")!;
    assert.equal(
      small.upfrontDragBps,
      Math.round((upfront * 10_000) / small.avgBalanceCents),
      `drag at ${upfront}c must follow the flag`,
    );
  }
  // The three must differ, or the assertion above proves nothing.
  const drags = [0, 175, 1_000].map(
    (u) => segmentTape(tape, DEFAULT_BANDS, u).segments[0].upfrontDragBps,
  );
  assert.equal(new Set(drags).size, 3, `expected three distinct drags, got ${drags.join(",")}`);
  assert.equal(drags[0], 0, "zero cost must show zero drag, not a cost that is not charged");

  // And underwriteSegments must thread it, not just segmentTape.
  const viaInput = underwriteSegments(tape, { ...INPUT, upfrontCentsPerAccount: 1_000 });
  assert.equal(viaInput.segments[0].segment.upfrontDragBps, drags[2]);
});

test("the worthless-band warning does not claim the blend clears when it does not", () => {
  // The gate is !unacquirableAtAnyPrice, which is weaker than clearsHurdle, so
  // the line asserted "The blend clears" three rows under a BLENDED row reading
  // "no". Narrowing the gate would suppress a real warning, so the sentence is
  // what changed.
  const rows = [
    "ACCT,BAL,ST,LPD,CODATE,TYPE",
    ...Array.from({ length: 40 }, (_, i) => `S${i},50.00,TX,01/15/2024,07/01/2024,creditcard`),
    "L1,5000.00,TX,01/15/2024,07/01/2024,creditcard",
  ].join("\n");
  const base = [
    "--tape", "-", "--tape-declared-face", "7000.00", "--tape-declared-accounts", "41",
    "--tape-date-format", "MM/DD/YYYY", "--tape-columns", COLS, "--tape-as-of", "2026-08-26",
    "--legal-share-bps", String(LEGAL_SHARE_BPS_VERIFIED), ...GR_BLEND_CLEARS, "--segments",
  ];
  // A price high enough that the blend itself does not clear.
  const notClearing = runCli([...base, "--price-bps", "500"], rows);
  assert.match(notClearing.stdout, /BLENDED.*\bno\b/);
  assert.match(notClearing.stdout, /The blend does not clear, and .* is separately unacquirable/);
  assert.equal(/The blend CLEARS/.test(notClearing.stdout), false);

  // And where the blend genuinely does clear, it still says so. The
  // precondition is asserted rather than used as a silent guard: wrapped in a
  // bare `if`, this branch would assert nothing the moment the fixture stopped
  // producing a worthless band.
  const clearing = runCli([...base, "--price-bps", "50"], rows);
  assert.match(
    clearing.stdout,
    /unacquirable\s+at ANY price/,
    "fixture must still produce a worthless band, or the CLEARS branch is untested",
  );
  assert.match(clearing.stdout, /The blend CLEARS while/);
});

test("a repeated --tape-columns slot is an error, not last-wins", () => {
  // Duplicating lastPaymentDate onto the charge-off column silently re-anchored
  // SOL and moved an H3 buy box from 22.30% to 33.13% of face — precisely the
  // fallback sol.ts rule (b) forbids.
  const r = runCli([
    ...withFlag(BASE, "--tape-columns", "balance=BAL,state=ST,lastPaymentDate=LPD,lastPaymentDate=CODATE"),
    "--tape-type", "credit_card", "--price-bps", "200",
  ]);
  assert.equal(r.code, 2);
  assert.match(r.stderr ?? "", /names "lastPaymentDate" more than once/);
});

test("--tape-type and a mapped debtType column cannot both be given", () => {
  // The flag was silently inert when the column was present — a supplied input
  // dropped without a word.
  const r = runCli([...BASE, "--price-bps", "200", "--tape-type", "medical"]);
  assert.equal(r.code, 2);
  assert.match(r.stderr ?? "", /were both given/);
});

test("--tape-as-of accepts the same format the tape is declared in", () => {
  // Requiring ISO while the operator is already typing MM/DD/YYYY for the file
  // was a gratuitous refusal, undocumented in USAGE.
  const iso = runCli([...withFlag(BASE, "--tape-as-of", "2026-08-26"), "--price-bps", "200"]);
  const us = runCli([...withFlag(BASE, "--tape-as-of", "08/26/2026"), "--price-bps", "200"]);
  assert.notEqual(iso.code, 2);
  assert.notEqual(us.code, 2, "the tape's own date format must be accepted");
  assert.equal(us.code, iso.code, "and must produce the same verdict");
  const bad = runCli([...withFlag(BASE, "--tape-as-of", "26-08-2026"), "--price-bps", "200"]);
  assert.equal(bad.code, 2);
});

test("the bare --tape run prints the band table and the no-buy-box disclosure", () => {
  // Every CLI test passed --segments or --hypothesis, so the DEFAULT invocation
  // — neither flag — was never exercised. Mutating showBands to require
  // --segments survived, and that run loses the whole band table AND the
  // "verdict is for the WHOLE tape" disclosure.
  const r = runCli([...BASE, "--price-bps", "200"]);
  assert.match(r.stdout, /BAND\s+ACCTS/, "the band table must print by default");
  assert.match(r.stdout, /BLENDED/);
  assert.match(r.stdout, /No buy box applied/);
  assert.match(r.stdout, /ASSUMED, NOT MEASURED/);
});

test('"subsidised" is only claimed when some band is actually carrying another', () => {
  // It was printed for every band below the asking price, including when the
  // blend does not clear and no band is above it — where nothing is carrying
  // anything.
  const highPrice = runCli([...BASE, "--price-bps", "9000", "--segments"]);
  assert.match(highPrice.stdout, /below ask/);
  assert.equal(/subsidised/.test(highPrice.stdout), false, "no band can carry another here");
});

test("a rejected row never echoes its cell value, even when that value is PII", () => {
  // The error path is where this usually leaks: it is the one place tempted to
  // quote the offending input back at the operator. RejectedRow deliberately
  // carries an enum reason and a column NAME, never the cell.
  const rows = [
    "ACCT,BAL,ST,LPD,CODATE,TYPE",
    "123-45-6789,NOTANUMBER,TX,01/15/2024,07/01/2024,creditcard",
    "A2,555-0100,ZZ,01/15/2024,07/01/2024,creditcard",
  ].join("\n");
  const r = runCli([
    "--tape", "-", "--tape-declared-face", "100.00", "--tape-declared-accounts", "2",
    "--tape-date-format", "MM/DD/YYYY", "--tape-columns", COLS,
    "--tape-as-of", "2026-08-26", "--price-bps", "200",
    "--legal-share-bps", String(LEGAL_SHARE_BPS_VERIFIED),
    "--gross-recovery-bps", String(GROSS_RECOVERY_BPS_JCAP_LOW),
  ], rows);
  assert.equal(r.code, 2);
  const all = r.stdout + (r.stderr ?? "");
  for (const value of ["123-45-6789", "555-0100", "NOTANUMBER"]) {
    assert.equal(all.includes(value), false, `${value} was echoed back into the output`);
  }
  // It still says enough to act on: which row, which reason, which column.
  assert.match(r.stdout, /row 1: id_looks_like_ssn \(column ACCT\)/);
  assert.match(r.stdout, /row 2: malformed_balance \(column BAL\)/);
});

test("no two columns fuse, at any value the model accepts", () => {
  // padStart silently does nothing when the value already exceeds the field, so
  // --upfront-cents 99999999 printed the BLENDED row as
  // "$960.9810405991bps-104056.86¢/$1" — three numbers fused into one
  // unreadable token. Anything underwrite() accepts must still render.
  for (const upfront of ["0", "175", "99999999"]) {
    const r = runCli([...BASE, "--price-bps", "200", "--segments", "--upfront-cents", upfront]);
    const line = r.stdout.split("\n").find((l) => l.trim().startsWith("BLENDED"))!;
    assert.ok(line, `no BLENDED row at upfront=${upfront}`);
    // Every field must be separated by whitespace: no digit or ¢ may sit
    // directly against the start of the next number.
    assert.equal(
      /\d(?:bps|¢\/\$1|%)\S/.test(line),
      false,
      `columns fused at upfront=${upfront}: ${line.trim()}`,
    );
    assert.equal(
      /[\d)]\$/.test(line),
      false,
      `a value ran into a dollar figure at upfront=${upfront}: ${line.trim()}`,
    );
    // And the row still carries its distinct tokens.
    const tokens = line.trim().split(/\s+/);
    assert.ok(tokens.length >= 7, `BLENDED row lost columns at upfront=${upfront}: ${tokens.join("|")}`);
  }
});

test("--json is machine-complete on both the success and the refusal path", () => {
  // A caller asking for JSON on a refused tape got exit 2 and nothing to parse,
  // so a pipeline could not report WHY. And defectCounts — which the text
  // report prints, and which is about the DATA rather than the invocation —
  // was missing from the success payload entirely.
  const bad = [
    "ACCT,BAL,ST,LPD,CODATE,TYPE",
    "A1,BAD,TX,01/15/2024,07/01/2024,creditcard",
  ].join("\n");
  const fail = runCli([
    "--tape", "-", "--tape-declared-face", "100.00", "--tape-declared-accounts", "1",
    "--tape-date-format", "MM/DD/YYYY", "--tape-columns", COLS, "--tape-as-of", "2026-08-26",
    "--price-bps", "200", "--legal-share-bps", String(LEGAL_SHARE_BPS_VERIFIED), "--json",
  ], bad);
  assert.equal(fail.code, 2);
  const fj = JSON.parse(fail.stdout.slice(fail.stdout.indexOf("{")));
  assert.equal(fj.reconciliation.ok, false);
  assert.equal(fj.segmented, null, "no analysis exists for a tape that did not reconcile");
  assert.equal(fj.buyBox, null);
  assert.deepEqual(fj.rejected, [{ rowNumber: 1, reason: "malformed_balance", column: "BAL" }]);

  const ok = runCli([...BASE, "--price-bps", "200", "--segments", "--json"]);
  const oj = JSON.parse(ok.stdout.slice(ok.stdout.indexOf("{")));
  assert.ok("defectCounts" in oj, "the text report prints defects; JSON must carry them");
  assert.ok("rejected" in oj);
  assert.ok("columns" in oj, "which columns were read is part of the record");
  assert.equal(oj.assumedDebtType, null, "nothing assumed when the column is mapped");
  assert.notEqual(oj.segmented, null);
});

test('"subsidised" is claimed when a band IS carrying another', () => {
  // The round-6 fix was only tested on its negative half: mutating
  // `anyBandCarries` to false survived, so the positive case — a band genuinely
  // being carried — was unguarded.
  // $300 accounts, not $50: at $50 the small band is UNACQUIRABLE, which is a
  // different label. Subsidised needs a band that is below the ask but still
  // worth something, while another band sits above the ask and carries it.
  // At 250bps: $250-$500 ceiling 2.47c (below), $5k+ 3.02c (above).
  const rows = [
    "ACCT,BAL,ST,LPD,CODATE,TYPE",
    ...Array.from({ length: 40 }, (_, i) => `S${i},300.00,TX,01/15/2024,07/01/2024,creditcard`),
    ...Array.from({ length: 5 }, (_, i) => `L${i},5000.00,TX,01/15/2024,07/01/2024,creditcard`),
  ].join("\n");
  const face = (40 * 30_000 + 5 * 500_000) / 100;
  const r = runCli([
    "--tape", "-", "--tape-declared-face", face.toFixed(2), "--tape-declared-accounts", "45",
    "--tape-date-format", "MM/DD/YYYY", "--tape-columns", COLS, "--tape-as-of", "2026-08-26",
    "--legal-share-bps", String(LEGAL_SHARE_BPS_VERIFIED), ...GR_BLEND_CLEARS, "--price-bps", "250", "--segments",
  ], rows);
  const bandLines = r.stdout.split("\n").filter((l) => /^\s+[<$]/.test(l));
  assert.ok(bandLines.length >= 2, "need at least two bands for one to carry the other");
  assert.match(r.stdout, /subsidised/, "a band below the ask while another is above IS subsidised");
  assert.equal(/below ask/.test(r.stdout), false, "and must not be mislabelled");
});

test("all three duplicate-check scopes are distinguished, with the right remedy", () => {
  // Mutating `idMapped` to false survived: every branch and both remedy
  // sentences were un-asserted, and only the header line was matched.
  const mk = (idCells: string[]) =>
    [
      "ACCT,BAL,ST,LPD,CODATE,TYPE",
      ...idCells.map((id, i) => `${id},100.00,TX,01/15/2024,07/01/2024,creditcard`),
    ].join("\n");
  const run = (rows: string, cols: string) =>
    runCli([
      "--tape", "-", "--tape-declared-face", "300.00", "--tape-declared-accounts", "3",
      "--tape-date-format", "MM/DD/YYYY", "--tape-columns", cols, "--tape-as-of", "2026-08-26",
      "--legal-share-bps", String(LEGAL_SHARE_BPS_VERIFIED), "--gross-recovery-bps", String(GROSS_RECOVERY_BPS_JCAP_LOW), "--price-bps", "200",
    ], rows);

  // (a) no id column mapped at all
  const unmapped = run(mk(["A1", "A2", "A3"]), "balance=BAL,state=ST,lastPaymentDate=LPD,debtType=TYPE");
  assert.match(unmapped.stdout, /no id column mapped/);
  assert.match(unmapped.stdout, /Map one with --tape-columns id=<COL>/);

  // (b) mapped, but every cell blank — mapping a column cannot fix that
  const allBlank = run(mk(["", "", ""]), COLS);
  assert.match(allBlank.stdout, /is mapped but EVERY cell is blank/);
  assert.match(allBlank.stdout, /Mapping a column cannot fix blank cells/);
  assert.equal(/no id column mapped/.test(allBlank.stdout), false);

  // (c) partially blank
  const partial = run(mk(["A1", "", ""]), COLS);
  assert.match(partial.stdout, /2 of 3 rows have a blank id/);
  assert.match(partial.stdout, /Mapping a column cannot fix blank cells/);

  // (d) fully populated — no warning at all
  const full = run(mk(["A1", "A2", "A3"]), COLS);
  assert.equal(/NOT FULLY CHECKED/.test(full.stdout), false);
});

test("--json content is asserted, not merely present", () => {
  // The earlier test checked `"columns" in oj` only, so emitting `columns: {}`
  // and `assumedDebtType: null` survived.
  const mapped = runCli([...BASE, "--price-bps", "200", "--segments", "--json"]);
  const mj = JSON.parse(mapped.stdout.slice(mapped.stdout.indexOf("{")));
  assert.equal(mj.columns.balance, "BAL");
  assert.equal(mj.columns.debtType, "TYPE");
  assert.equal(mj.assumedDebtType, null);
  assert.equal(typeof mj.defectCounts.missing_last_payment_date, "number");

  const assumed = runCli([
    ...withFlag(BASE, "--tape-columns", "balance=BAL,state=ST,lastPaymentDate=LPD"),
    "--tape-type", "medical", "--price-bps", "200", "--segments", "--json",
  ]);
  const aj = JSON.parse(assumed.stdout.slice(assumed.stdout.indexOf("{")));
  assert.equal(aj.assumedDebtType, "medical", "what was assumed must be in the payload");
  assert.equal(aj.columns.debtType, undefined);
});

test("a wholly unacquirable tape is named, not shown as a negative price", () => {
  // hiddenUnbuyable is deliberately empty when the BLEND itself is worthless (a
  // band cannot be "hidden" inside a worthless blend), so the run printed a
  // NEGATIVE number under the label "Ceiling" and said only "no". The same
  // understatement was already fixed once in the buy-box branch.
  const rows = [
    "ACCT,BAL,ST,LPD,CODATE,TYPE",
    ...Array.from({ length: 1000 }, (_, i) => `S${i},50.00,TX,01/15/2024,07/01/2024,creditcard`),
  ].join("\n");
  const r = runCli([
    "--tape", "-", "--tape-declared-face", "50000.00", "--tape-declared-accounts", "1000",
    "--tape-date-format", "MM/DD/YYYY", "--tape-columns", COLS, "--tape-as-of", "2026-08-26",
    "--legal-share-bps", String(LEGAL_SHARE_BPS_VERIFIED), "--gross-recovery-bps", String(GROSS_RECOVERY_BPS_JCAP_LOW), "--price-bps", "200", "--segments",
  ], rows);
  assert.match(r.stdout, /THE WHOLE TAPE IS UNACQUIRABLE AT ANY PRICE/);
  assert.match(r.stdout, /seller would have to pay/);
  assert.match(r.stdout, /BLENDED.*unacquirable\s+WORTHLESS/);
  // No negative figure may be presented as a ceiling.
  assert.equal(/-\d+\.\d+¢\/\$1/.test(r.stdout.split("BLENDED")[1] ?? ""), false);
  assert.equal(r.code, 1);
});

test("--json puts machine output on stdout and the report on stderr", () => {
  // USAGE says "instead of a report" and the --face path honours that; the tape
  // path printed 43 lines before the "{", forcing every consumer to slice.
  const r = runCli([...BASE, "--price-bps", "200", "--hypothesis", "h3", "--json"]);
  assert.equal(r.stdout.trimStart()[0], "{", "stdout must start with the payload");
  const j = JSON.parse(r.stdout);
  assert.ok(j.input, "provenance must ride with the numbers");
  assert.equal(j.input.priceBps, 200);
  assert.equal(j.asOf, "2026-08-26");
  assert.equal(j.asOfSuppliedByUser, true);
  assert.ok(j.buyBox);
  // The human disclosures are not dropped, only moved.
  assert.match(r.stderr ?? "", /ASSUMED, NOT MEASURED/);
  assert.match(r.stderr ?? "", /BUY BOX/);
});

test("the jurisdiction count matches what the parser actually accepts", () => {
  // Printed "of 51 jurisdictions" after the parser began accepting 56 codes,
  // understating the uncovered surface.
  const r = runCli([...BASE, "--price-bps", "200", "--hypothesis", "h3"]);
  assert.match(r.stdout, new RegExp(`of ${JURISDICTION_COUNT} jurisdictions`));
  assert.equal(JURISDICTION_COUNT, 56, "50 states + DC + 5 territories");
});
