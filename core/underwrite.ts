// CLI for underwriting a debt portfolio at a quoted price.
//
//   node --experimental-strip-types core/underwrite.ts --face 1000000 --price-bps 500 --legal-share-bps 4820
//
// Thin wrapper: all math lives in portfolio.ts. This parses args, converts
// dollars to integer cents at the boundary, and formats. No dependencies.

import { readFileSync } from "node:fs";

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
import {
  DEBT_TYPE_VALUES,
  JURISDICTION_COUNT,
  parseMoneyToCents,
  parseTape,
  parseYmd,
  type DateFormat,
  type DebtType,
  type TapeSpec,
} from "./tape.ts";
import { underwriteBuyBox, underwriteSegments } from "./segment.ts";
import { SOL_TABLE_VERIFIED, coveredStates, type Hypothesis } from "./sol.ts";

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

Optional  (--face path only, where marked *)
  --accounts <n>*            Account count. REQUIRED unless --upfront-cents 0 —
                            up-front servicing is per account, and its drag in
                            bps of face scales inversely with average balance
  --ratio <n>*              Match ratio R:1, to show the consumer's clearing payment
  --gross-recovery-bps <n>  All-channel gross recovery      (default ${GROSS_RECOVERY_BPS})
  --servicing-bps <n>       Collection-proportional servicing (default ${SERVICING_BPS}, PLACEHOLDER pending U6)
  --upfront-cents <n>       Up-front servicing PER ACCOUNT, in cents (default ${UPFRONT_CENTS_PER_ACCOUNT}).
                            Validation notice + pre-contact scrubs, charged on
                            every account whether it pays or not. Requires
                            --accounts. Set 0 to opt out explicitly.
  --horizon <months>        Collection horizon              (default ${DEFAULT_HORIZON_MONTHS})
  --retention-bps <n>       Monthly decay of collection rate (default 9000 = 90%/mo)
  --hurdle-bps <n>          Annual hurdle rate              (default ${HURDLE_ANNUAL_BPS})
  --stress*                 Sweep the two most uncertain inputs (legal share,
                            gross recovery) and print a range of price ceilings
                            instead of a single number
  --json                    Emit JSON instead of a report
  --help

Flag parsing is strict throughout: --key=value and --key value both work, an
unknown flag is an error rather than a no-op, a repeated flag is an error rather
than last-wins, a switch given a value is an error, and an empty value is an
error rather than zero. Every one of those was once a silent fallback to a
default, and every default here is the more favourable number.

Tape input (mutually exclusive with --face)
  --tape <path|->           Account-level CSV, or - for stdin. Derives face and
                            account count from the file; --face is then refused,
                            because two sources of truth for face value is how a
                            tape gets mispriced.
  --tape-declared-face <$>  Seller's stated face. REQUIRED. Reconciled EXACTLY
                            against the sum of balances; any mismatch is fatal.
  --tape-declared-accounts <n>  Seller's stated account count. REQUIRED.
  --tape-date-format <fmt>  YYYY-MM-DD | MM/DD/YYYY. REQUIRED, never sniffed —
                            03/04/2020 is a different SOL answer under each.
  --tape-columns k=v,...    Slots: balance, state, lastPaymentDate (defaulting to
                            BAL, ST, LPD) plus optional id, chargeOffDate,
                            debtType. An unknown slot name is an ERROR, not a
                            silent fallback to the default. Map id if you can:
                            without it the duplicate-account check cannot run,
                            and the same account listed twice reconciles
                            perfectly while being face you pay for and cannot
                            collect.
  --tape-type <t>           Debt type assumed for EVERY account when the file
                            has no column. Only accepts a real DebtType.
                            "unknown" has no limitations period and disqualifies
                            every account from both hypotheses.
  --tape-as-of <date>       SOL as-of date, in YYYY-MM-DD or the --tape-date-format
                            you gave (default: today, labelled as such)
  --hypothesis h1|h3        Apply a buy box. No default — H1 and H3 are mutually
                            exclusive and picking one silently changes the verdict.
  --segments                Print the per-band table
