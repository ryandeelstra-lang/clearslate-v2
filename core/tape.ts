// Account-level tape parsing. The first per-account record type in this repo.
//
// A "tape" is the seller's data file for a portfolio of charged-off accounts.
// Standard fields (docs/research/notes.md:175): name, SSN, balance, date of
// last payment, charge-off date, address, phone. Email is not standard.
//
// THIS MODULE DELIBERATELY DROPS IDENTITY. `TapeAccount` carries no name, SSN,
// address or phone — only what is needed to price the paper. Pre-purchase
// scoring has no legitimate use for identity, and a type that cannot hold it
// cannot leak it. Identity handling is a post-purchase concern with a different
// legal surface (FCRA permissible purpose, GLBA safeguards) and belongs in its
// own module.
//
// THE GOVERNING ASYMMETRY: you buy every row on the tape, including the ones
// you cannot read. A parser that drops malformed rows removes both their face
// AND their per-account servicing cost, leaving a smaller, cleaner, cheaper
// tape than the one you would actually own. That is the flattering direction.
// So parse failures are never silent drops — they are reconciliation failures
// that make the whole tape unbuyable until a human explains them.
//
// Pure. No dependencies.

/** Debt type, which governs the applicable statute of limitations. */
export type DebtType =
  | "credit_card"
  | "retail_card"
  | "personal_loan"
  | "medical"
  | "telecom"
  | "auto_deficiency"
  | "payday"
  | "student"
  | "unknown";

/** Calendar date as components. Deliberately NOT a Date — see parseYmd. */
export type Ymd = { y: number; m: number; d: number };

export type AccountDefect =
  | "missing_last_payment_date"
  | "malformed_last_payment_date"
  | "missing_charge_off_date"
  | "malformed_charge_off_date"
  | "unrecognised_debt_type"
  | "last_payment_after_charge_off";

/**
 * One account on a seller's data file, PRE-PURCHASE.
 *
 * `state` is the two-letter code from the address column; the address itself is
 * never read. It is retained because both the statute of limitations and the
 * economics of filing suit are state-specific.
 */
export type TapeAccount = {
  /** Opaque. Defaults to the row ordinal. NEVER a name or an SSN. */
  readonly id: string;
  readonly balanceCents: number;
  readonly state: string;
  readonly debtType: DebtType;
  readonly lastPaymentDate: Ymd | null;
  readonly chargeOffDate: Ymd | null;
  readonly defects: readonly AccountDefect[];
};

export type Tape = {
  readonly label: string;
  readonly asOf: Ymd;
  readonly accounts: readonly TapeAccount[];
  readonly faceCents: number;
  readonly accountCount: number;
};

export type RejectReason =
  | "ragged_row"
  | "missing_balance"
  | "malformed_balance"
  | "non_positive_balance"
  | "missing_state"
  | "unrecognised_state"
  | "id_looks_like_ssn";

export type RejectedRow = {
  /** 1-based, header excluded. */
  readonly rowNumber: number;
  readonly reason: RejectReason;
  /** Field NAME only. Never the value — values may be PII. */
  readonly column: string;
};

export type Reconciliation = {
  readonly declaredFaceCents: number;
  readonly parsedFaceCents: number;
  /** declared − parsed. Positive means face we could not read but would pay for. */
  readonly faceDeltaCents: number;
  readonly declaredAccountCount: number;
  readonly parsedAccountCount: number;
  readonly accountDelta: number;
  readonly rejectedCount: number;
  /**
   * Rows whose id repeats one already seen.
   *
   * A tape listing the same account twice reconciles PERFECTLY against declared
   * totals — the seller computes those from the same duplicated file — while
   * every duplicated row is face you pay for and cannot collect, plus a second
   * validation notice mailed on one debt. Inflated face at the same price per
   * dollar means paying more for less real paper, so this fails closed like any
   * other reconciliation failure.
   */
  readonly duplicateIdCount: number;
  /**
   * Whether the duplicate check could run at all — i.e. whether any row carried
   * an explicit id.
   *
   * ⚠ READ THIS BEFORE READING duplicateIdCount. The id column is optional, so
   * the DEFAULT invocation is the unchecked one, and a `duplicateIdCount` of 0
   * on an unchecked tape reads as "checked, none found" when it means "not
   * looked at". A byte-identical duplicated account produced exit 2 with the id
   * column mapped and a clean "clears", exit 0 without it.
   *
   * There is deliberately no content-based fallback: two accounts with the same
   * balance, state and dates are ordinary on a real tape, so guessing from
   * content would refuse good paper. Reporting "not checked" is the honest
   * answer — per CLAUDE.md, never let an estimate masquerade as a fact.
   */
  readonly duplicateIdsChecked: boolean;
  /**
   * Accounts that carried no explicit id, and so could not participate in the
   * duplicate check. `duplicateIdsChecked` is true only when this is zero: a
   * tape where 1 row of 4 had an id previously reported "checked" while three
   * quarters of it went unexamined — partial coverage reported as full, which
   * is the same masquerade `duplicateIdsChecked` exists to prevent.
   */
  readonly accountsWithoutId: number;
  /** Every delta zero, nothing rejected, no duplicate ids. Tolerance is not configurable. */
  readonly ok: boolean;
};

