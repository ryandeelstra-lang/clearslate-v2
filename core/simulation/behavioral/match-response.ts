// Match ratio response model.
//
// Sigmoid model: P(pay | ratio R) = 1 / (1 + exp(-k(R - R₀)))
// - k = sensitivity parameter (steeper = more elastic)
// - R₀ = inflection point (50% pay at this ratio)
//
// Per-archetype sensitivity adjustment:
// - Early responder: 0.8× (less price-sensitive, will pay anyway)
// - Strategic settler: 2.0× (highly sensitive to ratio)
// - Hesitant engager: 1.2× (moderately sensitive)
// - Avoider: 0.3× (ignores offer regardless)
// - Disputer: 0.0× (disputes, ratio irrelevant)

import { CONSUMER_BEHAVIOR, type ConsumerArchetype } from "../calibration.ts";
import { getArchetype } from "./consumer.ts";

/** Compute probability of payment given match ratio and archetype */
export function matchResponseProbability(
  archetype: ConsumerArchetype,
  matchRatio: number,
): number {
  const { baseline_k, baseline_R0 } = CONSUMER_BEHAVIOR.match_elasticity;

  // Adjust sensitivity by archetype
  const sensitivity = getArchetypeSensitivity(archetype);
  const k = baseline_k * sensitivity;
  const R0 = baseline_R0;

  // Sigmoid: P(pay | R) = 1 / (1 + exp(-k(R - R₀)))
  const exponent = -k * (matchRatio - R0);

  // Clamp to avoid overflow
  if (exponent > 20) return 0;
  if (exponent < -20) return 1;

  return 1 / (1 + Math.exp(exponent));
}

/** Get archetype-specific match sensitivity */
function getArchetypeSensitivity(archetype: ConsumerArchetype): number {
  const def = getArchetype(archetype);
  return def.match_sensitivity ?? 1.0;
}

/** Expected payment rate across a population at given ratio */
export function expectedPaymentRate(
  archetypeDistribution: Record<ConsumerArchetype, number>,
  matchRatio: number,
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [archetype, share] of Object.entries(archetypeDistribution)) {
    const prob = matchResponseProbability(archetype as ConsumerArchetype, matchRatio);
    weightedSum += prob * share;
    totalWeight += share;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
