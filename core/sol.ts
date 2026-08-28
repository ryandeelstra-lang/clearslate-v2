// Statute-of-limitations determination, per account.
//
// This decides which hypothesis a piece of paper belongs to:
//   H1 wants TIME-BARRED paper and must suppress partial payments.
//   H3 wants WITHIN-SOL paper and its match mechanic manufactures them.
// docs/decisions/18h-execution-plan.md:15-20. They are mutually exclusive.
//
// THE TABLE IS A REQUIRED PARAMETER, NOT A MODULE DEFAULT. Fifty invented
// limitation periods would be exactly the class of error this repo keeps
// catching in itself, and it would fail in the flattering direction: any
// plausible default (4 years) classifies most fresh paper as within-SOL, which
// is precisely what H3 wants to be true. So there is no assessSol(a, asOf)
// overload — a caller must name the table it is using, and the shipped table
// contains only states where a human has read the statute.
//
// Pure. No dependencies beyond tape.ts.

import { compareYmd, monthsBetween, type TapeAccount, type Ymd } from "./tape.ts";

/** Which limitations period a credit-card claim runs under, in this state. */
export type CreditCardBasis = "written" | "open" | "contested";

/**
 * Whether a partial payment restarts a clock that is still running. Distinct
 * from RevivalAfterExpiry: tolling a live claim and resurrecting a dead one are
 * different doctrines and states answer them differently. Collapsing the two is
 * the error to avoid.
 */
export type RevivalOnPayment =
  | "restarts"
  | "no_effect"
  | "written_acknowledgement_only"
  | "unknown";

/** Whether a payment on an ALREADY-EXPIRED debt resurrects it. Governs H1. */
export type RevivalAfterExpiry = "revives" | "does_not_revive" | "unknown";

export type SolRule = {
  readonly state: string;
  readonly writtenContractYears: number;
  readonly openAccountYears: number;
  readonly creditCardBasis: CreditCardBasis;
  readonly revivalOnPayment: RevivalOnPayment;
  readonly revivalAfterExpiry: RevivalAfterExpiry;
  readonly statute: string;
  /** Primary source. Required by the type — no URL, no number. */
  readonly sourceUrl: string;
  /** ISO date a human read the citation. */
  readonly verifiedOn: string;
};

export type SolTable = ReadonlyMap<string, SolRule>;

/**
 * States where the statute has actually been read and cited.
 *
 * TWO ENTRIES. That is not an oversight — it is the honest state of the
 * research. Every other jurisdiction resolves to "unknown", which is unbuyable
 * under both hypotheses, and the CLI says so out loud. Filling this table is a
 * research deliverable (U11), not a coding one. Scope it to the U4
 * minimum-viable licensing states first, not all 51.
 */
