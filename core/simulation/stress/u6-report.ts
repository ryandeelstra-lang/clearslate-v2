#!/usr/bin/env node
// U6 servicing cost report. Run: node core/simulation/stress/u6-report.ts

import {
  PER_ACCOUNT_FIXED,
  ANNUAL_FIXED,
  sumComponents,
  servicingCost,
  minimumViableVolume,
  type Bound,
} from "./u6-servicing.ts";

const $ = (n: number) => `$${n.toFixed(2)}`;
const c = (bps: number) => `${(bps / 100).toFixed(2)}¢`;

// H3 baseline shape.
const AVG_BALANCE = 660.57;
const PAYMENT_RATE = 0.20;
const AVG_PAYMENT = 165; // roughly the R=3 clearing amount on this balance

function main() {
  console.log("U6 — BOTTOM-UP SERVICING COST FOR A DIGITAL-FIRST BUYER\n");
  console.log("Replaces SERVICING_BPS = 541, labelled in portfolio.ts as");
  console.log('"a PLACEHOLDER pending U6. It is not an observed figure."\n');

  console.log("── WHY 541bps WAS THE WRONG BASIS ──\n");
  console.log("  Encore-derived 541bps on the H3 tape implies   $37.49 / account");
  console.log("  TrueAccord, digital-first, fully loaded         $4.50 – $16.00 / account");
  console.log("  → the placeholder is 2.3–8.3× too high for a digital operation\n");

  console.log("── PER-ACCOUNT FIXED (every account, paying or not) ──\n");
  for (const x of PER_ACCOUNT_FIXED) {
    console.log(`  ${x.label.padEnd(46)} ${$(x.low).padStart(7)} – ${$(x.high).padStart(6)}`);
  }
  console.log(
    `  ${"TOTAL".padEnd(46)} ${$(sumComponents(PER_ACCOUNT_FIXED, "low")).padStart(7)} – ` +
      `${$(sumComponents(PER_ACCOUNT_FIXED, "high")).padStart(6)}`,
  );
  console.log("\n  ⚠ Mail is unavoidable. Reg F §1006.42(b) requires E-SIGN consent for an");
  console.log("    electronic validation notice, and that consent cannot exist before first");
  console.log("    contact. §1006.6(d)(4)'s email safe harbor is a different provision and");
  console.log("    needs the CREDITOR to have sent a compliant pre-transfer notice with a");
  console.log("    35-day opt-out. There is no email-only path for first contact.\n");

  console.log("── ANNUAL FIXED (amortised over annual account volume) ──\n");
  for (const x of ANNUAL_FIXED) {
    const est = x.source.startsWith("ESTIMATE") ? "  ⚠ unsourced" : "";
    console.log(
      `  ${x.label.padEnd(46)} ${$(x.low).padStart(9)} – ${$(x.high).padStart(9)}${est}`,
    );
  }
  console.log(
    `  ${"TOTAL / YEAR".padEnd(46)} ${$(sumComponents(ANNUAL_FIXED, "low")).padStart(9)} – ` +
      `${$(sumComponents(ANNUAL_FIXED, "high")).padStart(9)}`,
  );
  console.log();

  console.log("── COST PER ACCOUNT vs ANNUAL VOLUME ──\n");
  console.log("  This is the term nobody had priced. Annual fixed costs amortise over");
  console.log("  volume, so the same business has wildly different unit economics at");
  console.log(`  different scale. Avg balance $${AVG_BALANCE.toFixed(0)}.\n`);
  console.log("   annual accounts |      LOW bound       |      HIGH bound");
  console.log("                   |  $/acct    bps face  |  $/acct    bps face");
  console.log("  -----------------|----------------------|--------------------");
  for (const v of [1_000, 5_000, 25_000, 100_000, 500_000, 2_000_000]) {
    const cells: string[] = [];
    for (const bound of ["low", "high"] as Bound[]) {
      const r = servicingCost({
        annualAccountVolume: v,
        avgBalanceDollars: AVG_BALANCE,
        paymentRate: PAYMENT_RATE,
        avgPaymentDollars: AVG_PAYMENT,
        bound,
      });
      cells.push(`${$(r.costPerAccountDollars).padStart(8)}  ${c(r.servicingBpsOfFace).padStart(8)}`);
    }
    console.log(`  ${v.toLocaleString().padStart(16)} | ${cells[0]}  | ${cells[1]}`);
  }
  console.log();

  console.log("── MINIMUM VIABLE SCALE ──\n");
  console.log("  Annual account volume needed to reach a given servicing level:\n");
  console.log("   target servicing |   LOW bound    |   HIGH bound");
  console.log("  ------------------|----------------|---------------");
  for (const target of [541, 373, 250, 150] as const) {
    const cells: string[] = [];
    for (const bound of ["low", "high"] as Bound[]) {
      const v = minimumViableVolume(target, {
        avgBalanceDollars: AVG_BALANCE,
        paymentRate: PAYMENT_RATE,
        avgPaymentDollars: AVG_PAYMENT,
        bound,
      });
      cells.push(v === null ? "unreachable".padStart(14) : v.toLocaleString().padStart(14));
    }
    console.log(`  ${c(target).padStart(17)} | ${cells[0]} | ${cells[1]}`);
  }
  console.log();

  console.log("── WHAT THIS MEANS ──\n");
  const pilot = servicingCost({
    annualAccountVolume: 1_000,
    avgBalanceDollars: AVG_BALANCE,
    paymentRate: PAYMENT_RATE,
    avgPaymentDollars: AVG_PAYMENT,
    bound: "low",
  });
  console.log(`  A 1,000-account pilot carries ${$(pilot.annualFixedPerAccountDollars)}/account of annual`);
  console.log(`  fixed cost alone — ${c((pilot.annualFixedPerAccountDollars / AVG_BALANCE) * 10_000)} of face, on an 11.07¢ bar, before a single`);
  console.log("  letter is mailed. The pilot cannot work at any match ratio. That is a");
  console.log("  property of scale, not of the hypothesis.");
  console.log();
  console.log("  At 100k+ accounts/year the per-account floor dominates instead, and");
  console.log("  servicing lands near the TrueAccord range — which is where");
  console.log("  what-would-it-take.ts said H3 becomes reachable.");
  console.log();
  console.log("  So U6's answer is not a number. It is: THERE IS A MINIMUM VIABLE SCALE,");
  console.log("  and it is far above any pilot this business can currently fund.");
}

main();
