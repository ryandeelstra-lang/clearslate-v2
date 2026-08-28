// Tests for core/sol.ts. Zero dependencies — node:test + node:assert.
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  SOL_TABLE_VERIFIED,
  assessSol,
  coveredStates,
  qualifiesFor,
  type SolRule,
  type SolTable,
} from "./sol.ts";
import type { DebtType, TapeAccount, Ymd } from "./tape.ts";

const ASOF: Ymd = { y: 2026, m: 8, d: 26 };

function acct(over: Partial<TapeAccount> = {}): TapeAccount {
  return {
    id: "a",
    balanceCents: 100_00,
    state: "TX",
    debtType: "credit_card" as DebtType,
    lastPaymentDate: { y: 2024, m: 1, d: 15 },
    chargeOffDate: { y: 2024, m: 7, d: 1 },
    defects: [],
    ...over,
  };
}

function rule(over: Partial<SolRule> = {}): SolRule {
  return {
    state: "XX",
    writtenContractYears: 4,
    openAccountYears: 4,
    creditCardBasis: "written",
    revivalOnPayment: "restarts",
    revivalAfterExpiry: "does_not_revive",
    statute: "test",
    sourceUrl: "https://example.test",
    verifiedOn: "2026-08-26",
    ...over,
  };
}

const XX = (over: Partial<SolRule> = {}): SolTable =>
  new Map([["XX", rule({ state: "XX", ...over })]]);

test("an unknown state never gets a default limitation period", () => {
  // A 4-year default would classify nearly all fresh paper as within-SOL,
  // which is exactly what H3 wants to be true.
  const s = assessSol(acct({ state: "OH" }), ASOF, XX());
  assert.equal(s.status, "unknown");
  assert.equal(s.limitMonths, null);
  assert.equal(s.rule, null);
  assert.ok(s.caveats.includes("no_rule_for_state"));
});

test("a missing last-payment date never falls back to the charge-off date", () => {
  // Charge-off is later than last payment, so that fallback makes accounts look
  // MORE within-SOL (flatters H3) and LESS time-barred (un-flatters H1).
  const a = acct({ state: "XX", lastPaymentDate: null, chargeOffDate: { y: 2024, m: 7, d: 1 } });
  const s = assessSol(a, ASOF, XX());
  assert.equal(s.status, "unknown");
  assert.equal(s.anchor, "none");
  assert.equal(s.elapsedMonths, null);
  // Prove the fallback would have produced a different, flattering answer.
  const withFallback = assessSol(
    acct({ state: "XX", lastPaymentDate: { y: 2024, m: 7, d: 1 } }),
    ASOF,
    XX(),
  );
  assert.equal(withFallback.status, "within");
  assert.notEqual(s.status, withFallback.status);
});

test("unknown SOL is unbuyable under BOTH hypotheses — the fork is not a partition", () => {
  const s = assessSol(acct({ state: "OH" }), ASOF, XX());
  assert.equal(qualifiesFor(s, "H1_time_barred"), false);
  assert.equal(qualifiesFor(s, "H3_within_sol"), false);
});

test("H1 and H3 predicates are disjoint over an arbitrary tape", () => {
  const dates: Ymd[] = [
    { y: 2026, m: 1, d: 1 },
    { y: 2024, m: 1, d: 1 },
    { y: 2022, m: 8, d: 26 },
    { y: 2020, m: 1, d: 1 },
    { y: 2015, m: 6, d: 30 },
  ];
  for (const state of ["XX", "OH"]) {
    for (const lastPaymentDate of dates) {
      const s = assessSol(acct({ state, lastPaymentDate }), ASOF, XX());
      const both = qualifiesFor(s, "H1_time_barred") && qualifiesFor(s, "H3_within_sol");
      assert.equal(both, false, `both true for ${state} ${JSON.stringify(lastPaymentDate)}`);
    }
  }
});

test("the exact anniversary is unknown, not a coin flip", () => {
  const t = XX({ writtenContractYears: 4, openAccountYears: 4 });
  // 48 months exactly.
  const exact = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2022, m: 8, d: 26 } }), ASOF, t);
  assert.equal(exact.status, "unknown");
  assert.ok(exact.caveats.includes("on_the_boundary"));
  // 47 months.
  const within = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2022, m: 9, d: 26 } }), ASOF, t);
  assert.equal(within.status, "within");
  // 49 months.
  const barred = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2022, m: 7, d: 26 } }), ASOF, t);
  assert.equal(barred.status, "time_barred");
});