export type TapeParseResult = {
  /**
   * null whenever reconciliation.ok is false. You cannot underwrite a tape you
   * could not fully read: returning a partial Tape invites pricing the readable
   * subset and paying for the whole file.
   */
  readonly tape: Tape | null;
  readonly rejected: readonly RejectedRow[];
  readonly reconciliation: Reconciliation;
  readonly defectCounts: Readonly<Record<AccountDefect, number>>;
};

export type DateFormat = "YYYY-MM-DD" | "MM/DD/YYYY";

export type TapeColumnMap = {
  id?: string;
  balance: string;
  state: string;
  lastPaymentDate: string;
  chargeOffDate?: string;
  debtType?: string;
};

export type TapeSpec = {
  label: string;
  columns: TapeColumnMap;
  /**
   * REQUIRED, never sniffed. The same file must not parse two ways: 03/04/2020
   * is a different SOL answer under each reading, and SOL decides which
   * hypothesis the paper belongs to.
   */
  dateFormat: DateFormat;
  /** Required when the file has no debtType column. Never guessed. */
  defaultDebtType?: DebtType;
  /** Seller's stated totals. The only check that the file parsed is the file sold. */
  declaredFaceCents: number;
  declaredAccountCount: number;
  asOf: Ymd;
};

/**
 * The ONLY exemptions to the identity refusal below.
 *
 * A first attempt granted a blanket exemption whenever a column matched a
 * generic "hint" for its slot. That was far too permissive: the id hint matched
 * `_ID`, so `id=TAX_ID` was allowed, and `id=ACCOUNT_SSN` slipped through on
 * "account" — both put real identity into the record the module exists to keep
 * it out of.
 *
 * An exemption now requires all three of: a specific PII pattern, a specific
 * slot, and POSITIVE evidence that the column is that slot's own field. There
 * are exactly two, each with a concrete justification:
 *
 *  - /addr/ for `state`, because tape.ts's own doc says state IS "the
 *    two-letter code from the address column" — ADDR_STATE is the field, not
 *    the address. MAILING_ADDRESS carries no state evidence and stays refused.
 *  - /name/ for `debtType`, because PRODUCT_NAME names a product, not a person.
 *    LAST_NAME carries no product evidence and stays refused.
 *
 * ssn, social, tax id, phone and email have NO exemption for any slot.
 */
/**
 * Positive evidence that a column IS the slot it is mapped to.
 *
 * The deny-list below cannot be finished. It was found incomplete twice — DOB
 * and the ECOA protected classes, then BDAY/YOB/BORN — because it enumerates an
 * open vocabulary: every seller invents new header names. With exactly six
 * slots of known shape, the closed form is the other direction. A column must
 * now BOTH look like its slot AND not look like identity.
 *
 * The date slot is why this matters most: it is the one with no downstream
 * backstop. A bad id is caught by SSN_RE, a bad state by isStateCode, a bad
 * type becomes "unknown" — but a birth date parses as a perfectly good date and
 * silently anchors the statute of limitations, making every account read
 * time_barred. That flatters H1 with the whole tape.
 */
const SLOT_REQUIRES: Readonly<Record<string, RegExp>> = {
  balance: /bal|amount|amt|principal|prin|face|due|outstanding|owed|owing/i,
  state: /state|province|region|(^|[^a-z])st([^a-z]|$)/i,
  lastPaymentDate:
    /(last|lst|latest|recent).*(pay|pmt)|(pay|pmt).*(date|dt)|dolp|(^|[^a-z])lpd([^a-z]|$)/i,
  chargeOffDate: /charge.?off|chg.?off|(^|[^a-z])co.?(date|dt)([^a-z]|$)/i,
  debtType: /type|product|class|categ|segment/i,
  id: /acct|account|loan|portfolio|batch|seller|ref|(^|[^a-z])(id|file|case|claim)([^a-z]|$)/i,
};

