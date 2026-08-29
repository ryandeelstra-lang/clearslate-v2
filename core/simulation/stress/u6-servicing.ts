// U6 — bottom-up servicing cost for a digital-first debt buyer.
//
// WHY. `portfolio.ts:14` labels SERVICING_BPS = 541 "a PLACEHOLDER pending U6.
// It is not an observed figure." The what-would-it-take analysis found it is
// worth ~half the break-even bar and is the cheapest unknown to close. This
// module closes it bottom-up instead of inheriting Encore's number.
//
// WHY ENCORE'S 541bps IS THE WRONG BASIS. It derives from a cost-to-collect of
// 44.1% of collections at a large buyer that runs call centres, mails letters
// at volume, and litigates. On the H3 baseline tape that implies **$37.49 per
// account**. TrueAccord — a digital-first operator, our actual comparison
// class — puts fully-loaded cost per account at **$4.50 to $16**, covering
// "collection staff wages and fringe benefits, software licensing, management
// overhead, communication costs (letter and postage, telephony, SMS),
// equipment, supplies, scrubs and skip tracing information, and premises."
//
// So the placeholder is 2.3–8.3× too high for a digital operation. That is the
// first correction all week that runs in our favour, which is precisely why the
// model below is built from components with sourced ranges rather than by
// asserting a smaller number.
//
// ⚠️ THE STRUCTURAL ERROR THIS FIXES. Servicing was modelled as bps of FACE.
// Almost none of it is. Mail, scrubs, software seats, dispute labour and
// licensing are all per ACCOUNT or per YEAR; only payment processing scales
// with money collected. `segment.ts:1-8` already says this about the up-front
// component — "any model that expresses servicing purely as bps of face hides
// this, and hides it in the direction that flatters the thesis" — but the main
// stack still used bps of face. Modelling per-account costs as bps of face
// understates them on small balances, which is the entire H3 buy box.
//
// ⚠️ AND THE CONSEQUENCE NOBODY HAD PRICED: annual fixed costs (software,
// licensing, compliance) amortise over ANNUAL ACCOUNT VOLUME. At pilot scale
// they dominate everything else by an order of magnitude. There is a minimum
// viable scale, and below it no portfolio works at any match ratio.

/** A cost component with a sourced range. Every field carries its provenance. */
export interface CostComponent {
  readonly label: string;
  readonly low: number;
  readonly high: number;
  readonly source: string;
}

// ─── Per account, charged whether they pay or not ───

/**
 * The validation notice must reach every account, and it must go by MAIL.
 *
 * Reg F §1006.42(b): a validation notice sent electronically must comply with
 * E-SIGN §101(c), which requires affirmative consumer consent demonstrating the
 * consumer can access electronic records. That consent cannot exist before
 * first contact. §1006.6(d)(4)'s email safe harbor is a DIFFERENT provision —
 * it permits communications about the debt, not electronic delivery of the
 * validation notice, and it additionally requires the CREDITOR to have sent a
 * compliant pre-transfer notice naming the email address with a 35-day opt-out
 * window. That is a much narrower condition than "the creditor used this email."
 *
 * Consequence: there is no email-only path for first contact. Every account
 * carries a physical mail cost. This kills the "email-only, heavily automated"
 * scenario that what-would-it-take.ts showed would make H3 clear.
 */
export const PER_ACCOUNT_FIXED: CostComponent[] = [
  {
    label: "Validation notice: postage (presorted first-class)",
    low: 0.55,
    high: 0.68,
    source: "USPS presorted first-class commercial rates",
  },
  {
    label: "Validation notice: print, insert, fulfilment",
    low: 0.10,
    high: 0.25,
    source: "Commercial letter-shop pricing at volume",
  },
  {
    label: "Scrubs: deceased, bankruptcy, litigious, NCOA",
    low: 0.10,
    high: 0.50,
    source: "Industry standard pre-contact scrub set (IC System, DoNotCall)",
  },
  {
    label: "Email hygiene / validation",
    low: 0.005,
    high: 0.02,
    source: "Bulk email verification vendors",
  },
];

// ─── Per payer, only on accounts that actually pay ───

/**
 * Debt collection is a high-risk merchant category. Card rates run 3.49–3.95%
 * plus ~$0.25/transaction. ACH is far cheaper and the industry runs 60–80% of
 * collections through it, so the blended rate depends on payment mix.
 */
export const PAYMENT_PROCESSING = {
  cardPct: { low: 0.0349, high: 0.0395, source: "High-risk merchant account rates 2025" },
  cardPerTxn: { low: 0.25, high: 0.30, source: "High-risk merchant per-transaction fee" },
  achPct: { low: 0.008, high: 0.010, source: "ACH percentage, typically capped" },
  achCapDollars: { low: 5.0, high: 5.0, source: "Typical ACH cap" },
  /** Share of collections taken by ACH rather than card. */
  achShare: { low: 0.60, high: 0.80, source: "Industry: 60–80% of collections via ACH" },
};

