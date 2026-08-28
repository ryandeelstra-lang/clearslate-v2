// H3 Baseline scenario - standard test case for H3 hypothesis validation.
//
// Represents a "good" fintech/BNPL tape that should be profitable at R=3 match.

import type { PortfolioConfig } from "../types.ts";
import { ASSET_CLASS_PARAMS } from "../calibration.ts";

export const H3_BASELINE: PortfolioConfig = {
  name: "h3-baseline",
  seed: 42,
  accountCount: 1000,

  balanceParams: {
    type: "lognormal",
    params: {
      mu: ASSET_CLASS_PARAMS.fintech_bnpl.balance.lognormal_mu,
      sigma: ASSET_CLASS_PARAMS.fintech_bnpl.balance.lognormal_sigma,
      min: ASSET_CLASS_PARAMS.fintech_bnpl.balance.target_range[0],
      max: ASSET_CLASS_PARAMS.fintech_bnpl.balance.target_range[1],
    },
  },

  assetClassMix: ASSET_CLASS_PARAMS.fintech_bnpl.debt_type_mix,

  geoParams: {
    ny_share: ASSET_CLASS_PARAMS.fintech_bnpl.geography.ny_share,
    tx_share: ASSET_CLASS_PARAMS.fintech_bnpl.geography.tx_share,
    other_share: ASSET_CLASS_PARAMS.fintech_bnpl.geography.other_share,
  },

  vintageParams: {
    chargeoff_months_ago: ASSET_CLASS_PARAMS.fintech_bnpl.vintage.chargeoff_months_ago,
    last_payment_months_ago: ASSET_CLASS_PARAMS.fintech_bnpl.vintage.last_payment_months_ago,
  },

  contactParams: {
    email_fill_rate: ASSET_CLASS_PARAMS.fintech_bnpl.contact_data.email_fill_rate,
    email_prior_use_rate: ASSET_CLASS_PARAMS.fintech_bnpl.contact_data.email_prior_use_rate,
    phone_fill_rate: ASSET_CLASS_PARAMS.fintech_bnpl.contact_data.phone_fill_rate,
  },

  defectParams: {
    baseline_rate: ASSET_CLASS_PARAMS.fintech_bnpl.defects.baseline_rate,
  },

  asOf: { y: 2026, m: 8, d: 26 },
};
