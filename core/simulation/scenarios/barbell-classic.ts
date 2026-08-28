// Barbell Classic scenario.
//
// Regression test for barbell detection (existing test, but with realistic noise).
// 100 large accounts ($5k avg) + 4,000 small accounts ($50 avg)

import type { PortfolioConfig } from "../types.ts";

export const BARBELL_CLASSIC: PortfolioConfig = {
  name: "barbell-classic",
  seed: 12345,
  accountCount: 4100,

  // Bimodal: 100 × $5k + 4,000 × $50
  balanceParams: {
    type: "bimodal",
    params: {
      cluster1: { count: 100, mean: 500_000, sd: 50_000 }, // $5k ± $500
      cluster2: { count: 4_000, mean: 5_000, sd: 1_000 }, // $50 ± $10
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

  defectParams: {
    baseline_rate: 0.05,
  },

  asOf: { y: 2026, m: 8, d: 26 },
};