// ─── Annual fixed, amortised over annual account volume ───

/**
 * THE TERM THAT DOMINATES AT PILOT SCALE.
 *
 * Software alone runs $399–$1,999/mo (Finvi Simplicity Collect), $500–$10,000/mo
 * (Tratta), or $4,999+/mo (Katabat). Licensing is ~30 states of application
 * fees, surety bonds and annual renewals — U4, and the repo's stated long pole.
 */
export const ANNUAL_FIXED: CostComponent[] = [
  {
    label: "Collection platform / software",
    low: 399 * 12,
    high: 4_999 * 12,
    source: "Finvi Simplicity $399–1,999/mo; Tratta $500–10k/mo; Katabat $4,999+/mo",
  },
  {
    label: "State licensing: fees + bond premiums (~30 states)",
    low: 30 * 700,
    high: 30 * 2_500,
    source: "Bond premium 1–5% of $10k–50k coverage + annual license fees ($200–750/state)",
  },
  {
    label: "Compliance + legal counsel (fractional)",
    low: 25_000,
    high: 120_000,
    source: "ESTIMATE — not sourced. Fractional compliance officer + outside counsel.",
  },
  {
    label: "Operations staff (dispute handling, servicing)",
    low: 45_000,
    high: 180_000,
    source: "ESTIMATE — not sourced. 0.5–2 FTE loaded.",
  },
];

/**
 * ⚠️ CORRECTED 28 Aug 2026, on the question "why does it cost any money to
 * maintain?"
 *
 * ANNUAL_FIXED above prices an INCUMBENT: a licensed-in-30-states operator that
 * buys a collections platform and employs compliance and ops staff. ClearSlate
 * is none of those things, and pricing it as one inflated the scale threshold by
 * more than an order of magnitude. Line by line, what the incumbent assumption
 * cost us:
 *
 *  - Licensing. Priced at 30 states. The buy box says "U4 minimum-viable
 *    licensing set only", and sol.ts covers exactly TWO states. Texas requires a
 *    $10k bond (~$50–100/yr premium) and NO license. New York State requires no
 *    license at all; NYC charges $150 per two years plus a $25k bond. Real
 *    two-state cost is ~$375–1,425/yr, not $21,000–75,000. **15–50× overstated.**
 *
 *  - Software. Priced at Katabat/Tratta/Finvi. We are building it — core/
 *    already holds the tape, SOL, segmentation and underwriting logic, and the
 *    consumer surface is a Next.js app plus Stripe. Hosting, Postgres, an email
 *    sender and a domain run ~$800–1,200/yr. **6–60× overstated.**
 *
 *  - Operations staff. At 1,000 accounts a 3.4% dispute rate is ~34 disputes a
 *    year, roughly three a month. That is not a headcount. It is founder time —
 *    a real opportunity cost, but not a cash cost, and this model is about cash.
 *
 *  - Compliance and legal. Predominantly one-time: get the validation notice and
 *    the match copy right once. Ongoing need is renewals and the occasional
 *    review, not a standing fractional officer.
 *
 * What survives, because it is genuinely irreducible:
 *  - bonds and licences for the states you actually operate in
 *  - RMAI membership and certification, which many SELLERS require before they
 *    will transact with you at all
 *  - insurance sellers commonly require in a purchase agreement
 *  - enough outside counsel to review the letters that carry §1692e exposure
 *  - accounting and tax
 *
 * The LEAN bound below is the honest floor for a founder-operated, two-state,
 * self-built operation. It is NOT a claim that the incumbent bound is wrong for
 * an incumbent — both are kept, because the gap between them IS the finding.
 */
export const ANNUAL_FIXED_LEAN: CostComponent[] = [
  {
    label: "Licensing + bonds (TX bond, NYC licence + bond)",
    low: 375,
    high: 1_425,
    source: "TX: $10k bond @ $50–100/yr, no licence. NY State: none. NYC: $150/2yr + $25k bond",
  },
  {
    label: "RMAI membership + business certification",
    low: 2_500,
    high: 5_000,
    source: "Dues $995–1,250/yr; $275 application; business cert $1,500–3,500 by size",
  },
  {
    label: "Infrastructure (hosting, Postgres, email, domain)",
    low: 800,
    high: 1_200,
    source: "Vercel + managed Postgres + Resend + domain, self-built on core/",
  },
  {
    label: "Outside counsel (letter review, renewals, as-needed)",
    low: 5_000,
    high: 15_000,
    source: "ESTIMATE — not sourced. Front-loaded; §1692e review is the load-bearing part.",
  },
  {
    label: "E&O / cyber insurance",
    low: 1_500,
    high: 5_000,
    source: "ESTIMATE — not sourced. Commonly required by sellers in purchase agreements.",
  },
  {
    label: "Accounting + tax",
    low: 1_000,
    high: 3_000,
    source: "ESTIMATE — not sourced. Small-entity bookkeeping and filing.",
  },
  {
    label: "Operations staff",
    low: 0,
    high: 0,
    source: "Founder-operated at pilot scale. ~34 disputes/yr at 1,000 accounts. " +
      "Real opportunity cost, but not a CASH cost — and this model prices cash.",
  },
];