`;

/**
 * Every flag this CLI understands. An unrecognised one is an ERROR, not a
 * no-op.
 *
 * Two failures this closes, both of which printed a decline as a clear:
 *
 *  --key=value was parsed as the literal key "upfront-cents=100000", so
 *  REQUIRED flags failed loudly but OPTIONAL ones fell silently through to
 *  their defaults — and every default is more favourable than a value a user
 *  bothered to type. Measured on one tape: `--upfront-cents 100000
 *  --servicing-bps 9000` gives maxPriceBps -11465, does not clear; the same
 *  run with `=` gives 298 and clears.
 *
 *  A typo (`--hypothsis h3`) was ignored entirely and exited 0.
 *
 * This is the third instance of the same shape in this codebase: idx()
 * returning -1 for both "absent" and "not requested", and runTape refusing
 * --stress rather than ignoring it. Silence about an input you did not
 * understand always resolves toward the default, and the defaults flatter.
 */
/** Switches: presence is the signal, so an attached value is meaningless. */
/** The six slots of TapeColumnMap. Explicit, so no prototype member sneaks in. */
const COLUMN_SLOTS: ReadonlySet<string> = new Set([
  "balance", "state", "lastPaymentDate", "id", "chargeOffDate", "debtType",
]);

const BOOLEAN_FLAGS: ReadonlySet<string> = new Set(["stress", "json", "help", "segments"]);

const KNOWN_FLAGS: ReadonlySet<string> = new Set([
  "face", "price-bps", "legal-share-bps", "accounts", "ratio",
  "gross-recovery-bps", "servicing-bps", "upfront-cents", "horizon",
  "retention-bps", "hurdle-bps", "stress", "json", "help",
  "tape", "tape-declared-face", "tape-declared-accounts", "tape-date-format",
  "tape-columns", "tape-type", "tape-as-of", "hypothesis", "segments",
]);

function parseArgs(argv: string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      throw new Error(`unexpected argument "${a}" — flags must start with --`);
    }
    const body = a.slice(2);
    const eq = body.indexOf("=");
    const key = eq === -1 ? body : body.slice(0, eq);
    if (!KNOWN_FLAGS.has(key)) {
      throw new Error(
        `unknown flag --${key}. Ignoring it would silently fall back to a ` +
          "default, and every default here is the more favourable value. " +
          "Run --help for the flag list.",
      );
    }
    // Last-wins on a repeat is the CLI convention, but not this file's
    // doctrine: `--price-bps 9000 --price-bps 200` silently priced at 200 and
    // exited 0. Anywhere else here, an input we cannot unambiguously interpret
    // is an error.
    if (out.has(key)) {
      throw new Error(
        `--${key} given more than once. Which value is intended is not something ` +
          "this tool will guess.",
      );
    }
    if (eq !== -1) {
      const value = body.slice(eq + 1);
      // `--json=false` still emitted JSON and `--segments=false` still printed
      // bands, because presence is what these are tested on. Reading the value
      // as if it turned the flag off would be worse; refusing is honest.
      if (BOOLEAN_FLAGS.has(key)) {
        throw new Error(
          `--${key} is a switch and takes no value; pass --${key} on its own ` +
            `(--${key}=${value} would read as ON regardless of the value).`,
        );
      }
      out.set(key, value);
      continue;
    }
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
  const cleaned = raw.replace(/[_,$]/g, "").trim();
  // Number("") is 0, and Number.isFinite(0) is true — so an empty value used to
  // sail through as ZERO. `--price-bps=` produced a $0.00 purchase price and a
  // CLEARS verdict on any tape: a free portfolio always clears. This became
  // reachable the moment --key=value parsing was added, since before that an
  // empty value was an unknown key and errored. The maximally flattering
  // failure, from the fix for a flattering failure.
  if (cleaned === "") {
    throw new Error(`--${key} was given an empty value; omit the flag or supply a number`);
  }
  const v = Number(cleaned);
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


/**
 * Right-align into `width`, but never let two columns run together.
 *
 * padStart silently does nothing when the value is already wider than the
 * field, so an extreme input collided the columns: --upfront-cents 99999999
 * printed the BLENDED row as "$960.9810405991bps-104056.86¢/$1", three numbers
 * fused into one unreadable token. Any value the model accepts must still
 * render as a distinct number.
 */
function col(value: string, width: number): string {
  return value.length >= width ? " " + value : value.padStart(width);
}

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

/** Dollars string to integer cents via tape.ts's string parser — never a float. */
function dollarsArg(args: Map<string, string>, key: string): number {
  const raw = args.get(key);
  if (raw === undefined) throw new Error(`missing required --${key}`);
  const cents = parseMoneyToCents(raw);
  if (cents === null) throw new Error(`--${key} is not a money amount: "${raw}"`);
  return cents;
}

function runTape(args: Map<string, string>): number {
  // With --json, the report goes to stderr so stdout is parseable JSON and
  // nothing. USAGE says "instead of a report" and the --face path honours that;
  // the tape path printed 43 lines before the "{", forcing every consumer to
  // slice on indexOf("{"). The disclosures are too valuable to drop, so they
  // move rather than disappear.
  const wantJson = args.has("json");
  const say = (line = "") => {
    if (wantJson) process.stderr.write(line + "\n");
    else console.log(line);
  };
  if (args.has("face")) {
    throw new Error(
      "--face and --tape are mutually exclusive: face is derived from the file. " +
        "Pass the seller's stated face as --tape-declared-face so it can be reconciled.",
    );
  }
  // Refuse flags the tape path does not implement rather than ignoring them.
  // --stress in particular: portfolio.ts:396-406 argues that a single number
  // "implies a precision this model does not have", so silently downgrading a
  // request for the uncertainty range to a point estimate is the worst
  // available response.
  for (const unsupported of ["stress", "ratio", "accounts"]) {
    if (args.has(unsupported)) {
      throw new Error(
        `--${unsupported} is not supported with --tape (it is a --face flag). ` +
          (unsupported === "accounts"
            ? "Account count is derived from the file."
            : "Run the --face path for that, or ask for --segments."),
      );
    }
  }

  const path = args.get("tape")!;
  const text = readFileSync(path === "-" ? 0 : path, "utf8");

  const fmt = args.get("tape-date-format");
  if (fmt !== "YYYY-MM-DD" && fmt !== "MM/DD/YYYY") {
    throw new Error("--tape-date-format must be YYYY-MM-DD or MM/DD/YYYY (never sniffed)");
  }

  const cols: Record<string, string> = {
    balance: "BAL",
    state: "ST",
    lastPaymentDate: "LPD",
  };
  const seenSlots = new Set<string>();
  for (const pair of (args.get("tape-columns") ?? "").split(",")) {
    if (pair.trim() === "") continue;
    // Split on the FIRST "=" only. `const [k, v] = pair.split("=")` silently
    // dropped everything after the second one, so a column literally named
    // "A=B" would have been mapped as "A" — the same "quietly resolve an
    // ambiguity" shape as the duplicate-header bug, and it would then fail with
    // a confusing "not in the header".
    const eq = pair.indexOf("=");
    const k = eq === -1 ? "" : pair.slice(0, eq).trim();
    const v = eq === -1 ? "" : pair.slice(eq + 1).trim();
    if (!k || !v) throw new Error(`--tape-columns entry must be k=v, got "${pair}"`);
    // `k in cols` walked the prototype chain, so "toString", "constructor" and
    // "__proto__" all passed the slot check, mapped nothing, and vanished from
    // the "Columns read:" line. The same prototype hole already fixed in
    // normaliseDebtType, in a second place. An explicit set has no chain.
    if (k in cols && seenSlots.has(k)) {
      // parseArgs errors on a repeated flag and idx() errors on a duplicate
      // header, both because "which one is authoritative is a question for the
      // seller, not for a tiebreak rule". A repeated SLOT was the one place
      // still resolving silently — and duplicating lastPaymentDate to point at
      // the charge-off column moved an H3 buy box from 22.30% to 33.13% of
      // face, which is exactly the anchor fallback sol.ts forbids.
      throw new Error(
        `--tape-columns names "${k}" more than once. Which column is authoritative ` +
          "is not something this tool will guess.",
      );
    }
    seenSlots.add(k);
    if (!COLUMN_SLOTS.has(k)) {
      throw new Error(
        `--tape-columns key "${k}" is not a column slot. Expected one of ` +
          "balance, state, lastPaymentDate, id, chargeOffDate, debtType.",
      );
    }
    cols[k] = v;
  }

  const asOfRaw = args.get("tape-as-of");
  const today = new Date();
  // Accept ISO, and also the format the tape itself is declared in. Requiring
  // ISO while the operator is already typing MM/DD/YYYY for the file was a
  // gratuitous refusal, and USAGE never said so. Both are unambiguous here
  // because the value is a single date supplied by a human, not a column that
  // must parse one way for every row.
  const asOf =
    asOfRaw === undefined
      ? { y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() }
      : (parseYmd(asOfRaw, "YYYY-MM-DD") ?? parseYmd(asOfRaw, fmt as DateFormat));
  if (asOf === null) {
    throw new Error(
      `--tape-as-of must be YYYY-MM-DD or ${fmt}, got "${asOfRaw}"`,
    );
  }

  // Validate at the boundary. This used to be an unchecked cast, so
  // `--tape-type banana` produced a clean per-band report with a "clears"
  // verdict on accounts whose debtType was the string "banana", and a near-miss
  // like `creditcard` crashed with an opaque TypeError from inside sol.ts.
  const rawType = args.get("tape-type");
  if (rawType !== undefined && !DEBT_TYPE_VALUES.has(rawType as DebtType)) {
    throw new Error(
      `--tape-type "${rawType}" is not a debt type; expected one of ${[...DEBT_TYPE_VALUES].join(", ")}`,
    );
  }

  if (rawType !== undefined && cols.debtType !== undefined) {
    throw new Error(
      `--tape-type "${rawType}" and --tape-columns debtType=${cols.debtType} were both given. ` +
        "The column wins and the flag would be silently ignored; drop one.",
    );
  }

  const spec: TapeSpec = {
    label: path === "-" ? "(stdin)" : path,
    columns: cols as unknown as TapeSpec["columns"],
    dateFormat: fmt as DateFormat,
    defaultDebtType: rawType as DebtType | undefined,
    declaredFaceCents: dollarsArg(args, "tape-declared-face"),
    declaredAccountCount: num(args, "tape-declared-accounts"),
    asOf,
  };

  const parsed = parseTape(text, spec);
  const rec = parsed.reconciliation;

  say("");
  say(`  TAPE  ${spec.label}   as of ${asOf.y}-${String(asOf.m).padStart(2, "0")}-${String(asOf.d).padStart(2, "0")}${asOfRaw === undefined ? " (today, assumed)" : ""}`);

  if (!rec.ok) {
    say("");
    say("  RECONCILIATION FAILED — this tape cannot be underwritten.");
    say(`    declared face     ${usd(rec.declaredFaceCents)}`);
    say(`    parsed face       ${usd(rec.parsedFaceCents)}   (delta ${usd(rec.faceDeltaCents)})`);
    say(`    declared accounts ${rec.declaredAccountCount.toLocaleString("en-US")}`);
    say(`    parsed accounts   ${rec.parsedAccountCount.toLocaleString("en-US")}   (delta ${rec.accountDelta})`);
    say(`    rejected rows     ${rec.rejectedCount}`);
    if (rec.duplicateIdCount > 0) {
      say(`    duplicate ids     ${rec.duplicateIdCount}  ← the same account listed twice is`);
      say("                      face you pay for and cannot collect, plus a second");
      say("                      validation notice mailed on one debt");
    }
    for (const r of parsed.rejected.slice(0, 10)) {
      say(`      row ${r.rowNumber}: ${r.reason} (column ${r.column})`);
    }
    if (parsed.rejected.length > 10) console.log(`      ... and ${parsed.rejected.length - 10} more`);
    say("");
    say("  You buy every row on the tape, including the ones you cannot read.");
    say("  Dropping them would leave a smaller, cleaner, cheaper tape than the");
    say("  one you would actually own.");
    say("");
    if (args.has("json")) {
      // A caller that asked for JSON got exit 2 and nothing parseable, so a
      // pipeline could not report WHY a tape was refused.
      console.log(
        JSON.stringify(
          {
            reconciliation: rec,
            rejected: parsed.rejected,
            defectCounts: parsed.defectCounts,
            segmented: null,
            buyBox: null,
          },
          null,
          2,
        ),
      );
    }
    return 2;
  }

  const tape = parsed.tape!;
  const input = {
    priceBps: num(args, "price-bps"),
    legalShareBps: num(args, "legal-share-bps"),
    grossRecoveryBps: num(args, "gross-recovery-bps", GROSS_RECOVERY_BPS),
    servicingBps: num(args, "servicing-bps", SERVICING_BPS),
    upfrontCentsPerAccount: num(args, "upfront-cents", UPFRONT_CENTS_PER_ACCOUNT),
    horizonMonths: num(args, "horizon", DEFAULT_HORIZON_MONTHS),
    retentionBps: num(args, "retention-bps", 9_000),
    hurdleAnnualBps: num(args, "hurdle-bps", HURDLE_ANNUAL_BPS),
  };

  const seg = underwriteSegments(tape, input);
  const defects = Object.entries(parsed.defectCounts).filter(([, n]) => n > 0);

  say(`  Reconciled: face ${usd(tape.faceCents)}, ${tape.accountCount.toLocaleString("en-US")} accounts`);
  // Say which columns were actually read. Omitting --tape-columns silently
  // applies the defaults BAL/ST/LPD, and an unmapped optional slot silently
  // disables everything downstream of it (no chargeOffDate column means the
  // charge-off defects can never fire). Both are the house failure: proceeding
  // on an assumption without stating it.
  const mapped = (["balance", "state", "lastPaymentDate", "id", "chargeOffDate", "debtType"] as const)
    .map((k) => `${k}=${(cols as Record<string, string>)[k] ?? "(unmapped)"}`)
    .join("  ");
  say(`  Columns read: ${mapped}`);
  if (spec.defaultDebtType !== undefined && cols.debtType === undefined) {
    say(`  ⚠ Debt type ASSUMED "${spec.defaultDebtType}" for every account — no column mapped.`);
    // Two things this claim used to get wrong, both by reasoning about the
    // wrong population:
    //
    //  (a) It compared writtenContractYears against openAccountYears only, so
    //      it missed that limitYearsFor returns NO period at all for "unknown".
    //      `--tape-type unknown` therefore printed "cannot change the SOL
    //      result" on the very run where the assumption flipped CLEARS/exit 0
    //      to DECLINE/exit 1.
    //  (b) It read the whole SOL table rather than the states present on THIS
    //      tape, so a splitting state nobody holds paper in would raise a
    //      spurious "map the column".
    if (spec.defaultDebtType === "unknown") {
      say('    "unknown" has NO limitations period, so this assumption disqualifies');
      say("    every account from both hypotheses. Map the column or name a real type.");
    } else {
      const onTape = new Set(tape.accounts.map((a) => a.state));
      const splits = [...SOL_TABLE_VERIFIED.values()].filter(
        (r) => onTape.has(r.state) && r.writtenContractYears !== r.openAccountYears,
      );
      if (splits.length === 0) {
        say("    No state ON THIS TAPE splits written from open-account periods, so");
        say("    the assumed type cannot change the SOL result for this file.");
      } else {
        say(
          `    ${splits.map((r) => r.state).join(", ")} on this tape split written from open-account`,
        );
        say("    periods, so the assumed type IS changing the SOL result. Map the column.");
      }
    }
  }
  if (!rec.duplicateIdsChecked) {
    const idMapped = cols.id !== undefined;
    const scope = !idMapped
      ? "no id column mapped"
      : rec.accountsWithoutId === rec.parsedAccountCount
        ? `id column "${cols.id}" is mapped but EVERY cell is blank`
        : `${rec.accountsWithoutId} of ${rec.parsedAccountCount} rows have a blank id`;
    say(`  ⚠ Duplicate accounts NOT FULLY CHECKED — ${scope}.`);
    say(
      idMapped
        ? "    Mapping a column cannot fix blank cells — ask the seller for account numbers."
        : "    Map one with --tape-columns id=<COL>.",
    );
    say("    A tape listing the same account twice reconciles perfectly and is");
    say("    face you pay for and cannot collect.");
  }
  if (defects.length > 0) {
    say(`  Defects: ${defects.map(([k, n]) => `${n} ${k}`).join(", ")}   ← you pay for these`);
  }

  const hyp = args.get("hypothesis");
  if (hyp !== undefined && hyp !== "h1" && hyp !== "h3") {
    throw new Error(`--hypothesis must be h1 or h3, got "${hyp}"`);
  }
  let exitCode: number;
  let box: ReturnType<typeof underwriteBuyBox> | null = null;

  const all = segmentSummary(tape);
  const showBands = args.has("segments") || hyp === undefined;
  if (showBands) {
    say("");
    say("  BAND            ACCTS   %ACCTS          FACE    %FACE        AVG    DRAG      CEILING  VERDICT");
    for (const s of seg.segments) {
      const g = s.segment;
      const ceiling = s.result.unacquirableAtAnyPrice ? "unacquirable" : `${cpd(s.result.maxPriceBps)}/$1`;
      // "subsidised" means another band is carrying this one. That is only true
      // if some band is above the asking price; when the blend does not clear,
      // every band can be below it and nothing is carrying anything.
      const anyBandCarries = seg.segments.some((x) => x.result.maxPriceBps > input.priceBps);
      const verdict = s.result.unacquirableAtAnyPrice
        ? "WORTHLESS"
        : s.subsidised
          ? anyBandCarries
            ? "subsidised"
            : "below ask"
          : "ok";
      say(
        `  ${g.band.label.padEnd(13)}` +
          col(g.accountCount.toLocaleString("en-US"), 7) +
          col(pct(g.shareOfAccountsBps), 9) +
          col(usd(g.faceCents), 14) +
          col(pct(g.shareOfFaceBps), 9) +
          col(usd(g.avgBalanceCents), 11) +
          col(g.upfrontDragBps + "bps", 8) +
          col(ceiling, 13) + `  ${verdict}`,
      );
    }
    say(
      `  ${"BLENDED".padEnd(13)}` +
        col(tape.accountCount.toLocaleString("en-US"), 7) +
        "".padStart(9) +
        col(usd(tape.faceCents), 14) +
        "".padStart(9) +
        col(usd(all.mean), 11) +
        col(seg.blended.upfrontServicingBps + "bps", 8) +
        col(
          seg.blended.unacquirableAtAnyPrice ? "unacquirable" : cpd(seg.blended.maxPriceBps) + "/$1",
          13,
        ) +
        `  ${seg.blended.unacquirableAtAnyPrice ? "WORTHLESS" : seg.blended.clearsHurdle ? "clears" : "no"}`,
    );
    if (hyp === undefined) {
      say("");
      say("  No buy box applied (--hypothesis not given). The verdict above is for");
      say("  the WHOLE tape. H1 and H3 select different paper and are mutually");
      say("  exclusive; this tool will not pick one for you.");
    }
  }

  // DISCLOSURES PRINT ON EVERY RUN, not only under --segments.
  //
  // They used to be inside the band-table block, which meant `--hypothesis h3`
  // alone — the invocation that actually produces a buy/decline verdict —
  // carried the FEWEST caveats: no barbell warning, and no statement that the
  // recovery rate is assumed rather than measured. The run someone acts on must
  // not be the quietest one.
  if (all.mean > all.median * 2) {
    say("");
    say(`  ⚠ Mean balance ${usd(all.mean)} vs median ${usd(all.median)}. The mean is not`);
    say("    describing this tape — it is a barbell, and a blended verdict");
    say("    cannot tell a barbell from a uniform tape.");
  }
  say("");
  // Each provenance claim below is made ONLY about a value that is actually the
  // default. Previously they were unconditional, so overriding a flag produced
  // a false statement about the operator's own number: --gross-recovery-bps 1200
  // printed "12.00c/$1 all-channel" (the 1680 default's provenance),
  // --retention-bps 8500 printed "held fixed and undocumented", and
  // --servicing-bps 700 printed "is a PLACEHOLDER pending U6". Attaching a
  // sourced figure's pedigree to a number someone typed is the same error this
  // whole module exists to prevent, pointed the other way.
  const supplied = (k: string) => args.has(k);
  say("  ASSUMED, NOT MEASURED: gross recovery is applied uniformly across bands");
  say(
    supplied("gross-recovery-bps")
      ? `  and across SOL status, at ${cpd(input.grossRecoveryBps)}/$1 — YOUR value, not the default.`
      : `  and across SOL status, at ${cpd(input.grossRecoveryBps)}/$1 all-channel (the default).`,
  );
  say("  No public source breaks recovery or price out by balance band");
  say("  (docs/research/u7-pricing.md, u8-litigation-economics.md). Per-band");
  say("  economics here vary ONLY through the flat per-account cost.");
  // The --face path discloses this inside --stress ("held fixed and NOT swept
  // above: monthly retention, undocumented"). The tape path refuses --stress,
  // so without this line the assumption appeared nowhere at all on the very
  // path that produces a per-account verdict.
  const prov = (k: string, defaultNote: string) => (supplied(k) ? "supplied by you" : defaultNote);
  say(
    `  Retention ${input.retentionBps} (${prov("retention-bps", "default, undocumented")}), ` +
      `horizon ${input.horizonMonths}mo (${prov("horizon", "default")}),`,
  );
  say(
    `  servicing ${cpd(input.servicingBps)}/$1 (${prov("servicing-bps", "default, PLACEHOLDER pending U6")}),`,
  );
  say(
    `  up-front ${input.upfrontCentsPerAccount}c/account ` +
      `(${prov("upfront-cents", "default, PLACEHOLDER pending U6")}).`,
  );
  if (!supplied("upfront-cents")) {
    // portfolio.ts:203 calls this "the weakest input in this model", and it is
    // the single number the whole per-band story turns on: its drag scales
    // inversely with average balance, so it dominates exactly the small-balance
    // paper H3 wants. The verdict run never mentioned it.
    say("  That last one is the weakest input in the model (portfolio.ts:203) and the");
    say("  one this whole per-band analysis turns on — its drag scales INVERSELY with");
    say("  average balance, so it lands hardest on the small paper H3 wants to buy.");
  }
  say("  None of these is swept here — the tape path has no --stress.");
  if (hyp === "h1") {
    // The buy box selects paper that cannot be litigated at all, then prices it
    // on a recovery rate measured across portfolios that could. segment.ts warns
    // at length against the opposite error — zeroing legalShareBps on time-barred
    // paper — but nothing flagged that the recovery BASE is unadjusted. Not an
    // arithmetic bug (legalShareBps is caller-supplied), but an undisclosed
    // assumption sitting under the number you take into a negotiation.
    say("");
    say(`  ⚠ H1 SELECTS TIME-BARRED PAPER, PRICED AT A LITIGATING BOOK'S RECOVERY.`);
    if (supplied("gross-recovery-bps")) {
      say(`    ${cpd(input.grossRecoveryBps)}/$1 is YOUR figure, replacing a default of`);
      say(`    ${cpd(GROSS_RECOVERY_BPS)}/$1 — an all-channel rate (portfolio.ts: 7c price x 2.4`);
      say("    multiple) measured on portfolios that retained the option to sue.");
    } else {
      say(`    ${cpd(input.grossRecoveryBps)}/$1 is an all-channel figure (portfolio.ts: 7c price`);
      say("    x 2.4 multiple) from portfolios that retained the option to sue.");
    }
    say("    Paper that cannot be sued at all should not be assumed to recover at");
    say("    that rate.");
    say("    Lower --gross-recovery-bps deliberately, or treat this ceiling as an");
    say("    upper bound rather than an estimate.");
  }

  // A worthless band is a fact about the tape, not about the segment REPORT, so
  // it prints and counts whether or not --segments was passed. It used to live
  // inside the --segments block and be overwritten by the buy-box exit code
  // below: on a barbell where 97.56% of accounts were unacquirable at any
  // price, adding --hypothesis h3 both suppressed this warning and flipped the
  // exit code from 1 to 0. Passing the flag the tool itself recommends turned a
  // decline into a buy.
  if (seg.hiddenUnbuyable.length > 0) {
    const acct = seg.hiddenUnbuyable.reduce((s, x) => s + x.segment.shareOfAccountsBps, 0);
    say("");
    // This used to read "The blend clears while ..." unconditionally, but the
    // gate is `!blended.unacquirableAtAnyPrice`, which is weaker than
    // clearsHurdle — so the line could assert the blend clears three rows under
    // a BLENDED row reading "no". Narrowing the gate instead would suppress a
    // real warning, so the sentence is what changes.
    const bands = seg.hiddenUnbuyable.map((x) => x.segment.band.label).join(", ");
    say(
      seg.blended.clearsHurdle
        ? `  ⚠ The blend CLEARS while ${bands} is unacquirable`
        : `  ⚠ The blend does not clear, and ${bands} is separately unacquirable`,
    );
    say(`    at ANY price — ${pct(acct)} of accounts, bought at ${cpd(input.priceBps)}/$1.`);
    for (const s of seg.hiddenUnbuyable) {
      if (s.segment.accountsWithDefects > 0) {
        say(`    ${s.segment.band.label}: ${s.segment.accountsWithDefects} of ${s.segment.accountCount} accounts carry defects.`);
      }
    }
  }

  if (seg.blended.unacquirableAtAnyPrice) {
    // hiddenUnbuyable is deliberately empty here (a worthless band cannot be
    // "hidden" inside a worthless blend), so without this the run said only
    // "DOES NOT CLEAR" and printed a NEGATIVE number under the label "Ceiling".
    say("");
    say("  ⚠ THE WHOLE TAPE IS UNACQUIRABLE AT ANY PRICE — up-front servicing alone");
    say("    exceeds the present value of everything collectable. Free is too");
    say(`    expensive; the seller would have to pay ${usd(-seg.blended.maxPriceCents)} to place it.`);
  }

  const wholeTapeOk =
    seg.blended.clearsHurdle &&
    !seg.blended.unacquirableAtAnyPrice &&
    seg.hiddenUnbuyable.length === 0;
  exitCode = wholeTapeOk ? 0 : 1;

  if (hyp !== undefined) {
    const hypothesis: Hypothesis = hyp === "h1" ? "H1_time_barred" : "H3_within_sol";
    box = underwriteBuyBox(tape, hypothesis, SOL_TABLE_VERIFIED, input);
    say("");
    say(`  BUY BOX — ${hypothesis}`);
    say(`    In box            ${box.inBoxAccountCount.toLocaleString("en-US")} accounts, ${usd(box.inBoxFaceCents)} (${pct(box.inBoxShareOfFaceBps)} of face)`);
    say(`    Out of box        ${usd(box.outOfBoxFaceCents)}  ← paid for, cannot be worked`);
    say(`    SOL table covers  ${coveredStates(SOL_TABLE_VERIFIED).join(", ")} of ${JURISDICTION_COUNT} jurisdictions`);
    if (hypothesis === "H3_within_sol") {
      // A hard-coded default with no flag and no prior mention: an account
      // nominally within SOL but 2 months from the bar is excluded, and nothing
      // said the threshold existed.
      say("    Headroom required  6 months before the bar (fixed, no flag) — paper");
      say("                      closer than that is excluded as unworkable in time");
    }
    say(`    Uncovered face    ${usd(box.uncoveredStateFaceCents)} in ${box.uncoveredStates.length} states — unknown SOL,`);
    say("                      which is unbuyable under H1 and H3 alike");
    // These were computed by assessSol and discarded. near_boundary on an H3
    // tape is the signal that matters most: paper that qualifies today and is
    // barred before onboarding finishes.
    const CAVEAT_TEXT: Record<string, string> = {
      near_boundary: "within 3 months of the bar either side",
      on_the_boundary: "exactly at the bar — status unknowable",
      contested_basis_disagrees: "written and open-account clocks disagree",
      revival_after_expiry_unresolved: "post-expiry revival rule unresolved",
      no_last_payment_date: "no usable last-payment date",
      debt_type_unknown: "debt type unrecognised",
      no_rule_for_state: "no SOL rule for the state",
    };
    const flagged = Object.entries(box.caveatCounts).filter(([, n]) => n > 0);
    if (flagged.length > 0) {
      say("    SOL caveats  (an account stops at its first BLOCKING reason — an");
      say("                  uncovered state short-circuits before the date check — but a");
      say("                  non-blocking caveat can accompany one, so these neither sum");
      say("                  to the account count nor to the defect counts above)");
      for (const [k, n] of flagged.sort((a, b) => b[1] - a[1])) {
        say(`      ${String(n).padStart(6)}  ${k} — ${CAVEAT_TEXT[k] ?? k}`);
      }
    }
    say("");
    if (box.resultInBoxDenominated === null) {
      say("    VERDICT: DECLINE — the buy box selects too little of this tape to");
      say("    price. You would be paying the whole-tape price for a fraction you");
      say("    can work.");
      exitCode = 1;
    } else if (box.resultInBoxDenominated.unacquirableAtAnyPrice) {
      // The --face path has said this since round 1; the buy-box path used to
      // print a NEGATIVE number under the label "Ceiling" and call it
      // "DOES NOT CLEAR", which understates the answer considerably.
      say("    VERDICT: UNACQUIRABLE AT ANY PRICE — the workable slice cannot");
      say("    cover the up-front cost of servicing the whole file. Free is too");
      say(`    expensive; the seller would have to pay ${usd(-box.resultInBoxDenominated.maxPriceCents)} to place it.`);
      exitCode = 1;
    } else {
      say(`    Ceiling on whole tape  ${cpd(box.maxPriceBpsOfWholeTape!)}/$1   (blended said ${cpd(seg.blended.maxPriceBps)}/$1)`);
      say(`    VERDICT: ${box.resultInBoxDenominated.clearsHurdle ? "CLEARS" : "DOES NOT CLEAR"} at ${cpd(input.priceBps)}/$1`);
      // The buy box can only make the verdict WORSE. A tape with a worthless
      // band does not become buyable because a subset of it clears.
      exitCode = box.resultInBoxDenominated.clearsHurdle && wholeTapeOk ? 0 : 1;
    }
  }

  say("");
  if (args.has("json")) {
    // The buy box MUST be in the payload whenever it was computed. It used to
    // be omitted, so a script parsing --json saw only the blended, wedge-free
    // numbers — including a clearing verdict on a tape the text output declined.
    console.log(
      JSON.stringify(
        {
          input,
          asOf: `${asOf.y}-${String(asOf.m).padStart(2, "0")}-${String(asOf.d).padStart(2, "0")}`,
          asOfSuppliedByUser: asOfRaw !== undefined,
          reconciliation: rec,
          rejected: parsed.rejected,
          defectCounts: parsed.defectCounts,
          columns: cols,
          assumedDebtType: cols.debtType === undefined ? (spec.defaultDebtType ?? null) : null,
          segmented: seg,
          buyBox: box,
        },
        null,
        2,
      ),
    );
  }
  return exitCode;
}

