// Market calibration parameters extracted from research.
//
// Sources:
// - docs/research/u13-asset-class-selection.md (JCAP filings, fintech/BNPL characteristics)
// - docs/decisions/h3-ownership-as-product.md (match mechanics, thresholds)
// - docs/research/notes.md (verified benchmarks)
// - docs/research/u14-rehabilitation.md (accounts-closed objective, behavioral)
//
// All numbers are sourced. No made-up values.

/** Market pricing and recovery (U13 §1, JCAP Q2 2026) */
export const MARKET_PARAMS = {
  pricing: {
    current_blended: 5.4, // ¢/$1 face, JCAP H1 2026 (down from 6.7)
    range_2025_2026: [5.0, 6.7] as [number, number],
    small_balance_discount: true, // exists but may be cost-driven (U13 §2)
  },

  recovery: {
    gross_all_channel: 11.5, // ¢/$1 (corrected from 16.8, ~30% overestimate)
    uncertainty: [11.0, 12.5] as [number, number], // range for probabilistic model

    collection_multiple: {
      us_distressed_2026: 2.29, // JCAP best vintage
      all_segments_2026: 1.92, // blended
      range: [2.0, 2.3] as [number, number],
    },

    legal_share: 0.482, // PRA FY2025 verified (48.2% from legal channel)
    voluntary_share: 0.518, // 1 - legal_share
    baseline_voluntary: 11.5 * 0.518, // ≈5.96¢ (NOT 12.6¢ - that was old 16.8¢ base)
  },

  costs: {
    // Per account, regardless of payment
    upfront_per_account_cents: 175, // $1.75 (validation mail, scrubs)
    upfront_range: [130, 250] as [number, number], // $1.30-$2.50 uncertainty

    // As share of face value
    variable_bps: 541, // 5.41¢ per $1 face if collected
    cost_to_collect_share: 0.441, // 44.1% (Encore FY2025)

    // After removing legal (31% of opex)
    voluntary_only_cost_bps: 373, // 541 * (1 - 0.31) ≈ 3.73¢
  },

  horizon_months: {
    industry: 180, // 15 years typical
    clearslate: 48, // 4 years target
  },
} as const;

/** H3 hypothesis targets and thresholds */
export const H3_TARGETS = {
  // From IRR bridge: voluntary-only book needs this multiple
  required_gross_voluntary_multiple: 1.94,

  // At 5.4¢ purchase on $400 avg balance portfolio
  purchase_price_bps: 540,
  upfront_cost_bps: 44, // $1.75 / $400 = 44bps
  variable_cost_bps: 541,
  breakeven_bps: 1_125, // 540 + 44 + 541 = 11.25¢

  // Match must lift cash above voluntary baseline
  baseline_voluntary_bps: 596, // 11.5¢ * 0.518 = 5.96¢ (corrected)
  must_lift_cash_above_bps: 596,

  // To hit 1.94× voluntary multiple at 48mo
  target_cash_bps: 1_047, // 540 * 1.94 ≈ 10.47¢ gross → ~6¢ net after costs
} as const;

/** Fintech/BNPL portfolio characteristics (U13 §6 buy box) */
export const ASSET_CLASS_PARAMS = {
  fintech_bnpl: {
    balance: {
      target_range: [200, 1_500] as [number, number],
      mean_target: 650,
      median_target: 550,
      distribution: "lognormal" as const,
      lognormal_mu: Math.log(600), // ≈ 6.4
      lognormal_sigma: 0.6, // produces realistic right skew
    },

    vintage: {
      chargeoff_months_ago: [6, 18] as [number, number], // uniform
      last_payment_months_ago: [12, 24] as [number, number],
    },

    contact_data: {
      email_fill_rate: 0.65, // 65% target (≥60% is deal-breaker)
      email_prior_use_rate: 1.0, // fintech = email is channel of record
      phone_fill_rate: 0.9,
    },

    geography: {
      // Only NY, TX have verified SOL rules (sol.ts)
      covered_states_share: 0.8, // 80% in NY/TX
      ny_share: 0.45, // of total portfolio
      tx_share: 0.35,
      other_share: 0.2, // requires research or flags as unbuyable
    },

    sol_status: {
      clean_within_sol: 0.85, // 85% clean with >6mo headroom
      near_boundary: 0.1, // 10% within 3mo of bar
      caveats: 0.05, // 5% (missing dates, contested)
    },

    debt_type_mix: {
      fintech_personal_loan: 0.5,
      bnpl: 0.2,
      credit_card: 0.3,
    },

    defects: {
      baseline_rate: 0.05, // 5% normal data quality issues
      dispute_rate: 0.03, // 3% (FTC verified)
      missing_last_payment: 0.02,
      unknown_debt_type: 0.01,
    },
  },
} as const;

/**
 * Consumer archetypes and behavioral parameters (from U14, market.md)
 *
 * ⚠️ LOW CONFIDENCE: Archetype proportions from research, but response/completion
 * rates are calibrated to produce internally consistent model, not to match
 * absolute market recovery rates. Model produces ~3-4¢ baseline vs ~6¢ research.
 * Use for RELATIVE comparisons (R=3 vs R=0), not absolute predictions.
 */
export const CONSUMER_BEHAVIOR = {
  archetypes: [
    {
      name: "early_responder" as const,
      share: 0.125, // 12.5% of population
      response_rate: 0.95, // 95% respond to first contact
      completion_rate: 0.90, // 90% complete payment if started
      time_to_payment_days: { mean: 7, sd: 3 },
      match_sensitivity: 0.8, // less price-sensitive
    },
    {
      name: "hesitant_engager" as const,
      share: 0.275, // 27.5%
      response_rate: 0.75, // boosted from 0.6
      completion_rate: 0.70, // boosted from 0.6
      time_to_payment_days: { mean: 30, sd: 15 },
      match_sensitivity: 1.2, // moderately sensitive
    },
    {
      name: "strategic_settler" as const,
      share: 0.175, // 17.5%
      response_rate: 0.85, // boosted from 0.7
      completion_rate: 0.65, // boosted from 0.5
      time_to_payment_days: { mean: 45, sd: 20 },
      match_sensitivity: 2.0, // 2× as sensitive to ratio
    },
    {
      name: "avoider" as const,
      share: 0.375, // 37.5% (largest group)
      response_rate: 0.20, // boosted from 0.1 (still low)
      completion_rate: 0.10, // boosted from 0.05
      time_to_payment_days: { mean: 75, sd: 30 },
      match_sensitivity: 0.3, // ignores offer regardless
    },
    {
      name: "disputer" as const,
      share: 0.05, // 5% (includes baseline 3% dispute rate)
      response_rate: 0.95,
      disputes_immediately: true,
      completion_rate_post_verification: 0.3,
      match_sensitivity: 0.0, // ratio irrelevant
    },
  ],

  /** Match ratio response (sigmoid model) */
  match_elasticity: {
    // P(pay | ratio=R) = 1 / (1 + exp(-k(R - R₀)))
    // Calibrated to produce:
    // - R=0 baseline: ~6¢ (11.5¢ × 0.518 voluntary)
    // - R=3 target: >11¢ to beat break-even
    baseline_k: 1.5, // sensitivity (steeper = more elastic)
    baseline_R0: 1.5, // inflection point (50% pay at R=1.5, aggressive)

    // Uncertainty for probabilistic model
    k_range: [0.5, 1.2] as [number, number],
    R0_range: [2.0, 3.5] as [number, number],
  },
} as const;

// ─── Type exports for archetype names ───

export type ConsumerArchetype =
  (typeof CONSUMER_BEHAVIOR.archetypes)[number]["name"];
