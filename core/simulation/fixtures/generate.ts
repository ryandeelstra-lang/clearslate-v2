// Fixture generator CLI.
//
// Generates deterministic CSV fixtures from scenario definitions.
// Usage: node core/simulation/fixtures/generate.ts [scenario-name]

import fs from "node:fs";
import path from "node:path";
import { H3_BASELINE } from "../scenarios/h3-baseline.ts";
import { CONCENTRATION_RISK } from "../scenarios/concentration-risk.ts";
import { HIGH_DEFECT } from "../scenarios/high-defect.ts";
import { BARBELL_CLASSIC } from "../scenarios/barbell-classic.ts";
import { generatePortfolio } from "../generators/portfolio.ts";
import type { TapeAccount } from "../../tape.ts";

/** Convert TapeAccount[] to CSV */
function accountsToCSV(accounts: TapeAccount[]): string {
  const header =
    "account_id,balance_cents,state,chargeoff_date,last_payment_date,debt_type";
  const rows = accounts.map((a) => {
    const chargeoff = a.chargeOffDate
      ? `${a.chargeOffDate.y}-${String(a.chargeOffDate.m).padStart(2, "0")}-${String(a.chargeOffDate.d).padStart(2, "0")}`
      : "";
    const lastPayment = a.lastPaymentDate
      ? `${a.lastPaymentDate.y}-${String(a.lastPaymentDate.m).padStart(2, "0")}-${String(a.lastPaymentDate.d).padStart(2, "0")}`
      : "";

    return `${a.id},${a.balanceCents},${a.state},${chargeoff},${lastPayment},${a.debtType}`;
  });

  return [header, ...rows].join("\n");
}

/** Generate one scenario */
function generateScenario(
  name: string,
  config: ReturnType<typeof H3_BASELINE>,
  outDir: string,
) {
  console.log(`Generating ${name}...`);

  const portfolio = generatePortfolio(config);

  console.log(`  Accounts: ${portfolio.accounts.length}`);
  console.log(
    `  Face value: $${(portfolio.metadata.actual_face_cents / 100).toFixed(0)}`,
  );
  console.log(
    `  Mean balance: $${(portfolio.metadata.balance_stats.mean / 100).toFixed(0)}`,
  );
  console.log(
    `  Median balance: $${(portfolio.metadata.balance_stats.median / 100).toFixed(0)}`,
  );
  console.log(`  Defect rate: ${(portfolio.metadata.defect_rate * 100).toFixed(1)}%`);
  console.log(`  QC flags: ${portfolio.metadata.qc_flags.join(", ") || "none"}`);

  const csv = accountsToCSV(portfolio.accounts);
  const outPath = path.join(outDir, `${name}.csv`);
  fs.writeFileSync(outPath, csv, "utf8");

  console.log(`  Written: ${outPath}`);
  console.log();
}

/** Main entry point */
function main() {
  const outDir = path.join(
    import.meta.dirname || ".",
    "..",
    "..",
    "fixtures",
    "virtual-world",
  );

  // Ensure output directory exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`Generating fixtures to ${outDir}\n`);

  // Generate all scenarios
  generateScenario("h3-baseline", H3_BASELINE, outDir);
  generateScenario("concentration-risk", CONCENTRATION_RISK, outDir);
  generateScenario("high-defect", HIGH_DEFECT, outDir);
  generateScenario("barbell-classic", BARBELL_CLASSIC, outDir);

  console.log("Done.");
}

main();
