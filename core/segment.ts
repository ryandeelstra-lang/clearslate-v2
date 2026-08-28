// Per-balance-band portfolio economics, and the buy-box wedge.
//
// WHY THIS EXISTS. portfolio.ts:221-232 records the problem: up-front servicing
// is charged PER ACCOUNT, so its drag in bps of face scales inversely with
// average balance ($2,500 avg -> 7bps; $400 avg -> 44bps), and "any model that
// expresses servicing purely as bps of face hides this, and hides it in the
// direction that flatters the thesis."
//
// WHAT SEGMENTATION DOES NOT DO. underwrite() is LINEAR in faceCents and in
// accounts: price, variable servicing, expected gross and the discounted
// inflows all scale with face; up-front servicing scales with count. So
// SUM(per-segment maxPriceCents) === blended maxPriceCents, up to rounding.
// Splitting a tape by band does not change the total ceiling. Anyone who
// expects it to has misunderstood the model.
//
// WHAT IT DOES DO:
//  1. CROSS-SUBSIDY. You pay ONE price per dollar of face. A band whose
//     maxPriceBps is below the asking priceBps is being paid for by another
//     band. The blend can clear while a band holding 95% of your ACCOUNTS is
//     unacquirable at any price.
//  2. MIX RISK. Face concentrates in the big band; per-account cost
//     concentrates in the small band. faceCents/accounts cannot tell a uniform
//     tape from a barbell.
//  3. THE BUY-BOX WEDGE. Under H3 you may only work within-SOL accounts, but
//     you pay for the whole file. That is genuinely non-linear and it is the
//     largest hidden cost in the design.
//
// No math is reimplemented here. Composition only.

import {
  UPFRONT_CENTS_PER_ACCOUNT,
  underwrite,
  type UnderwriteInput,
  type UnderwriteResult,
} from "./portfolio.ts";
import type { Tape, TapeAccount } from "./tape.ts";
import {
  assessSol,
  qualifiesFor,
  type BuyBoxOpts,
  type Hypothesis,
  type SolCaveat,
  type SolTable,
} from "./sol.ts";

export type Band = {
  readonly label: string;
  /** Inclusive. */
  readonly minCents: number;
  /** Exclusive. null = unbounded. */
  readonly maxCents: number | null;
};

/**
 * Edges chosen from the research, not invented. U8 puts the litigation-economics
 * transition on a gradient across roughly $500-$1,500 (cost-model break-even
 * ~$1,418, but ~half of all collection suits are under $2,000 per Pew, and CA
 * small-claims break-even is $373). U7 compares sub-$1k against $2.5k-$5k.
 * The bands bracket the gradient rather than picking a threshold the evidence
 * does not support.
 */
export const DEFAULT_BANDS: readonly Band[] = [
  { label: "<$250", minCents: 0, maxCents: 25_000 },
  { label: "$250-$500", minCents: 25_000, maxCents: 50_000 },
  { label: "$500-$1k", minCents: 50_000, maxCents: 100_000 },
  { label: "$1k-$2.5k", minCents: 100_000, maxCents: 250_000 },
  { label: "$2.5k-$5k", minCents: 250_000, maxCents: 500_000 },
  { label: "$5k+", minCents: 500_000, maxCents: null },
];

export type Segment = {
  readonly band: Band;
  readonly accountCount: number;
  readonly faceCents: number;
  readonly avgBalanceCents: number;
  readonly medianBalanceCents: number;
  /**
   * THE number this module exists to surface: bps of THIS band's face consumed
   * by flat per-account up-front cost.
   */
  readonly upfrontDragBps: number;
  readonly shareOfFaceBps: number;
  /** Diverges from shareOfFaceBps on a barbelled tape. That divergence is the point. */
  readonly shareOfAccountsBps: number;
  /**
   * Number of ACCOUNTS in this band carrying at least one defect. Note the
   * unit: TapeParseResult.defectCounts counts DEFECTS (one account can carry
   * three), so the two numbers are not comparable and the names used to imply
   * they were.
   */
  readonly accountsWithDefects: number;
};