const REFUSAL_EXEMPTIONS: ReadonlyArray<{
  readonly pattern: RegExp;
  readonly slot: string;
  readonly requires: RegExp;
}> = [
  { pattern: /addr/i, slot: "state", requires: SLOT_REQUIRES.state },
  { pattern: /postal/i, slot: "state", requires: SLOT_REQUIRES.state },
  { pattern: /name/i, slot: "debtType", requires: SLOT_REQUIRES.debtType },
];

/**
 * Columns the parser refuses to read even if mapped. Exported so the CLI can
 * print them and a test can assert none appear in a serialised TapeAccount.
 */
export const REFUSED_COLUMN_PATTERNS: readonly RegExp[] = [
  // --- Government identifiers ------------------------------------------
  /ssn/i,
  /social/i,
  /tax.*id|taxpayer/i,
  /gov(t|ernment).?.?id/i,
  /(^|[^a-z])(ein|tin|itin)([^a-z]|$)/i,
  /licen[cs]e/i,
  /(^|[^a-z])dl[^a-z]/i,
  /passport/i,
  /medicare|medicaid/i,

  // --- Names and aliases -----------------------------------------------
  /name/i,
  /alias/i,
  /(^|[^a-z])aka([^a-z]|$)/i,
  /nickname/i,
  /(^|[^a-z])(middle|suffix|maiden)([^a-z]|$)/i,

  // --- Contact ---------------------------------------------------------
  /phone/i,
  /mobile/i,
  /(^|[^a-z])cell([^a-z]|$)/i,
  // Anchored BOTH sides. An unanchored form matched "E_MAIL" inside
  // HOM(E_MAIL)ING_STATE and STAT(E_MAIL)ING — refusing a legitimate state
  // column outright. The trailing [^a-z] is what does the work: "mailing" is
  // not "mail".
  /(^|[^a-z])e[-_. ]?mail([^a-z]|$)/i,
  /(^|[^a-z])fax([^a-z]|$)/i,

  // --- Address ---------------------------------------------------------
  // `state` is exempt where the column carries positive state evidence; the
  // components below never are, because they are the address, not the state.
  /addr/i,
  /street/i,
  /(^|[^a-z])city([^a-z]|$)/i,
  /(^|[^a-z])zip/i,
  /postal/i,

  // --- Protected classes under ECOA / Regulation B ----------------------
  // 12 CFR 1002.2(m) defines a "credit transaction" to include COLLECTION
  // PROCEDURES, so ECOA reaches how this paper is worked, not just how it was
  // lent. Registered as U11 in docs/decisions/h3-ownership-as-product.md.
  // Nine of these eleven were mappable into a scoring slot: a per-account
  // model reading GENDER or RACE is the disparate-impact exposure U11 exists
  // to flag, and it would have been invisible.
  /(^|[^a-z])age([^a-z]|$)/i,
  /birth/i,
  /(^|[^a-z])d\.?o\.?b([^a-z]|$)/i,
  /gender/i,
  /(^|[^a-z])sex([^a-z]|$)/i,
  /(^|[^a-z])race([^a-z]|$)/i,
  /ethnic/i,
  /marital/i,
  /national.?origin/i,
  /religio/i,
  /disab/i,

  // --- Employment and income -------------------------------------------
  /employ/i,
  /occupation/i,
  /(^|[^a-z])(income|salary|wages)([^a-z]|$)/i,

  // --- Bank and card details -------------------------------------------
  /bank.?(acct|account|no|num)/i,
  /routing/i,
  /(^|[^a-z])iban([^a-z]|$)/i,
  /card.?(num|no)/i,
];

/**
 * Decimal string to integer cents, by string split.
 *
 * NEVER Math.round(Number(x) * 100): that is the float boundary this repo
 * forbids, and it is silently wrong. Number("1.005") * 100 is 100.49999999999999,
 * so Math.round gives 100 — a cent lost on every such row, understating face.
 *
 * Rejects more than two decimal places rather than rounding: a sub-cent balance
 * on a tape is a format error, not a rounding opportunity.
 */
