// Temporal data generator (dates).
//
// Generates charge-off dates and last payment dates within vintage windows.
// Ensures last payment precedes charge-off for SOL calculations.

import type { RNG, VintageParams, YearMonthDay } from "../types.ts";

/** Temporal data for one account */
export interface AccountDates {
  chargeoff: YearMonthDay;
  lastPayment: YearMonthDay;
}

/** Generate vintage dates for N accounts */
export function generateVintage(
  n: number,
  params: VintageParams,
  asOf: YearMonthDay,
  rng: RNG,
): AccountDates[] {
  const dates: AccountDates[] = [];

  for (let i = 0; i < n; i++) {
    // Charge-off date: uniform within [min, max] months ago
    const [minMonths, maxMonths] = params.chargeoff_months_ago;
    const chargeoffMonthsAgo = minMonths + Math.floor(rng() * (maxMonths - minMonths + 1));
    const chargeoff = subtractMonths(asOf, chargeoffMonthsAgo);

    // Last payment: uniform within [min, max] months ago, but must precede charge-off
    const [minLPMonths, maxLPMonths] = params.last_payment_months_ago;
    const lpMonthsAgo = minLPMonths + Math.floor(rng() * (maxLPMonths - minLPMonths + 1));
    let lastPayment = subtractMonths(asOf, lpMonthsAgo);

    // Ensure last payment is before charge-off
    if (dateToSerial(lastPayment) >= dateToSerial(chargeoff)) {
      // Push last payment back by 1-3 months before charge-off
      const offset = 1 + Math.floor(rng() * 3);
      lastPayment = subtractMonths(chargeoff, offset);
    }

    dates.push({ chargeoff, lastPayment });
  }

  return dates;
}

/** Subtract months from a date (simple, no library) */
function subtractMonths(date: YearMonthDay, months: number): YearMonthDay {
  let { y, m, d } = date;

  m -= months;
  while (m < 1) {
    m += 12;
    y -= 1;
  }

  // Clamp day to valid range for month
  const maxDay = daysInMonth(y, m);
  if (d > maxDay) d = maxDay;

  return { y, m, d };
}

/** Days in month (handles leap years) */
function daysInMonth(year: number, month: number): number {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) return 29;
  return days[month - 1];
}

/** Leap year check */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Convert date to serial number for comparison (YYYYMMDD) */
function dateToSerial(date: YearMonthDay): number {
  return date.y * 10000 + date.m * 100 + date.d;
}
