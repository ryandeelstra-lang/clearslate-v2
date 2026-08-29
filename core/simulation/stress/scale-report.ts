#!/usr/bin/env node
// LEAN vs INCUMBENT — what does it actually cost to maintain?
//
// Answers the question that broke the previous scale threshold: "why does it
// cost any money to maintain?" The honest answer is that most of what the first
// U6 model charged was an incumbent's cost structure, imported into a business
// that is not an incumbent. See the note above ANNUAL_FIXED_LEAN.

import { H3_BASELINE } from "../scenarios/h3-baseline.ts";
import { sweep } from "./u9.ts";
import {
  ANNUAL_FIXED,
  ANNUAL_FIXED_LEAN,
  sumComponents,
  servicingCost,
  type Bound,
  type Structure,
} from "./u6-servicing.ts";

const $ = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const c = (bps: number) => `${(bps / 100).toFixed(2)}¢`;

const AVG_BALANCE = 660.57;
const SHAPE = { avgBalanceDollars: AVG_BALANCE, paymentRate: 0.20, avgPaymentDollars: 165 };
const PRICE_BPS = 540;

function main() {
  console.log("WHAT DOES IT ACTUALLY COST TO MAINTAIN?\n");

  console.log("── THE TWO COST STRUCTURES ──\n");
  console.log("  LEAN — founder-operated, two states, self-built on core/");
  for (const x of ANNUAL_FIXED_LEAN) {
    console.log(`    ${x.label.padEnd(48)} ${$(x.low).padStart(8)} – ${$(x.high).padStart(8)}`);
  }
  console.log(
    `    ${"TOTAL / YEAR".padEnd(48)} ${$(sumComponents(ANNUAL_FIXED_LEAN, "low")).padStart(8)} – ` +
      `${$(sumComponents(ANNUAL_FIXED_LEAN, "high")).padStart(8)}`,
  );
  console.log();
  console.log("  INCUMBENT — 30 states, bought platform, compliance + ops headcount");
  console.log(
    `    ${"TOTAL / YEAR".padEnd(48)} ${$(sumComponents(ANNUAL_FIXED, "low")).padStart(8)} – ` +
      `${$(sumComponents(ANNUAL_FIXED, "high")).padStart(8)}`,
  );
  console.log();
  console.log(
    `  Ratio: the incumbent structure is ${(
      sumComponents(ANNUAL_FIXED, "low") / sumComponents(ANNUAL_FIXED_LEAN, "low")
    ).toFixed(0)}–${(
      sumComponents(ANNUAL_FIXED, "high") / sumComponents(ANNUAL_FIXED_LEAN, "high")
    ).toFixed(0)}× the lean one.\n`);

  // Cash distribution, honest untuned ranges.
  const mc = sweep(H3_BASELINE, { trials: 30, matchRatios: [2, 3, 4], seed: "scale" });
  console.log("Cash across STATED ranges (honest, untuned):");
  for (const r of mc) console.log(`   R=${r.matchRatio}: median ${c(r.cashBpsMedian)}   P90 ${c(r.cashBpsP90)}`);
  console.log();

  console.log("── BAR vs SCALE, BOTH STRUCTURES ──\n");
  console.log("  bar = 5.40¢ purchase + servicing\n");
  console.log("   accounts/yr | structure |  servicing | bar    | median clears");
  console.log("  -------------|-----------|------------|--------|---------------");
  for (const v of [500, 1_000, 2_000, 5_000, 25_000]) {
    for (const structure of ["lean", "incumbent"] as Structure[]) {
      const s = servicingCost({ ...SHAPE, annualAccountVolume: v, bound: "low", structure });
      const bar = PRICE_BPS + s.servicingBpsOfFace;
      const med = mc.filter((r) => r.cashBpsMedian >= bar).map((r) => `R${r.matchRatio}`);
      console.log(
        `  ${v.toLocaleString().padStart(12)} | ${structure.padEnd(9)} | ` +
          `${c(s.servicingBpsOfFace).padStart(10)} | ${c(bar).padStart(6)} | ${med.join(",") || "—"}`,
      );
    }
  }
  console.log();

  console.log("── WHAT A VIABLE PILOT LOOKS LIKE (lean, low bound) ──\n");
  for (const v of [1_000, 2_000, 5_000]) {
    const s = servicingCost({ ...SHAPE, annualAccountVolume: v, bound: "low", structure: "lean" });
    const bar = PRICE_BPS + s.servicingBpsOfFace;
    const faceDollars = v * AVG_BALANCE;
    const purchase = faceDollars * (PRICE_BPS / 10_000);
    const annualFixed = sumComponents(ANNUAL_FIXED_LEAN, "low");
    const clears = mc.filter((r) => r.cashBpsMedian >= bar).map((r) => `R=${r.matchRatio}`);
    console.log(`  ${v.toLocaleString()} accounts — ${$(faceDollars)} face`);
    console.log(`    purchase at 5.4¢      ${$(purchase)}`);
    console.log(`    annual fixed          ${$(annualFixed)}`);
    console.log(`    TOTAL CAPITAL NEEDED  ${$(purchase + annualFixed)}`);
    console.log(`    bar ${c(bar)} → median clears at: ${clears.join(", ") || "nothing"}`);
    console.log();
  }

  console.log("── THE CORRECTION ──\n");
  console.log("  The earlier U6 model put minimum viable scale at 25,000–100,000");
  console.log("  accounts/year and ~$3.6M of purchase capital. That priced an");
  console.log("  incumbent. Lean, it is a few thousand accounts and tens of");
  console.log("  thousands of dollars.");
  console.log();
  console.log("  Which means the pilot that answers U9 empirically IS fundable,");
  console.log("  and the strategic conclusion drawn from the earlier number —");
  console.log("  'go service someone else's paper because you cannot afford to");
  console.log("  buy' — was drawn from an assumption, not from the business.");
  console.log();
  console.log("  ⚠ Still unsourced in the lean bound: counsel, insurance, accounting");
  console.log("    ($7.5k–23k combined). And founder labour is priced at zero cash,");
  console.log("    which is true for cash and false for capacity.");
}

main();
