// Tunable constants that shape user-facing onboarding claims. These were inline
// "magic numbers" in the insights route + framing; centralized here because they
// directly drive numbers and projections the user sees (and trusts), so they
// must be easy to find, document, and adjust.

// Estimated spare change redirected per transaction by the round-up rule.
// ~$0.50/txn is a rough average of "round up to the next dollar".
export const ROUND_UP_PER_TXN_CENTS = 50;

// Floor for the extra monthly principal in the "with ClearSlate" projection, so
// the optimistic curve always shows *some* acceleration even for light spenders.
// NOTE: this makes the projection an estimate, not a promise — surface it as such.
export const EXTRA_MONTHLY_FLOOR_CENTS = 5000; // $50

// The discretionary / high-harm buckets the card caps or blocks — the spend a
// user can realistically cut and redirect at debt. Drives the "ClearSlate" payoff
// line (current debt payment + this freed cash). Must mirror the "stop the
// bleeding" categories in mobile RulesEditor so we only count spend the card can
// actually free up.
export const IMPULSE_BUCKETS = [
  "gambling",
  "alcohol",
  "tobacco",
  "fast_food",
  "coffee",
  "entertainment",
  "subscriptions",
  "shopping",
  "personal_care",
] as const;

// Approximate prices for real-world framing of an amount ("18 tanks of gas").
// Hardcoded + approximate; update periodically. Ordered largest-first so big
// amounts don't read as "hundreds of lattes".
export type FramingUnit = { singular: string; plural: string; cents: number };

export const FRAMING_UNITS: FramingUnit[] = [
  { singular: "month of rent", plural: "months of rent", cents: 150000 },
  { singular: "car payment", plural: "car payments", cents: 50000 },
  { singular: "tank of gas", plural: "tanks of gas", cents: 5500 },
  { singular: "month of Netflix", plural: "months of Netflix", cents: 1599 },
  { singular: "movie ticket", plural: "movie tickets", cents: 1400 },
  { singular: "Chipotle burrito", plural: "Chipotle burritos", cents: 1100 },
  { singular: "latte", plural: "lattes", cents: 600 },
];

// The "satisfying, graspable" count window used when picking a framing unit.
export const FRAMING_MIN_COUNT = 3;
export const FRAMING_MAX_COUNT = 40;
