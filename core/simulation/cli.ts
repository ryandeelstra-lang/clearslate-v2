#!/usr/bin/env node
// Simulation CLI.
//
// Run simulations from command line with different parameters.
// Usage: node core/simulation/cli.ts [scenario] [match-ratio] [seed]

import { H3_BASELINE } from "./scenarios/h3-baseline.ts";
import { runSimulation } from "./operational/simulate.ts";

function printUsage() {
  console.log("Usage: node core/simulation/cli.ts [scenario] [match-ratio] [seed]");
  console.log();
  console.log("Arguments:");
  console.log("  scenario      h3-baseline (default)");
  console.log("  match-ratio   0-5 (default: 3)");
  console.log("  seed          any number/string (default: 42)");
  console.log();
  console.log("Examples:");
  console.log("  node core/simulation/cli.ts                    # H3 baseline at R=3");
  console.log("  node core/simulation/cli.ts h3-baseline 0 42   # Baseline (no match)");
  console.log("  node core/simulation/cli.ts h3-baseline 5 42   # R=5 match");
  process.exit(1);
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
  }

  const scenarioName = args[0] || "h3-baseline";
  const matchRatio = args[1] ? parseFloat(args[1]) : 3;
  const seed = args[2] || 42;

  // Load scenario
  let scenario;
  switch (scenarioName) {
    case "h3-baseline":
      scenario = H3_BASELINE;
      break;
    default:
      console.error(`Unknown scenario: ${scenarioName}`);
      printUsage();
  }

  console.log(`Running simulation: ${scenarioName} at R=${matchRatio}, seed=${seed}\n`);

  const result = runSimulation(scenario, matchRatio, seed);

  // Print results
  console.log("=== Portfolio ===");
  console.log(
    `Face value: $${(result.summary.total_face_cents / 100).toLocaleString()}`,
  );
  console.log(`Accounts: ${result.portfolio.accounts.length}`);
  console.log(
    `Mean balance: $${(result.portfolio.metadata.balance_stats.mean / 100).toFixed(0)}`,
  );
  console.log(
    `Median balance: $${(result.portfolio.metadata.balance_stats.median / 100).toFixed(0)}`,
  );
  console.log(
    `Defect rate: ${(result.portfolio.metadata.defect_rate * 100).toFixed(1)}%`,
  );
  console.log(`QC flags: ${result.portfolio.metadata.qc_flags.join(", ") || "none"}`);
  console.log();

  console.log("=== Purchase ===");
  console.log(
    `Price: $${(result.summary.purchase_price_cents / 100).toLocaleString()} (${((result.summary.purchase_price_cents / result.summary.total_face_cents) * 100).toFixed(2)}¢/$1)`,
  );
  console.log();

  console.log("=== Collections ===");
  console.log(
    `Response rate: ${(result.payment_stats.response_rate * 100).toFixed(1)}%`,
  );
  console.log(
    `Payment rate: ${(result.payment_stats.payment_rate * 100).toFixed(1)}% (of responders)`,
  );
  console.log(
    `Cash collected: $${(result.summary.cash_collected_cents / 100).toLocaleString()} (${(result.summary.cash_per_dollar_face * 100).toFixed(2)}¢/$1)`,
  );
  console.log(`Accounts cleared: ${result.summary.accounts_cleared}`);
  console.log();

  console.log("=== Operations ===");
  console.log(`Disputes: ${result.summary.accounts_disputed}`);
  console.log(`Compliance events: ${result.summary.accounts_complained}`);
  console.log();

  console.log("=== Costs ===");
  console.log(
    `Upfront: $${(result.costs.total_upfront_cents / 100).toLocaleString()}`,
  );
  console.log(
    `Variable: $${(result.costs.total_variable_cents / 100).toLocaleString()}`,
  );
  console.log(
    `Disputes: $${(result.costs.total_dispute_cents / 100).toLocaleString()}`,
  );
  console.log(
    `Compliance: $${(result.costs.total_compliance_cents / 100).toLocaleString()}`,
  );
  console.log(
    `Total: $${(result.summary.total_costs_cents / 100).toLocaleString()}`,
  );
  console.log();

  console.log("=== Summary ===");
  console.log(
    `Gross cash: $${(result.summary.cash_collected_cents / 100).toLocaleString()}`,
  );
  console.log(
    `Purchase + costs: $${((result.summary.purchase_price_cents + result.summary.total_costs_cents) / 100).toLocaleString()}`,
  );
  console.log(
    `Net profit: $${(result.summary.net_after_costs_cents / 100).toLocaleString()}`,
  );
  const roi =
    (result.summary.net_after_costs_cents / result.summary.purchase_price_cents) *
    100;
  console.log(`ROI: ${roi.toFixed(1)}%`);
  console.log();

  // Break-even check
  const breakeven_cents = 0.1125 * result.summary.total_face_cents; // 11.25¢
  const cash_bps =
    (result.summary.cash_collected_cents / result.summary.total_face_cents) *
    10_000;
  console.log(`Break-even: 11.25¢ (${(breakeven_cents / 100).toLocaleString()})`);
  console.log(
    `Achieved: ${(cash_bps / 100).toFixed(2)}¢ (${result.summary.cash_collected_cents >= breakeven_cents ? "PASS ✅" : "FAIL ❌"}`,
  );
}

main();