export function parseMoneyToCents(raw: string): number | null {
  let s = raw.trim();
  if (s === "") return null;
  // Accounting negatives: (12.34)
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  s = s.replace(/[$,\s]/g, "");
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1);
  }
  const m = /^(\d+)(?:\.(\d+))?$/.exec(s);
  if (!m) return null;
  const frac = m[2] ?? "";
  // More than two decimals is accepted ONLY when the extra digits are zeros —
  // a DECIMAL(x,4) warehouse export writes 1500.0000, which is unambiguously
  // $1500.00, and rejecting it made every row fail and the tape unbuyable.
  // 1.005 is still refused: that is a real sub-cent value, not a format artifact.
  if (frac.length > 2 && /[^0]/.test(frac.slice(2))) return null;
  const cents = Number(m[1]) * 100 + Number(frac.slice(0, 2).padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) return null;
  return negative ? -cents : cents;
}

/**
 * Explicit calendar-component parse plus calendar validity.
 *
 * NEVER `new Date(str)`. In a negative UTC offset, `new Date("2020-03-01")`
 * is 29 Feb local — which moves the SOL anniversary a day and can flip a
 * boundary account between hypotheses.
 */
export function parseYmd(raw: string, format: DateFormat): Ymd | null {
  const s = raw.trim();
  if (s === "") return null;
  let y: number, mo: number, d: number;
  if (format === "YYYY-MM-DD") {
    const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
    if (!m) return null;
    [y, mo, d] = [+m[1], +m[2], +m[3]];
  } else {
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
    if (!m) return null;
    [mo, d, y] = [+m[1], +m[2], +m[3]];
  }
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  if (d > daysInMonth(y, mo)) return null;
  return { y, m: mo, d };
}

