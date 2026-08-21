// Pure date helpers for payoff visualization. No DB, no "server-only".

/**
 * Adds `months` to a date and returns the resulting date.
 */
export function payoffDateFrom(months: number, from = new Date()): Date {
  const result = new Date(from);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Formats a date as "March 2029".
 */
export function formatPayoffDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Describes the delta in human terms.
 * < 2 months → "N weeks sooner"
 * >= 2 months → "Y years, M months sooner" (matches the months() formatter pattern)
 */
export function describeDelta(monthsSaved: number): string {
  if (monthsSaved <= 0) return "";

  // Under 2 months: express in weeks
  if (monthsSaved < 2) {
    const weeks = Math.round(monthsSaved * 4.33); // ~4.33 weeks per month
    return `${weeks} week${weeks === 1 ? "" : "s"} sooner`;
  }

  // 2+ months: express in years and months
  const years = Math.floor(monthsSaved / 12);
  const months = monthsSaved % 12;
  const parts: string[] = [];

  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (months > 0) parts.push(`${months} month${months === 1 ? "" : "s"}`);

  return parts.join(", ") + " sooner";
}