test("a contested basis returns unknown only when the two periods disagree", () => {
  const t = XX({ creditCardBasis: "contested", writtenContractYears: 6, openAccountYears: 3 });
  // 2 years elapsed: within under both.
  const a = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2024, m: 8, d: 26 } }), ASOF, t);
  assert.equal(a.status, "within");
  // 8 years elapsed: barred under both.
  const b = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2018, m: 8, d: 26 } }), ASOF, t);
  assert.equal(b.status, "time_barred");
  // 4 years elapsed: within under 6y, barred under 3y — they disagree.
  const c = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2022, m: 8, d: 26 } }), ASOF, t);
  assert.equal(c.status, "unknown");
  assert.ok(c.caveats.includes("contested_basis_disagrees"));
});

test("H1 refuses paper whose post-expiry revival rule is unresolved", () => {
  const old = { y: 2015, m: 1, d: 1 };
  for (const revivalAfterExpiry of ["unknown", "revives"] as const) {
    const t = XX({ revivalAfterExpiry });
    const s = assessSol(acct({ state: "XX", lastPaymentDate: old }), ASOF, t);
    assert.equal(s.status, "time_barred");
    assert.equal(qualifiesFor(s, "H1_time_barred"), false, `H1 accepted ${revivalAfterExpiry}`);
  }
  const good = assessSol(acct({ state: "XX", lastPaymentDate: old }), ASOF, XX());
  assert.equal(qualifiesFor(good, "H1_time_barred"), true);
});

test("H3 refuses paper within months of the bar", () => {
  // 46 months elapsed on a 48-month clock: 2 months of headroom.
  const s = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2022, m: 10, d: 26 } }), ASOF, XX());
  assert.equal(s.status, "within");
  assert.equal(s.monthsToBar, 2);
  assert.equal(qualifiesFor(s, "H3_within_sol"), false, "default headroom is 6 months");
  assert.equal(qualifiesFor(s, "H3_within_sol", { minMonthsToBar: 1 }), true);
});

test("an unknown debt type gets no limitation period", () => {
  const s = assessSol(acct({ state: "XX", debtType: "unknown" }), ASOF, XX());
  assert.equal(s.status, "unknown");
  assert.ok(s.caveats.includes("debt_type_unknown"));
});

test("a last-payment date after the as-of date is not a usable anchor", () => {
  const s = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2027, m: 1, d: 1 } }), ASOF, XX());
  assert.equal(s.status, "unknown");
  assert.equal(s.anchor, "none");
});

test("every rule in the shipped table carries a statute and a primary-source URL", () => {
  // Makes fabrication a test failure.
  for (const [state, r] of SOL_TABLE_VERIFIED) {
    assert.ok(r.statute.length > 0, `${state} has no statute`);
    assert.ok(r.sourceUrl.startsWith("https://"), `${state} has no primary source URL`);
    assert.match(r.verifiedOn, /^\d{4}-\d{2}-\d{2}$/, `${state} has no read date`);
    assert.ok(r.writtenContractYears > 0 && r.openAccountYears > 0, `${state} has a zero period`);
  }
});

test("the shipped table covers only researched states, and says so", () => {
  const covered = coveredStates(SOL_TABLE_VERIFIED);
  assert.deepEqual(covered, ["NY", "TX"]);
  // Everything else is unknown, hence unbuyable under both hypotheses.
  const s = assessSol(acct({ state: "CA" }), ASOF, SOL_TABLE_VERIFIED);
  assert.equal(s.status, "unknown");
});

test("an empty table is a correct table", () => {
  const empty: SolTable = new Map();
  const s = assessSol(acct(), ASOF, empty);
  assert.equal(s.status, "unknown");
  assert.deepEqual(coveredStates(empty), []);
});

test("New York runs three years and does not revive after expiry", () => {
  // CPLR 214-i (Consumer Credit Fairness Act), effective 7 April 2022.
  const r = SOL_TABLE_VERIFIED.get("NY")!;
  assert.equal(r.writtenContractYears, 3);
  assert.equal(r.revivalAfterExpiry, "does_not_revive");
  // The two clocks must actually differ. Pick an elapsed time BETWEEN them —
  // 40 months — so NY (36) is barred while TX (48) is not. The previous version
  // of this test used a date 55 months back, where both are barred, so it
  // asserted the same value on both sides and could not have detected a table
  // that blurred NY and TX. Its comment claimed otherwise.
  const lpd = { y: 2023, m: 4, d: 26 };
  const ny = assessSol(acct({ state: "NY", lastPaymentDate: lpd }), ASOF, SOL_TABLE_VERIFIED);
  const tx = assessSol(acct({ state: "TX", lastPaymentDate: lpd }), ASOF, SOL_TABLE_VERIFIED);
  assert.equal(ny.elapsedMonths, 40);
  assert.equal(ny.status, "time_barred", "NY three-year clock has run");
  assert.equal(tx.status, "within", "TX four-year clock has not");
  assert.notEqual(ny.status, tx.status, "the table must not blur the two");
});

