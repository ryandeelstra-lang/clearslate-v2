// CLI for underwriting a debt portfolio at a quoted price.
//
//   node --experimental-strip-types core/underwrite.ts --face 1000000 --price-bps 500 --legal-share-bps 4820
//
// Thin wrapper: all math lives in portfolio.ts. This parses args, converts
// dollars to integer cents at the boundary, and formats. No dependencies.

import {
  DEFAULT_HORIZON_MONTHS,
  GROSS_RECOVERY_BPS,
  HURDLE_ANNUAL_BPS,
  LEGAL_SHARE_BPS_PLAN,
  LEGAL_SHARE_BPS_VERIFIED,
  SERVICING_BPS,
  UPFRONT_CENTS_PER_ACCOUNT,
  clearingPaymentCents,
  stressTest,
  underwrite,
  type UnderwriteResult,
} from "./portfolio.ts";

const USAGE = `
Underwrite a charged-off debt portfolio at a quoted price.

  node --experimental-strip-types core/underwrite.ts --face <dollars> --price-bps <n> --legal-share-bps <n>

Required
  --face <dollars>          Total face value of the tape, in dollars
  --price-bps <n>           Seller's asking price, in bps of face (500 = 5c per $1)
  --legal-share-bps <n>     Share of collections forfeited by never litigating.
                            No default, deliberately — the repo holds two
                            irreconcilable values and picking one silently
                            changes the verdict:
                              ${LEGAL_SHARE_BPS_PLAN}  v2-plan.md entry-price model (L=25%)
                              ${LEGAL_SHARE_BPS_VERIFIED}  PRA FY2025 10-K, verified (48.2%)

Optional
  --accounts <n>            Account count. REQUIRED unless --upfront-cents 0 —
                            up-front servicing is per account, and its drag in
                            bps of face scales inversely with average balance
  --ratio <n>               Match ratio R:1, to show the consumer's clearing payment
  --gross-recovery-bps <n>  All-channel gross recovery      (default ${GROSS_RECOVERY_BPS})
  --servicing-bps <n>       Collection-proportional servicing (default ${SERVICING_BPS}, PLACEHOLDER pending U6)
  --upfront-cents <n>       Up-front servicing PER ACCOUNT, in cents (default ${UPFRONT_CENTS_PER_ACCOUNT}).
                            Validation notice + pre-contact scrubs, charged on
                            every account whether it pays or not. Requires
                            --accounts. Set 0 to opt out explicitly.
  --horizon <months>        Collection horizon              (default ${DEFAULT_HORIZON_MONTHS})
  --retention-bps <n>       Monthly decay of collection rate (default 9000 = 90%/mo)
  --hurdle-bps <n>          Annual hurdle rate              (default ${HURDLE_ANNUAL_BPS})
  --stress                  Sweep the two most uncertain inputs (legal share,
                            gross recovery) and print a range of price ceilings
                            instead of a single number
  --json                    Emit JSON instead of a report
  --help
`;

function parseArgs(argv: string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out.set(key, "true");
    else {
      out.set(key, next);
      i++;
    }
  }
  return out;
}

function num(args: Map<string, string>, key: string, fallback?: number): number {
  const raw = args.get(key);
  if (raw === undefined) {
    if (fallback !== undefined) return fallback;
    throw new Error(`missing required --${key}`);
  }
  const v = Number(raw.replace(/[_,$]/g, ""));
  if (!Number.isFinite(v)) throw new Error(`--${key} must be a number, got "${raw}"`);
  return v;
}

