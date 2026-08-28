// Tests for operational simulation.

import { test } from "node:test";
import assert from "node:assert/strict";
import seedrandom from "seedrandom";
import { H3_BASELINE } from "../scenarios/h3-baseline.ts";
import { runSimulation } from "./simulate.ts";
import { generatePortfolio } from "../generators/portfolio.ts";
import { simulateDisputes } from "./disputes.ts";
import { simulateComplianceEvents } from "./compliance.ts";
import { assignArchetypes } from "../behavioral/consumer.ts";
import { simulateAllPayments } from "../behavioral/payment.ts";

test("Dispute rate is ~3% of accounts", () => {
  const portfolio = generatePortfolio(H3_BASELINE);
  const rng = seedrandom("dispute-test");
  const disputes = simulateDisputes(portfolio.accounts, rng);

  const disputeRate = disputes.length / portfolio.accounts.length;

  console.log(`  Dispute rate: ${(disputeRate * 100).toFixed(1)}%`);
  console.log(`  Disputes: ${disputes.length} / ${portfolio.accounts.length}`);

  assert(
    disputeRate >= 0.02 && disputeRate <= 0.07,
    `Dispute rate ${(disputeRate * 100).toFixed(1)}% not in [2%, 7%]`,
  );
});

test("Compliance events are rare (<1%)", () => {
  const portfolio = generatePortfolio(H3_BASELINE);
  const rng = seedrandom("compliance-test");
  const archetypes = assignArchetypes(portfolio.accounts.length, rng);
  const outcomes = simulateAllPayments(
    portfolio.accounts,
    archetypes,
    3,
    rng,
  );
  const complianceEvents = simulateComplianceEvents(
    portfolio.accounts,
    outcomes,
    rng,
  );

  const complaintRate = complianceEvents.length / portfolio.accounts.length;

  console.log(`  Compliance events: ${complianceEvents.length}`);
  console.log(`  Complaint rate: ${(complaintRate * 100).toFixed(2)}%`);

  assert(
    complaintRate < 0.01,
    `Complaint rate ${(complaintRate * 100).toFixed(2)}% >= 1%`,
  );
});

test("Full simulation produces coherent summary", () => {
  const result = runSimulation(H3_BASELINE, 3, "full-sim-test");

  console.log("  Full simulation summary:");
  console.log(
    `    Face value: $${(result.summary.total_face_cents / 100).toFixed(0)}`,
  );
  console.log(
    `    Purchase price: $${(result.summary.purchase_price_cents / 100).toFixed(0)} (${(result.summary.purchase_price_cents / result.summary.total_face_cents * 100).toFixed(2)}¢)`,
  );
  console.log(
    `    Cash collected: $${(result.summary.cash_collected_cents / 100).toFixed(0)} (${(result.summary.cash_per_dollar_face * 100).toFixed(2)}¢)`,
  );
  console.log(
    `    Total costs: $${(result.summary.total_costs_cents / 100).toFixed(0)}`,
  );
  console.log(
    `    Net after costs: $${(result.summary.net_after_costs_cents / 100).toFixed(0)}`,
  );
  console.log(`    Accounts cleared: ${result.summary.accounts_cleared}`);
  console.log(`    Disputes: ${result.summary.accounts_disputed}`);
  console.log(`    Complaints: ${result.summary.accounts_complained}`);

  // Sanity checks
  assert(
    result.summary.total_face_cents > 0,
    "Face value should be positive",
  );
  assert(
    result.summary.purchase_price_cents > 0,
    "Purchase price should be positive",
  );
  assert(
    result.summary.cash_collected_cents >= 0,
    "Cash collected should be non-negative",
  );
  assert(
    result.summary.total_costs_cents > 0,
    "Costs should be positive (at least upfront)",
  );

  // Purchase price should be ~5.4¢ of face
  const purchaseBps =
    (result.summary.purchase_price_cents / result.summary.total_face_cents) *
    10_000;
  assert(
    Math.abs(purchaseBps - 540) < 10,
    `Purchase bps ${purchaseBps} not near 540`,
  );
});

test("Upfront costs are exactly $1.75 per account", () => {
  const result = runSimulation(H3_BASELINE, 3, "upfront-cost-test");

  const expectedUpfront = 175 * H3_BASELINE.accountCount; // $1.75 × count

  console.log(
    `  Expected upfront: $${(expectedUpfront / 100).toFixed(2)}`,
  );
  console.log(
    `  Actual upfront: $${(result.costs.total_upfront_cents / 100).toFixed(2)}`,
  );

  assert(
    result.costs.total_upfront_cents === expectedUpfront,
    `Upfront ${result.costs.total_upfront_cents} ≠ ${expectedUpfront}`,
  );
});

test("Variable costs are ~5.41% of collected face", () => {
  const result = runSimulation(H3_BASELINE, 3, "variable-cost-test");

  const collectedCents = result.summary.cash_collected_cents;
  const expectedVariable = Math.round((collectedCents * 541) / 10_000);

  console.log(
    `  Collected: $${(collectedCents / 100).toFixed(2)}`,
  );
  console.log(
    `  Expected variable: $${(expectedVariable / 100).toFixed(2)}`,
  );
  console.log(
    `  Actual variable: $${(result.costs.total_variable_cents / 100).toFixed(2)}`,
  );

  // Allow ±$10 tolerance (rounding)
  assert(
    Math.abs(result.costs.total_variable_cents - expectedVariable) < 1000,
    `Variable ${result.costs.total_variable_cents} not near ${expectedVariable}`,
  );
});
