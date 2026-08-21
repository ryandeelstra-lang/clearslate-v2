import { DEFAULT_APR } from "./apr";

/**
 * Fallback interest rates by account subtype, used only when the institution
 * does not report a real APR through Plaid Liabilities.
 *
 * Applying the credit-card default (24.99%) to every account is badly wrong: a
 * mortgage is not a credit card, and assuming so inflates the interest figure
 * several-fold in the direction that flatters the product. Every value here is
 * a rough US market average and must be surfaced to the user as an estimate.
 */
const BY_SUBTYPE: Record<string, number> = {
  "credit card": DEFAULT_APR, // 24.99%
  paypal: DEFAULT_APR,
  "line of credit": 0.135,
  "home equity": 0.085,
  heloc: 0.085,
  mortgage: 0.068,
  auto: 0.075,
  student: 0.065,
  consumer: 0.12,
  commercial: 0.09,
  "construction": 0.078,
  overdraft: 0.2,
};

// Coarser fallback when the subtype is missing or unrecognized.
const BY_TYPE: Record<string, number> = {
  credit: DEFAULT_APR,
  loan: 0.09,
};

export function defaultAprFor(
  type: string | null | undefined,
  subtype: string | null | undefined,
): number {
  const s = subtype?.toLowerCase().trim();
  if (s && BY_SUBTYPE[s] !== undefined) return BY_SUBTYPE[s];

  const t = type?.toLowerCase().trim();
  if (t && BY_TYPE[t] !== undefined) return BY_TYPE[t];

  return DEFAULT_APR;
}

/**
 * A mortgage is a different financial object from consumer debt: it is secured,
 * long-amortizing, low-rate, and is not what the payoff ladder targets. Keeping
 * it out of the headline stops a $500k house from drowning out a $4k card.
 */
export function isMortgage(subtype: string | null | undefined): boolean {
  const s = subtype?.toLowerCase().trim();
  return s === "mortgage" || s === "construction";
}
