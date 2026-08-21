// Fee detection and recovery guidance. Pure — no DB, no imports from db.

export type Fee = {
  date: string;
  name: string;
  amountCents: number;
  category: "late" | "overdraft" | "interest" | "annual" | "foreign";
};

export type FeeFindings = {
  lateFees: Fee[];
  overdraftFees: Fee[];
  annualFees: Fee[];
  foreignFees: Fee[];
  interestCharges: Fee[];
  totalRecoverableCents: number; // Only genuinely waivable fees
  totalChargedCents: number; // All fees including interest
};

/**
 * Detects fee transactions by matching name/merchantName text patterns.
 *
 * HONESTY CONSTRAINT: Late fees, overdraft, and NSF are genuinely waivable
 * (92% success rate for late fees). Interest charges are NOT typically waived
 * — they are the cost of carrying a balance. Report them separately so we never
 * overstate what someone can recover.
 */
export function detectFees(
  transactions: Array<{
    name: string | null;
    merchantName: string | null;
    amountCents: number;
    date: string;
    bucket?: string | null;
  }>,
): FeeFindings {
  const lateFees: Fee[] = [];
  const overdraftFees: Fee[] = [];
  const annualFees: Fee[] = [];
  const foreignFees: Fee[] = [];
  const interestCharges: Fee[] = [];

  for (const txn of transactions) {
    // Only count money-out transactions (Plaid convention: positive = outflow).
    if (txn.amountCents <= 0) continue;

    const text = `${txn.name ?? ""} ${txn.merchantName ?? ""}`.toLowerCase();

    // Late fee detection
    if (/late fee|late charge|past due fee/i.test(text)) {
      lateFees.push({
        date: txn.date,
        name: txn.name ?? "Late fee",
        amountCents: txn.amountCents,
        category: "late",
      });
      continue;
    }

    // Overdraft/NSF detection
    if (/overdraft|nsf|insufficient fund|returned item/i.test(text)) {
      overdraftFees.push({
        date: txn.date,
        name: txn.name ?? "Overdraft fee",
        amountCents: txn.amountCents,
        category: "overdraft",
      });
      continue;
    }

    // Interest charge detection — NOT recoverable
    if (/interest charge|finance charge|purchase interest/i.test(text)) {
      interestCharges.push({
        date: txn.date,
        name: txn.name ?? "Interest charge",
        amountCents: txn.amountCents,
        category: "interest",
      });
      continue;
    }

    // Annual fee detection
    if (/annual fee|membership fee/i.test(text)) {
      annualFees.push({
        date: txn.date,
        name: txn.name ?? "Annual fee",
        amountCents: txn.amountCents,
        category: "annual",
      });
      continue;
    }

    // Foreign transaction fee detection
    if (/foreign transaction/i.test(text)) {
      foreignFees.push({
        date: txn.date,
        name: txn.name ?? "Foreign transaction fee",
        amountCents: txn.amountCents,
        category: "foreign",
      });
      continue;
    }
  }

  // Recoverable = late + overdraft + annual + foreign (NOT interest)
  const totalRecoverableCents =
    lateFees.reduce((sum, f) => sum + f.amountCents, 0) +
    overdraftFees.reduce((sum, f) => sum + f.amountCents, 0) +
    annualFees.reduce((sum, f) => sum + f.amountCents, 0) +
    foreignFees.reduce((sum, f) => sum + f.amountCents, 0);

  const totalChargedCents =
    totalRecoverableCents +
    interestCharges.reduce((sum, f) => sum + f.amountCents, 0);

  return {
    lateFees,
    overdraftFees,
    annualFees,
    foreignFees,
    interestCharges,
    totalRecoverableCents,
    totalChargedCents,
  };
}

export type CallScript = {
  preparation: string[];
  call: string[];
  ask: string[];
  ifRefused: string[];
  closing: string[];
};

/**
 * Generates a structured call script for requesting fee waivers.
 * Returned as discrete steps so the UI can render them as a readable sequence
 * the user can follow while on the phone.
 *
 * Research basis: LendingTree 2025 found 92% of people who asked got a late fee
 * waived. This is a population statistic, not a promise to any individual user.
 */
export function buildFeeCallScript(): CallScript {
  return {
    preparation: [
      "Find the phone number on the back of your card or your statement.",
      "Have your account number handy — you'll need it to verify your identity.",
      "Note the exact fee amount and the date it was charged before you call.",
    ],
    call: [
      "Call the customer service number and say 'speak to a representative' or press 0.",
      "Once connected, say: 'I'd like to request a courtesy waiver for a fee on my account.'",
    ],
    ask: [
      "State the specific fee: 'I noticed a [late fee / overdraft fee] of $X on [date].'",
      "Ask politely: 'I'd like to request a one-time courtesy waiver for this charge.'",
      "If you have a good payment history, mention it: 'I've been a customer for [X years] and this is unusual for me.'",
      "Be calm and polite — the rep wants to help but may need to check with a supervisor.",
    ],
    ifRefused: [
      "If they say no, ask: 'Is there anything I can do to have this reconsidered?'",
      "Some banks will waive fees after a certain period of on-time activity.",
      "You can also ask: 'When can I call back to request this again?'",
      "Stay calm — a 'not today' is not a permanent no, and you can try again later.",
    ],
    closing: [
      "Thank the representative for their time, whether or not they waive the fee.",
      "If they agree, get a confirmation number and ask when the credit will appear.",
      "This call costs you nothing and doesn't affect your credit score.",
      "Research shows 92% of people who asked in 2025 got a late fee waived (LendingTree) — but that's a population average, not a guarantee for your specific case.",
    ],
  };
}

// DB part (may import from lib/db)
