#!/usr/bin/env node
// "What would have to be true?" — inverts the U9 stress test.
//
// u9-report.ts asks "does H3 clear under our stated uncertainty?" (no). This
// asks the more useful question: which input, moved how far, would make it
// clear? That tells us what to go measure, and in what order.
//
// The headline candidate is SERVICING. portfolio.ts:14 labels SERVICING_BPS
// = 541 "a PLACEHOLDER pending U6. It is not an observed figure." It is 5.41¢
// of an 11.07¢ bar — nearly half — and it is derived from Encore's
// cost-to-collect, which carries call centres, mailed letters and legal
// infrastructure that a pure-email operation does not have.
//
// U6 may therefore be worth more than U9, and is far cheaper to answer: you can
// price a digital-only servicing stack from vendor quotes without buying a
// portfolio.

import { H3_BASELINE } from "../scenarios/h3-baseline.ts";
import { generatePortfolio } from "../generators/portfolio.ts";
import { sweep, breakEvenBps, type CostRegime } from "./u9.ts";

const c = (bps: number) => `${(bps / 100).toFixed(2)}¢`;

function main() {
  const p = generatePortfolio(H3_BASELINE);
  const face = p.metadata.actual_face_cents;
  const n = p.accounts.length;

  console.log("WHAT WOULD HAVE TO BE TRUE?\n");
  console.log(`Portfolio: ${n} accounts, $${(face / 100).toLocaleString()} face\n`);

  // Cash distribution is independent of the cost regime, so compute once.
  const mc = sweep(H3_BASELINE, {
    trials: 40,
    matchRatios: [2, 3, 4],
    seed: "wwit",
  });

  console.log("Cash the model produces across its stated ranges (unchanged by costs):");
  console.log("   R | median |   P90");
  console.log("  ---|--------|-------");
  for (const r of mc) {
    console.log(`   ${r.matchRatio} | ${c(r.cashBpsMedian).padStart(6)} | ${c(r.cashBpsP90).padStart(6)}`);
  }
  console.log();

  // Sweep the two cost inputs that are placeholders or negotiable.
  const servicingOptions: Array<[string, number]> = [
    ["541 — Encore-derived PLACEHOLDER (current)", 541],
    ["373 — Encore minus legal share", 373],
    ["250 — lean digital-only", 250],
    ["150 — email-only, heavily automated", 150],
  ];
  const priceOptions: Array<[string, number]> = [
    ["5.40¢ — JCAP H1 2026 blended", 540],
    ["4.00¢ — small-balance discount", 400],
    ["3.00¢ — deep discount", 300],
  ];

  console.log("Break-even bar under different cost regimes, and what clears it:\n");
  console.log("  servicing                                   price   bar     clears at");
  console.log("  --------------------------------------------------------------------");

  for (const [sLabel, servicingBps] of servicingOptions) {
    for (const [pLabel, priceBps] of priceOptions) {
      const regime: CostRegime = {
        priceBps,
        servicingBps,
        upfrontCentsPerAccount: 175,
      };
      const bar = breakEvenBps(face, n, regime);

      const medianClears = mc.filter((r) => r.cashBpsMedian >= bar).map((r) => `R=${r.matchRatio}`);
      const p90Clears = mc.filter((r) => r.cashBpsP90 >= bar).map((r) => `R=${r.matchRatio}`);

      let verdict: string;
      if (medianClears.length > 0) verdict = `MEDIAN ${medianClears.join(",")}`;
      else if (p90Clears.length > 0) verdict = `P90 only ${p90Clears.join(",")}`;
      else verdict = "nothing";

      console.log(
        `  ${sLabel.padEnd(43)} ${pLabel.slice(0, 5).padStart(5)}   ${c(bar).padStart(6)}  ${verdict}`,
      );
    }
    console.log();
  }

  console.log("READ THIS AS:");
  console.log("  Servicing is a PLACEHOLDER (portfolio.ts:14) worth ~half the bar. It was");
  console.log("  never measured, and it carries costs a pure-email operation does not have.");
  console.log("  U6 is cheaper to answer than U9 — vendor quotes, not a portfolio purchase —");
  console.log("  and it moves the bar further than any behavioural parameter we can argue");
  console.log("  about. Answer U6 first.");
  console.log();
  console.log("  Note the asymmetry: no cost regime makes the MEDIAN clear at 5.40¢ price.");
  console.log("  Both a lower servicing cost AND a lower purchase price are required, and");
  console.log("  even then it lands at the optimistic end of the behavioural distribution.");
}

main();