const usd = (cents: number) =>
  (cents < 0 ? "-" : "") +
  "$" +
  Math.abs(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const cpd = (bps: number) => `${(bps / 100).toFixed(2)}¢`;
const pct = (bps: number) => `${(bps / 100).toFixed(2)}%`;

function report(r: UnderwriteResult, opts: { accounts?: number; ratio?: number; faceCents: number }) {
  const lines: string[] = [];
  const per = opts.accounts && opts.accounts > 0 ? opts.accounts : null;
  const L = (label: string, value: string) => lines.push(`  ${label.padEnd(26)}${value}`);

  lines.push("");
  lines.push("  ACQUISITION");
  L("Face value", usd(opts.faceCents));
  if (per) L("Accounts", `${per.toLocaleString("en-US")} (avg ${usd(Math.round(opts.faceCents / per))})`);
  L("Purchase price", `${usd(r.purchasePriceCents)}  (${cpd(Math.round((r.purchasePriceCents * 10_000) / opts.faceCents))}/$1)`);
  if (r.upfrontServicingCents > 0) {
    L("Servicing — up front", `${usd(r.upfrontServicingCents)}  (${cpd(r.upfrontServicingBps)}/$1)  ← per account, paying or not`);
    L("Servicing — variable", `${usd(r.variableServicingCents)}  (${cpd(Math.round((r.variableServicingCents * 10_000) / opts.faceCents))}/$1)`);
  } else {
    L("Servicing", `${usd(r.servicingCents)}  (${cpd(Math.round((r.servicingCents * 10_000) / opts.faceCents))}/$1)`);
  }
  L("Break-even collection", `${usd(r.breakEvenCents)}  (${cpd(r.breakEvenBps)}/$1)`);

  lines.push("");
  lines.push("  EXPECTED PERFORMANCE  (voluntary channel only)");
  L("Gross collections", `${usd(r.expectedGrossCents)}  (${cpd(r.expectedGrossBps)}/$1)`);
  L("Net of servicing", `${usd(r.expectedNetCents)}`);
  L("Gross multiple", `${r.grossMultiple.toFixed(2)}x`);

  lines.push("");
  lines.push("  DISCOUNTED");
  L("NPV at hurdle", usd(r.npvCents));
  L("IRR (annual)", r.irrAnnualBps === null ? "n/a (no sign change)" : pct(r.irrAnnualBps));
  L("Max price we can pay", `${usd(r.maxPriceCents)}  (${cpd(r.maxPriceBps)}/$1)`);

  if (opts.ratio !== undefined && per) {
    const avgFace = Math.round(opts.faceCents / per);
    lines.push("");
    lines.push(`  MATCH AT ${opts.ratio}:1`);
    L("Avg balance", usd(avgFace));
    L("Consumer pays to clear", `${usd(clearingPaymentCents(avgFace, opts.ratio))}  (${cpd(Math.round(10_000 / (opts.ratio + 1)))}/$1)`);
  }

  lines.push("");
  if (r.unacquirableAtAnyPrice) {
    lines.push("  VERDICT: UNACQUIRABLE AT ANY PRICE — up-front servicing alone");
    lines.push(`  exceeds the present value of everything collectable. Free is too`);
    lines.push(`  expensive; the seller would have to pay ${usd(-r.maxPriceCents)} to place it.`);
    lines.push("");
    return lines.join("\n");
  }
  const verdict = r.clearsHurdle
    ? `  VERDICT: CLEARS — asking price is ${cpd(r.maxPriceBps - Math.round((r.purchasePriceCents * 10_000) / opts.faceCents))}/$1 below our ceiling`
    : `  VERDICT: DOES NOT CLEAR — asking price exceeds our ceiling by ${cpd(Math.round((r.purchasePriceCents * 10_000) / opts.faceCents) - r.maxPriceBps)}/$1`;
  lines.push(verdict);
  lines.push("");
  return lines.join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.has("help") || args.size === 0) {
    console.log(USAGE);
    return 0;
  }

  const faceDollars = num(args, "face");
  if (faceDollars <= 0) throw new Error("--face must be > 0");
  // Convert at the boundary. Money is integer cents everywhere inside.
  const faceCents = Math.round(faceDollars * 100);

  const accounts = args.has("accounts") ? num(args, "accounts") : undefined;
  const input = {
    faceCents,
    priceBps: num(args, "price-bps"),
    legalShareBps: num(args, "legal-share-bps"),
    grossRecoveryBps: num(args, "gross-recovery-bps", GROSS_RECOVERY_BPS),
    servicingBps: num(args, "servicing-bps", SERVICING_BPS),
    accounts,
    upfrontCentsPerAccount: num(args, "upfront-cents", UPFRONT_CENTS_PER_ACCOUNT),
    horizonMonths: num(args, "horizon", DEFAULT_HORIZON_MONTHS),
    retentionBps: num(args, "retention-bps", 9_000),
    hurdleAnnualBps: num(args, "hurdle-bps", HURDLE_ANNUAL_BPS),
  };

  const result = underwrite(input);

  if (args.has("stress")) {
    const grid = stressTest(input);
    if (args.has("json")) {
      console.log(JSON.stringify({ input, result, stress: grid }, null, 2));
      return result.clearsHurdle ? 0 : 1;
    }
    const asked = Math.round((result.purchasePriceCents * 10_000) / faceCents);
    console.log("");
    console.log(`  PRICE CEILING ACROSS SCENARIOS   (asking ${cpd(asked)}/$1)`);
    console.log("");
    for (const s of grid) {
      const ceiling = s.unacquirableAtAnyPrice ? "unacquirable" : `${cpd(s.maxPriceBps)}/$1`;
      const mark = s.clearsHurdle ? "clears" : "no";
      console.log(`  ${s.label.padEnd(50)}${ceiling.padStart(14)}   ${mark}`);
    }
    const ceilings = grid.filter((s) => !s.unacquirableAtAnyPrice).map((s) => s.maxPriceBps);
    console.log("");
    if (ceilings.length > 0) {
      console.log(`  Range: ${cpd(Math.min(...ceilings))} – ${cpd(Math.max(...ceilings))} per $1 of face.`);
      console.log(`  Quote the LOW end. The spread is parameter uncertainty, not upside.`);
      // Retention is held fixed above. It is also undocumented, so say so
      // rather than let the grid imply it has been accounted for.
      const slow = underwrite({ ...input, retentionBps: 9_500 }).maxPriceBps;
      const fast = underwrite({ ...input, retentionBps: 8_000 }).maxPriceBps;
      console.log("");
      console.log(`  Held fixed and NOT swept above: monthly retention ${input.retentionBps} (undocumented).`);
      console.log(`  At 8000 / 9500 the ceiling moves to ${cpd(fast)} / ${cpd(slow)} per $1.`);
    } else {
      console.log("  Unacquirable under every scenario tested.");
    }
    console.log("");
    return result.clearsHurdle ? 0 : 1;
  }

  if (args.has("json")) {
    console.log(JSON.stringify({ input, result }, null, 2));
    // Must match the non-JSON path: a script parsing JSON should be able to
    // branch on the exit code exactly as a human branches on the verdict.
    return result.clearsHurdle ? 0 : 1;
  }

  console.log(
    report(result, {
      accounts: args.has("accounts") ? num(args, "accounts") : undefined,
      ratio: args.has("ratio") ? num(args, "ratio") : undefined,
      faceCents,
    }),
  );
  return result.clearsHurdle ? 0 : 1;
}

try {
  process.exit(main());
} catch (err) {
  console.error(`error: ${(err as Error).message}`);
  console.error(`try --help`);
  process.exit(2);
}
