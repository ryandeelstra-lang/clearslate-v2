// Concentration Risk scenario.
//
// Tests what happens when 80% of accounts are in uncovered states (unknown SOL).
// Should flag as unbuyable under H3 (cannot determine SOL status).

import type { PortfolioConfig } from "../types.ts";

export const CONCENTRATION_RISK: PortfolioConfig = {
  name: "concentration-risk",
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

  // STRESS: Only 20% in covered states (vs 80% baseline)
  geoParams: {
    ny_share: 0.10, // 10% NY (vs 45%)
    tx_share: 0.10, // 10% TX (vs 35%)
    other_share: 0.80, // 80% uncovered (vs 20%)
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
