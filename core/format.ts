// Display helpers. All inputs are integer cents.

export function usd(cents: number, opts?: { cents?: boolean }): string {
  const showCents = opts?.cents ?? false;
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });
}

/** Compact form for headline numbers: $65,262 → $65.3k */
export function usdCompact(cents: number): string {
  const dollars = cents / 100;
  if (Math.abs(dollars) >= 1000) {
    return (
      "$" +
      (dollars / 1000).toLocaleString("en-US", {
        maximumFractionDigits: 1,
      }) +
      "k"
    );
  }
  return usd(cents);
}

export function percent(fraction: number): string {
  return `${(fraction * 100).toFixed(2).replace(/\.00$/, "")}%`;
}

/** 47 → "3 years, 11 months" */
export function months(n: number): string {
  if (n <= 0) return "now";
  const y = Math.floor(n / 12);
  const m = n % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} year${y === 1 ? "" : "s"}`);
  if (m > 0) parts.push(`${m} month${m === 1 ? "" : "s"}`);
  return parts.join(", ");
}
