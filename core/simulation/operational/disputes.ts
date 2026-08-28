// Dispute event simulation.
//
// Base rate: 3% (FTC verified)
// Risk factors: balance >$2k, medical debt, CA/NY states
// Dispute types: not_mine (35%), amount (30%), already_paid (20%), identity (10%), medical_billing (5%)

import type { TapeAccount } from "../../tape.ts";
import type { RNG } from "../types.ts";

/** Dispute event */
export interface DisputeEvent {
  account_id: string; // references TapeAccount.id
  dispute_type:
    | "identity"
    | "amount"
    | "not_mine"
    | "already_paid"
    | "medical_billing";
  filed_day: number; // days 1-30 after contact
  verification_sent_day: number | null;
  outcome: "verified" | "withdrawn" | "unresolvable" | "pending";
  resolution_day: number | null;
}

/** Simulate disputes for a portfolio */
export function simulateDisputes(
  accounts: TapeAccount[],
  rng: RNG,
): DisputeEvent[] {
  const disputes: DisputeEvent[] = [];

  for (const account of accounts) {
    // Base rate: 3% (FTC verified)
    let disputeProb = 0.03;

    // Risk factors increase probability
    if (account.balanceCents > 200_000) disputeProb *= 1.5; // >$2k
    if (account.debtType === "medical") disputeProb *= 1.8; // medical high dispute
    if (account.state === "CA" || account.state === "NY") disputeProb *= 1.3; // higher consumer protection

    if (rng() < disputeProb) {
      disputes.push({
        account_id: account.id,
        dispute_type: sampleDisputeType(account, rng),
        filed_day: Math.floor(rng() * 30) + 1, // days 1-30
        verification_sent_day: null, // will be set during simulation
        outcome: "pending",
        resolution_day: null,
      });
    }
  }

  return disputes;
}

/** Sample dispute type based on account characteristics */
function sampleDisputeType(
  account: TapeAccount,
  rng: RNG,
): DisputeEvent["dispute_type"] {
  if (account.debtType === "medical") {
    return rng() < 0.6 ? "medical_billing" : "amount";
  }

  const r = rng();
  if (r < 0.35) return "not_mine";
  if (r < 0.65) return "amount";
  if (r < 0.85) return "already_paid";
  return "identity";
}