function segmentSummary(tape: { accounts: readonly { balanceCents: number }[]; faceCents: number; accountCount: number }) {
  const sorted = tape.accounts.map((a) => a.balanceCents).sort((x, y) => x - y);
  const mid = sorted.length >> 1;
  return {
    mean: Math.floor(tape.faceCents / tape.accountCount),
    median:
      sorted.length % 2 === 1 ? sorted[mid] : Math.floor((sorted[mid - 1] + sorted[mid]) / 2),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.has("help") || args.size === 0) {
    console.log(USAGE);
    return 0;
  }

  if (args.has("tape")) return runTape(args);

  // The mirror of runTape's guard. Without it the --face path ACCEPTED and
  // silently dropped every tape-only flag: `--face … --hypothesis h3 --segments
  // --tape-declared-face 999999` printed CLEARS / exit 0 with zero mentions of
  // any of them, while the same portfolio through --tape --hypothesis h3 gives
  // DOES NOT CLEAR / exit 1. --hypothesis and --segments are exactly the two
  // flags that can only make a verdict WORSE (the buy-box wedge, a hidden
  // unbuyable band), so dropping them always resolves toward the flattering
  // blended answer — and --tape-declared-face gives someone who believes they
  // are getting reconciliation none at all.
  const tapeOnly = [
    "tape-declared-face", "tape-declared-accounts", "tape-date-format",
    "tape-columns", "tape-type", "tape-as-of", "hypothesis", "segments",
  ].filter((f) => args.has(f));
  if (tapeOnly.length > 0) {
    throw new Error(
      `${tapeOnly.map((f) => `--${f}`).join(", ")} require --tape; the --face path ` +
        "models a portfolio as totals and has no accounts to segment or select. " +
        "Pass --tape <file> to use them.",
    );
  }

  // Convert at the boundary. Money is integer cents everywhere inside.
  //
  // This used to be Math.round(Number(raw) * 100), which is the float boundary
  // docs/rules.md forbids: Number("1.005") * 100 is 100.49999999999999, so the
  // round yields 100 and a cent goes missing. parseMoneyToCents does it by
  // string split and refuses a third decimal outright.
  const faceCents = dollarsArg(args, "face");
  if (faceCents <= 0) throw new Error("--face must be > 0");

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
