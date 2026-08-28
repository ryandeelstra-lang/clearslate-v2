// Geographic distribution generator.
//
// Assigns states to accounts, respecting SOL table coverage.
// Only NY and TX have verified SOL rules in sol.ts; other states flag as unknown.

import type { GeoParams, RNG, State } from "../types.ts";

/** States not covered by sol.ts (will resolve to "unknown" SOL) */
const UNCOVERED_STATES: State[] = ["OH", "CA", "FL", "IL", "PA", "GA", "NC", "MI", "VA", "WA"];

/** Assign states to N accounts based on geographic parameters */
export function assignStates(n: number, params: GeoParams, rng: RNG): State[] {
  const states: State[] = [];
  const { ny_share, tx_share, other_share } = params;

  // Validate shares sum to 1.0 (within tolerance)
  const total = ny_share + tx_share + other_share;
  if (Math.abs(total - 1.0) > 0.01) {
    throw new Error(
      `Geographic shares must sum to 1.0, got ${total.toFixed(3)}`,
    );
  }

  for (let i = 0; i < n; i++) {
    const r = rng();
    if (r < ny_share) {
      states.push("NY");
    } else if (r < ny_share + tx_share) {
      states.push("TX");
    } else {
      // Uncovered state (will flag as unknown SOL)
      const idx = Math.floor(rng() * UNCOVERED_STATES.length);
      states.push(UNCOVERED_STATES[idx]);
    }
  }

  return states;
}

/** Count states by category (covered vs uncovered) */
export function analyzeGeographicMix(states: State[]): {
  covered_count: number;
  uncovered_count: number;
  covered_share: number;
  by_state: Record<State, number>;
} {
  const by_state: Record<State, number> = {};
  let covered_count = 0;
  let uncovered_count = 0;

  for (const state of states) {
    by_state[state] = (by_state[state] || 0) + 1;
    if (state === "NY" || state === "TX") {
      covered_count++;
    } else {
      uncovered_count++;
    }
  }

  return {
    covered_count,
    uncovered_count,
    covered_share: covered_count / states.length,
    by_state,
  };
}
