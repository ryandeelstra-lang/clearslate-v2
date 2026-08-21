// Balance-transfer math, done honestly. All money is integer cents, APR is a
// fraction (0.2499 = 24.99%). The fee is charged UP FRONT and added to the
// balance, and the debt reverts to a normal rate if not cleared within the intro
// window — a transfer can be net negative for someone paying very little.

import { payoffProjection, type Payoff } from "./apr";

export const TYPICAL_TRANSFER_FEE = 0.03; // 3% is the common floor
export const TYPICAL_INTRO_MONTHS = 18; // offers commonly run 15-21

/**
 * The rate the balance reverts to after the intro period ends, when the user
 * has not paid it off in time. Conservatively assume a typical consumer card
 * rate, not the punitive "go-to" rate some issuers impose.
 */
const POST_INTRO_APR = 0.2299;

export type TransferValue = {
  /** The up-front fee, in cents, added to the transferred balance. */
  feeCents: number;

  /**
   * Total interest the user will pay if they STAY on the current card and keep
   * paying monthlyPaymentCents until the balance is cleared.
   */
  interestIfStayCents: number;

  /**
   * Total interest if they transfer. During the intro window APR is 0%, so all
   * payments reduce principal. If the balance is not cleared when the intro
   * period ends, the remainder accrues interest at POST_INTRO_APR.
   */
  interestIfTransferCents: number;

  /**
   * Net saving (or loss) after subtracting the fee. A transfer that doesn't
   * clear the debt within the intro window may cost MORE than staying put — we
   * model that honestly. Negative means the transfer is a bad deal.
   */
  netSavingCents: number;

  /** True if the debt is paid off within the intro period at this payment. */
  paidOffWithinIntro: boolean;

  /**
   * Balance (cents) remaining when the intro period ends. Zero if paid off. If
   * nonzero, this amount reverts to POST_INTRO_APR and the user is worse off
   * than many expect.
   */
  remainingAtIntroEndCents: number;

  /**
   * Months until the transfer breaks even — the point where cumulative savings
   * overtake the fee. Null when the transfer never breaks even (the fee exceeds
   * all interest saved, which happens when the payment is so low the debt never
   * shrinks meaningfully even on the 0% card).
   */
  breakEvenMonths: number | null;
};

/**
 * Calculates whether a balance transfer is worth it. Models the fee, the 0%
 * intro period, and the reversion to a normal rate if the balance survives
 * past introMonths. Returns the net saving (or loss) after subtracting the fee.
 */
export function transferValue(opts: {
  balanceCents: number;
  currentApr: number;
  introMonths: number;
  feePercent: number;
  monthlyPaymentCents: number;
}): TransferValue {
  const {
    balanceCents,
    currentApr,
    introMonths,
    feePercent,
    monthlyPaymentCents,
  } = opts;

  // The fee is charged UP FRONT and added to the transferred balance.
  const feeCents = Math.round(balanceCents * feePercent);
  const transferredBalanceCents = balanceCents + feeCents;

  // If they stay: current card at currentApr.
  const stayPath = payoffProjection(balanceCents, currentApr, monthlyPaymentCents);
  const interestIfStayCents = stayPath.totalInterestCents;

  // If they transfer: 0% APR during the intro period.
  let interestIfTransferCents = 0;
  let remainingAtIntroEndCents = 0;
  let paidOffWithinIntro = false;

  // Simulate the intro period month-by-month at 0% APR.
  let balance = transferredBalanceCents;
  for (let m = 0; m < introMonths; m++) {
    if (balance <= 0) {
      paidOffWithinIntro = true;
      break;
    }
    // 0% intro: no interest, payment reduces principal directly.
    balance -= monthlyPaymentCents;
    if (balance < 0) balance = 0;
  }

  remainingAtIntroEndCents = Math.max(balance, 0);

  // If a balance remains when the intro ends, it reverts to POST_INTRO_APR and
  // the user keeps paying until it's cleared. That remainder accrues interest.
  if (remainingAtIntroEndCents > 0) {
    const postIntroPath = payoffProjection(
      remainingAtIntroEndCents,
      POST_INTRO_APR,
      monthlyPaymentCents,
    );
    interestIfTransferCents = postIntroPath.totalInterestCents;
  }

  // Gross saving is the interest avoided, net saving subtracts the fee. A
  // transfer can be net negative.
  const grossSavingCents = interestIfStayCents - interestIfTransferCents;
  const netSavingCents = grossSavingCents - feeCents;

  // Break-even: the month where cumulative savings overtake the fee. We compute
  // this by simulating both paths month-by-month and comparing total interest
  // paid. For simplicity, break-even is defined as the first month where the
  // stay path has paid more interest (total) than the transfer path + fee.
  let breakEvenMonths: number | null = null;
  if (netSavingCents > 0) {
    // Only compute break-even when the transfer eventually wins.
    const stayMonthly = simMonthlyInterest(
      balanceCents,
      currentApr,
      monthlyPaymentCents,
    );
    const transferMonthly = simMonthlyInterestWithIntro(
      transferredBalanceCents,
      introMonths,
      monthlyPaymentCents,
    );

    let stayTotal = 0;
    let transferTotal = 0;
    for (let m = 0; m < Math.max(stayMonthly.length, transferMonthly.length); m++) {
      stayTotal += stayMonthly[m] ?? 0;
      transferTotal += transferMonthly[m] ?? 0;
      if (stayTotal >= transferTotal + feeCents) {
        breakEvenMonths = m + 1;
        break;
      }
    }
  }

  return {
    feeCents,
    interestIfStayCents,
    interestIfTransferCents,
    netSavingCents,
    paidOffWithinIntro,
    remainingAtIntroEndCents,
    breakEvenMonths,
  };
}

/**
 * Helper: simulates the stay path month-by-month and returns an array of
 * per-month interest charges. Used for break-even calculation.
 */
function simMonthlyInterest(
  balanceCents: number,
  apr: number,
  monthlyPaymentCents: number,
): number[] {
  const series: number[] = [];
  let balance = balanceCents;
  for (let m = 0; m < 600 && balance > 0; m++) {
    const interest = Math.round((balance * apr) / 12);
    series.push(interest);
    balance = balance + interest - monthlyPaymentCents;
    if (balance < 0) balance = 0;
  }
  return series;
}

/**
 * Helper: simulates the transfer path (0% intro then POST_INTRO_APR) month-by-
 * month and returns per-month interest charges.
 */
function simMonthlyInterestWithIntro(
  balanceCents: number,
  introMonths: number,
  monthlyPaymentCents: number,
): number[] {
  const series: number[] = [];
  let balance = balanceCents;

  // Intro period: 0% APR.
  for (let m = 0; m < introMonths && balance > 0; m++) {
    series.push(0);
    balance -= monthlyPaymentCents;
    if (balance < 0) balance = 0;
  }

  // Post-intro: POST_INTRO_APR.
  for (let m = introMonths; m < 600 && balance > 0; m++) {
    const interest = Math.round((balance * POST_INTRO_APR) / 12);
    series.push(interest);
    balance = balance + interest - monthlyPaymentCents;
    if (balance < 0) balance = 0;
  }

  return series;
}
