// Rate negotiation math and call-script generation. Pure — no DB, no imports from db.

export const AVG_APR_REDUCTION = 0.063; // 6.3 percentage points (LendingTree 2025)
export const SUCCESS_RATE = 0.83;

/**
 * Floor for a negotiated credit-card rate.
 *
 * The 6.3-point average comes from cards averaging ~25% APR. Subtracting it from
 * an already-low card produces a target no issuer will ever grant — asking Chase
 * for 6.20% on a credit card just makes the caller look uninformed and wastes
 * the attempt. Roughly 14% is the realistic floor for a good consumer card, so
 * we never coach someone to ask for less than that.
 */
const MIN_CARD_APR = 0.1399;

/**
 * Below this, the card is already at a good rate and a retention call isn't
 * worth making — we'd rather show nothing than manufacture a target.
 */
export const NOT_WORTH_CALLING_APR = 0.1599;

export type NegotiationValue = {
  newApr: number; // Fraction
  monthlySavedCents: number;
  annualSavedCents: number;
};

// NOTE: deliberately no "lifetime savings" figure. Projecting annual savings
// over N years assumes the balance never shrinks, which would overstate the
// benefit several-fold for anyone actually paying the card down. Annual is the
// longest horizon we can quote honestly without modelling the paydown curve.

/**
 * Projects savings from a successful APR negotiation. Floors the new APR at a
 * credible minimum so we never promise 0% and undercut trust.
 */
export function negotiationValue(
  balanceCents: number,
  aprFraction: number,
): NegotiationValue {
  const reducedApr = Math.max(aprFraction - AVG_APR_REDUCTION, MIN_CARD_APR);

  const oldMonthly = Math.round((balanceCents * aprFraction) / 12);
  const newMonthly = Math.round((balanceCents * reducedApr) / 12);
  const monthlySavedCents = Math.max(oldMonthly - newMonthly, 0);
  const annualSavedCents = monthlySavedCents * 12;

  return {
    newApr: reducedApr,
    monthlySavedCents,
    annualSavedCents,
  };
}

export type NegotiationTarget = {
  accountId: string;
  name: string;
  mask: string | null;
  balanceCents: number;
  apr: number;
  aprIsEstimated: boolean;
  annualSavedCents: number;
};

/**
 * Ranks accounts by potential annual savings, high to low. Only credit cards
 * qualify — mortgages and auto loans don't negotiate via a retention call, and
 * including them would be a lie.
 */
export function rankTargets(
  accounts: Array<{
    id: string;
    name: string;
    mask: string | null;
    subtype: string | null;
    balanceCents: number;
    apr: number;
    aprIsEstimated: boolean;
  }>,
): NegotiationTarget[] {
  return accounts
    .filter((a) => a.subtype === "credit card")
    // Already-low cards aren't worth a call; showing them invents a target.
    .filter((a) => a.apr > NOT_WORTH_CALLING_APR)
    .map((a) => {
      const value = negotiationValue(a.balanceCents, a.apr);
      return {
        accountId: a.id,
        name: a.name,
        mask: a.mask,
        balanceCents: a.balanceCents,
        apr: a.apr,
        aprIsEstimated: a.aprIsEstimated,
        annualSavedCents: value.annualSavedCents,
      };
    })
    .sort((a, b) => b.annualSavedCents - a.annualSavedCents);
}

export type CallScript = {
  opening: string[];
  ask: string[];
  ifRefused: string[];
  ifPushed: string[];
  closing: string[];
};

/**
 * Generates a structured call script for negotiating with a card issuer.
 * Returned as discrete steps so the UI can render them as a readable sequence
 * the user can follow while on the phone.
 */
export function buildScript(opts: {
  issuer: string;
  balanceCents: number;
  apr: number;
  yearsHeld?: number;
}): CallScript {
  const { issuer, balanceCents, apr, yearsHeld } = opts;
  const targetApr = Math.max(apr - AVG_APR_REDUCTION, MIN_CARD_APR);
  const targetPercent = (targetApr * 100).toFixed(2).replace(/\.00$/, "");
  const currentPercent = (apr * 100).toFixed(2).replace(/\.00$/, "");

  // We do not know how long they have held the card — Plaid does not report an
  // open date. Never script a tenure claim the user might not be able to make
  // truthfully; prompt them to state their own facts instead.
  const tenureLine = yearsHeld
    ? `Mention you've held the card ${yearsHeld === 1 ? "over a year" : `about ${yearsHeld} years`} and have paid on time.`
    : `Say how long you've had the card and that you've paid on time — use your real history, whatever it is. If it's short or imperfect, skip this and go straight to the ask.`;

  return {
    opening: [
      `Call the number on the back of your ${issuer} card.`,
      `When prompted, say "speak to a representative" or press 0 to reach a person.`,
      `Ask for the retention department or account review team. Say: "I'd like to discuss my interest rate."`,
    ],
    ask: [
      tenureLine,
      `Ask for a specific rate: "I'd like my APR reduced from ${currentPercent}% to ${targetPercent}%."`,
      `Asking for a specific number signals you've done research and aren't just fishing.`,
    ],
    ifRefused: [
      `If they say no, ask: "What would need to change for me to qualify?" or "When can I call back to review this again?"`,
      `Many issuers will offer a rate review after 6 months of on-time payments.`,
      `Stay calm and polite — the rep wants to help, but may need approval or time.`,
    ],
    ifPushed: [
      `If they ask why you're requesting this, mention that you're comparing offers from other cards or considering a balance transfer.`,
      `Issuers want to keep your business. A plausible alternative makes them more willing to negotiate.`,
    ],
    closing: [
      `Thank the rep for their time, whether or not they approve the reduction.`,
      `Get a confirmation number if they agree to lower your rate, and ask when it takes effect.`,
      `This call costs you nothing and does not affect your credit score. The worst outcome is "not today" — which still gives you information for the next attempt.`,
    ],
  };
}
