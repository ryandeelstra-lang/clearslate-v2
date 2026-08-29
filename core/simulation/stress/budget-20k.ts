// What can $20,000 actually buy?
//
// THE REFRAME. Every prior model in this repo asked "does the portfolio turn a
// profit?" At $20k that is the wrong question — no tape that small clears
// break-even, and chasing one wastes the budget. The right question is:
//
//     What is the cheapest experiment that ANSWERS U9?
//
// U9 is a behavioural question: does a match ratio lift the payment rate above
// the no-match baseline? Answering it needs statistical power, not margin. The
// tape is R&D expense, not an investment, and it should be bought to maximise
// SAMPLE SIZE per dollar rather than recovery per dollar.
//
// That inverts a buy-box rule. U13 says "Balance: $200–$1,500, avg ≥$400"
// because per-account costs crush small balances. For a POWER experiment the
// opposite holds: smaller balances mean more accounts per dollar of budget,
// and more accounts mean a tighter confidence interval. The first tape should
// be bought against different criteria than every tape after it.

// ─── Day-one minimum compliant cost ───
//
// ANNUAL_FIXED_LEAN in u6-servicing.ts prices a going concern operating in two
// states and buying paper from sellers who impose requirements. A first
// experiment can defer several of those, honestly, by scoping smaller.

export interface DayOneItem {
  readonly label: string;
  readonly low: number;
  readonly high: number;
  readonly note: string;
}

export const DAY_ONE_REQUIRED: DayOneItem[] = [
  {
    label: "Texas third-party debt collector bond ($10k coverage)",
    low: 50,
    high: 100,
    note: "Tex. Fin. Code §392.101. Filed with SOS. Texas requires NO licence.",
  },
  {
    label: "Outside counsel: validation notice + match copy review",
    low: 1_500,
    high: 3_500,
    note: "One-time, not annual. The §1692e surface is the match copy — this is " +
      "the line item that must NOT be cut.",
  },
  {
    label: "Infrastructure (free tiers where they exist)",
    low: 0,
    high: 300,
    note: "Vercel/Neon/Resend free tiers cover a few thousand accounts. Domain owned.",
  },
  {
    label: "Entity + registered agent + accounting",
    low: 300,
    high: 800,
    note: "ClearSlate LLC already exists. Marginal cost only.",
  },
];

/**
 * Deferred, with the reason each is safe to defer for ONE small experiment —
 * and the trigger that makes it mandatory.
 */
export const DAY_ONE_DEFERRED: DayOneItem[] = [
  {
    label: "RMAI membership + certification",
    low: 2_500,
    high: 5_000,
    note: "DEFER. Required by many SELLERS, not by law. Trigger: the first seller " +
      "who demands it, or any forward-flow agreement.",
  },
  {
    label: "E&O / cyber insurance",
    low: 1_500,
    high: 5_000,
    note: "DEFER. Commonly required in purchase agreements. Trigger: seller demands " +
      "it, or first tape carrying identity data at volume.",
  },
  {
    label: "NYC licence + $25k bond",
    low: 275,
    high: 1_350,
    note: "DEFER by buying TX-only. Trigger: any NY account in the tape. sol.ts " +
      "covers NY, so this is a live option, not a permanent exclusion.",
  },
  {
    label: "Additional state licensing (~28 more states)",
    low: 20_000,
    high: 73_000,
    note: "DEFER. This is U4, the stated long pole. Not needed to answer U9.",
  },
];

export function sumItems(items: DayOneItem[], bound: "low" | "high"): number {
  return items.reduce((s, i) => s + (bound === "low" ? i.low : i.high), 0);
}

// ─── Statistical power: what sample answers U9? ───

const Z_ALPHA_2 = 1.959964; // two-sided α = 0.05
const Z_BETA_80 = 0.841621; // 80% power
const Z_BETA_90 = 1.281552; // 90% power

/**
 * Accounts per arm for a two-proportion test.
 *
 * U9's design is one arm at R=0 (no match, the voluntary baseline) and one at
 * the test ratio. `p0` is the baseline payment rate, `p1` the rate the match
 * would have to produce to be worth detecting.
 */
export function samplePerArm(p0: number, p1: number, power: 0.8 | 0.9 = 0.8): number {
  const zb = power === 0.9 ? Z_BETA_90 : Z_BETA_80;
  const num = Math.pow(Z_ALPHA_2 + zb, 2) * (p0 * (1 - p0) + p1 * (1 - p1));
  return Math.ceil(num / Math.pow(p1 - p0, 2));
}

/** Minimum detectable payment rate at the test arm, given accounts per arm. */
export function detectableLift(p0: number, perArm: number, power: 0.8 | 0.9 = 0.8): number {
  let lo = p0 + 1e-6;
  let hi = 0.999;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (samplePerArm(p0, mid, power) > perArm) lo = mid;
    else hi = mid;
  }
  return hi;
}

// ─── Putting the budget together ───

export interface BudgetPlan {
  budgetDollars: number;
  fixedDollars: number;
  paperDollars: number;
  priceBps: number;
  avgBalanceDollars: number;
  faceDollars: number;
  accounts: number;
  perArm: number;
  mailCostDollars: number;
  /** Payment rate at the test arm that this sample can detect. */
  detectableRate: number;
  /** Multiple of baseline that represents. */
  detectableMultiple: number;
}

export function planBudget(opts: {
  budgetDollars: number;
  fixedDollars: number;
  priceBps: number;
  avgBalanceDollars: number;
  baselinePaymentRate: number;
  mailPerAccount: number;
  power?: 0.8 | 0.9;
}): BudgetPlan {
  // Mail is charged per account, so it competes with paper for the budget.
  // Solve for the account count the remaining budget supports.
  const forPaperAndMail = opts.budgetDollars - opts.fixedDollars;
  const costPerAccount =
    opts.avgBalanceDollars * (opts.priceBps / 10_000) + opts.mailPerAccount;
  const accounts = Math.max(0, Math.floor(forPaperAndMail / costPerAccount));

  const perArm = Math.floor(accounts / 2);
  const detectableRate =
    perArm > 0 ? detectableLift(opts.baselinePaymentRate, perArm, opts.power ?? 0.8) : 1;

  return {
    budgetDollars: opts.budgetDollars,
    fixedDollars: opts.fixedDollars,
    paperDollars: accounts * opts.avgBalanceDollars * (opts.priceBps / 10_000),
    priceBps: opts.priceBps,
    avgBalanceDollars: opts.avgBalanceDollars,
    faceDollars: accounts * opts.avgBalanceDollars,
    accounts,
    perArm,
    mailCostDollars: accounts * opts.mailPerAccount,
    detectableRate,
    detectableMultiple: detectableRate / opts.baselinePaymentRate,
  };
}