export type Segmentation = {
  readonly segments: readonly Segment[];
  readonly tapeFaceCents: number;
  readonly tapeAccountCount: number;
  readonly avgBalanceCents: number;
  readonly medianBalanceCents: number;
};

/** Index of the first band containing this balance, or -1. */
function bandIndexOf(balanceCents: number, bands: readonly Band[]): number {
  for (let i = 0; i < bands.length; i++) {
    const b = bands[i];
    if (balanceCents >= b.minCents && (b.maxCents === null || balanceCents < b.maxCents)) {
      return i;
    }
  }
  return -1;
}

/**
 * Reject a band set that cannot produce a correct segmentation.
 *
 * Duplicate labels were the live bug: buckets were keyed by label, so two bands
 * sharing one shared a bucket, and the loop then emitted a segment for EACH
 * band reading the same merged accounts. A 4-account, $1,400 tape reported 8
 * accounts and $2,800 — double the face, silently, in the direction that
 * flatters. Buckets are keyed by index now, which fixes it structurally; this
 * validation exists so the misconfiguration is reported rather than merely
 * survived.
 */
function validateBands(bands: readonly Band[]): void {
  if (bands.length === 0) throw new Error("bands must not be empty");
  const labels = new Set<string>();
  for (const b of bands) {
    if (labels.has(b.label)) throw new Error(`duplicate band label "${b.label}"`);
    labels.add(b.label);
    if (!Number.isInteger(b.minCents) || b.minCents < 0) {
      throw new Error(`band "${b.label}" minCents must be a non-negative integer`);
    }
    if (b.maxCents !== null) {
      if (!Number.isInteger(b.maxCents)) {
        throw new Error(`band "${b.label}" maxCents must be an integer or null`);
      }
      if (b.maxCents <= b.minCents) {
        throw new Error(`band "${b.label}" maxCents must exceed minCents`);
      }
    }
  }
  // Overlaps silently merged into whichever band came first, so a band could
  // report zero accounts while holding some.
  const sorted = [...bands].sort((x, y) => x.minCents - y.minCents);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    if (prev.maxCents === null || prev.maxCents > sorted[i].minCents) {
      throw new Error(`bands "${prev.label}" and "${sorted[i].label}" overlap`);
    }
  }
}

function median(sortedCents: number[]): number {
  if (sortedCents.length === 0) return 0;
  const mid = sortedCents.length >> 1;
  return sortedCents.length % 2 === 1
    ? sortedCents[mid]
    : Math.floor((sortedCents[mid - 1] + sortedCents[mid]) / 2);
}

/** Accounts per band, indexed positionally so duplicate labels cannot merge buckets. */
function bucket(
  accounts: readonly TapeAccount[],
  bands: readonly Band[],
): TapeAccount[][] {
  const out: TapeAccount[][] = bands.map(() => []);
  for (const a of accounts) {
    const i = bandIndexOf(a.balanceCents, bands);
    if (i === -1) {
      throw new Error(
        `account ${a.id} with balance ${a.balanceCents} falls in no band — ` +
          "bands must cover the full range",
      );
    }
    out[i].push(a);
  }
  return out;
}