export const SOL_TABLE_VERIFIED: SolTable = new Map<string, SolRule>([
  [
    "NY",
    {
      state: "NY",
      // CPLR 214-i, added by the Consumer Credit Fairness Act, effective
      // 7 April 2022: three years for an action arising out of a consumer
      // credit transaction, down from six.
      writtenContractYears: 3,
      openAccountYears: 3,
      creditCardBasis: "written",
      // ⚠ NOT INDEPENDENTLY SOURCED. This is the LIVE-claim doctrine (a partial
      // payment tolling a clock that is still running), which the CCFA does not
      // address — the CCFA text quoted below governs the field AFTER it, not
      // this one. Left as the general common-law position pending research.
      // `revivalOnPayment` currently has no consumer in the codebase, so no
      // number moves; H1's payment-suppression logic will be the first to read
      // it, and it must be verified before that ships.
      revivalOnPayment: "restarts",
      // Sourced. The CCFA bars revival outright: once the period has run, "any
      // subsequent payment toward, written or oral affirmation of or other
      // activity on the debt does not revive or extend the limitations period."
      revivalAfterExpiry: "does_not_revive",
      statute: "N.Y. C.P.L.R. § 214-i (Consumer Credit Fairness Act)",
      sourceUrl: "https://www.nysenate.gov/legislation/laws/CVP/214-I",
      verifiedOn: "2026-08-26",
    },
  ],
  [
    "TX",
    {
      state: "TX",
      // Tex. Civ. Prac. & Rem. Code § 16.004(a)(3): suit on debt must be
      // brought not later than four years after the cause of action accrues.
      writtenContractYears: 4,
      openAccountYears: 4,
      creditCardBasis: "written",
      // Tex. Fin. Code § 392.307, added 2019: for consumer debt held by a debt
      // buyer, an expired cause of action "is not revived by a payment ... an
      // oral or written reaffirmation ... or any other activity on the debt."
      revivalOnPayment: "no_effect",
      revivalAfterExpiry: "does_not_revive",
      statute:
        "Tex. Civ. Prac. & Rem. Code § 16.004; Tex. Fin. Code § 392.307 (debt buyers)",
      sourceUrl: "https://statutes.capitol.texas.gov/Docs/FI/htm/FI.392.htm#392.307",
      verifiedOn: "2026-08-26",
    },
  ],
]);

export type SolStatus = "within" | "time_barred" | "unknown";

export type SolCaveat =
  | "no_rule_for_state"
  | "no_last_payment_date"
  | "debt_type_unknown"
  | "contested_basis_disagrees"
  | "on_the_boundary"
  | "near_boundary"
  | "revival_after_expiry_unresolved";

export type SolAssessment = {
  readonly status: SolStatus;
  /** Never inferred. "none" whenever there is no usable last-payment date. */
  readonly anchor: "last_payment" | "none";
  readonly elapsedMonths: number | null;
  readonly limitMonths: number | null;
  /** Negative = already barred. null when unknown. */
  readonly monthsToBar: number | null;
  readonly caveats: readonly SolCaveat[];
  readonly rule: SolRule | null;
};

/** Which limitations period applies to this debt type in this state. */
function limitYearsFor(rule: SolRule, a: TapeAccount): number[] {
  switch (a.debtType) {
    case "credit_card":
    case "retail_card":
      if (rule.creditCardBasis === "written") return [rule.writtenContractYears];
      if (rule.creditCardBasis === "open") return [rule.openAccountYears];
      // Contested: evaluate under both and require agreement.
      return [rule.writtenContractYears, rule.openAccountYears];
    case "personal_loan":
    case "auto_deficiency":
    case "student":
    case "payday":
      return [rule.writtenContractYears];
    case "medical":
    case "telecom":
      return [rule.openAccountYears];
    case "unknown":
      return [];
  }
}

/**
 * Assess one account against a table.
 *
 * Four rules carry this function, all of them about refusing to guess:
 *
 *  (a) No rule for the state, or an unknown debt type, means no period. Never
 *      a default.
 *  (b) A missing last-payment date NEVER falls back to the charge-off date.
 *      Charge-off is later than last payment, so that fallback makes accounts
 *      look MORE within-SOL (flatters H3) and LESS time-barred (un-flatters
 *      H1). Since the direction of the flattery depends on which hypothesis is
 *      being tested, the only symmetric answer is "unknown".
 *  (c) A contested credit-card basis is resolved by AGREEMENT, not by picking a
 *      side. Compute under both periods; if they agree, that is the answer; if
 *      they disagree, "unknown". Picking the shorter period is conservative for
 *      H3 and anti-conservative for H1 — one choice cannot serve both.
 *  (d) The exact anniversary is "unknown", not a coin flip. Tape dates are
 *      themselves unreliable; a whole-month tie is not a fact.
 */
