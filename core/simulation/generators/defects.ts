// Defect injection.
//
// Injects realistic data quality issues:
// - Missing last payment dates (blocks SOL calculation)
// - Unknown debt types (disqualifies from hypotheses)
// - Reconciliation mismatches (declared vs actual face/count)

import type { DefectParams, RNG } from "../types.ts";

/** Defect flags for one account */
export interface AccountDefects {
  missing_chargeoff: boolean;
  missing_last_payment: boolean;
  unknown_type: boolean;
}

/** Inject defects into N accounts */
export function injectDefects(
  n: number,
  params: DefectParams,
  rng: RNG,
): AccountDefects[] {
  const defects: AccountDefects[] = [];

  // Override rates if specified
  const missing_lp_rate = params.missing_last_payment ?? params.baseline_rate * 0.4;
  const unknown_type_rate = params.unknown_debt_type ?? params.baseline_rate * 0.2;
  const missing_co_rate = params.baseline_rate * 0.05; // charge-off rare to be missing

  for (let i = 0; i < n; i++) {
    defects.push({
      missing_chargeoff: rng() < missing_co_rate,
      missing_last_payment: rng() < missing_lp_rate,
      unknown_type: rng() < unknown_type_rate,
    });
  }

  return defects;
}

/** Compute actual defect rate from defect flags */
export function computeDefectRate(defects: AccountDefects[]): number {
  const defectCount = defects.filter(
    (d) => d.missing_chargeoff || d.missing_last_payment || d.unknown_type,
  ).length;

  return defectCount / defects.length;
}

/** Inject reconciliation mismatch (declared vs actual face/count) */
export function injectReconciliationMismatch(
  declared_face_cents: number,
  declared_count: number,
  mismatch_rate: number,
  rng: RNG,
): { actual_face_cents: number; actual_count: number } {
  if (rng() > mismatch_rate) {
    // No mismatch
    return {
      actual_face_cents: declared_face_cents,
      actual_count: declared_count,
    };
  }

  // Introduce mismatch (5-15% variance)
  const face_factor = 1 + (rng() * 0.1 - 0.05); // ±5%
  const count_factor = 1 + (rng() * 0.1 - 0.05);

  return {
    actual_face_cents: Math.round(declared_face_cents * face_factor),
    actual_count: Math.round(declared_count * count_factor),
  };
}
