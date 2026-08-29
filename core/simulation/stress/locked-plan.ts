#!/usr/bin/env node
// The locked $20k plan. Run: node core/simulation/stress/locked-plan.ts

import { sumItems, DAY_ONE_REQUIRED, samplePerArm } from "./budget-20k.ts";
import {
  PRICE_SCENARIOS,
  planPower,
  sequentialPlan,
  purchasePricePerAccount,
} from "./power-per-dollar.ts";

const $ = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const pc = (x: number) => `${(x * 100).toFixed(1)}%`;

const BUDGET = 20_000;
const BASELINE = 0.06; // no-match payment rate
const PREDICTED_R4 = 0.431; // model at honest params
const MAIL = 0.93;
const AVG_BALANCE = 250;
const FIXED = sumItems(DAY_ONE_REQUIRED, "high"); // $4,700, conservative

function main() {
  console.log("THE LOCKED $20K PLAN\n");
  console.log("budget-20k.ts got 1,060 accounts by treating three inputs as fixed");
  console.log("that are not fixed. Each is worth more than the trimming that got us there.\n");

  // ── Lever 1: price ──
  console.log("── LEVER 1: WE WERE PAYING BLENDED PRICE FOR THE CHEAPEST SEGMENT ──\n");
  console.log("  Market spans <1¢ to 15¢. Fresh paper 7–15¢; several-year-old under 1¢;");
  console.log('  small balances explicitly discounted ("uneconomic to work"); secondary');
  console.log("  placements price sharply lower. 5.4¢ is a BLEND we do not buy.\n");
  console.log("   price | acct cost | accounts | validity");
  console.log("  -------|-----------|----------|----------");
  for (const s of PRICE_SCENARIOS) {
    const cost = purchasePricePerAccount(AVG_BALANCE, s.bps);
    const n = Math.floor((BUDGET - FIXED) / (cost + MAIL));
    console.log(
      `  ${s.label.slice(0, 5).padStart(6)} | ${("$" + cost.toFixed(2)).padStart(9)} | ${String(n).padStart(8)} | ${s.validity.slice(0, 52)}`,
    );
  }
  console.log("\n  → 4.0¢ is the honest pick: inside the buy box, ~1,500 accounts.");
  console.log("    1.5¢ buys the most accounts and destroys the result. Not a trade to make.\n");

  // ── Lever 2: acquisition mode ──
  console.log("── LEVER 2: WE ASSUMED WE HAVE TO BUY ──\n");
  const options = [
    {
      label: "Purchase @ 5.4¢ (budget-20k's plan)",
      mode: "purchase" as const,
      acquireCostPerAccount: purchasePricePerAccount(AVG_BALANCE, 540),
      validityNote: "Own the paper. Full authority. Blended price on a small-balance tape.",
    },
    {
      label: "Purchase @ 4.0¢ (small-balance discount)",
      mode: "purchase" as const,
      acquireCostPerAccount: purchasePricePerAccount(AVG_BALANCE, 400),
      validityNote: "Own the paper. Inside the buy box. Needs broker confirmation.",
    },
    {
      label: "Contingency placement (creditor keeps title)",
      mode: "contingency" as const,
      acquireCostPerAccount: 0,
      validityNote: "⚠ BRAND CONFOUND — see below. Needs pre-authorised settlement bands.",
    },
  ];

  console.log("   option                                  | accounts | per arm | detects");
  console.log("  ----------------------------------------|----------|---------|--------");
  for (const o of options) {
    const p = planPower({
      ...o,
      budgetDollars: BUDGET,
      fixedDollars: FIXED,
      mailPerAccount: MAIL,
      arms: 3,
      baselinePaymentRate: BASELINE,
    });
    console.log(
      `  ${o.label.padEnd(39)} | ${String(p.accounts).padStart(8)} | ${String(p.perArm).padStart(7)} | ${p.detectableMultiple.toFixed(1)}×`,
    );
  }
  console.log();
  console.log("  Contingency costs $0 to acquire, so the budget buys ~16,400 accounts —");
  console.log("  15× the purchase plan. The creditor's economics are good too: they sold");
  console.log("  nothing, and net 60–70% of whatever we collect on paper already written");
  console.log("  off. The blocker is trust and settlement authority, not economics.\n");
  console.log("  ⚠ BUT THE BRAND CONFOUND IS REAL AND CUTS AGAINST US. Servicing as");
  console.log("    'on behalf of [known lender]' gets better response than 'ClearSlate,");
  console.log("    who bought your debt'. A contingency result would OVERSTATE what we");
  console.log("    achieve as an unknown buyer. Mitigate by servicing under our own");
  console.log("    brand — negotiable, and worth insisting on.\n");

  // ── Lever 3: sequential ──
  console.log("── LEVER 3: WE POWERED A FIXED-N TRIAL ──\n");
  const fixedPerArm = samplePerArm(BASELINE, 0.12); // detect a doubling
  console.log(`  Fixed-n to detect a doubling (6% → 12%): ${fixedPerArm} per arm.\n`);
  console.log("   looks | max/arm | expected/arm if effect is real");
  console.log("  -------|---------|-------------------------------");
  for (const looks of [1, 2, 3, 4]) {
    const sp = sequentialPlan(fixedPerArm, looks);
    console.log(
      `  ${String(looks).padStart(6)} | ${String(sp.maxPerArm).padStart(7)} | ${String(sp.expectedPerArmUnderEffect).padStart(29)}`,
    );
  }
  console.log();
  const seq = sequentialPlan(fixedPerArm, 3);
  console.log(`  → 3 looks: max ${seq.maxPerArm}/arm, but expected ${seq.expectedPerArmUnderEffect}/arm if the effect is real.`);
  console.log("    The model predicts R=4 at 43.1% vs 6% baseline. Against an effect that");
  console.log(`    large the trial stops at the FIRST look: ~${samplePerArm(BASELINE, PREDICTED_R4)} per arm.`);
  console.log("    We would know inside weeks, having spent a fraction of the budget.\n");

  // ── The plan ──
  console.log("── LOCKED ──\n");
  const cost4 = purchasePricePerAccount(AVG_BALANCE, 400);
  const n4 = Math.floor((BUDGET - FIXED) / (cost4 + MAIL));
  console.log("  PRIMARY: contingency placement, own brand, 3 arms (R=0, R=2, R=4),");
  console.log("           group-sequential with 3 looks.");
  console.log(`    · costs ~${$(FIXED)} fixed + ${$(MAIL)}/account mail — no purchase`);
  console.log("    · stop at the first look if the effect is anywhere near predicted");
  console.log("    · service under ClearSlate's brand to kill the confound\n");
  console.log(`  FALLBACK: purchase ~${n4} accounts at 4.0¢, same 3-arm sequential design.`);
  console.log(`    · ${$(cost4 * n4)} paper + ${$(MAIL * n4)} mail + ${$(FIXED)} fixed = ${$(cost4 * n4 + MAIL * n4 + FIXED)}`);
  console.log(`    · ${Math.floor(n4 / 3)} per arm — detects ~2.0×, well inside the predicted 7×\n`);
  console.log("  SPEND NOTHING UNTIL: a broker or creditor confirms one of these is");
  console.log("  available at this size. Both plans die on sourcing, not on money.\n");

  console.log("── WHAT THE COUNSEL BUDGET SHOULD ACTUALLY BUY ──\n");
  console.log("  Not just 'review the letters'. Scope it to one question worth ~$1/account");
  console.log("  forever: §1006.34(a)(1)(i) permits validation info (A) IN the initial");
  console.log("  communication, (B) within five days, or (C) ORALLY. §1006.42(b) attaches");
  console.log("  E-SIGN only to (B). If (A) or (C) avoids E-SIGN, the mailed notice — the");
  console.log("  entire per-account floor — may be avoidable. I could not resolve this");
  console.log("  from the regulation text and will not guess at it.");
}

main();