export function assessSol(a: TapeAccount, asOf: Ymd, table: SolTable): SolAssessment {
  const caveats: SolCaveat[] = [];
  const rule = table.get(a.state) ?? null;

  if (rule === null) {
    return {
      status: "unknown",
      anchor: "none",
      elapsedMonths: null,
      limitMonths: null,
      monthsToBar: null,
      caveats: ["no_rule_for_state"],
      rule: null,
    };
  }
  if (rule.revivalAfterExpiry === "unknown") caveats.push("revival_after_expiry_unresolved");

  const years = limitYearsFor(rule, a);
  if (years.length === 0) {
    caveats.push("debt_type_unknown");
    return {
      status: "unknown",
      anchor: "none",
      elapsedMonths: null,
      limitMonths: null,
      monthsToBar: null,
      caveats,
      rule,
    };
  }

  if (a.lastPaymentDate === null) {
    caveats.push("no_last_payment_date");
    return {
      status: "unknown",
      anchor: "none",
      elapsedMonths: null,
      limitMonths: null,
      monthsToBar: null,
      caveats,
      rule,
    };
  }

  // A last-payment date after the as-of date is not a usable anchor.
  if (compareYmd(a.lastPaymentDate, asOf) > 0) {
    caveats.push("no_last_payment_date");
    return {
      status: "unknown",
      anchor: "none",
      elapsedMonths: null,
      limitMonths: null,
      monthsToBar: null,
      caveats,
      rule,
    };
  }

  const elapsedMonths = monthsBetween(a.lastPaymentDate, asOf);
  const statuses = years.map((y): SolStatus => {
    const limit = y * 12;
    if (elapsedMonths === limit) return "unknown";
    return elapsedMonths < limit ? "within" : "time_barred";
  });

  const agreed = statuses.every((s) => s === statuses[0]) ? statuses[0] : "unknown";
  if (agreed === "unknown" && statuses.length > 1 && statuses[0] !== statuses[1]) {
    caveats.push("contested_basis_disagrees");
  }

  // Report against the shortest applicable period — the one that bars first.
  const limitMonths = Math.min(...years) * 12;
  const monthsToBar = limitMonths - elapsedMonths;
  if (agreed === "unknown" && statuses.some((s) => s === "unknown")) {
    caveats.push("on_the_boundary");
  } else if (Math.abs(monthsToBar) <= 3) {
    caveats.push("near_boundary");
  }

  return {
    status: agreed,
    anchor: "last_payment",
    elapsedMonths,
    limitMonths,
    monthsToBar,
    caveats,
    rule,
  };
}

export type Hypothesis = "H1_time_barred" | "H3_within_sol";

export type BuyBoxOpts = {
  /**
   * Months of headroom H3 requires before the bar. An account 30 days from
   * time-bar is nominally within-SOL and will be barred before onboarding
   * finishes.
   */
  readonly minMonthsToBar?: number;
};

/**
 * Does this account qualify for the given hypothesis?
 *
 * THE FORK IS NOT A PARTITION. "unknown" qualifies for NEITHER, so the two
 * predicates are disjoint and their union is not the tape. This is the concrete
 * code expression of "H1 and H3 are mutually exclusive", and the difference
 * between the two predicates and the whole tape is face you pay for and cannot
 * work.
 *
 * H1 additionally requires a RESOLVED no-revival rule: its entire structure
 * depends on partial payments not resurrecting the claim, and "unknown" revival
 * is not a risk H1 can absorb.
 */
export function qualifiesFor(
  s: SolAssessment,
  h: Hypothesis,
  opts: BuyBoxOpts = {},
): boolean {
  const minMonthsToBar = opts.minMonthsToBar ?? 6;
  if (h === "H3_within_sol") {
    return s.status === "within" && (s.monthsToBar ?? -1) >= minMonthsToBar;
  }
  return (
    s.status === "time_barred" &&
    s.rule !== null &&
    s.rule.revivalAfterExpiry === "does_not_revive"
  );
}

export function coveredStates(table: SolTable): string[] {
  return [...table.keys()].sort();
}
