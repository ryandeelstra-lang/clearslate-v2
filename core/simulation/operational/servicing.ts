// Servicing cost realization.
//
// Upfront: $1.75 per account (validation mail, scrubs)
// Variable: 5.41¢ per $1 face collected
// Dispute handling: $125 avg per dispute
// Compliance response: $1,000 avg per complaint

import type { TapeAccount } from "../../tape.ts";
import type { PaymentOutcome } from "../behavioral/payment.ts";
import type { DisputeEvent } from "./disputes.ts";
import type { ComplianceEvent } from "./compliance.ts";

/** Servicing cost breakdown */
export interface ServicingCost {
  total_upfront_cents: number;
  total_variable_cents: number;
  total_dispute_cents: number;
  total_compliance_cents: number;
  total_cents: number;
  per_account_breakdown: Array<{
    account_id: string;
    upfront_cents: number;
    variable_cents: number;
    dispute_cost_cents: number;
    compliance_cost_cents: number;
    total_cents: number;
  }>;
}

/** Compute servicing costs for a portfolio */
export function computeServicingCosts(
  accounts: TapeAccount[],
  outcomes: PaymentOutcome[],
  disputes: DisputeEvent[],
  complianceEvents: ComplianceEvent[],
): ServicingCost {
  const UPFRONT_CENTS = 175; // $1.75
  const VARIABLE_BPS = 541; // 5.41¢ per $1 face
  const DISPUTE_COST_CENTS = 12_500; // $125 avg
  const COMPLAINT_COST_CENTS = 100_000; // $1,000 avg

  const breakdown = accounts.map((account, i) => {
    const outcome = outcomes[i];
    const hasDispute = disputes.some((d) => d.account_id === account.id);
    const hasComplaint = complianceEvents.some(
      (e) => e.account_id === account.id,
    );

    const upfront_cents = UPFRONT_CENTS;
    const variable_cents = outcome.paid
      ? Math.round((outcome.amount_cents * VARIABLE_BPS) / 10_000)
      : 0;
    const dispute_cost_cents = hasDispute ? DISPUTE_COST_CENTS : 0;
    const compliance_cost_cents = hasComplaint ? COMPLAINT_COST_CENTS : 0;

    return {
      account_id: account.id,
      upfront_cents,
      variable_cents,
      dispute_cost_cents,
      compliance_cost_cents,
      total_cents:
        upfront_cents +
        variable_cents +
        dispute_cost_cents +
        compliance_cost_cents,
    };
  });

  return {
    total_upfront_cents: breakdown.reduce(
      (sum, b) => sum + b.upfront_cents,
      0,
    ),
    total_variable_cents: breakdown.reduce(
      (sum, b) => sum + b.variable_cents,
      0,
    ),
    total_dispute_cents: breakdown.reduce(
      (sum, b) => sum + b.dispute_cost_cents,
      0,
    ),
    total_compliance_cents: breakdown.reduce(
      (sum, b) => sum + b.compliance_cost_cents,
      0,
    ),
    total_cents: breakdown.reduce((sum, b) => sum + b.total_cents, 0),
    per_account_breakdown: breakdown,
  };
}
