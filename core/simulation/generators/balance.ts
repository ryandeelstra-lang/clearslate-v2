// Balance distribution generator.
//
// Implements log-normal (Box-Muller transform) and bimodal distributions.
// Returns balances in integer cents.

import type { BalanceDistribution, RNG } from "../types.ts";

/** Generate N balances from a distribution */
export function generateBalances(
  n: number,
  distribution: BalanceDistribution,
  rng: RNG,
): number[] {
  switch (distribution.type) {
    case "lognormal":
      return generateLogNormal(n, distribution.params, rng);
    case "bimodal":
      return generateBimodal(n, distribution.params, rng);
  }
}

/** Generate log-normal balances using Box-Muller transform */
function generateLogNormal(
  n: number,
  params: { mu: number; sigma: number; min: number; max: number },
  rng: RNG,
): number[] {
  const { mu, sigma, min, max } = params;
  const balances: number[] = [];

  for (let i = 0; i < n; i++) {
    // Box-Muller transform for normal(0,1)
    const u1 = rng();
    const u2 = rng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    // Transform to log-normal
    const logBalance = mu + sigma * z;
    const balance = Math.exp(logBalance);

    // Clamp to realistic range, round to integer cents
    const clamped = Math.max(min, Math.min(max, balance));
    balances.push(Math.round(clamped * 100)); // convert dollars to cents
  }

  return balances;
}

/** Generate bimodal balances (two clusters with noise) */
function generateBimodal(
  n: number,
  params: {
    cluster1: { count: number; mean: number; sd: number };
    cluster2: { count: number; mean: number; sd: number };
  },
  rng: RNG,
): number[] {
  const balances: number[] = [];

  // Cluster 1
  for (let i = 0; i < params.cluster1.count; i++) {
    const z = boxMuller(rng);
    const balance = params.cluster1.mean + params.cluster1.sd * z;
    balances.push(Math.max(0, Math.round(balance))); // cents, non-negative
  }

  // Cluster 2
  for (let i = 0; i < params.cluster2.count; i++) {
    const z = boxMuller(rng);
    const balance = params.cluster2.mean + params.cluster2.sd * z;
    balances.push(Math.max(0, Math.round(balance)));
  }

  // Shuffle to mix clusters
  shuffle(balances, rng);

  return balances;
}

/** Box-Muller transform helper (returns one standard normal sample) */
export function boxMuller(rng: RNG): number {
  const u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** Fisher-Yates shuffle */
function shuffle<T>(array: T[], rng: RNG): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