test("Texas runs four years and bars revival for debt buyers", () => {
  // Tex. Civ. Prac. & Rem. Code 16.004; Tex. Fin. Code 392.307.
  const r = SOL_TABLE_VERIFIED.get("TX")!;
  assert.equal(r.writtenContractYears, 4);
  assert.equal(r.revivalAfterExpiry, "does_not_revive");
  assert.equal(r.revivalOnPayment, "no_effect");
});

// ---------------------------------------------------------------------------
// Regressions from adversarial review round 2. Both shipped rules happen to
// have writtenContractYears === openAccountYears, so nothing in the suite could
// tell the two branches apart until these.

test("the reported limit is the SHORTEST applicable period, the one that bars first", () => {
  // sol.ts reports against Math.min(...years). With Math.max, a contested-basis
  // account 3 months from the bar reports 39 months of headroom and H3 BUYS IT.
  const t = XX({ creditCardBasis: "contested", writtenContractYears: 6, openAccountYears: 3 });
  // 33 months elapsed: within under both (72 and 36), but only 3 months of room.
  const s = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2023, m: 11, d: 26 } }), ASOF, t);
  assert.equal(s.status, "within");
  assert.equal(s.elapsedMonths, 33);
  assert.equal(s.limitMonths, 36, "must report the 3-year clock, not the 6-year one");
  assert.equal(s.monthsToBar, 3);
  assert.equal(qualifiesFor(s, "H3_within_sol"), false, "3 months is inside the 6-month gate");
});

test("open-account debt runs on the open-account clock, not the written-contract one", () => {
  // Mutating openAccountYears -> writtenContractYears made medical paper look
  // three years fresher than it is. Flatters H3.
  const t = XX({ writtenContractYears: 6, openAccountYears: 3 });
  const lpd = { y: 2022, m: 2, d: 26 }; // 54 months before ASOF
  const medical = assessSol(acct({ state: "XX", debtType: "medical", lastPaymentDate: lpd }), ASOF, t);
  const telecom = assessSol(acct({ state: "XX", debtType: "telecom", lastPaymentDate: lpd }), ASOF, t);
  const card = assessSol(acct({ state: "XX", debtType: "credit_card", lastPaymentDate: lpd }), ASOF, t);
  assert.equal(medical.elapsedMonths, 54);
  assert.equal(medical.limitMonths, 36);
  assert.equal(medical.status, "time_barred");
  assert.equal(telecom.status, "time_barred");
  assert.equal(card.limitMonths, 72);
  assert.equal(card.status, "within", "the same dates on a written contract are not barred");
});

test("near_boundary fires within three months either side of the bar", () => {
  const t = XX({ writtenContractYears: 4, openAccountYears: 4 });
  // 46 months elapsed on a 48-month clock.
  const near = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2022, m: 10, d: 26 } }), ASOF, t);
  assert.equal(near.monthsToBar, 2);
  assert.ok(near.caveats.includes("near_boundary"), `caveats were [${near.caveats.join(",")}]`);
  // Just past it, on the barred side.
  const justPast = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2022, m: 6, d: 26 } }), ASOF, t);
  assert.equal(justPast.status, "time_barred");
  assert.ok(justPast.caveats.includes("near_boundary"));
  // Comfortably inside: no caveat.
  const far = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2025, m: 8, d: 26 } }), ASOF, t);
  assert.equal(far.monthsToBar, 36);
  assert.equal(far.caveats.includes("near_boundary"), false);
});

test("an unresolved post-expiry revival rule is flagged, not just silently disqualifying", () => {
  // The caveat was pushed and never surfaced anywhere; now it reaches the buy
  // box's caveatCounts, so it needs to actually fire.
  const t = XX({ revivalAfterExpiry: "unknown" });
  const s = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2015, m: 1, d: 1 } }), ASOF, t);
  assert.ok(s.caveats.includes("revival_after_expiry_unresolved"));
  assert.equal(qualifiesFor(s, "H1_time_barred"), false);
  // A resolved rule carries no such caveat.
  const resolved = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2015, m: 1, d: 1 } }), ASOF, XX());
  assert.equal(resolved.caveats.includes("revival_after_expiry_unresolved"), false);
});

test("caveats are the first blocking reason, not a cumulative list", () => {
  // An account in an uncovered state AND missing its last-payment date reports
  // only no_rule_for_state — assessSol returns early. That is why the CLI's
  // caveat counts do not sum to its defect counts, and the report now says so.
  const a = acct({ state: "OH", lastPaymentDate: null });
  const s = assessSol(a, ASOF, XX());
  assert.deepEqual(s.caveats, ["no_rule_for_state"]);
  assert.equal(s.caveats.includes("no_last_payment_date"), false, "short-circuits before the date check");
  // The same account in a COVERED state reports the date problem instead.
  const covered = assessSol(acct({ state: "XX", lastPaymentDate: null }), ASOF, XX());
  assert.ok(covered.caveats.includes("no_last_payment_date"));
  assert.equal(covered.caveats.includes("no_rule_for_state"), false);
});

