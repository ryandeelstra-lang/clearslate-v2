// Compliance event simulation.
//
// FDCPA complaints: ~0.2% baseline (per 10,000 accounts)
// CFPB complaints: ~0.05% baseline
// State AG inquiries: ~0.01% baseline
//
// Triggers: disengaged avoiders (5×), disputed accounts (3×), medical debt (2×)

import type { TapeAccount } from "../../tape.ts";
import type { RNG } from "../types.ts";
import type { PaymentOutcome } from "../behavioral/payment.ts";

/** Compliance event */
export interface ComplianceEvent {
  event_type: "fdcpa_complaint" | "cfpb_complaint" | "state_ag_inquiry";
  account_id: string;
  filed_day: number;
  severity: "low" | "medium" | "high";
  resolved: boolean;
}

/** Simulate compliance events for a portfolio */
export function simulateComplianceEvents(
  accounts: TapeAccount[],
  outcomes: PaymentOutcome[],
  rng: RNG,
): ComplianceEvent[] {
  const events: ComplianceEvent[] = [];

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const outcome = outcomes[i];

    // Base rates (per 10,000 accounts to match research)
    let complaintProb = 0.002; // 0.2% baseline

    // Triggers
    if (outcome.disengaged) complaintProb *= 5; // avoiders who block
    if (outcome.disputed) complaintProb *= 3; // disputers escalate
    if (account.debtType === "medical") complaintProb *= 2;

    if (rng() < complaintProb) {
      const eventType =
        rng() < 0.6
          ? "fdcpa_complaint"
          : rng() < 0.9
            ? "cfpb_complaint"
            : "state_ag_inquiry";

      events.push({
        event_type: eventType,
        account_id: account.id,
        filed_day: Math.floor(rng() * 90) + 1,
        severity: rng() < 0.7 ? "low" : rng() < 0.95 ? "medium" : "high",
        resolved: false,
      });
    }
  }

  return events;
}