export function segmentTape(
  tape: Tape,
  bands: readonly Band[] = DEFAULT_BANDS,
  /**
   * MUST be threaded from the caller's UnderwriteInput. It defaulted here and
   * `segmentTape` never received the input at all, so the per-band DRAG column
   * was frozen at 175c/account no matter what --upfront-cents said: at 1000c on
   * a $124.35 average band it printed 141bps where the truth is 804bps, a 5.7x
   * understatement, and at 0c it printed a cost that was not being charged.
   * The blended row tracked the flag correctly, so the table contradicted
   * itself. This is the number segment.ts exists to surface.
   */
  upfrontCentsPerAccount: number = UPFRONT_CENTS_PER_ACCOUNT,
): Segmentation {
  if (tape.accountCount === 0) throw new Error("tape has no accounts");
  validateBands(bands);

  const buckets = bucket(tape.accounts, bands);
  const segments: Segment[] = [];

  for (let bi = 0; bi < bands.length; bi++) {
    const band = bands[bi];
    const inBand = buckets[bi];
    if (inBand.length === 0) continue;
    const faceCents = inBand.reduce((s, a) => s + a.balanceCents, 0);
    const sorted = inBand.map((a) => a.balanceCents).sort((x, y) => x - y);
    const avgBalanceCents = Math.floor(faceCents / inBand.length);
    segments.push({
      band,
      accountCount: inBand.length,
      faceCents,
      avgBalanceCents,
      medianBalanceCents: median(sorted),
      upfrontDragBps: upfrontDragBps(avgBalanceCents, upfrontCentsPerAccount),
      shareOfFaceBps: Math.round((faceCents * 10_000) / tape.faceCents),
      shareOfAccountsBps: Math.round((inBand.length * 10_000) / tape.accountCount),
      accountsWithDefects: inBand.filter((a) => a.defects.length > 0).length,
    });
  }

  const allSorted = tape.accounts.map((a) => a.balanceCents).sort((x, y) => x - y);
  return {
    segments,
    tapeFaceCents: tape.faceCents,
    tapeAccountCount: tape.accountCount,
    avgBalanceCents: Math.floor(tape.faceCents / tape.accountCount),
    medianBalanceCents: median(allSorted),
  };
}

/**
 * Up-front servicing drag in bps of face, for a given average balance.
 * Exposed so the figures asserted in portfolio.ts:221-232 are checked by a test
 * rather than trusted as a comment.
 */
export function upfrontDragBps(
  avgBalanceCents: number,
  upfrontCentsPerAccount: number = UPFRONT_CENTS_PER_ACCOUNT,
): number {
  if (avgBalanceCents <= 0) throw new Error("avgBalanceCents must be > 0");
  return Math.round((upfrontCentsPerAccount * 10_000) / avgBalanceCents);
}

export type SegmentUnderwrite = {
  readonly segment: Segment;
  readonly result: UnderwriteResult;
  /** This band's ceiling is below the price being paid on it — another band carries it. */
  readonly subsidised: boolean;
};

export type SegmentedUnderwrite = {
  readonly blended: UnderwriteResult;
  readonly segments: readonly SegmentUnderwrite[];
  readonly summedMaxPriceCents: number;
  readonly blendedMaxPriceCents: number;
  /**
   * blended − summed. Expected within a few cents of zero because the model is
   * linear. A large value means a bug, not an insight.
   */
  readonly linearityResidualCents: number;
  /** Bands unacquirable at any price while the blend is not. */
  readonly hiddenUnbuyable: readonly SegmentUnderwrite[];
  /** Bands being carried by other bands at the asking price. */
  readonly subsidisedBands: readonly string[];
};

/**
 * Underwrite band by band, and blended, from the same inputs.
 *
 * `legalShareBps` is a SINGLE value applied to every band, by construction.
 *
 * DO NOT add a per-band or per-SOL-status legal share. The tempting move —
 * "time-barred paper cannot be litigated, so legalShareBps = 0 there" — is the
 * most dangerous available error in this design. `legalShareBps` is the share
 * FORFEITED by not suing, and GROSS_RECOVERY_BPS (1680) was measured on
 * LITIGATING portfolios. Setting it to 0 on time-barred paper asserts that
 * time-barred paper recovers the full 16.8c, which is backwards by a wide
 * margin, and it makes the worst paper on the tape score best.
 */