test("near_boundary fires at exactly 3 months and not at 4", () => {
  // The window's own edges were never asserted: the prior test checked 2, -2
  // and 36 only, so narrowing `<= 3` to `< 3` survived — and narrowing the
  // window suppresses warnings, which is the flattering direction.
  const t = XX({ writtenContractYears: 4, openAccountYears: 4 });
  const at = (lpd: Ymd) => assessSol(acct({ state: "XX", lastPaymentDate: lpd }), ASOF, t);
  const cases: Array<[Ymd, number, boolean]> = [
    [{ y: 2022, m: 12, d: 26 }, 4, false],
    [{ y: 2022, m: 11, d: 26 }, 3, true],
    [{ y: 2022, m: 5, d: 26 }, -3, true],
    [{ y: 2022, m: 4, d: 26 }, -4, false],
  ];
  for (const [lpd, expectedToBar, expectCaveat] of cases) {
    const s = at(lpd);
    assert.equal(s.monthsToBar, expectedToBar, `monthsToBar for ${JSON.stringify(lpd)}`);
    assert.equal(
      s.caveats.includes("near_boundary"),
      expectCaveat,
      `near_boundary at monthsToBar ${expectedToBar} should be ${expectCaveat}`,
    );
  }
});

test("all three creditCardBasis values select a different clock", () => {
  // `creditCardBasis: "open"` had ZERO occurrences in the suite, so mutating
  // its branch to read writtenContractYears survived everything. Several states
  // genuinely treat credit-card claims as open accounts; getting it wrong hands
  // cards the LONGER period, so more accounts read within-SOL — flatters H3.
  //
  // written 6y / open 3y, 54 months elapsed, discriminates all three branches.
  const lpd = { y: 2022, m: 2, d: 26 };
  const card = (basis: "written" | "open" | "contested") =>
    assessSol(
      acct({ state: "XX", debtType: "credit_card", lastPaymentDate: lpd }),
      ASOF,
      XX({ creditCardBasis: basis, writtenContractYears: 6, openAccountYears: 3 }),
    );

  const written = card("written");
  assert.equal(written.elapsedMonths, 54);
  assert.equal(written.limitMonths, 72);
  assert.equal(written.status, "within");

  const open = card("open");
  assert.equal(open.limitMonths, 36, "open basis must use the open-account period");
  assert.equal(open.status, "time_barred");

  const contested = card("contested");
  assert.equal(contested.status, "unknown", "the two clocks disagree here");
  assert.ok(contested.caveats.includes("contested_basis_disagrees"));

  // The three are genuinely distinct outcomes on identical input.
  assert.notEqual(written.status, open.status);
  assert.notEqual(written.status, contested.status);
  assert.notEqual(open.status, contested.status);

  // And retail_card follows the same rule as credit_card.
  const retail = assessSol(
    acct({ state: "XX", debtType: "retail_card", lastPaymentDate: lpd }),
    ASOF,
    XX({ creditCardBasis: "open", writtenContractYears: 6, openAccountYears: 3 }),
  );
  assert.equal(retail.limitMonths, 36);
  assert.equal(retail.status, "time_barred");
});

test("anchor names what elapsed time was measured from, in both directions", () => {
  // Only ever asserted as "none", so mutating the success path to return "none"
  // too survived the whole suite. `anchor` has no consumer inside core/ — it is
  // public API surface telling a caller WHAT the clock was run from, and the
  // distinction is the whole point of refusing to fall back to the charge-off
  // date. Same declared-but-unread status as revivalOnPayment.
  const ok = assessSol(acct({ state: "XX", lastPaymentDate: { y: 2024, m: 1, d: 15 } }), ASOF, XX());
  assert.equal(ok.anchor, "last_payment");
  assert.equal(typeof ok.elapsedMonths, "number");

  for (const broken of [
    acct({ state: "XX", lastPaymentDate: null }),
    acct({ state: "XX", lastPaymentDate: { y: 2027, m: 1, d: 1 } }),
    acct({ state: "OH", lastPaymentDate: { y: 2024, m: 1, d: 15 } }),
    acct({ state: "XX", debtType: "unknown", lastPaymentDate: { y: 2024, m: 1, d: 15 } }),
  ]) {
    const s = assessSol(broken, ASOF, XX());
    assert.equal(s.anchor, "none", "no usable anchor must say so");
    assert.equal(s.elapsedMonths, null, "and must not report an elapsed time");
  }
});