/** Calendar month length without Date. */
export function daysInMonth(y: number, m: number): number {
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

export function compareYmd(a: Ymd, b: Ymd): -1 | 0 | 1 {
  if (a.y !== b.y) return a.y < b.y ? -1 : 1;
  if (a.m !== b.m) return a.m < b.m ? -1 : 1;
  if (a.d !== b.d) return a.d < b.d ? -1 : 1;
  return 0;
}

export function formatYmd(a: Ymd): string {
  return `${a.y}-${String(a.m).padStart(2, "0")}-${String(a.d).padStart(2, "0")}`;
}

/**
 * Whole months elapsed from `from` to `to`.
 *
 * ⚠ DEFINED FOR `to >= from` ONLY. It is not antisymmetric — reversing the
 * arguments does not negate the result (2020-03-31 -> 2020-02-28 gives −2 while
 * the forward direction gives 1), because the day clamp below is asymmetric by
 * construction. `assessSol` guards with `compareYmd(lastPaymentDate, asOf) > 0`
 * before calling, so the reversed case is unreachable there; any new caller
 * must guard the same way. An earlier doc comment promised "negative if `to`
 * precedes `from`", which implied a symmetry this does not have.
 *
 * The anchor day is CLAMPED to the length of the target month. A naive
 * `to.d < from.d` under-counts whenever the anchor day does not exist in the
 * target month — the 29 February case. From 2020-02-29 to 2023-02-28 the
 * anniversary has passed (28 Feb is the last day of that month), but the naive
 * form reports 35 months and the account reads `within` when it is at the bar.
 *
 * That error is one-sided toward `within`, i.e. toward H3 — the flattering
 * direction — which is why it is clamped rather than tolerated.
 */
export function monthsBetween(from: Ymd, to: Ymd): number {
  const anchorDay = Math.min(from.d, daysInMonth(to.y, to.m));
  return (to.y - from.y) * 12 + (to.m - from.m) - (to.d < anchorDay ? 1 : 0);
}

const STATES = new Set(
  ("AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO " +
    "MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC " +
    // Territories. No SOL rule ships for any of them, so they resolve to
    // "unknown" and are unbuyable under both hypotheses — the correct place to
    // fail. Rejecting them at the PARSER instead made one such account refuse
    // the entire tape.
    "PR VI GU AS MP")
    .split(" "),
);

/** Every jurisdiction code the parser accepts: 50 states + DC + 5 territories. */
export const JURISDICTION_COUNT = STATES.size;

export function isStateCode(s: string): boolean {
  return STATES.has(s.trim().toUpperCase());
}

// A Map, not an object literal. As a literal this was prototype-exposed: a
// debtType cell of `constructor` survives the [^a-z] strip intact and
// `DEBT_TYPES["constructor"]` returned Object's constructor — a Function, which
// is truthy, so `?? "unknown"` never fired. The account then carried a Function
// as its debtType: JSON.stringify dropped the field silently, the tape
// reconciled with ZERO defects and reported "clears", and limitYearsFor's
// switch fell off the end and threw an opaque TypeError under --hypothesis.
// Exactly the failure pair already fixed at the CLI boundary for --tape-type.
const DEBT_TYPES = new Map<string, DebtType>(Object.entries({
  creditcard: "credit_card",
  card: "credit_card",
  bankcard: "credit_card",
  retail: "retail_card",
  retailcard: "retail_card",
  privatelabel: "retail_card",
  personalloan: "personal_loan",
  installment: "personal_loan",
  medical: "medical",
  healthcare: "medical",
  telecom: "telecom",
  telco: "telecom",
  wireless: "telecom",
  utility: "telecom",
  auto: "auto_deficiency",
  autodeficiency: "auto_deficiency",
  autoloan: "auto_deficiency",
  payday: "payday",
  paydayloan: "payday",
  student: "student",
  studentloan: "student",
} as const));

/**
 * Map a debt-type string. Unrecognised values become "unknown" rather than a
 * guess — and sol.ts refuses to rule on "unknown", so an unmapped type fails
 * closed instead of borrowing the credit-card limitations period.
 */
export function normaliseDebtType(raw: string): DebtType {
  const k = raw.trim().toLowerCase().replace(/[^a-z]/g, "");
  const mapped = DEBT_TYPES.get(k);
  // Belt and braces: the Map closes the prototype hole, and this confirms the
  // value is one the rest of the system knows how to reason about.
  return mapped !== undefined && DEBT_TYPE_VALUES.has(mapped) ? mapped : "unknown";
}

const SSN_RE = /^\d{3}-?\d{2}-?\d{4}$/;

/** Runtime guard for DebtType — the CLI takes it as an arbitrary string. */
export const DEBT_TYPE_VALUES: ReadonlySet<DebtType> = new Set<DebtType>([
  "credit_card",
  "retail_card",
  "personal_loan",
  "medical",
  "telecom",
  "auto_deficiency",
  "payday",
  "student",
  "unknown",
]);

const EMPTY_DEFECTS: Record<AccountDefect, number> = {
  missing_last_payment_date: 0,
  malformed_last_payment_date: 0,
  missing_charge_off_date: 0,
  malformed_charge_off_date: 0,
  unrecognised_debt_type: 0,
  last_payment_after_charge_off: 0,
};


/**
 * Render the header for an error message WITHOUT echoing data.
 *
 * The message used to interpolate the raw header row. On a headerless file —
 * an ordinary seller artifact — row 1 IS an account, so a mapping mistake
 * printed a consumer's name, SSN and phone to stderr, straight into scrollback
 * and CI logs. That defeats this module's entire contract and RejectedRow's
 * stated rule that only a column NAME is ever reported.
 *
 * A cell is echoed only if it looks like a header: it has a letter, is not a
 * parseable money value or date, and matches no identity pattern. Anything else
 * is redacted to its position.
 */
function safeHeaderList(header: readonly string[], spec: TapeSpec): string {
  // THE ROW IS ONLY ECHOED IF IT IS CONFIRMED TO BE A HEADER.
  //
  // The first attempt asked "does this cell look like data?" per cell. That
  // question is unanswerable: on a realistic headerless tape laid out
  // first,last,address,city,state,zip,ssn,acct,bal,lpd only the zip, SSN,
  // balance and date redact — a minority — so the row printed "Jane, Roe,
  // 12 Elm St, Austin". A person's name and a street address look exactly like
  // column headers, because shape does not distinguish them.
  //
  // The usable signal is one we already hold: whether ANY column this spec maps
  // was actually found. A real header row will match at least one of them —
  // balance, state and lastPaymentDate are all required, so there are never
  // fewer than three chances. If none matched, this row cannot be confirmed as
  // a header, and an unconfirmed row is never printed.
  const wanted = Object.values(spec.columns).filter((c): c is string => typeof c === "string");
  const found = wanted.filter((w) => header.some((h) => h.trim() === w.trim()));

  // ONE match is not confirmation. A headerless row can contain a cell that
  // happens to equal a mapped name — "ST" is this tool's own default state
  // column AND a plausible street-suffix cell in a split address — and a single
  // accidental hit re-opened the leak through the front door: a row containing
  // "ST" printed "Jane, Roe, 12 Elm".
  //
  // A genuine header matches nearly all of the spec; only the column being
  // complained about is missing. Requiring half, minimum two, separates the two
  // cases cleanly: balance, state and lastPaymentDate are all required, so
  // `wanted` is never smaller than three.
  const needed = Math.max(2, Math.ceil(wanted.length / 2));
  if (found.length < needed) {
    return (
      `${header.length} columns, all withheld — only ${found.length} of ${wanted.length} mapped ` +
      `columns (${wanted.map((w) => `"${w}"`).join(", ")}) appear in row 1, fewer than the ` +
      `${needed} needed to confirm it is a header. If the file has no header row, its first ` +
      "line is an account and its contents are not printed."
    );
  }

  // Confirmed a header. Still redact any cell that carries an identity value —
  // a real header can contain an SSN-shaped or money-shaped column name, and
  // showing it costs more than it helps.
  const shown = header.map((raw, i) => {
    const h = raw.trim();
    if (h === "") return `#${i + 1}:(empty)`;
    return SSN_RE.test(h) || parseMoneyToCents(h) !== null ? `#${i + 1}:(redacted)` : h;
  });
  return `${header.length} columns [${shown.join(", ")}], matched ${found.length} of ${wanted.length} mapped`;
}

/**
 * Parse a CSV tape.
 *
 * Two tiers, deliberately:
 *
 *   REJECTED — balance or state unreadable, or the row is ragged. The row
 *   cannot be represented at all, so reconciliation fails and `tape` is null.
 *   The tape is unbuyable until a human explains the rows.
 *
 *   ACCEPTED WITH DEFECTS — a date is missing or malformed, or the debt type is
 *   unrecognised. The row counts FULLY toward face and account count (you pay
 *   for it and you mail it a validation notice), carries a defect, and its SOL
 *   resolves to "unknown" — unbuyable under both hypotheses.
 */
export function parseTape(text: string, spec: TapeSpec): TapeParseResult {
  for (const [field, col] of Object.entries(spec.columns)) {
    if (typeof col !== "string") continue;
    const requires = SLOT_REQUIRES[field];
    if (requires !== undefined && !requires.test(col)) {
      throw new Error(
        `refusing to map column "${col}" for ${field}: it does not look like a ` +
          `${field} column. A deny-list of identity names cannot be completed — ` +
          "every seller invents new ones — so a column must positively look like " +
          "the field it is mapped to.",
      );
    }
    for (const re of REFUSED_COLUMN_PATTERNS) {
      if (re.test(col)) {
        const exempt = REFUSAL_EXEMPTIONS.some(
          (e) => e.slot === field && e.pattern.source === re.source && e.requires.test(col),
        );
        if (exempt) continue;
        throw new Error(
          `refusing to map column "${col}" for ${field}: matches ${re} and does not ` +
            `look like a ${field} column — pre-purchase scoring must not read identity fields`,
        );
      }
    }
  }
  if (spec.columns.debtType === undefined && spec.defaultDebtType === undefined) {
    throw new Error(
      "spec needs columns.debtType or defaultDebtType — the statute of " +
        'limitations depends on it and "credit_card" is not a safe guess',
    );
  }
  if (spec.defaultDebtType !== undefined && !DEBT_TYPE_VALUES.has(spec.defaultDebtType)) {
    throw new Error(
      `defaultDebtType "${spec.defaultDebtType}" is not a DebtType — ` +
        `expected one of ${[...DEBT_TYPE_VALUES].join(", ")}`,
    );
  }

  const { header, rows } = parseCsvRows(text);

  /**
   * Resolve a mapped column to its header index.
   *
   * A NAMED-BUT-ABSENT column throws. It used to return -1, the same value as
   * "not requested at all", and the two took different branches downstream: a
   * typo'd `debtType` column silently fell through to `defaultDebtType`, so a
   * tape of unclassifiable paper reported ZERO defects and every account
   * borrowed the default's limitations period. On a real fixture that turned a
   * DECLINE under both hypotheses into a clean H3 CLEARS. Same class of hole
   * disabled the SSN guard and every charge-off defect.
   */
  const idx = (name: string | undefined, field: string): number => {
    if (name === undefined) return -1;
    const want = name.trim();
    const hits: number[] = [];
    for (let i = 0; i < header.length; i++) if (header[i].trim() === want) hits.push(i);
    if (hits.length === 0) {
      throw new Error(
        `column "${name}" mapped for ${field} is not in the header: ${safeHeaderList(header, spec)}`,
      );
    }
    if (hits.length > 1) {
      // findIndex silently took the FIRST. On a tape carrying two columns both
      // called BAL — 100.00 and 999999.00 — that is a guess about which one is
      // the balance, made without saying so, and the two answers differ by four
      // orders of magnitude. Which column is authoritative is a question for the
      // seller, not for a tiebreak rule.
      throw new Error(
        `column "${want}" mapped for ${field} appears ${hits.length} times in the header ` +
          `(positions ${hits.join(", ")}). Which one is authoritative is a question ` +
          "for the seller — rename the columns or map an unambiguous one.",
      );
    }
    return hits[0];
  };

  const cBal = idx(spec.columns.balance, "balance");
  const cState = idx(spec.columns.state, "state");
  const cLpd = idx(spec.columns.lastPaymentDate, "lastPaymentDate");
  const cCo = idx(spec.columns.chargeOffDate, "chargeOffDate");
  const cType = idx(spec.columns.debtType, "debtType");
  const cId = idx(spec.columns.id, "id");

  const accounts: TapeAccount[] = [];
  const rejected: RejectedRow[] = [];
  const explicitIds: string[] = [];
  const defectCounts: Record<AccountDefect, number> = { ...EMPTY_DEFECTS };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 1;

    // Ragged rows are rejected, never padded: padding shifts columns and can
    // read a balance out of a date column.
    if (row.length !== header.length) {
      rejected.push({ rowNumber, reason: "ragged_row", column: "(row)" });
      continue;
    }

    const rawId = cId === -1 ? "" : row[cId].trim();
    if (rawId !== "" && SSN_RE.test(rawId)) {
      rejected.push({ rowNumber, reason: "id_looks_like_ssn", column: spec.columns.id! });
      continue;
    }

    const rawBal = row[cBal].trim();
    if (rawBal === "") {
      rejected.push({ rowNumber, reason: "missing_balance", column: spec.columns.balance });
      continue;
    }
    const balanceCents = parseMoneyToCents(rawBal);
    if (balanceCents === null) {
      rejected.push({ rowNumber, reason: "malformed_balance", column: spec.columns.balance });
      continue;
    }
    if (balanceCents <= 0) {
      rejected.push({ rowNumber, reason: "non_positive_balance", column: spec.columns.balance });
      continue;
    }

    const rawState = row[cState].trim();
    if (rawState === "") {
      rejected.push({ rowNumber, reason: "missing_state", column: spec.columns.state });
      continue;
    }
    if (!isStateCode(rawState)) {
      rejected.push({ rowNumber, reason: "unrecognised_state", column: spec.columns.state });
      continue;
    }

    const defects: AccountDefect[] = [];

    const rawLpd = row[cLpd].trim();
    let lastPaymentDate: Ymd | null = null;
    if (rawLpd === "") defects.push("missing_last_payment_date");
    else {
      lastPaymentDate = parseYmd(rawLpd, spec.dateFormat);
      if (lastPaymentDate === null) defects.push("malformed_last_payment_date");
    }

    let chargeOffDate: Ymd | null = null;
    if (cCo !== -1) {
      const rawCo = row[cCo].trim();
      if (rawCo === "") defects.push("missing_charge_off_date");
      else {
        chargeOffDate = parseYmd(rawCo, spec.dateFormat);
        if (chargeOffDate === null) defects.push("malformed_charge_off_date");
      }
    }

    if (lastPaymentDate && chargeOffDate && compareYmd(lastPaymentDate, chargeOffDate) > 0) {
      defects.push("last_payment_after_charge_off");
    }

    let debtType: DebtType;
    if (cType !== -1) {
      debtType = normaliseDebtType(row[cType]);
      if (debtType === "unknown") defects.push("unrecognised_debt_type");
    } else {
      debtType = spec.defaultDebtType!;
    }

    for (const d of defects) defectCounts[d]++;

    if (rawId !== "") explicitIds.push(rawId);
    accounts.push({
      id: rawId === "" ? `row:${rowNumber}` : rawId,
      balanceCents,
      state: rawState.toUpperCase(),
      debtType,
      lastPaymentDate,
      chargeOffDate,
      defects,
    });
  }

  const parsedFaceCents = accounts.reduce((s, a) => s + a.balanceCents, 0);
  // Only rows that carried an EXPLICIT id participate. Synthesised "row:N" ids
  // are unique by construction, so including them both diluted the check and
  // let a real id literally spelled "row:2" collide with the synthesised id for
  // blank-id row 2. Compared case-insensitively: a tape distinguishing two
  // accounts by the case of their id is not a thing, and treating "A1"/"a1" as
  // the same errs toward refusing a tape rather than buying phantom face.
  const seenIds = new Set<string>();
  let duplicateIdCount = 0;
  for (const id of explicitIds) {
    const k = id.toLowerCase();
    if (seenIds.has(k)) duplicateIdCount++;
    else seenIds.add(k);
  }
  const accountsWithoutId = accounts.length - explicitIds.length;
  const duplicateIdsChecked = accounts.length > 0 && accountsWithoutId === 0;
  const reconciliation: Reconciliation = {
    declaredFaceCents: spec.declaredFaceCents,
    parsedFaceCents,
    faceDeltaCents: spec.declaredFaceCents - parsedFaceCents,
    declaredAccountCount: spec.declaredAccountCount,
    parsedAccountCount: accounts.length,
    accountDelta: spec.declaredAccountCount - accounts.length,
    rejectedCount: rejected.length,
    duplicateIdCount,
    duplicateIdsChecked,
    accountsWithoutId,
    ok:
      rejected.length === 0 &&
      duplicateIdCount === 0 &&
      spec.declaredFaceCents === parsedFaceCents &&
      spec.declaredAccountCount === accounts.length,
  };

  return {
    tape: reconciliation.ok
      ? {
          label: spec.label,
          asOf: spec.asOf,
          accounts,
          faceCents: parsedFaceCents,
          accountCount: accounts.length,
        }
      : null,
    rejected,
    reconciliation,
    defectCounts,
  };
}