export type Bound = "low" | "high";

export interface ServicingResult {
  perAccountFixedDollars: number;
  annualFixedDollars: number;
  annualFixedPerAccountDollars: number;
  processingPctOfCollections: number;
  /** Total cost per account, excluding the price paid for the paper. */
  costPerAccountDollars: number;
  /** The same, expressed in bps of face — the unit portfolio.ts wants. */
  servicingBpsOfFace: number;
}

export function sumComponents(cs: CostComponent[], bound: Bound): number {
  return cs.reduce((s, c) => s + (bound === "low" ? c.low : c.high), 0);
}

/** Blended payment-processing rate as a fraction of collections. */
export function processingRate(bound: Bound, avgPaymentDollars: number): number {
  const p = PAYMENT_PROCESSING;
  const achShare = bound === "low" ? p.achShare.high : p.achShare.low; // more ACH = cheaper
  const cardPct = bound === "low" ? p.cardPct.low : p.cardPct.high;
  const cardTxn = bound === "low" ? p.cardPerTxn.low : p.cardPerTxn.high;
  const achPct = bound === "low" ? p.achPct.low : p.achPct.high;

  const cardRate = cardPct + cardTxn / Math.max(1, avgPaymentDollars);
  const achRate = Math.min(achPct, p.achCapDollars.low / Math.max(1, avgPaymentDollars));

  return achShare * achRate + (1 - achShare) * cardRate;
}

/** Which cost structure to price: a founder-run operation, or an incumbent. */
export type Structure = "lean" | "incumbent";

export interface ServicingInputs {
  /** Accounts serviced per YEAR. This is what annual fixed costs amortise over. */
  annualAccountVolume: number;
  /** Average face balance per account, dollars. */
  avgBalanceDollars: number;
  /** Fraction of accounts that pay. */
  paymentRate: number;
  /** Average payment made by a payer, dollars. */
  avgPaymentDollars: number;
  bound: Bound;
  /** Defaults to "lean" — see the note above ANNUAL_FIXED_LEAN. */
  structure?: Structure;
}

export function servicingCost(inp: ServicingInputs): ServicingResult {
  const perAccountFixed = sumComponents(PER_ACCOUNT_FIXED, inp.bound);
  const annualFixed = sumComponents(
    (inp.structure ?? "lean") === "lean" ? ANNUAL_FIXED_LEAN : ANNUAL_FIXED,
    inp.bound,
  );
  const annualFixedPerAccount = annualFixed / inp.annualAccountVolume;

  const rate = processingRate(inp.bound, inp.avgPaymentDollars);
  const processingPerAccount = inp.paymentRate * inp.avgPaymentDollars * rate;

  const costPerAccount = perAccountFixed + annualFixedPerAccount + processingPerAccount;

  return {
    perAccountFixedDollars: perAccountFixed,
    annualFixedDollars: annualFixed,
    annualFixedPerAccountDollars: annualFixedPerAccount,
    processingPctOfCollections: rate,
    costPerAccountDollars: costPerAccount,
    servicingBpsOfFace: (costPerAccount / inp.avgBalanceDollars) * 10_000,
  };
}

/**
 * Minimum annual account volume at which servicing lands at or below a target
 * bps of face. Returns null if unreachable even at very large scale, which
 * happens when the per-account floor alone exceeds the target.
 */
export function minimumViableVolume(
  targetBps: number,
  inp: Omit<ServicingInputs, "annualAccountVolume">,
): number | null {
  // eslint-disable-next-line no-unused-vars -- structure flows through inp
  const floor = servicingCost({ ...inp, annualAccountVolume: 100_000_000 });
  if (floor.servicingBpsOfFace > targetBps) return null;

  let lo = 100;
  let hi = 100_000_000;
  for (let i = 0; i < 60; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const r = servicingCost({ ...inp, annualAccountVolume: mid });
    if (r.servicingBpsOfFace > targetBps) lo = mid;
    else hi = mid;
  }
  return hi;
}
