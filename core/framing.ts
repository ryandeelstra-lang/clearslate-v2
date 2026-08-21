// Converts a dollar amount (cents) into a relatable real-world quantity, e.g.
// "18 tanks of gas". The unit prices + count window live in ./config.ts.

import {
  FRAMING_UNITS,
  FRAMING_MIN_COUNT,
  FRAMING_MAX_COUNT,
} from "./config";

// Picks the unit that yields a satisfying, graspable count, preferring larger
// units first so big amounts don't read as "hundreds of lattes".
export function frame(amountCents: number): string {
  if (amountCents <= 0) return "nothing";

  for (const unit of FRAMING_UNITS) {
    const count = Math.round(amountCents / unit.cents);
    if (count >= FRAMING_MIN_COUNT && count <= FRAMING_MAX_COUNT) {
      return `${count} ${count === 1 ? unit.singular : unit.plural}`;
    }
  }

  // Fallback: use the smallest unit so very small amounts still frame.
  const unit = FRAMING_UNITS[FRAMING_UNITS.length - 1]!;
  const count = Math.max(1, Math.round(amountCents / unit.cents));
  return `${count} ${count === 1 ? unit.singular : unit.plural}`;
}
