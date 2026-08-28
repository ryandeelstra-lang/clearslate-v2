// Portfolio generator - main orchestrator.
//
// Assembles all generators into a complete synthetic portfolio (TapeAccount[]).
// Returns Portfolio with metadata for QC and validation.

import seedrandom from "seedrandom";
import type { TapeAccount, AccountDefect, Ymd, DebtType } from "../../tape.ts";
import type {
  Portfolio,
  PortfolioConfig,
  PortfolioMetadata,
  QCFlag,
  DistributionStats,
  RNG,
  AssetClassMix,
} from "../types.ts";
import { generateBalances } from "./balance.ts";
import { assignStates, analyzeGeographicMix } from "./geography.ts";
import { generateVintage } from "./temporal.ts";
import { generateContactData } from "./contact.ts";
import { injectDefects, computeDefectRate } from "./defects.ts";

/** Main entry point: generate a complete synthetic portfolio */
export function generatePortfolio(config: PortfolioConfig): Portfolio {
  const rng: RNG = seedrandom(String(config.seed));

  // 1. Generate balance distribution
  const balances = generateBalances(config.accountCount, config.balanceParams, rng);

  // 2. Assign geography (respecting SOL coverage)
  const states = assignStates(config.accountCount, config.geoParams, rng);

  // 3. Generate temporal data (charge-off, last payment)
  const dates = generateVintage(config.accountCount, config.vintageParams, config.asOf, rng);

  // 4. Assign debt types
  const debtTypes = assignDebtTypes(config.accountCount, config.assetClassMix, rng);

  // 5. Generate contact data
  const contacts = generateContactData(config.accountCount, config.contactParams, rng);

  // 6. Inject defects (missing dates, unknown types)
  const defects = injectDefects(config.accountCount, config.defectParams, rng);

  // 7. Assemble into TapeAccount[]
  const accounts: TapeAccount[] = [];
  for (let i = 0; i < config.accountCount; i++) {
    const accountDefects: AccountDefect[] = [];

    // Map defects to AccountDefect types
    if (defects[i].missing_chargeoff) {
      accountDefects.push("missing_charge_off_date");
    }
    if (defects[i].missing_last_payment) {
      accountDefects.push("missing_last_payment_date");
    }
    if (defects[i].unknown_type) {
      accountDefects.push("unrecognised_debt_type");
    }

    // Determine actual debt type
    const debtType: DebtType = defects[i].unknown_type ? "unknown" : debtTypes[i];

    // Dates (null if defect)
    const chargeOffDate: Ymd | null = defects[i].missing_chargeoff
      ? null
      : dates[i].chargeoff;
    const lastPaymentDate: Ymd | null = defects[i].missing_last_payment
      ? null
      : dates[i].lastPayment;

    accounts.push({
      id: `ACCT${String(i).padStart(8, "0")}`,
      balanceCents: balances[i],
      state: states[i],
      debtType,
      chargeOffDate,
      lastPaymentDate,
      defects: accountDefects,
    });
  }

  // 8. Compute metadata and QC flags
  const metadata = computeMetadata(accounts, config, balances, states, defects);

  return {
    accounts,
    metadata,
  };
}

/** Compute portfolio metadata and QC flags */
function computeMetadata(
  accounts: TapeAccount[],
  config: PortfolioConfig,
  balances: number[],
  states: string[],
  defects: ReturnType<typeof injectDefects>,
): PortfolioMetadata {
  const totalFace = balances.reduce((sum, b) => sum + b, 0);
  const defectRate = computeDefectRate(defects);
  const geoAnalysis = analyzeGeographicMix(states);

  // QC flags
  const qc_flags: QCFlag[] = [];

  // High unknown SOL share (>50% in uncovered states)
  if (geoAnalysis.covered_share < 0.5) {
    qc_flags.push("high_unknown_sol_share");
  }

  // High defect rate (>15%)
  if (defectRate > 0.15) {
    qc_flags.push("high_defect_rate");
  }

  // Barbell detection (mean > 2× median)
  const stats = computeStats(balances);
  if (stats.mean > 2 * stats.median) {
    qc_flags.push("barbell_detected");
  }

  // Low email fill (<60% deal-breaker)
  const emailCount = accounts.filter((a) => a.defects.length === 0).length;
  const emailFill = emailCount / accounts.length;
  if (emailFill < 0.6) {
    qc_flags.push("low_email_fill");
  }

  return {
    declared_face_cents: totalFace,
    declared_count: accounts.length,
    actual_face_cents: totalFace,
    actual_count: accounts.length,
    balance_stats: stats,
    qc_flags,
    defect_rate: defectRate,
  };
}

/** Compute distribution statistics */
function computeStats(values: number[]): DistributionStats {
  if (values.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, sd: 0, skew: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = values.length;

  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  const min = sorted[0];
  const max = sorted[n - 1];

  // Standard deviation
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  const sd = Math.sqrt(variance);

  // Skewness (sample skewness)
  const m3 = values.reduce((sum, v) => sum + ((v - mean) / sd) ** 3, 0) / n;
  const skew = m3;

  return { mean, median, min, max, sd, skew };
}

/** Assign debt types based on asset class mix */
function assignDebtTypes(
  n: number,
  mix: AssetClassMix,
  rng: RNG,
): DebtType[] {
  // Build weighted choices
  const choices: Array<{ type: DebtType; weight: number }> = [];
  let totalWeight = 0;

  for (const [type, weight] of Object.entries(mix)) {
    if (weight > 0) {
      choices.push({ type: type as DebtType, weight });
      totalWeight += weight;
    }
  }

  if (choices.length === 0 || Math.abs(totalWeight - 1.0) > 0.01) {
    throw new Error(
      `Asset class mix must sum to 1.0, got ${totalWeight.toFixed(3)}`,
    );
  }

  // Sample debt types
  const types: DebtType[] = [];
  for (let i = 0; i < n; i++) {
    const r = rng();
    let cumulative = 0;
    for (const { type, weight } of choices) {
      cumulative += weight;
      if (r < cumulative) {
        types.push(type);
        break;
      }
    }
  }

  return types;
}
