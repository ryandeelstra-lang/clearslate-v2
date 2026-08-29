// Payment outcome simulation.
//
// Simulates consumer response to match offer:
// 1. Does consumer respond to contact? (archetype.response_rate)
// 2. Disputer path (files dispute immediately)
// 3. Match ratio evaluation (sigmoid model)
// 4. Payment amount (clearing vs partial, archetype.completion_rate)
// 5. Timing (normal distribution around archetype mean)

import type { TapeAccount } from "../../tape.ts";
import type { RNG } from "../types.ts";
import type { ConsumerArchetype } from "../calibration.ts";
import { getArchetype } from "./consumer.ts";
import { matchResponseProbability, type ElasticityParams } from "./match-response.ts";
import { boxMuller } from "../generators/balance.ts";

/** Payment outcome for one account */
export interface PaymentOutcome {
  responded: boolean; // opened email, clicked link
  disputed: boolean; // filed dispute
  paid: boolean; // made payment
  amount_cents: number; // 0 if not paid, clearing or partial if paid
  days_to_payment: number | null; // null if didn't pay
  disengaged: boolean; // blocked contact, complaint filed
  cleared: boolean; // paid clearing amount (account goes to zero balance)
}

/** Simulate payment outcome for one account */
export function simulatePayment(
  account: TapeAccount,
  archetype: ConsumerArchetype,
  matchRatio: number,
  rng: RNG,
  elasticity?: ElasticityParams,
): PaymentOutcome {
  const behavior = getArchetype(archetype);

  // 1. Does consumer respond to contact?
  const responded = rng() < behavior.response_rate;
  if (!responded) {
    return {
      responded: false,
      disputed: false,
      paid: false,
      amount_cents: 0,
      days_to_payment: null,
      disengaged: false,
      cleared: false,
    };
  }

  // 2. Disputer path
  if (archetype === "disputer" || (behavior.disputes_immediately ?? false)) {
    return {
      responded: true,
      disputed: true,
      paid: false,
      amount_cents: 0,
      days_to_payment: null,
      disengaged: false,
      cleared: false,
    };
  }

  // 3. Match ratio evaluation (sigmoid)
  const payProbability = matchResponseProbability(archetype, matchRatio, elasticity);
  const willPay = rng() < payProbability;

  if (!willPay) {
    // Disengagement check (avoiders more likely to block)
    const disengaged = archetype === "avoider" && rng() < 0.5;
    return {
      responded: true,
      disputed: false,
      paid: false,
      amount_cents: 0,
      days_to_payment: null,
      disengaged,
      cleared: false,
    };
  }

  // 4. Payment amount (clearing vs partial)
  const clearingAmount = Math.round(account.balanceCents / (matchRatio + 1));
  const completesPayment = rng() < behavior.completion_rate;

  const amount_cents = completesPayment
    ? clearingAmount
    : Math.round(clearingAmount * (0.2 + 0.6 * rng())); // 20-80% of clearing

  // 5. Timing (normal distribution around archetype mean)
  const { mean, sd } = behavior.time_to_payment_days;
  const z = boxMuller(rng);
  const days = Math.max(1, Math.round(mean + sd * z));

  return {
    responded: true,
    disputed: false,
    paid: true,
    amount_cents,
    days_to_payment: days,
    disengaged: false,
    cleared: completesPayment, // cleared if they paid the full clearing amount
  };
}

/** Simulate payment outcomes for all accounts */
export function simulateAllPayments(
  accounts: TapeAccount[],
  archetypes: ConsumerArchetype[],
  matchRatio: number,
  rng: RNG,
  elasticity?: ElasticityParams,
): PaymentOutcome[] {
  if (accounts.length !== archetypes.length) {
    throw new Error(
      `Account count ${accounts.length} != archetype count ${archetypes.length}`,
    );
  }

  const outcomes: PaymentOutcome[] = [];
  for (let i = 0; i < accounts.length; i++) {
    outcomes.push(
      simulatePayment(accounts[i], archetypes[i], matchRatio, rng, elasticity),
    );
  }

  return outcomes;
}

/** Aggregate payment statistics */
export interface PaymentStats {
  total_accounts: number;
  responded_count: number;
  disputed_count: number;
  paid_count: number;
  disengaged_count: number;
  total_collected_cents: number;
  accounts_cleared_count: number; // paid clearing amount
  response_rate: number;
  payment_rate: number; // of those who responded
  cash_per_dollar_face: number;
}

export function aggregatePaymentStats(
  accounts: TapeAccount[],
  outcomes: PaymentOutcome[],
): PaymentStats {
  const total_accounts = accounts.length;
  const responded_count = outcomes.filter((o) => o.responded).length;
  const disputed_count = outcomes.filter((o) => o.disputed).length;
  const paid_count = outcomes.filter((o) => o.paid).length;
  const disengaged_count = outcomes.filter((o) => o.disengaged).length;

  const total_collected_cents = outcomes.reduce((sum, o) => sum + o.amount_cents, 0);
  const total_face_cents = accounts.reduce((sum, a) => sum + a.balanceCents, 0);

  // Accounts cleared = marked as cleared in outcome
  const accounts_cleared_count = outcomes.filter((o) => o.cleared).length;

  return {
    total_accounts,
    responded_count,
    disputed_count,
    paid_count,
    disengaged_count,
    total_collected_cents,
    accounts_cleared_count,
    response_rate: responded_count / total_accounts,
    payment_rate: responded_count > 0 ? paid_count / responded_count : 0,
    cash_per_dollar_face: total_face_cents > 0
      ? total_collected_cents / total_face_cents
      : 0,
  };
}
