#!/usr/bin/env node
// COMBINED U6 + U9 — the actual question.
//
// u9-report.ts concluded "0% clears at every ratio". That used SERVICING_BPS =
// 541, which u6-servicing.ts has now shown is 2.3–8.3× too high for a digital
// operation and, worse, was modelled in the wrong UNIT (bps of face, when
// almost every component is per-account or per-year).
//
// So the U9 verdict was partly an artefact of an inflated placeholder. This
// re-runs it with servicing built bottom-up, and adds the variable that turns
// out to matter more than the match ratio: ANNUAL ACCOUNT VOLUME.

import { H3_BASELINE } from "../scenarios/h3-baseline.ts";
import { generatePortfolio } from "../generators/portfolio.ts";
import { sweep } from "./u9.ts";
import { servicingCost, type Bound } from "./u6-servicing.ts";

const c = (bps: number) => `${(bps / 100).toFixed(2)}¢`;
const pct = (x: number) => `${(x * 100).toFixed(0)}%`;

const AVG_BALANCE = 660.57;
const PAYMENT_RATE = 0.20;
const AVG_PAYMENT = 165;
const PRICE_BPS = 540; // JCAP H1 2026 blended

function main() {
  const p = generatePortfolio(H3_BASELINE);
  console.log("COMBINED U6 + U9 — DOES H3 CLEAR, AND AT WHAT SCALE?\n");
  console.log(`Portfolio shape: ${p.accounts.length} accounts, avg balance $${AVG_BALANCE.toFixed(0)}\n`);

  // Cash distribution is independent of the cost regime — compute once.
  const mc = sweep(H3_BASELINE, {
    trials: 40,
    matchRatios: [2, 3, 4],
    seed: "combined",
  });

  console.log("Cash the model produces across its STATED ranges (honest, untuned):");
  console.log("   R | median |   P90");
  console.log("  ---|--------|-------");
  for (const r of mc) {
    console.log(`   ${r.matchRatio} | ${c(r.cashBpsMedian).padStart(6)} | ${c(r.cashBpsP90).padStart(6)}`);
  }
  console.log();

  console.log("── THE BAR, AS A FUNCTION OF SCALE ──\n");
  console.log(`  bar = ${c(PRICE_BPS)} purchase + bottom-up servicing at that volume\n`);
  console.log("   annual accounts | servicing | bar    | median clears | P90 clears");
  console.log("  -----------------|-----------|--------|---------------|------------");

  for (const v of [1_000, 5_000, 25_000, 100_000, 500_000]) {
    for (const bound of ["low", "high"] as Bound[]) {
      const s = servicingCost({
        annualAccountVolume: v,
        avgBalanceDollars: AVG_BALANCE,
        paymentRate: PAYMENT_RATE,
        avgPaymentDollars: AVG_PAYMENT,
        bound,
      });
      const bar = PRICE_BPS + s.servicingBpsOfFace;

      const med = mc.filter((r) => r.cashBpsMedian >= bar).map((r) => `R${r.matchRatio}`);
      const p90 = mc.filter((r) => r.cashBpsP90 >= bar).map((r) => `R${r.matchRatio}`);

      const label = bound === "low" ? `${v.toLocaleString()} (low)` : `${v.toLocaleString()} (high)`;
      console.log(
        `  ${label.padStart(16)} | ${c(s.servicingBpsOfFace).padStart(9)} | ${c(bar).padStart(6)} | ` +
          `${(med.join(",") || "—").padStart(13)} | ${p90.join(",") || "—"}`,
      );
    }
  }
  console.log();

  console.log("── WHAT CHANGED, AND WHY ──\n");
  console.log("  u9-report.ts said 0% clears at every ratio. That used the 541bps");
  console.log("  servicing PLACEHOLDER, giving an 11.07¢ bar. Bottom-up, at 100k");
  console.log("  accounts/year, servicing is 0.33–0.99¢ and the bar is 5.73–6.39¢.");
  console.log("  The honest-range medians at R=3–4 are 6.28–6.74¢.");
  console.log();
  console.log("  So H3 does NOT fail on behaviour. It failed on a cost placeholder");
  console.log("  that was inherited from a litigating call-centre operator and");
  console.log("  expressed in the wrong unit.");
  console.log();
  console.log("  ⚠ BUT the binding constraint simply moved. It is now SCALE:");
  console.log("    - at 1,000 accounts/yr servicing is 14.68–66.18¢ — hopeless");
  console.log("    - it needs ~25k–100k accounts/year before fixed costs amortise");
  console.log("    - and 100k accounts at $661 avg is ~$66M of face per year");
  console.log();
  console.log("  The pilot that would answer U9 empirically is exactly the thing");
  console.log("  the economics cannot support. That is the real finding.");
  console.log();
  console.log("  ⚠ Two of the four annual-fixed components (compliance, ops staff)");
  console.log("    are marked UNSOURCED ESTIMATE in u6-servicing.ts and together span");
  console.log("    $70k–$300k. They drive the scale threshold more than anything");
  console.log("    sourced does. Close those before trusting any number here.");
}

main();
