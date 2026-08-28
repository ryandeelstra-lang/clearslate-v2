// Core types for the debt portfolio simulation framework.
//
// Probability distributions, RNG wrapper, configuration types.
// Zero runtime dependencies beyond seedrandom for deterministic RNG.

import type { TapeAccount } from "../tape.ts";

/** Seeded random number generator (0 to 1, exclusive of 1) */
export type RNG = () => number;

/** Month/day within a year */
export type MonthDay = { m: number; d: number };

/** Full date (year + month + day) */
export type YearMonthDay = { y: number; m: number; d: number };

/** US state code */
export type State = string; // 'NY' | 'TX' | 'OH' | ...

/** Debt type (matches tape.ts) */
export type DebtType =
  | "credit_card"
  | "retail_card"
  | "personal_loan"
  | "bnpl"
  | "medical"
  | "telecom"
  | "dda"
  | "auto_deficiency"
  | "payday"
  | "student"
  | "unknown";

// ─── Distribution Parameters ───

/** Log-normal distribution parameters */
export interface LogNormalParams {
  mu: number; // mean of underlying normal (log scale)
  sigma: number; // std dev of underlying normal
  min: number; // clamp lower bound (in original units)
  max: number; // clamp upper bound
}

/** Bimodal distribution (two clusters) */
export interface BimodalParams {
  cluster1: { count: number; mean: number; sd: number };
  cluster2: { count: number; mean: number; sd: number };
}

/** Balance distribution specification */
export type BalanceDistribution =
  | { type: "lognormal"; params: LogNormalParams }
  | { type: "bimodal"; params: BimodalParams };

/** Geographic distribution parameters */
export interface GeoParams {
  ny_share: number; // proportion in NY (0-1)
  tx_share: number; // proportion in TX
  other_share: number; // proportion in uncovered states
}

/** Vintage parameters (months ago from asOf date) */
export interface VintageParams {
  chargeoff_months_ago: [number, number]; // [min, max] uniform range
  last_payment_months_ago: [number, number];
}

/** Contact data parameters */
export interface ContactParams {
  email_fill_rate: number; // proportion with email (0-1)
  email_prior_use_rate: number; // proportion of emails that are Reg F-usable
  phone_fill_rate: number; // proportion with phone
}

/** Defect injection parameters */
export interface DefectParams {
  baseline_rate: number; // overall defect rate
  missing_last_payment?: number; // specific defect rates (optional overrides)
  unknown_debt_type?: number;
  reconciliation_mismatch?: number;
}

/** Asset class mix (proportions sum to 1.0) */
export type AssetClassMix = Partial<Record<DebtType, number>>;

// ─── Portfolio Configuration ───

export interface PortfolioConfig {
  name: string;
  seed: number; // RNG seed for reproducibility
  accountCount: number;

  balanceParams: BalanceDistribution;
  assetClassMix: AssetClassMix;
  geoParams: GeoParams;
  vintageParams: VintageParams;
  contactParams: ContactParams;
  defectParams: DefectParams;

  asOf: YearMonthDay; // as-of date for the portfolio
}

// ─── Portfolio Output ───

/** Statistics about a distribution */
export interface DistributionStats {
  mean: number;
  median: number;
  min: number;
  max: number;
  sd: number; // standard deviation
  skew: number; // skewness
}

/** QC flags raised during generation */
export type QCFlag =
  | "high_unknown_sol_share" // >50% in states not covered by sol.ts
  | "high_defect_rate" // >15% defects
  | "barbell_detected" // mean > 2× median
  | "reconciliation_mismatch" // declared vs actual face/count mismatch
  | "low_email_fill"; // <60% email (deal-breaker per U13)

/** Portfolio metadata */
export interface PortfolioMetadata {
  declared_face_cents: number;
  declared_count: number;
  actual_face_cents: number;
  actual_count: number;
  balance_stats: DistributionStats;
  qc_flags: QCFlag[];
  defect_rate: number; // actual defect rate after generation
}

/** Generated portfolio */
export interface Portfolio {
  accounts: TapeAccount[];
  metadata: PortfolioMetadata;
}

// ─── Helper Types ───

/** Weighted choice */
export interface WeightedChoice<T> {
  value: T;
  weight: number;
}

/** Date range */
export interface DateRange {
  start: YearMonthDay;
  end: YearMonthDay;
}