export function underwriteSegments(
  tape: Tape,
  input: Omit<UnderwriteInput, "faceCents" | "accounts">,
  bands: readonly Band[] = DEFAULT_BANDS,
): SegmentedUnderwrite {
  const seg = segmentTape(tape, bands, input.upfrontCentsPerAccount ?? UPFRONT_CENTS_PER_ACCOUNT);
  const blended = underwrite({
    ...input,
    faceCents: tape.faceCents,
    accounts: tape.accountCount,
  });

  const segments: SegmentUnderwrite[] = seg.segments.map((segment) => {
    const result = underwrite({
      ...input,
      faceCents: segment.faceCents,
      accounts: segment.accountCount,
    });
    return {
      segment,
      result,
      subsidised: result.maxPriceBps < input.priceBps,
    };
  });

  const summedMaxPriceCents = segments.reduce((s, x) => s + x.result.maxPriceCents, 0);

  return {
    blended,
    segments,
    summedMaxPriceCents,
    blendedMaxPriceCents: blended.maxPriceCents,
    linearityResidualCents: blended.maxPriceCents - summedMaxPriceCents,
    hiddenUnbuyable: blended.unacquirableAtAnyPrice
      ? []
      : segments.filter((x) => x.result.unacquirableAtAnyPrice),
    subsidisedBands: segments.filter((x) => x.subsidised).map((x) => x.segment.band.label),
  };
}

/**
 * Price in bps of a SUBSET's face that costs the same CENTS as `priceBps` of the
 * whole tape's face.
 *
 * NOT ROUNDED. underwrite() constrains priceBps to [0, 10000] but does not
 * require an integer. An earlier version rounded UP, on the theory that
 * understating what was paid would raise the apparent ceiling — but one whole
 * basis point OF THE SUBSET is unbounded relative to the true price when the
 * box is small: fuzzing found a configuration where ceil DOUBLED the reported
 * cheque ($200 against a true $100).
 *
 * ⚠ THE RESULT IS ACCURATE TO ONE CENT, NOT EXACT. underwrite() then computes
 * round(inBoxFace × thisBps / 10000), and that composition is not float-exact:
 * over 3,000,000 random configurations, 287 came back one cent LOW — the
 * flattering direction, since a smaller apparent cheque raises the apparent
 * ceiling. Bounded at 1¢ regardless of tape size, so it is immaterial against a
 * six-figure cheque, but it is a real bound and this module previously claimed
 * exactness it does not have. Reproduction: tapeFace 3763125¢, half in box,
 * 136bps → 51178¢ reported against 51179¢ true.
 */
export function priceBpsOnSubset(
  totalFaceCents: number,
  subsetFaceCents: number,
  priceBps: number,
): number {
  if (subsetFaceCents <= 0) {
    throw new Error("subsetFaceCents must be > 0 — a buy box that selects nothing is a decline");
  }
  return (totalFaceCents * priceBps) / subsetFaceCents;
}

export type BuyBoxUnderwrite = {
  readonly hypothesis: Hypothesis;
  readonly inBoxAccountCount: number;
  readonly inBoxFaceCents: number;
  readonly outOfBoxFaceCents: number;
  readonly inBoxShareOfFaceBps: number;
  /**
   * ⚠ EVERY bps FIELD INSIDE THIS IS DENOMINATED IN IN-BOX FACE, not tape face,
   * because in-box face is what was passed to underwrite(). Do NOT compare its
   * `maxPriceBps` against the seller's quoted priceBps — different units, and
   * the comparison reads backwards: on a 10%-in-box tape it shows 218 against a
   * quoted 200, which looks like "clears by 18bps" while the true ceiling is
   * 22bps and `clearsHurdle` is false. A 9.9x overstatement.
   *
   * The name carries the warning because a doc comment does not survive into
   * `--json`, where these fields appear with no unit marker at all, two keys
   * away from the correctly-denominated one.
   *
   * `clearsHurdle` and every *Cents field are absolute and safe to read. For
   * anything in bps, use `maxPriceBpsOfWholeTape`.
   */
  readonly resultInBoxDenominated: UnderwriteResult | null;
  /** Ceiling in bps of the WHOLE tape's face. THE ONLY bps comparable to the quote. */
  readonly maxPriceBpsOfWholeTape: number | null;
  /** In-box face so small that the whole-tape price exceeds 100% of it. */
  readonly boxTooSmallToPrice: boolean;
  /** Face in states the SOL table does not cover. Never dropped from the denominator. */
  readonly uncoveredStateFaceCents: number;
  readonly uncoveredStates: readonly string[];
  /**
   * How many accounts carried each SOL caveat.
   *
   * assessSol computes these and, until this field existed, every one was
   * discarded here — so `near_boundary`, `on_the_boundary`,
   * `contested_basis_disagrees` and `revival_after_expiry_unresolved` reached no
   * report and no JSON. `near_boundary` on an H3 tape is exactly the signal a
   * buyer needs: paper that qualifies today and is barred before onboarding
   * finishes. An unreachable warning is not shipped.
   */
  readonly caveatCounts: Readonly<Record<SolCaveat, number>>;
};