/** Build a Tape from typed records. Recomputes totals; never trusts a passed-in one. */
export function buildTape(
  accounts: readonly TapeAccount[],
  meta: { label: string; asOf: Ymd },
): Tape {
  return {
    label: meta.label,
    asOf: meta.asOf,
    accounts,
    faceCents: accounts.reduce((s, a) => s + a.balanceCents, 0),
    accountCount: accounts.length,
  };
}

/**
 * Minimal RFC4180-ish CSV reader: quoted fields, embedded commas and newlines,
 * doubled quotes, CRLF, leading BOM. Enough for a tape, one less dependency.
 */
export function parseCsvRows(text: string): { header: string[]; rows: string[][] } {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const out: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  let sawAny = false;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
      sawAny = true;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      sawAny = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
      sawAny = true;
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      // Every line terminator ends a row, INCLUDING a blank line. Skipping
      // blanks made a line present in the file produce neither an account nor a
      // rejection, and shifted every subsequent rowNumber so a rejection
      // pointed a human at the wrong line. A blank line now falls out as
      // ragged_row. A trailing newline is handled by the final push below,
      // which fires only when something was actually seen.
      row.push(field);
      out.push(row);
      field = "";
      row = [];
      sawAny = false;
    } else {
      field += c;
      sawAny = true;
    }
  }
  if (sawAny || field !== "" || row.length > 0) {
    row.push(field);
    out.push(row);
  }

  // Only leading blank lines are skipped, to find the header. INTERIOR blank
  // lines are kept: filtering those made a line present in the file produce
  // neither an account nor a RejectedRow, and shifted every subsequent
  // rowNumber so rejections pointed a human at the wrong line. An interior
  // blank now falls out as ragged_row.
  //
  // TRAILING bare blank lines ARE stripped. A file ending "\n\n" is a
  // formatting artifact, not a row, and refusing an entire tape over it would
  // be a false positive on a file whose only fault is a stray newline.
  // Stripping from the END cannot shift any earlier rowNumber. Note this
  // removes only a bare blank line (a single empty field) — a trailing ",,"
  // has separators in it, so somebody wrote something, and it is kept and
  // rejected like any other malformed row. A whitespace-ONLY trailing line
  // ("   \n") counts as bare: it was refusing whole tapes over invisible
  // characters, the same false positive the trailing rule exists to remove.
  const firstContent = out.findIndex((r) => r.some((f) => f.trim() !== ""));
  if (firstContent === -1) return { header: [], rows: [] };
  let end = out.length;
  while (end > firstContent + 1 && out[end - 1].length === 1 && out[end - 1][0].trim() === "") end--;
  return { header: out[firstContent], rows: out.slice(firstContent + 1, end) };
}
