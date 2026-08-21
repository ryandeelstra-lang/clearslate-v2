// Credit-card interest + payoff math. All money is integer cents — no floats.
// APR is a fraction (0.2499 = 24.99%).

export const DEFAULT_APR = 0.2499;

export function monthlyInterestCents(balanceCents: number, apr = DEFAULT_APR): number {
  return Math.round((balanceCents * apr) / 12);
}

// Typical credit-card minimum payment: this month's interest + ~1% of principal,
// floored at $35. Including interest ensures the balance actually declines (a flat
// 2% can sit below interest at high APRs and never pay off).
export function minimumPaymentCents(balanceCents: number, apr = DEFAULT_APR): number {
  const interest = monthlyInterestCents(balanceCents, apr);
  return Math.max(interest + Math.round(balanceCents * 0.01), 3500);
}

// Fixed monthly payment (cents) needed to clear `balanceCents` in `months` at a
// given annual `apr` — the standard amortization formula. Turns the user's
// "pay off in N months" goal into the payment that lands exactly on it.
export function monthlyPaymentForMonths(
  balanceCents: number,
  apr: number,
  months: number,
): number {
  if (months <= 0) return balanceCents;
  const r = apr / 12;
  if (r <= 0) return Math.ceil(balanceCents / months);
  const factor = (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return Math.ceil(balanceCents * factor);
}

export type Payoff = {
  months: number; // capped at maxMonths; null-ish meaning "never" if === maxMonths
  totalInterestCents: number;
  series: number[]; // remaining balance (cents) at each month, index 0 = start
  neverPaysOff: boolean;
};

// Simulates month-by-month: accrue monthly interest, then apply payment.
export function payoffProjection(
  balanceCents: number,
  apr: number,
  monthlyPaymentCents: number,
  maxMonths = 600,
): Payoff {
  let balance = balanceCents;
  let totalInterest = 0;
  const series: number[] = [balance];

  for (let m = 0; m < maxMonths; m++) {
    if (balance <= 0) break;
    const interest = Math.round((balance * apr) / 12);
    // If the payment can't cover interest, the debt never shrinks.
    if (monthlyPaymentCents <= interest) {
      return {
        months: maxMonths,
        totalInterestCents: totalInterest,
        series,
        neverPaysOff: true,
      };
    }
    totalInterest += interest;
    balance = balance + interest - monthlyPaymentCents;
    if (balance < 0) balance = 0;
    series.push(balance);
  }

  return {
    months: series.length - 1,
    totalInterestCents: totalInterest,
    series,
    neverPaysOff: balance > 0,
  };
}

// The honest "do nothing different" payment for the Now line: what the user
// actually pays toward debt today (from Plaid). Never let it drop below the level
// where the balance can't shrink — under the monthly interest the debt grows
// forever, which would over-claim the gut-punch — and fall back to the realistic
// card minimum when we can't see any real payments.
export function baselinePaymentCents(
  debtCents: number,
  apr: number,
  detectedMonthlyCents: number,
): number {
  const minimum = minimumPaymentCents(debtCents, apr);
  if (detectedMonthlyCents <= 0) return minimum;
  const interest = monthlyInterestCents(debtCents, apr);
  return detectedMonthlyCents > interest ? detectedMonthlyCents : minimum;
}

export type PayoffComparison = {
  now: Payoff;
  withRules: Payoff;
  excessInterestCents: number; // interest the Now path wastes vs. ClearSlate
  extraMonthlyCents: number; // additional $/mo the ClearSlate path puts on debt
};

// The two-line payoff comparison the onboarding "facts" slide shows: the user's
// current trajectory ("Now", their real debt payment) vs. the accelerated
// "ClearSlate" path (that payment plus the cash freed by cutting impulse
// categories). Pure — callers supply the two payment amounts.
export function payoffComparison(
  debtCents: number,
  apr: number,
  nowPaymentCents: number,
  withRulesPaymentCents: number,
): PayoffComparison {
  const now = payoffProjection(debtCents, apr, nowPaymentCents);
  const withRules = payoffProjection(debtCents, apr, withRulesPaymentCents);
  return {
    now,
    withRules,
    excessInterestCents: Math.max(now.totalInterestCents - withRules.totalInterestCents, 0),
    extraMonthlyCents: Math.max(withRulesPaymentCents - nowPaymentCents, 0),
  };
}
