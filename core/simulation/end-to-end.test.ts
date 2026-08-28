// End-to-end simulation test.
//
// Validates the full simulation flow: portfolio → payment → disputes → compliance → costs → summary

import { test } from "node:test";
import assert from "node:assert/strict";
import { H3_BASELINE } from "./scenarios/h3-baseline.ts";
import { runSimulation } from "./operational/simulate.ts";

test("H3 Baseline end-to-end simulation", () => {
  const result = runSimulation(H3_BASELINE, 3, 42);

  console.log("\n=== H3 Baseline Simulation (R=3) ===");
  console.log(`Portfolio:`);
  console.log(
    `  Face value: $${(result.summary.total_face_cents / 100).toLocaleString()}`,
  );
  console.log(`  Accounts: ${result.portfolio.accounts.length}`);
  console.log(
    `  Mean balance: $${(result.portfolio.metadata.balance_stats.mean / 100).toFixed(0)}`,
  );
  console.log(
    `  Median balance: $${(result.portfolio.metadata.balance_stats.median / 100).toFixed(0)}`,
  );
  console.log();

  console.log(`Purchase:`);
  console.log(
    `  Price: $${(result.summary.purchase_price_cents / 100).toLocaleString()} (${((result.summary.purchase_price_cents / result.summary.total_face_cents) * 100).toFixed(2)}¢/$1)`,
  );
  console.log();

  console.log(`Collections:`);
  console.log(
    `  Response rate: ${(result.payment_stats.response_rate * 100).toFixed(1)}%`,
  );
  console.log(
    `  Payment rate: ${(result.payment_stats.payment_rate * 100).toFixed(1)}%`,
  );
  console.log(
    `  Cash collected: $${(result.summary.cash_collected_cents / 100).toLocaleString()} (${(result.summary.cash_per_dollar_face * 100).toFixed(2)}¢/$1)`,
  );
  console.log(`  Accounts cleared: ${result.summary.accounts_cleared}`);
  console.log();

  console.log(`Operations:`);
  console.log(`  Disputes: ${result.summary.accounts_disputed}`);
  console.log(`  Compliance events: ${result.summary.accounts_complained}`);
  console.log();

  console.log(`Costs:`);
  console.log(
    `  Upfront: $${(result.costs.total_upfront_cents / 100).toLocaleString()}`,
  );
  console.log(
    `  Variable: $${(result.costs.total_variable_cents / 100).toLocaleString()}`,
  );
  console.log(
    `  Disputes: $${(result.costs.total_dispute_cents / 100).toLocaleString()}`,
  );
  console.log(
    `  Compliance: $${(result.costs.total_compliance_cents / 100).toLocaleString()}`,
  );
  console.log(
    `  Total: $${(result.summary.total_costs_cents / 100).toLocaleString()}`,
  );
  console.log();

  console.log(`Summary:`);
  console.log(
    `  Net profit: $${(result.summary.net_after_costs_cents / 100).toLocaleString()}`,
  );
  const roi =
    (result.summary.net_after_costs_cents / result.summary.purchase_price_cents) *
    100;
  console.log(`  ROI: ${roi.toFixed(1)}%`);
  console.log();

  // Assertions
  assert(
    result.summary.total_face_cents > 0,
    "Face value should be positive",
  );
  assert(
    result.summary.cash_collected_cents > 0,
    "Should collect some cash",
  );
  assert(
    result.summary.accounts_cleared > 0,
    "Should clear some accounts",
  );
  assert(
    result.summary.net_after_costs_cents !== 0,
    "Should have non-zero net result",
  );
});

test("Match elasticity comparison: R=0 vs R=3", () => {
  const baseline = runSimulation(H3_BASELINE, 0, 42);
  const matched = runSimulation(H3_BASELINE, 3, 42);

  console.log("\n=== Match Elasticity Comparison ===");
  console.log(`R=0 (baseline):`);
  console.log(
    `  Cash: $${(baseline.summary.cash_collected_cents / 100).toLocaleString()} (${(baseline.summary.cash_per_dollar_face * 100).toFixed(2)}¢/$1)`,
  );
  console.log(`  Accounts cleared: ${baseline.summary.accounts_cleared}`);
  console.log();

  console.log(`R=3 (match):`);
  console.log(
    `  Cash: $${(matched.summary.cash_collected_cents / 100).toLocaleString()} (${(matched.summary.cash_per_dollar_face * 100).toFixed(2)}¢/$1)`,
  );
  console.log(`  Accounts cleared: ${matched.summary.accounts_cleared}`);
  console.log();

  const cashLift =
    matched.summary.cash_collected_cents / baseline.summary.cash_collected_cents;
  console.log(`  Cash lift: ${cashLift.toFixed(2)}×`);
  console.log();

  // Match should lift cash significantly
  assert(
    matched.summary.cash_collected_cents > baseline.summary.cash_collected_cents,
    "R=3 should collect more than R=0",
  );
  assert(
    matched.summary.accounts_cleared > baseline.summary.accounts_cleared,
    "R=3 should clear more accounts than R=0",
  );
  assert(
    cashLift > 1.5,
    `Cash lift ${cashLift.toFixed(2)}× should be >1.5×`,
  );
});
