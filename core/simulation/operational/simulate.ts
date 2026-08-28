// Full operational simulation.
//
// Orchestrates: portfolio → payment → disputes → compliance → costs

import seedrandom from "seedrandom";
import type { PortfolioConfig } from "../types.ts";
import { generatePortfolio } from "../generators/portfolio.ts";
import { assignArchetypes } from "../behavioral/consumer.ts";
import {
  simulateAllPayments,
  aggregatePaymentStats,
} from "../behavioral/payment.ts";
import { simulateDisputes } from "./disputes.ts";
import { simulateComplianceEvents } from "./compliance.ts";
import { computeServicingCosts } from "./servicing.ts";

/** Full simulation result */
export interface SimulationResult {
  portfolio: ReturnType<typeof generatePortfolio>;
  payment_stats: ReturnType<typeof aggregatePaymentStats>;
  disputes: ReturnType<typeof simulateDisputes>;
  compliance_events: ReturnType<typeof simulateComplianceEvents>;
  costs: ReturnType<typeof computeServicingCosts>;
  summary: {
    total_face_cents: number;
    purchase_price_cents: number; // at 5.4¢ per $1
    cash_collected_cents: number;
    total_costs_cents: number;
    net_after_costs_cents: number;
    cash_per_dollar_face: number;
    accounts_cleared: number;
    accounts_disputed: number;
    accounts_complained: number;
  };
}

/** Run full simulation */
export function runSimulation(
  config: PortfolioConfig,
  matchRatio: number,
  seed: number | string,
): SimulationResult {
  const rng = seedrandom(String(seed));

  // 1. Generate portfolio
  const portfolio = generatePortfolio(config);

  // 2. Assign archetypes
  const archetypes = assignArchetypes(portfolio.accounts.length, rng);

  // 3. Simulate payments
  const outcomes = simulateAllPayments(
    portfolio.accounts,
    archetypes,
    matchRatio,
    rng,
  );
  const payment_stats = aggregatePaymentStats(portfolio.accounts, outcomes);

  // 4. Simulate disputes
  const disputes = simulateDisputes(portfolio.accounts, rng);

  // 5. Simulate compliance events
  const compliance_events = simulateComplianceEvents(
    portfolio.accounts,
    outcomes,
    rng,
  );

  // 6. Compute costs
  const costs = computeServicingCosts(
    portfolio.accounts,
    outcomes,
    disputes,
    compliance_events,
  );

  // 7. Compute summary
  const total_face_cents = portfolio.metadata.actual_face_cents;
  const purchase_price_cents = Math.round(total_face_cents * 0.054); // 5.4¢ per $1
  const cash_collected_cents = payment_stats.total_collected_cents;
  const total_costs_cents = costs.total_cents;
  const net_after_costs_cents =
    cash_collected_cents - purchase_price_cents - total_costs_cents;

  return {
    portfolio,
    payment_stats,
    disputes,
    compliance_events,
    costs,
    summary: {
      total_face_cents,
      purchase_price_cents,
      cash_collected_cents,
      total_costs_cents,
      net_after_costs_cents,
      cash_per_dollar_face: cash_collected_cents / total_face_cents,
      accounts_cleared: payment_stats.accounts_cleared_count,
      accounts_disputed: disputes.length,
      accounts_complained: compliance_events.length,
    },
  };
}
