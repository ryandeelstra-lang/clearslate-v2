// High Defect scenario.
//
// Tests portfolio with 30% defect rate (6× normal).
// Should trigger QC flags and either reject or demand steep discount.

import type { PortfolioConfig } from "../types.ts";

export const HIGH_DEFECT: PortfolioConfig = {
  name: "high-defect",
  seed: 42,
  accountCount: 1000,

  balanceParams: {
    type: "lognormal",
    params: {
      mu: Math.log(600),
      sigma: 0.6,
      min: 200,
      max: 1_500,
    },
  },

  assetClassMix: {
    fintech_personal_loan: 0.5,
    bnpl: 0.2,
    credit_card: 0.3,
  },

  geoParams: {
    ny_share: 0.45,
    tx_share: 0.35,
    other_share: 0.20,
  },

  vintageParams: {
    chargeoff_months_ago: [6, 18],
    last_payment_months_ago: [12, 24],
  },

  contactParams: {
    email_fill_rate: 0.65,
    email_prior_use_rate: 1.0,
    phone_fill_rate: 0.9,
  },

  // STRESS: 30% defect rate (6× normal 5%)
  defectParams: {
    baseline_rate: 0.30,
    missing_last_payment: 0.15, // 15% missing LPD (blocks SOL)
    unknown_debt_type: 0.10, // 10% unknown type (disqualifies)
  },

  asOf: { y: 2026, m: 8, d: 26 },
};