/**
 * Underwrite the slice of a tape you can actually work, while paying for all of it.
 *
 * THE FLATTERING ERROR THIS PREVENTS: filtering the tape to the buy box and
 * underwriting the filtered face at the quoted priceBps. That silently discards
 * the out-of-box face AND the out-of-box mailing cost, and it can turn an
 * unbuyable tape into a clearing one.
 *
 * So: faceCents is the IN-BOX face (only qualifying accounts can produce
 * recovery), `accounts` is the WHOLE-TAPE count (a Reg F validation notice
 * mails to every account you own, in-box or not), and priceBps is
 * priceBpsOnSubset (you pay the seller for the whole file).
 */
export function underwriteBuyBox(
  tape: Tape,
  hypothesis: Hypothesis,
  solTable: SolTable,
  input: Omit<UnderwriteInput, "faceCents" | "accounts">,
  opts: BuyBoxOpts = {},
): BuyBoxUnderwrite {
  const inBox: TapeAccount[] = [];
  let uncoveredStateFaceCents = 0;
  const uncovered = new Set<string>();
  const caveatCounts: Record<SolCaveat, number> = {
    no_rule_for_state: 0,
    no_last_payment_date: 0,
    debt_type_unknown: 0,
    contested_basis_disagrees: 0,
    on_the_boundary: 0,
    near_boundary: 0,
    revival_after_expiry_unresolved: 0,
  };

  for (const a of tape.accounts) {
    const s = assessSol(a, tape.asOf, solTable);
    for (const c of s.caveats) caveatCounts[c]++;
    if (s.rule === null) {
      uncoveredStateFaceCents += a.balanceCents;
      uncovered.add(a.state);
    }
    if (qualifiesFor(s, hypothesis, opts)) inBox.push(a);
  }

  const inBoxFaceCents = inBox.reduce((s, a) => s + a.balanceCents, 0);
  const outOfBoxFaceCents = tape.faceCents - inBoxFaceCents;
  const base = {
    hypothesis,
    inBoxAccountCount: inBox.length,
    inBoxFaceCents,
    outOfBoxFaceCents,
    inBoxShareOfFaceBps: Math.round((inBoxFaceCents * 10_000) / tape.faceCents),
    uncoveredStateFaceCents,
    uncoveredStates: [...uncovered].sort(),
    caveatCounts,
  };

  if (inBoxFaceCents === 0) {
    return { ...base, resultInBoxDenominated: null, maxPriceBpsOfWholeTape: null, boxTooSmallToPrice: true };
  }

  const subsetPriceBps = priceBpsOnSubset(tape.faceCents, inBoxFaceCents, input.priceBps);
  // underwrite() rejects priceBps > 10000. Detect before calling and report —
  // matching portfolio.ts's own precedent that a worthless tape is a real
  // answer you want to see, not an exception to catch.
  if (subsetPriceBps > 10_000) {
    return { ...base, resultInBoxDenominated: null, maxPriceBpsOfWholeTape: null, boxTooSmallToPrice: true };
  }

  const result = underwrite({
    ...input,
    priceBps: subsetPriceBps,
    faceCents: inBoxFaceCents,
    accounts: tape.accountCount,
  });

  return {
    ...base,
    resultInBoxDenominated: result,
    maxPriceBpsOfWholeTape: Math.round((result.maxPriceCents * 10_000) / tape.faceCents),
    boxTooSmallToPrice: false,
  };
}
