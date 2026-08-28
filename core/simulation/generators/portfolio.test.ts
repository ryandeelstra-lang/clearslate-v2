// Tests for portfolio generator.
//
// Validates that generated portfolios match target distributions.

import { test } from "node:test";
import assert from "node:assert/strict";
import { generatePortfolio } from "./portfolio.ts";
import { H3_BASELINE } from "../scenarios/h3-baseline.ts";

test("H3 baseline generates 1000 accounts", () => {
  const portfolio = generatePortfolio(H3_BASELINE);

  assert.equal(portfolio.accounts.length, 1000, "Should generate 1000 accounts");
  assert.equal(portfolio.metadata.actual_count, 1000);
});

test("H3 baseline balance distribution has realistic mean/median", () => {
  const portfolio = generatePortfolio(H3_BASELINE);
  const { balance_stats } = portfolio.metadata;

  // Log-normal(μ=ln(600), σ=0.6) should produce:
  // - Median ≈ $550 (exp(μ) = 600, but clipping affects it)
  // - Mean ≈ $650 (right-skewed)

  const meanDollars = balance_stats.mean / 100;
  const medianDollars = balance_stats.median / 100;

  console.log(`  Mean: $${meanDollars.toFixed(2)}, Median: $${medianDollars.toFixed(2)}`);

  assert(meanDollars > 500 && meanDollars < 800, `Mean $${meanDollars} not in [500, 800]`);
  assert(medianDollars > 400 && medianDollars < 700, `Median $${medianDollars} not in [400, 700]`);
  assert(meanDollars > medianDollars, "Mean should exceed median (right skew)");
});

test("H3 baseline geographic mix matches target", () => {
  const portfolio = generatePortfolio(H3_BASELINE);

  const nyCount = portfolio.accounts.filter((a) => a.state === "NY").length;
  const txCount = portfolio.accounts.filter((a) => a.state === "TX").length;
  const otherCount = portfolio.accounts.filter((a) =>
    a.state !== "NY" && a.state !== "TX"
  ).length;

  const nyShare = nyCount / 1000;
  const txShare = txCount / 1000;
  const otherShare = otherCount / 1000;

  console.log(`  NY: ${(nyShare * 100).toFixed(1)}%, TX: ${(txShare * 100).toFixed(1)}%, Other: ${(otherShare * 100).toFixed(1)}%`);

  // Target: NY 45%, TX 35%, Other 20% (±10% tolerance)
  assert(nyShare > 0.35 && nyShare < 0.55, `NY ${(nyShare * 100).toFixed(1)}% not in [35%, 55%]`);
  assert(txShare > 0.25 && txShare < 0.45, `TX ${(txShare * 100).toFixed(1)}% not in [25%, 45%]`);
  assert(otherShare > 0.10 && otherShare < 0.30, `Other ${(otherShare * 100).toFixed(1)}% not in [10%, 30%]`);
});

test("H3 baseline has ~5% defect rate", () => {
  const portfolio = generatePortfolio(H3_BASELINE);
  const defectRate = portfolio.metadata.defect_rate;

  console.log(`  Defect rate: ${(defectRate * 100).toFixed(1)}%`);

  // Baseline 5% splits into ~2% missing_lp + ~1% unknown_type + ~0.25% missing_co
  // With randomness, expect 2-6%
  assert(defectRate > 0.02 && defectRate < 0.07,
    `Defect rate ${(defectRate * 100).toFixed(1)}% not in [2%, 7%]`);
});

test("H3 baseline flags no critical QC issues", () => {
  const portfolio = generatePortfolio(H3_BASELINE);
  const { qc_flags } = portfolio.metadata;

  console.log(`  QC flags: ${qc_flags.length > 0 ? qc_flags.join(", ") : "none"}`);

  // Should NOT flag high_unknown_sol_share (80% covered)
  assert(!qc_flags.includes("high_unknown_sol_share"),
    "Should not flag high unknown SOL (80% covered)");

  // Should NOT flag high_defect_rate (5% baseline)
  assert(!qc_flags.includes("high_defect_rate"),
    "Should not flag high defect rate (5% is normal)");

  // Should NOT flag low_email_fill (65% target)
  assert(!qc_flags.includes("low_email_fill"),
    "Should not flag low email fill (65% > 60% threshold)");
});

test("All accounts have required fields", () => {
  const portfolio = generatePortfolio(H3_BASELINE);

  for (const account of portfolio.accounts) {
    assert(account.id.startsWith("ACCT"), `Account ID should start with ACCT: ${account.id}`);
    assert(account.balanceCents > 0, "Balance should be positive");
    assert(account.state.length === 2, `State should be 2 chars: ${account.state}`);
    assert(account.debtType, "Debt type should be set");

    // Dates can be null (defects), but if present should be valid
    if (account.chargeOffDate) {
      assert(account.chargeOffDate.y >= 2020, "Charge-off year should be recent");
    }
    if (account.lastPaymentDate) {
      assert(account.lastPaymentDate.y >= 2020, "Last payment year should be recent");
    }
  }
});

test("Generated portfolio is deterministic (same seed = same output)", () => {
  const p1 = generatePortfolio(H3_BASELINE);
  const p2 = generatePortfolio(H3_BASELINE);

  // First 5 accounts should be identical
  for (let i = 0; i < 5; i++) {
    assert.equal(p1.accounts[i].id, p2.accounts[i].id);
    assert.equal(p1.accounts[i].balanceCents, p2.accounts[i].balanceCents);
    assert.equal(p1.accounts[i].state, p2.accounts[i].state);
    assert.equal(p1.accounts[i].debtType, p2.accounts[i].debtType);
  }

  // Metadata should match
  assert.equal(p1.metadata.declared_face_cents, p2.metadata.declared_face_cents);
  assert.equal(p1.metadata.balance_stats.mean, p2.metadata.balance_stats.mean);
});
