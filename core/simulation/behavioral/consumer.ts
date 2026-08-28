// Consumer archetype assignment.
//
// Five behavioral archetypes based on research (U14, market.md):
// - Early responder (12.5%): responds quickly, high completion
// - Hesitant engager (27.5%): needs multiple touches, moderate completion
// - Strategic settler (17.5%): price-sensitive, negotiates
// - Avoider (37.5%): ignores contact, largest group
// - Disputer (5%): disputes immediately

import type { RNG } from "../types.ts";
import { CONSUMER_BEHAVIOR, type ConsumerArchetype } from "../calibration.ts";

/** Assign archetype to one consumer via weighted sampling */
export function assignArchetype(rng: RNG): ConsumerArchetype {
  const r = rng();
  let cumulative = 0;

  for (const archetype of CONSUMER_BEHAVIOR.archetypes) {
    cumulative += archetype.share;
    if (r < cumulative) {
      return archetype.name;
    }
  }

  // Fallback (should never reach due to shares summing to 1.0)
  return "avoider";
}

/** Get archetype definition by name */
export function getArchetype(name: ConsumerArchetype) {
  const archetype = CONSUMER_BEHAVIOR.archetypes.find((a) => a.name === name);
  if (!archetype) {
    throw new Error(`Unknown archetype: ${name}`);
  }
  return archetype;
}

/** Assign archetypes to N consumers */
export function assignArchetypes(n: number, rng: RNG): ConsumerArchetype[] {
  const archetypes: ConsumerArchetype[] = [];
  for (let i = 0; i < n; i++) {
    archetypes.push(assignArchetype(rng));
  }
  return archetypes;
}

/** Analyze archetype distribution */
export function analyzeArchetypes(archetypes: ConsumerArchetype[]): Record<
  ConsumerArchetype,
  { count: number; share: number }
> {
  const counts: Partial<Record<ConsumerArchetype, number>> = {};
  const total = archetypes.length;

  for (const archetype of archetypes) {
    counts[archetype] = (counts[archetype] || 0) + 1;
  }

  const result: Partial<Record<ConsumerArchetype, { count: number; share: number }>> = {};
  for (const [archetype, count] of Object.entries(counts)) {
    result[archetype as ConsumerArchetype] = {
      count: count as number,
      share: (count as number) / total,
    };
  }

  return result as Record<ConsumerArchetype, { count: number; share: number }>;
}
