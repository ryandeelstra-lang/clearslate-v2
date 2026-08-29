#!/usr/bin/env node
// What $20,000 buys. Run: node core/simulation/stress/budget-report.ts

import {
  DAY_ONE_REQUIRED,
  DAY_ONE_DEFERRED,
  sumItems,
  samplePerArm,
  detectableLift,
  planBudget,
} from "./budget-20k.ts";

const $ = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const pc = (x: number) => `${(x * 100).toFixed(1)}%`;

const BUDGET = 20_000;
const BASELINE_PAYMENT = 0.06; // ~6% of accounts pay with no match
const MAIL = 0.93; // validation notice, high bound — Reg F makes it unavoidable

function main() {
  console.log("WHAT $20,000 BUYS\n");
  console.log("The first tape does not need to be profitable. It needs to ANSWER U9.");
  console.log("Buying for statistical power is cheaper than buying for margin.\n");

  console.log("── DAY-ONE REQUIRED ──\n");
  for (const i of DAY_ONE_REQUIRED) {
    console.log(`  ${i.label.padEnd(52)} ${$(i.low).padStart(7)} – ${$(i.high).padStart(7)}`);
    console.log(`      ${i.note}`);
  }
  const fixLo = sumItems(DAY_ONE_REQUIRED, "low");
  const fixHi = sumItems(DAY_ONE_REQUIRED, "high");
  console.log(`\n  ${"TOTAL".padEnd(52)} ${$(fixLo).padStart(7)} – ${$(fixHi).padStart(7)}\n`);

  console.log("── DEFERRED, WITH THE TRIGGER THAT ENDS THE DEFERRAL ──\n");
  for (const i of DAY_ONE_DEFERRED) {
    console.log(`  ${i.label.padEnd(52)} ${$(i.low).padStart(7)} – ${$(i.high).padStart(7)}`);
    console.log(`      ${i.note}`);
  }
  console.log(
    `\n  Deferred total: ${$(sumItems(DAY_ONE_DEFERRED, "low"))} – ${$(sumItems(DAY_ONE_DEFERRED, "high"))}` +
      ` — this is what made the earlier model say $20k was impossible.\n`,
  );

  console.log("── HOW BIG A SAMPLE DOES U9 NEED? ──\n");
  console.log(`  Baseline payment rate assumed ${pc(BASELINE_PAYMENT)}. Two arms: R=0 vs the test ratio.\n`);
  console.log("   if the match lifts payment to | accounts/arm | total accounts");
  console.log("  ------------------------------|--------------|---------------");
  for (const p1 of [0.09, 0.12, 0.15, 0.18, 0.24]) {
    const n = samplePerArm(BASELINE_PAYMENT, p1);
    console.log(
      `  ${(pc(p1) + ` (${(p1 / BASELINE_PAYMENT).toFixed(1)}×)`).padStart(29)} | ${String(n).padStart(12)} | ${String(n * 2).padStart(14)}`,
    );
  }
  console.log("\n  80% power, α=0.05 two-sided.\n");

  console.log("── WHAT THE BUDGET SUPPORTS, BY BALANCE BAND ──\n");
  console.log(`  Budget ${$(BUDGET)}, minus ${$(fixLo)}–${$(fixHi)} fixed. Paper at 5.4¢ + ${$(MAIL)}/acct mail.\n`);
  console.log("   avg balance | accounts | per arm | detects a lift to | that is");
  console.log("  -------------|----------|---------|-------------------|----------");
  for (const bal of [250, 400, 661, 1_000]) {
    const p = planBudget({
      budgetDollars: BUDGET,
      fixedDollars: fixHi, // conservative: assume the high end of fixed
      priceBps: 540,
      avgBalanceDollars: bal,
      baselinePaymentRate: BASELINE_PAYMENT,
      mailPerAccount: MAIL,
    });
    console.log(
      `  ${("$" + bal).padStart(12)} | ${String(p.accounts).padStart(8)} | ${String(p.perArm).padStart(7)} | ` +
        `${pc(p.detectableRate).padStart(17)} | ${p.detectableMultiple.toFixed(1)}× baseline`,
    );
  }
  console.log();

  const best = planBudget({
    budgetDollars: BUDGET,
    fixedDollars: fixHi,
    priceBps: 540,
    avgBalanceDollars: 250,
    baselinePaymentRate: BASELINE_PAYMENT,
    mailPerAccount: MAIL,
  });

  console.log("── THE PLAN ──\n");
  console.log(`  Buy SMALL balances, not the buy-box $400+ average.\n`);
  console.log(`    face value          ${$(best.faceDollars)}`);
  console.log(`    paper at 5.4¢       ${$(best.paperDollars)}`);
  console.log(`    mail                ${$(best.mailCostDollars)}`);
  console.log(`    day-one fixed       ${$(fixHi)}`);
  console.log(`    ----------------------------`);
  console.log(`    TOTAL               ${$(best.paperDollars + best.mailCostDollars + fixHi)}`);
  console.log(`    of ${$(BUDGET)} budget    ${$(BUDGET - best.paperDollars - best.mailCostDollars - fixHi)} left\n`);
  console.log(`    ${best.accounts} accounts, ${best.perArm} per arm`);
  console.log(`    detects a lift from ${pc(BASELINE_PAYMENT)} to ${pc(best.detectableRate)} (${best.detectableMultiple.toFixed(1)}×) at 80% power\n`);

  console.log("  ⚠ THIS INVERTS THE BUY BOX ON PURPOSE. U13 sets 'avg ≥$400' because");
  console.log("    per-account costs crush small balances. That is right for a tape you");
  console.log("    intend to PROFIT from and wrong for one you intend to LEARN from —");
  console.log("    small balances buy more accounts per dollar, and accounts are power.");
  console.log("    The first tape should be bought against different criteria than");
  console.log("    every tape after it. Say so explicitly to any broker.\n");

  console.log("── HOW MANY ARMS CAN WE AFFORD? ──\n");
  console.log("  The model (honest params) predicts payment rates of:");
  console.log("    R=0  7.2%   R=2  20.7%   R=3  34.1%   R=4  43.1%\n");
  console.log(`  So the predicted R=3 effect is 4.7× — and a 2-arm design detects 1.8×.`);
  console.log("  We are overpowered for the predicted effect, which is the right place");
  console.log("  to be given how often this model has erred in the flattering direction.");
  console.log("  It also means we can afford a dose-response design instead of a\n  yes/no one.\n");
  console.log("   arms | per arm | detects a lift to | vs baseline");
  console.log("  ------|---------|-------------------|-------------");
  for (const arms of [2, 3, 4]) {
    const perArm = Math.floor(best.accounts / arms);
    const d = detectableLift(BASELINE_PAYMENT, perArm);
    console.log(
      `  ${String(arms).padStart(5)} | ${String(perArm).padStart(7)} | ${pc(d).padStart(17)} | ${(d / BASELINE_PAYMENT).toFixed(1)}×`,
    );
  }
  console.log();
  console.log("  RECOMMENDED: 3 arms — R=0 (control), R=2, R=4.");
  console.log("    · R=0 measures the TRUE voluntary baseline, itself an unknown we have");
  console.log("      only ever estimated (5.96¢, derived from a corrected 11.5¢ gross).");
  console.log("    · R=2 and R=4 bracket the ratio range and give a dose-response slope,");
  console.log("      which is what actually calibrates R₀ — the parameter the sensitivity");
  console.log("      analysis showed swings cash 9× more than purchase price does.");
  console.log("    · A single test ratio answers 'does it work'. Three arms answer");
  console.log("      'what should we set it to', which is the question that follows.\n");

  console.log("  ⚠ ON THE CONTROL ARM. Withholding the match from ~350 people sits badly");
  console.log("    against the mission. Resolve it with DELAYED TREATMENT: after the");
  console.log("    experiment closes, offer the control arm the same match. We own the");
  console.log("    paper, so it costs nothing but forgone balance we were never going to");
  console.log("    collect anyway — and it removes the objection entirely.\n");

  console.log("── WHAT THIS DOES AND DOES NOT BUY ──\n");
  console.log("  DOES: a powered answer to U9 — the single gating unknown. Whether the");
  console.log("        match lifts payment, by how much, and at which ratio.");
  console.log("  DOES: real contact-fill data (U6's other half), real dispute rates,");
  console.log("        real deliverability, and a compliance track record.");
  console.log("  NOT:  a profit. This tape is R&D expense. Budget it as such.");
  console.log("  NOT:  external validity beyond the balance band bought. Small-balance");
  console.log("        response may differ from $400+ response — a known limitation,");
  console.log("        and the reason to state the band in any result.\n");

  console.log("── THE UNRESOLVED RISK ──\n");
  console.log(`  Can you SOURCE a ${$(best.faceDollars)} tape? Brokers deal in $1M+ face and`);
  console.log("  may not transact this small, or may only offer picked-over paper.");
  console.log("  That is a sourcing question, not a modelling one, and it is now the");
  console.log("  first thing to test — before spending any of the $20k.");
}

main();
