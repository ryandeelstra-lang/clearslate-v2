// Tests for core/tape.ts. Zero dependencies — node:test + node:assert.
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DEBT_TYPE_VALUES,
  buildTape,
  compareYmd,
  monthsBetween,
  parseCsvRows,
  parseMoneyToCents,
  parseTape,
  parseYmd,
  isStateCode,
  normaliseDebtType,
  type TapeSpec,
} from "./tape.ts";

const ASOF = { y: 2026, m: 8, d: 26 };

function spec(over: Partial<TapeSpec> = {}): TapeSpec {
  return {
    label: "test-lot",
    columns: {
      id: "ACCT",
      balance: "BAL",
      state: "ST",
      lastPaymentDate: "LPD",
      chargeOffDate: "CODATE",
      debtType: "TYPE",
    },
    dateFormat: "YYYY-MM-DD",
    declaredFaceCents: 0,
    declaredAccountCount: 0,
    asOf: ASOF,
    ...over,
  };
}

const HEADER = "ACCT,BAL,ST,LPD,CODATE,TYPE";

test("money parses by string split, never through a float", () => {
  assert.equal(parseMoneyToCents("0.07"), 7);
  assert.equal(parseMoneyToCents("$1,234.56"), 123456);
  assert.equal(parseMoneyToCents("1234"), 123400);
  assert.equal(parseMoneyToCents("(12.34)"), -1234);
  // The float path: Number("1.005") * 100 === 100.49999999999999, so
  // Math.round gives 100 — a cent lost on every such row.
  assert.equal(Math.round(Number("1.005") * 100), 100);
  assert.equal(parseMoneyToCents("1.005"), null, "3dp is a format error, not a rounding chance");
});

test("every cent from $0.01 to $10.00 round-trips exactly", () => {
  for (let c = 1; c <= 1000; c++) {
    const dollars = (c / 100).toFixed(2);
    assert.equal(parseMoneyToCents(dollars), c, `failed at ${dollars}`);
  }
});

test("dates parse as calendar components, not via new Date", () => {
  assert.deepEqual(parseYmd("2020-03-01", "YYYY-MM-DD"), { y: 2020, m: 3, d: 1 });
  // new Date("2020-03-01") in a negative UTC offset is 29 Feb LOCAL, which
  // moves the SOL anniversary a day and can flip a boundary account.
  assert.equal(new Date("2020-03-01").getUTCDate(), 1);
  assert.deepEqual(parseYmd("03/01/2020", "MM/DD/YYYY"), { y: 2020, m: 3, d: 1 });
});

test("impossible calendar dates are rejected", () => {
  assert.equal(parseYmd("2021-02-29", "YYYY-MM-DD"), null, "2021 is not a leap year");
  assert.deepEqual(parseYmd("2020-02-29", "YYYY-MM-DD"), { y: 2020, m: 2, d: 29 });
  assert.equal(parseYmd("2020-02-30", "YYYY-MM-DD"), null);
  assert.equal(parseYmd("2020-13-01", "YYYY-MM-DD"), null);
  assert.equal(parseYmd("1900-02-29", "YYYY-MM-DD"), null, "1900 is not a leap year");
  assert.deepEqual(parseYmd("2000-02-29", "YYYY-MM-DD"), { y: 2000, m: 2, d: 29 });
});

test("date format is declared, never sniffed", () => {
  // 03/04/2020 is 4 March under one reading and 3 April under the other. The
  // parser must not choose.
  assert.deepEqual(parseYmd("03/04/2020", "MM/DD/YYYY"), { y: 2020, m: 3, d: 4 });
  assert.equal(parseYmd("03/04/2020", "YYYY-MM-DD"), null);
  assert.equal(parseYmd("13/01/2020", "MM/DD/YYYY"), null, "month 13 is malformed, not DD/MM");
});

test("month arithmetic is exact across month ends and leap years", () => {
  assert.equal(monthsBetween({ y: 2020, m: 1, d: 31 }, { y: 2023, m: 1, d: 30 }), 35);
  assert.equal(monthsBetween({ y: 2020, m: 1, d: 31 }, { y: 2023, m: 1, d: 31 }), 36);
  assert.equal(monthsBetween({ y: 2020, m: 1, d: 31 }, { y: 2023, m: 2, d: 1 }), 36);
  // The 29 February anchor. 28 Feb 2023 is the LAST day of that month, so the
  // three-year anniversary has arrived — the naive `to.d < from.d` form returns
  // 35 and reports the account `within` when it is at the bar. That error is
  // one-sided toward `within`, i.e. toward H3, which is the flattering
  // direction. Caught by adversarial review; this assertion previously
  // enshrined the bug under the title "exact across month ends".
  assert.equal(monthsBetween({ y: 2020, m: 2, d: 29 }, { y: 2023, m: 2, d: 28 }), 36);
  assert.equal(monthsBetween({ y: 2020, m: 2, d: 29 }, { y: 2023, m: 2, d: 27 }), 35);
  // A 31st anchor into a 30-day month clamps the same way.
  assert.equal(monthsBetween({ y: 2024, m: 3, d: 31 }, { y: 2024, m: 4, d: 30 }), 1);
  assert.equal(monthsBetween({ y: 2024, m: 3, d: 31 }, { y: 2024, m: 4, d: 29 }), 0);
});

test("a February 29 anchor does not read as within-SOL past the bar", () => {
  // The end-to-end consequence of the clamping bug, on the NY three-year clock.
  const leapAnchor = { y: 2020, m: 2, d: 29 };
  assert.equal(monthsBetween(leapAnchor, { y: 2023, m: 2, d: 28 }), 36, "at the bar");
  assert.equal(monthsBetween(leapAnchor, { y: 2023, m: 3, d: 1 }), 36, "past the bar");
  assert.equal(monthsBetween(leapAnchor, { y: 2023, m: 3, d: 29 }), 37);
});

test("compareYmd orders correctly", () => {
  assert.equal(compareYmd({ y: 2020, m: 1, d: 1 }, { y: 2020, m: 1, d: 2 }), -1);
  assert.equal(compareYmd({ y: 2020, m: 2, d: 1 }, { y: 2020, m: 1, d: 2 }), 1);
  assert.equal(compareYmd({ y: 2020, m: 1, d: 1 }, { y: 2020, m: 1, d: 1 }), 0);
});

test("a clean tape reconciles and produces a Tape", () => {
  const csv = [HEADER, "A1,100.00,TX,2024-01-15,2024-07-01,creditcard"].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
  assert.ok(r.tape, "tape should be non-null");
  assert.equal(r.tape!.faceCents, 10_000);
  assert.equal(r.reconciliation.ok, true);
});

test("an unreadable balance is rejected, and rejection makes the whole tape unbuyable", () => {
  const csv = [
    HEADER,
    "A1,100.00,TX,2024-01-15,2024-07-01,creditcard",
    "A2,NOT_A_NUMBER,TX,2024-01-15,2024-07-01,creditcard",
  ].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 20_000, declaredAccountCount: 2 }));
  // The row is NOT dropped into a smaller, cleaner tape.
  assert.equal(r.tape, null, "a tape you could not fully read is not underwritable");
  assert.equal(r.rejected.length, 1);
  assert.equal(r.rejected[0].reason, "malformed_balance");
  assert.equal(r.reconciliation.ok, false);
});

test("reconciliation is exact — a one-cent gap fails", () => {
  const csv = [HEADER, "A1,100.00,TX,2024-01-15,2024-07-01,creditcard"].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 10_001, declaredAccountCount: 1 }));
  assert.equal(r.tape, null);
  assert.equal(r.reconciliation.faceDeltaCents, 1);
  assert.equal(r.reconciliation.declaredFaceCents, 10_001);
  assert.equal(r.reconciliation.parsedFaceCents, 10_000);
});

test("a missing last-payment date is a defect, not a rejection — you still pay for the row", () => {
  const csv = [HEADER, "A1,100.00,TX,,2024-07-01,creditcard"].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
  assert.ok(r.tape);
  assert.equal(r.tape!.accountCount, 1, "the account still costs a validation notice");
  assert.equal(r.tape!.faceCents, 10_000);
  assert.equal(r.tape!.accounts[0].lastPaymentDate, null);
  assert.ok(r.tape!.accounts[0].defects.includes("missing_last_payment_date"));
  assert.equal(r.defectCounts.missing_last_payment_date, 1);
});

test("a ragged row is rejected, never padded", () => {
  // Padding would shift columns and read a balance out of the state column.
  const csv = [HEADER, "A1,100.00,TX"].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
  assert.equal(r.rejected[0].reason, "ragged_row");
  assert.equal(r.tape, null);
});

test("an id that looks like an SSN is refused", () => {
  for (const id of ["123-45-6789", "123456789"]) {
    const csv = [HEADER, `${id},100.00,TX,2024-01-15,2024-07-01,creditcard`].join("\n");
    const r = parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
    assert.equal(r.rejected[0]?.reason, "id_looks_like_ssn", `should refuse ${id}`);
  }
});

test("a mapped identity column throws before any row is read", () => {
  for (const col of ["SSN", "FIRST_NAME", "ADDRESS1", "PHONE", "EMAIL"]) {
    assert.throws(
      () => parseTape("x", spec({ columns: { balance: col, state: "ST", lastPaymentDate: "LPD" } })),
      /refusing to map column/,
      `should refuse ${col}`,
    );
  }
});

test("identity never reaches a TapeAccount even when present in the file", () => {
  const csv = [
    "ACCT,BAL,ST,LPD,CODATE,TYPE,SSN,FIRST_NAME,ADDRESS1,PHONE",
    "A1,100.00,TX,2024-01-15,2024-07-01,creditcard,123-45-6789,Jane Roe,12 Elm St,555-0100",
  ].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
  assert.ok(r.tape);
  const dump = JSON.stringify(r.tape!.accounts);
  for (const pii of ["123-45-6789", "Jane", "Roe", "Elm", "555-0100"]) {
    assert.equal(dump.includes(pii), false, `${pii} leaked into TapeAccount`);
  }
});

test("an unrecognised debt type becomes unknown, never credit_card", () => {
  const csv = [HEADER, "A1,100.00,TX,2024-01-15,2024-07-01,WIDGETS"].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
  assert.equal(r.tape!.accounts[0].debtType, "unknown");
  assert.ok(r.tape!.accounts[0].defects.includes("unrecognised_debt_type"));
});

test("a spec with neither debtType column nor default is refused", () => {
  assert.throws(
    () =>
      parseTape(
        "BAL,ST,LPD\n1,TX,2024-01-01",
        spec({ columns: { balance: "BAL", state: "ST", lastPaymentDate: "LPD" } }),
      ),
    /defaultDebtType/,
  );
});

test("a non-positive balance is rejected, not zeroed", () => {
  for (const bal of ["0.00", "(50.00)"]) {
    const csv = [HEADER, `A1,${bal},TX,2024-01-15,2024-07-01,creditcard`].join("\n");
    const r = parseTape(csv, spec({ declaredFaceCents: 0, declaredAccountCount: 0 }));
    assert.equal(r.rejected[0]?.reason, "non_positive_balance", `should reject ${bal}`);
  }
});

test("an unrecognised state is rejected — SOL cannot be assessed without it", () => {
  const csv = [HEADER, "A1,100.00,ZZ,2024-01-15,2024-07-01,creditcard"].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
  assert.equal(r.rejected[0].reason, "unrecognised_state");
});

test("a header-only file is not a free tape", () => {
  const r = parseTape(HEADER, spec({ declaredFaceCents: 0, declaredAccountCount: 0 }));
  assert.ok(r.tape);
  assert.equal(r.tape!.accountCount, 0);
  assert.equal(r.tape!.faceCents, 0);
});

test("csv handles quotes, embedded commas and CRLF", () => {
  const { header, rows } = parseCsvRows('A,B\r\n"x,y",2\r\n"he said ""hi""",3\r\n');
  assert.deepEqual(header, ["A", "B"]);
  assert.deepEqual(rows[0], ["x,y", "2"]);
  assert.deepEqual(rows[1], ['he said "hi"', "3"]);
});

test("buildTape recomputes totals and ignores any passed-in total", () => {
  const t = buildTape(
    [
      { id: "1", balanceCents: 100, state: "TX", debtType: "credit_card", lastPaymentDate: null, chargeOffDate: null, defects: [] },
      { id: "2", balanceCents: 250, state: "TX", debtType: "credit_card", lastPaymentDate: null, chargeOffDate: null, defects: [] },
    ],
    { label: "t", asOf: ASOF },
  );
  assert.equal(t.faceCents, 350);
  assert.equal(t.accountCount, 2);
});

test("no floats leak from a parsed tape", () => {
  const csv = [
    HEADER,
    "A1,1234.56,TX,2024-01-15,2024-07-01,creditcard",
    "A2,0.01,NY,2020-03-01,2020-09-01,medical",
  ].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 123_457, declaredAccountCount: 2 }));
  assert.ok(r.tape);
  assert.ok(Number.isInteger(r.tape!.faceCents));
  for (const a of r.tape!.accounts) assert.ok(Number.isInteger(a.balanceCents));
});

// ---------------------------------------------------------------------------
// Regressions from adversarial review, 26 Aug 2026. Each of these passed before
// the fix; several flattered the tape.

test("a mapped column that is absent from the header throws, for EVERY column", () => {
  // The critical one. `idx()` returned -1 for both "not requested" and
  // "requested but missing", and the two took different branches: a typo'd
  // debtType column silently fell through to defaultDebtType, so a tape of
  // unclassifiable paper reported ZERO defects and every account borrowed the
  // default's limitations period — turning a DECLINE into a CLEARS.
  const csv = ["ACCT,BAL,ST,LPD,ACCT_TYPE", "A1,100.00,TX,01/15/2024,WIDGETS"].join("\n");
  const base = spec({
    dateFormat: "MM/DD/YYYY",
    declaredFaceCents: 10_000,
    declaredAccountCount: 1,
    defaultDebtType: "credit_card",
  });
  for (const [field, bad] of [
    ["debtType", "TYPE"],
    ["chargeOffDate", "CODATE"],
    ["id", "ACCOUNT"],
    ["balance", "BALANCE"],
  ] as const) {
    const columns = {
      id: "ACCT",
      balance: "BAL",
      state: "ST",
      lastPaymentDate: "LPD",
      debtType: "ACCT_TYPE",
      [field]: bad,
    } as TapeSpec["columns"];
    assert.throws(
      () => parseTape(csv, { ...base, columns }),
      /is not in the header/,
      `a typo'd ${field} column must throw`,
    );
  }
});

test("a typo'd debtType column can no longer borrow the default's SOL period", () => {
  const csv = ["ACCT,BAL,ST,LPD,ACCT_TYPE", "A1,100.00,TX,01/15/2024,WIDGETS"].join("\n");
  const correct = parseTape(csv, spec({
    columns: { id: "ACCT", balance: "BAL", state: "ST", lastPaymentDate: "LPD", debtType: "ACCT_TYPE" },
    dateFormat: "MM/DD/YYYY",
    declaredFaceCents: 10_000,
    declaredAccountCount: 1,
    defaultDebtType: "credit_card",
  }));
  // Mapped correctly, the row is unclassifiable and says so.
  assert.equal(correct.tape!.accounts[0].debtType, "unknown");
  assert.equal(correct.defectCounts.unrecognised_debt_type, 1);
});

test("an invalid defaultDebtType is refused rather than reaching sol.ts", () => {
  // It used to escape the type system into stored data: debtType could be
  // `undefined` on a RECONCILED tape, and assessSol then threw an opaque
  // TypeError from inside limitYearsFor.
  assert.throws(
    () =>
      parseTape("BAL,ST,LPD\n1.00,TX,2024-01-15", spec({
        columns: { balance: "BAL", state: "ST", lastPaymentDate: "LPD" },
        defaultDebtType: "creditcard" as never,
      })),
    /is not a DebtType/,
  );
});

test("undelimited identity column names are refused", () => {
  // /(^|[^a-z])name([^a-z]|$)/i does not match an uppercase letter under /i, so
  // FIRST_NAME was refused while FIRSTNAME and LASTNAME sailed through — and a
  // surname ended up inside the type whose contract is that it cannot hold one.
  for (const col of ["FIRSTNAME", "LASTNAME", "SURNAME", "CUSTOMERNAME", "DEBTORNAME", "NAME"]) {
    assert.throws(
      () => parseTape("x", spec({ columns: { balance: col, state: "ST", lastPaymentDate: "LPD" } })),
      /refusing to map column/,
      `should refuse ${col}`,
    );
  }
});

test("a blank data row is rejected, not erased, and rowNumber stays true to the file", () => {
  // parseCsvRows filtered all-empty rows, so a row present in the file produced
  // neither an account nor a RejectedRow — and every subsequent rowNumber
  // shifted, pointing a human at the wrong line.
  const csv = [HEADER, "A1,100.00,TX,2024-01-15,2024-07-01,creditcard", ",,,,,", "A3,BAD,TX,2024-01-15,2024-07-01,creditcard"].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
  assert.equal(r.rejected.length, 2, "the blank row must be accounted for");
  assert.equal(r.rejected[0].rowNumber, 2, "blank row is file data-row 2");
  assert.equal(r.rejected[1].rowNumber, 3, "the malformed row is data-row 3, not 2");
  assert.equal(r.tape, null);
});

test("every reject reason is distinguishable", () => {
  const cases: Array<[string, string]> = [
    ["A1,,TX,2024-01-15,2024-07-01,creditcard", "missing_balance"],
    ["A1,BAD,TX,2024-01-15,2024-07-01,creditcard", "malformed_balance"],
    ["A1,0.00,TX,2024-01-15,2024-07-01,creditcard", "non_positive_balance"],
    ["A1,100.00,,2024-01-15,2024-07-01,creditcard", "missing_state"],
    ["A1,100.00,ZZ,2024-01-15,2024-07-01,creditcard", "unrecognised_state"],
    ["A1,100.00,TX", "ragged_row"],
  ];
  for (const [row, reason] of cases) {
    const r = parseTape([HEADER, row].join("\n"), spec());
    assert.equal(r.rejected[0]?.reason, reason, `row "${row}" should be ${reason}`);
  }
});

test("every date defect is distinguishable", () => {
  const cases: Array<[string, string]> = [
    ["A1,100.00,TX,,2024-07-01,creditcard", "missing_last_payment_date"],
    ["A1,100.00,TX,NOPE,2024-07-01,creditcard", "malformed_last_payment_date"],
    ["A1,100.00,TX,2024-01-15,,creditcard", "missing_charge_off_date"],
    ["A1,100.00,TX,2024-01-15,NOPE,creditcard", "malformed_charge_off_date"],
    ["A1,100.00,TX,2024-08-01,2024-07-01,creditcard", "last_payment_after_charge_off"],
  ];
  for (const [row, defect] of cases) {
    const r = parseTape([HEADER, row].join("\n"), spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
    assert.ok(r.tape, `row "${row}" should still be accepted`);
    assert.ok(
      r.tape!.accounts[0].defects.includes(defect as never),
      `row "${row}" should carry ${defect}, got [${r.tape!.accounts[0].defects.join(",")}]`,
    );
  }
});

test("a BOM never reaches the header token", () => {
  // The previous version asserted an id from a data row that had no BOM, and
  // passed with the strip removed — String.prototype.trim() already removes
  // U+FEFF, so column MATCHING survives a BOM either way. What the strip
  // actually guarantees is that the raw header token is clean, which is what
  // the "not in the header" error message prints back to a human.
  const withBom = parseCsvRows("﻿" + HEADER + "\nA1,1.00,TX,2024-01-15,,creditcard");
  const without = parseCsvRows(HEADER + "\nA1,1.00,TX,2024-01-15,,creditcard");
  assert.equal(withBom.header[0], "ACCT");
  assert.equal(withBom.header[0].charCodeAt(0), 65, "leading char must be 'A', not U+FEFF");
  assert.deepEqual(withBom.header, without.header, "a BOM must not change the header at all");
});

test("trailing blank lines are an artifact; interior blank lines are a row", () => {
  // The distinction matters in opposite directions. Dropping an INTERIOR blank
  // erases a line that was in the file and shifts every later rowNumber.
  // Refusing a tape over a TRAILING newline is a false positive on a file whose
  // only fault is a stray "\n". Stripping from the end cannot shift an earlier
  // rowNumber, so both can be true at once.
  const trailing = parseCsvRows("A,B\n1,2\n\n");
  assert.deepEqual(trailing.rows, [["1", "2"]], "a trailing blank line is not a row");

  const interior = parseCsvRows("A,B\n1,2\n\n3,4\n");
  assert.equal(interior.rows.length, 3, "an interior blank line IS a row");
  assert.deepEqual(interior.rows[1], [""]);

  // A trailing line with separators in it is not blank — somebody wrote
  // something — so it survives and gets rejected like any other malformed row.
  const commas = parseCsvRows("A,B\n1,2\n,,\n");
  assert.deepEqual(commas.rows[1], ["", "", ""]);

  // End to end: a tape whose only fault is a trailing newline still reconciles.
  const csv = [HEADER, "A1,100.00,TX,2024-01-15,2024-07-01,creditcard", "", ""].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
  assert.ok(r.tape, "a trailing newline must not cost you the tape");
  assert.equal(r.rejected.length, 0);
});

test("a tape listing the same account twice does not reconcile", () => {
  // It used to reconcile PERFECTLY: the seller's declared totals are computed
  // from the same duplicated file, so face and count both matched. Every
  // duplicated row is face paid for and uncollectable, plus a second validation
  // notice on one debt — inflated face at the same price per dollar.
  const csv = [
    HEADER,
    "A1,5000.00,TX,2024-01-15,2024-07-01,creditcard",
    "A1,5000.00,TX,2024-01-15,2024-07-01,creditcard",
    "A2,100.00,TX,2024-01-15,2024-07-01,creditcard",
  ].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 1_010_000, declaredAccountCount: 3 }));
  assert.equal(r.reconciliation.duplicateIdCount, 1);
  assert.equal(r.reconciliation.faceDeltaCents, 0, "face matched — that is the trap");
  assert.equal(r.reconciliation.accountDelta, 0, "count matched too");
  assert.equal(r.reconciliation.ok, false, "and it must still be refused");
  assert.equal(r.tape, null);
});

test("distinct ids on identical-looking rows still reconcile", () => {
  // Two accounts with the same balance and dates are ordinary. Only a repeated
  // ID is the duplicate-sale signal.
  const csv = [
    HEADER,
    "A1,5000.00,TX,2024-01-15,2024-07-01,creditcard",
    "A2,5000.00,TX,2024-01-15,2024-07-01,creditcard",
  ].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 1_000_000, declaredAccountCount: 2 }));
  assert.equal(r.reconciliation.duplicateIdCount, 0);
  assert.ok(r.tape);
});

test("rows with no id column get distinct synthesised ids", () => {
  // Otherwise every row would collide and the duplicate check would refuse
  // every tape that omits an id column.
  const csv = [
    "BAL,ST,LPD",
    "100.00,TX,2024-01-15",
    "100.00,TX,2024-01-15",
  ].join("\n");
  const r = parseTape(csv, spec({
    columns: { balance: "BAL", state: "ST", lastPaymentDate: "LPD" },
    defaultDebtType: "credit_card",
    declaredFaceCents: 20_000,
    declaredAccountCount: 2,
  }));
  assert.equal(r.reconciliation.duplicateIdCount, 0);
  assert.ok(r.tape, "a tape without an id column must still be usable");
  assert.deepEqual(r.tape!.accounts.map((a) => a.id), ["row:1", "row:2"]);
});

test("the trailing/interior blank boundary holds when both appear", () => {
  // An interior blank followed by trailing blanks: the interior one must
  // survive at its true position while the trailing ones are stripped.
  assert.deepEqual(
    parseCsvRows("A,B\n1,2\n\n3,4\n\n\n").rows,
    [["1", "2"], [""], ["3", "4"]],
  );
  // A blank between the header and the first data row is interior — there is
  // data after it — so it counts.
  assert.deepEqual(parseCsvRows("A,B\n\n1,2\n\n").rows, [[""], ["1", "2"]]);
  // Nothing but blanks after the header is all trailing.
  assert.deepEqual(parseCsvRows("A,B\n\n\n\n").rows, []);
  assert.deepEqual(parseCsvRows("A,B").rows, []);
  // A file of only blank lines has no header at all.
  assert.deepEqual(parseCsvRows("\n\n\n"), { header: [], rows: [] });
});

test("a trailing whitespace-only line is an artifact too", () => {
  // "   \n" at EOF failed the `=== ""` check and refused the whole tape as
  // ragged_row — the same false positive the trailing-blank rule removes, over
  // characters a human cannot see.
  assert.deepEqual(parseCsvRows("A,B\n1,2\n   \n").rows, [["1", "2"]]);
  assert.deepEqual(parseCsvRows("A,B\n1,2\n\t\n").rows, [["1", "2"]]);
  // But an interior whitespace-only line is still a row.
  assert.equal(parseCsvRows("A,B\n1,2\n   \n3,4\n").rows.length, 3);
});

test("a declared account count that disagrees fails even when face matches", () => {
  // Only the FACE mismatch was tested; the count check had zero coverage.
  const csv = [
    HEADER,
    "A1,60.00,TX,2024-01-15,2024-07-01,creditcard",
    "A2,40.00,TX,2024-01-15,2024-07-01,creditcard",
  ].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 3 }));
  assert.equal(r.reconciliation.faceDeltaCents, 0, "face agrees");
  assert.equal(r.reconciliation.accountDelta, 1, "count does not");
  assert.equal(r.reconciliation.ok, false);
  assert.equal(r.tape, null);
});

test("a row with MORE fields than the header is ragged, not truncated", () => {
  const csv = [HEADER, "A1,100.00,TX,2024-01-15,2024-07-01,creditcard,EXTRA"].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
  assert.equal(r.rejected[0].reason, "ragged_row");
});

test("a trailing summary line is rejected, not silently absorbed", () => {
  // Real tapes sometimes end with a TOTAL row. It is not blank, so it survives
  // the trailing-blank strip and must fall out as ragged.
  const csv = [HEADER, "A1,100.00,TX,2024-01-15,2024-07-01,creditcard", "TOTAL"].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
  assert.equal(r.rejected[0].reason, "ragged_row");
  assert.equal(r.tape, null);
});

test("hyphen-minus negatives are rejected like the accounting form", () => {
  // Only the "(50.00)" form was covered.
  assert.equal(parseMoneyToCents("-50.00"), -5_000);
  const csv = [HEADER, "A1,-50.00,TX,2024-01-15,2024-07-01,creditcard"].join("\n");
  const r = parseTape(csv, spec());
  assert.equal(r.rejected[0].reason, "non_positive_balance");
});

test("a balance beyond safe integer precision is refused, not silently rounded", () => {
  assert.equal(parseMoneyToCents("99999999999999999.99"), null);
  assert.equal(parseMoneyToCents("90071992547409.91"), 9_007_199_254_740_991);
  assert.equal(parseMoneyToCents("90071992547409.92"), null);
});

test("partial id coverage does not count as a completed duplicate check", () => {
  // One row of four carried an id and the check reported "checked" — three
  // quarters of the tape went unexamined while the flag said otherwise. Partial
  // coverage reported as full is the same masquerade the flag exists to stop.
  const csv = [
    HEADER,
    "A1,100.00,TX,2024-01-15,2024-07-01,creditcard",
    ",100.00,TX,2024-01-15,2024-07-01,creditcard",
    ",100.00,TX,2024-01-15,2024-07-01,creditcard",
    ",100.00,TX,2024-01-15,2024-07-01,creditcard",
  ].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 40_000, declaredAccountCount: 4 }));
  assert.equal(r.reconciliation.accountsWithoutId, 3);
  assert.equal(r.reconciliation.duplicateIdsChecked, false);

  // Full coverage does count.
  const full = [
    HEADER,
    "A1,100.00,TX,2024-01-15,2024-07-01,creditcard",
    "A2,100.00,TX,2024-01-15,2024-07-01,creditcard",
  ].join("\n");
  const rf = parseTape(full, spec({ declaredFaceCents: 20_000, declaredAccountCount: 2 }));
  assert.equal(rf.reconciliation.accountsWithoutId, 0);
  assert.equal(rf.reconciliation.duplicateIdsChecked, true);
});

test("ids differing only in case or surrounding whitespace are duplicates", () => {
  // Errs toward refusing a tape rather than buying phantom face: no real tape
  // distinguishes two accounts by the case of an identifier.
  for (const second of ["a1", " A1 ", "A1  "]) {
    const csv = [
      HEADER,
      "A1,100.00,TX,2024-01-15,2024-07-01,creditcard",
      `${second},100.00,TX,2024-01-15,2024-07-01,creditcard`,
    ].join("\n");
    const r = parseTape(csv, spec({ declaredFaceCents: 20_000, declaredAccountCount: 2 }));
    assert.equal(r.reconciliation.duplicateIdCount, 1, `"${second}" should duplicate "A1"`);
    assert.equal(r.reconciliation.ok, false);
  }
});

test("a duplicated header name is refused, not resolved to the first match", () => {
  // findIndex silently took the first. A tape carrying two BAL columns —
  // 100.00 and 999999.00 — parsed as $100.00 with no complaint, and the two
  // readings differ by four orders of magnitude. Which is authoritative is a
  // question for the seller.
  const csv = [
    "ACCT,BAL,ST,LPD,CODATE,TYPE,BAL",
    "A1,100.00,TX,2024-01-15,2024-07-01,creditcard,999999.00",
  ].join("\n");
  assert.throws(
    () => parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 })),
    /appears 2 times in the header/,
  );
  // An UNMAPPED duplicate is harmless — the parser never reads it.
  const unmapped = [
    "ACCT,BAL,ST,LPD,CODATE,TYPE,NOTE,NOTE",
    "A1,100.00,TX,2024-01-15,2024-07-01,creditcard,x,y",
  ].join("\n");
  const r = parseTape(unmapped, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
  assert.ok(r.tape, "only MAPPED columns need to be unambiguous");
});

test("quoted and padded header names still resolve", () => {
  // The duplicate check must not break ordinary header shapes.
  for (const header of [
    '"ACCT","BAL","ST","LPD","CODATE","TYPE"',
    " ACCT , BAL , ST , LPD , CODATE , TYPE ",
  ]) {
    const csv = [header, "A1,100.00,TX,2024-01-15,2024-07-01,creditcard"].join("\n");
    const r = parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
    assert.ok(r.tape, `header "${header}" should resolve`);
    assert.equal(r.tape!.accounts[0].balanceCents, 10_000);
  }
});

test("debt-type lookup cannot reach the prototype chain", () => {
  // DEBT_TYPES was an object literal, so a cell of "constructor" survived the
  // [^a-z] strip and returned Object's constructor — a Function, which is
  // truthy, so `?? "unknown"` never fired. The account then carried a Function
  // as its debtType: JSON.stringify dropped the field, the tape reconciled with
  // ZERO defects and reported "clears", and limitYearsFor threw an opaque
  // TypeError under --hypothesis. Verified by hand at the time but never
  // pinned, so both the Map and the DEBT_TYPE_VALUES guard were untested.
  for (const attack of [
    "constructor",
    "__proto__",
    "toString",
    "valueOf",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "toLocaleString",
  ]) {
    const got = normaliseDebtType(attack);
    assert.equal(got, "unknown", `${attack} must not resolve to anything`);
    assert.equal(typeof got, "string", `${attack} returned a ${typeof got}`);
    assert.ok(DEBT_TYPE_VALUES.has(got), `${attack} produced a non-DebtType`);
  }
  // Real mappings still work.
  assert.equal(normaliseDebtType("creditcard"), "credit_card");
  assert.equal(normaliseDebtType("  MEDICAL "), "medical");
});

test("a prototype-named debt type reaches the account as a defect, not a Function", () => {
  const csv = [HEADER, "A1,100.00,TX,2024-01-15,2024-07-01,constructor"].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 10_000, declaredAccountCount: 1 }));
  assert.ok(r.tape);
  const a = r.tape!.accounts[0];
  assert.equal(a.debtType, "unknown");
  assert.equal(typeof a.debtType, "string");
  assert.ok(a.defects.includes("unrecognised_debt_type"), "and it must be reported");
  // The field survives serialisation — a Function would vanish silently.
  assert.match(JSON.stringify(a), /"debtType":"unknown"/);
});

test("a slot-appropriate column name is not refused as identity", () => {
  // /addr/ refused ADDR_STATE — the natural seller header for the state, and
  // this module's own doc says state IS "the two-letter code from the address
  // column". /name/ refused PRODUCT_NAME the same way. Both were hard blocks on
  // realistic files with no workaround short of editing the seller's CSV.
  for (const cols of [
    { balance: "BAL", state: "ADDR_STATE", lastPaymentDate: "LPD" },
    { balance: "BAL", state: "ADDRESS_STATE", lastPaymentDate: "LPD" },
    { balance: "BAL", state: "ST", lastPaymentDate: "LPD", debtType: "PRODUCT_NAME" },
    { balance: "PRINCIPAL_AMOUNT", state: "ST", lastPaymentDate: "LPD" },
  ]) {
    // Header must actually contain the mapped columns, or the run fails on the
    // header check and proves nothing about the refusal rule.
    const header = Object.values(cols).join(",");
    const row = Object.keys(cols)
      .map((k) => (k === "balance" ? "100.00" : k === "state" ? "TX" : "2024-01-15"))
      .join(",");
    const r = parseTape(
      [header, row].join("\n"),
      spec({
        columns: cols as never,
        defaultDebtType: "credit_card",
        declaredFaceCents: 10_000,
        declaredAccountCount: 1,
      }),
    );
    assert.ok(r.tape, `${JSON.stringify(cols)} is a legitimate mapping`);
  }
  // The guard still holds where the column really is identity.
  for (const cols of [
    { balance: "BAL", state: "MAILING_ADDRESS", lastPaymentDate: "LPD" },
    { balance: "BAL", state: "ST", lastPaymentDate: "LPD", id: "SSN" },
    { balance: "BAL", state: "ST", lastPaymentDate: "LPD", id: "CUSTOMER_NAME" },
    { balance: "PHONE", state: "ST", lastPaymentDate: "LPD" },
  ]) {
    assert.throws(
      () =>
        parseTape(
          Object.values(cols).join(",") + "\n",
          spec({ columns: cols as never, defaultDebtType: "credit_card" }),
        ),
      /refusing to map column/,
      `${JSON.stringify(cols)} must stay refused`,
    );
  }
});

test("a DECIMAL(x,4) money export is read, a real sub-cent value is not", () => {
  // 1500.0000 is how a SQL/warehouse export writes $1500.00. Rejecting it
  // failed every row and made the whole tape unbuyable.
  assert.equal(parseMoneyToCents("1500.0000"), 150_000);
  assert.equal(parseMoneyToCents("0.1000"), 10);
  assert.equal(parseMoneyToCents("1500.00000000"), 150_000);
  // But a genuine sub-cent value is still a format error, not a rounding chance.
  assert.equal(parseMoneyToCents("1500.0050"), null);
  assert.equal(parseMoneyToCents("1.005"), null);
  assert.equal(parseMoneyToCents("1500.000001"), null);

  const csv = [HEADER, "A1,1500.0000,TX,2024-01-15,2024-07-01,creditcard"].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 150_000, declaredAccountCount: 1 }));
  assert.ok(r.tape, "a 4-decimal export must not refuse the tape");
});

test("territory accounts parse and then fail closed at the SOL layer", () => {
  // A single PR/VI/GU account made the WHOLE tape unbuyable at the parser.
  // They have no SOL rule, so "unknown" — unbuyable under both hypotheses — is
  // the correct place to fail, and it does not cost the rest of the file.
  for (const st of ["PR", "VI", "GU", "AS", "MP"]) {
    assert.equal(isStateCode(st), true, `${st} is a real jurisdiction`);
  }
  const csv = [
    HEADER,
    "A1,100.00,PR,2024-01-15,2024-07-01,creditcard",
    "A2,100.00,TX,2024-01-15,2024-07-01,creditcard",
  ].join("\n");
  const r = parseTape(csv, spec({ declaredFaceCents: 20_000, declaredAccountCount: 2 }));
  assert.ok(r.tape, "a territory account must not refuse the tape");
  assert.equal(r.tape!.accounts[0].state, "PR");
  assert.equal(isStateCode("ZZ"), false, "and a non-jurisdiction is still refused");
});

test("the identity-refusal exemptions are narrow: pattern AND slot AND evidence", () => {
  // A first attempt exempted any PII pattern whenever the column matched a
  // generic hint for its slot. Far too permissive: the id hint matched "_ID",
  // so id=TAX_ID was ALLOWED, and id=ACCOUNT_SSN slipped through on "account".
  // Both put real identity into the record this module exists to keep it out of.
  const check = (slot: string, col: string) => {
    const cols: Record<string, string> = { balance: "BAL", state: "ST", lastPaymentDate: "LPD" };
    cols[slot] = col;
    try {
      parseTape(Object.values(cols).join(",") + "\n", spec({
        columns: cols as never,
        defaultDebtType: "credit_card",
      }));
      return "allowed";
    } catch (e) {
      return /refusing to map column/.test((e as Error).message) ? "refused" : "allowed";
    }
  };

  // ssn / social / tax-id / phone / email have NO exemption for ANY slot.
  for (const [slot, col] of [
    ["id", "TAX_ID"], ["id", "ACCOUNT_SSN"], ["id", "SSN"], ["id", "SSN_LAST4"],
    ["id", "SOCIAL_SECURITY"], ["id", "EMAIL_ADDRESS"], ["id", "HOME_PHONE"],
    ["id", "CUSTOMER_NAME"], ["balance", "PHONE"], ["balance", "EMAIL"],
    ["lastPaymentDate", "SSN"], ["debtType", "LAST_NAME"],
  ] as const) {
    assert.equal(check(slot, col), "refused", `${slot}=${col} must stay refused`);
  }

  // An exemption needs POSITIVE evidence the column is that slot's own field.
  assert.equal(check("state", "ADDR_STATE"), "allowed");
  assert.equal(check("state", "DEBTOR_ADDR_STATE"), "allowed");
  assert.equal(check("state", "MAILING_ADDRESS"), "refused", "that is an address, not a state");
  assert.equal(check("debtType", "PRODUCT_NAME"), "allowed");
  assert.equal(check("debtType", "PRODUCT_TYPE"), "allowed");

  // And an exemption is slot-specific: /addr/ is forgiven for state, not for id.
  assert.equal(check("id", "ADDR_STATE"), "refused", "exemptions do not transfer between slots");
});

test("date-of-birth, licence, tax and phone aliases are all refused", () => {
  // REFUSED_COLUMN_PATTERNS covered ssn/social/tax-id/name/addr/phone/email and
  // nothing else, so DOB, DATE_OF_BIRTH, DL_NUMBER, EIN, TIN, PASSPORT, MOBILE,
  // CELL and E_MAIL were all mappable into scoring slots. Mapping DOB as
  // lastPaymentDate would anchor the statute of limitations on a birth date —
  // a correctness disaster as well as a privacy one.
  const check = (slot: string, col: string) => {
    const cols: Record<string, string> = { balance: "BAL", state: "ST", lastPaymentDate: "LPD" };
    cols[slot] = col;
    try {
      parseTape(Object.values(cols).join(",") + "\n", spec({
        columns: cols as never,
        defaultDebtType: "credit_card",
      }));
      return "allowed";
    } catch (e) {
      return /refusing to map column/.test((e as Error).message) ? "refused" : "allowed";
    }
  };
  for (const [slot, col] of [
    ["lastPaymentDate", "DOB"], ["lastPaymentDate", "DATE_OF_BIRTH"],
    ["lastPaymentDate", "BIRTH_DATE"], ["lastPaymentDate", "BIRTHDATE"],
    ["id", "DL_NUMBER"], ["id", "DRIVERS_LICENSE"], ["id", "LICENSE_NO"],
    ["id", "EIN"], ["id", "TIN"], ["id", "ITIN"], ["id", "PASSPORT"],
    ["id", "MOBILE"], ["id", "CELL"], ["id", "E_MAIL"], ["id", "E-MAIL"],
  ] as const) {
    assert.equal(check(slot, col), "refused", `${slot}=${col} is identity`);
  }
  // The widened patterns must not catch ordinary seller headers.
  for (const [slot, col] of [
    ["balance", "CURRENT_BALANCE"], ["balance", "PRINCIPAL_AMOUNT"], ["balance", "FACE_AMT"],
    ["state", "ADDR_STATE"], ["state", "DEBTOR_STATE"], ["id", "ACCT_NO"],
    ["id", "ACCOUNT_NUMBER"], ["id", "LOAN_ID"], ["lastPaymentDate", "LAST_PAY_DT"],
    ["lastPaymentDate", "LAST_PAYMENT_DATE"], ["chargeOffDate", "CHARGE_OFF_DATE"],
    ["chargeOffDate", "CO_DT"], ["debtType", "PRODUCT_TYPE"], ["debtType", "PRODUCT_NAME"],
  ] as const) {
    assert.equal(check(slot, col), "allowed", `${slot}=${col} is a legitimate header`);
  }
});

test("every category of identity a real tape carries is refused", () => {
  // The pattern list was written by hand and was twice found incomplete. This
  // enumerates what a debt tape actually carries, by category, so the next gap
  // is a test failure rather than a discovery.
  //
  // The protected-class group is the one that matters most: 12 CFR 1002.2(m)
  // defines a "credit transaction" to include COLLECTION PROCEDURES, so ECOA
  // reaches how this paper is worked. Nine of those eleven were mappable into a
  // scoring slot — a per-account model reading GENDER or RACE is exactly the
  // disparate-impact exposure registered as U11.
  const check = (col: string) => {
    const cols = { balance: "BAL", state: "ST", lastPaymentDate: "LPD", id: col };
    try {
      parseTape(Object.values(cols).join(",") + "\n", spec({
        columns: cols as never,
        defaultDebtType: "credit_card",
      }));
      return "allowed";
    } catch (e) {
      return /refusing to map column/.test((e as Error).message) ? "refused" : "allowed";
    }
  };

  const PII: Record<string, string[]> = {
    names: ["FIRST_NAME", "LAST_NAME", "MIDDLE_INITIAL", "SUFFIX", "MAIDEN_NAME", "ALIAS", "AKA", "NICKNAME"],
    government: ["SSN", "TIN", "EIN", "ITIN", "TAX_ID", "DL_NUMBER", "PASSPORT", "MEDICARE_ID", "MEDICAID_ID"],
    contact: ["PHONE", "HOME_PHONE", "WORK_PHONE", "MOBILE", "CELL", "EMAIL", "E_MAIL", "FAX", "FAX_NUMBER"],
    address: ["ADDRESS1", "ADDR", "STREET", "STREET_ADDRESS", "CITY", "ZIP", "ZIPCODE", "POSTAL_CODE"],
    protectedClass: ["DOB", "DATE_OF_BIRTH", "AGE", "GENDER", "SEX", "RACE", "ETHNICITY", "MARITAL_STATUS", "NATIONAL_ORIGIN", "RELIGION", "DISABILITY"],
    employment: ["EMPLOYER", "EMPLOYER_NAME", "OCCUPATION", "ANNUAL_INCOME", "SALARY"],
    banking: ["BANK_ACCOUNT", "ROUTING_NUMBER", "CARD_NUMBER", "IBAN"],
  };
  for (const [group, cols] of Object.entries(PII)) {
    for (const col of cols) {
      assert.equal(check(col), "refused", `${group}: ${col} must never be mappable`);
    }
  }

  // And the widening must not catch what a seller legitimately sends.
  for (const col of ["ACCT_NO", "ACCOUNT_NUMBER", "LOAN_ID", "PORTFOLIO_ID", "BATCH_NO", "SELLER_REF"]) {
    assert.equal(check(col), "allowed", `${col} is a legitimate id column`);
  }
  // ORIGINAL_CREDITOR is a bank name, not an account identifier — using it as
  // the id would give every row the same id and manufacture false duplicates.
  assert.equal(check("ORIGINAL_CREDITOR"), "refused");
});

test("a headerless tape never has its contents echoed", () => {
  // A seller sending data with no header row is an ordinary artifact. idx()
  // interpolated the whole header row into its error, so on such a file — where
  // row 1 IS an account — a mapping mistake printed a consumer's name, SSN and
  // phone to stderr, into scrollback and CI logs. It defeated this module's
  // entire contract, and the earlier no-echo test could not catch it because it
  // supplied a well-formed header.
  // A REALISTIC layout — first,last,address,city,state,zip,ssn,acct,bal,date.
  // The earlier fixture was too easy: most of its cells were numeric, so a
  // majority-redacted heuristic tripped. Here only zip/SSN/balance/date look
  // like data, and "Jane", "Roe", "12 Elm St" and "Austin" printed, because a
  // name and a street address look exactly like column headers.
  const headerless = [
    "Jane,Roe,12 Elm St,Austin,TX,78701,123-45-6789,ACC-1001,1500.00,01/15/2024",
    "John,Doe,44 Oak Ave,Dallas,TX,75201,987-65-4321,ACC-1002,2500.00,02/20/2024",
  ].join("\n");
  let msg = "";
  try {
    parseTape(headerless, spec({ defaultDebtType: "credit_card" }));
  } catch (e) {
    msg = (e as Error).message;
  }
  assert.ok(msg.length > 0, "a headerless tape must not parse silently");
  for (const leaked of ["Jane", "Roe", "12 Elm St", "Austin", "123-45-6789", "78701", "ACC-1001"]) {
    assert.equal(msg.includes(leaked), false, `${leaked} was echoed`);
  }
  // Per-cell shape cannot decide this. The usable signal is whether ANY mapped
  // column was actually found: a real header matches at least one of the three
  // required ones. None matched here, so the row is unconfirmed and withheld.
  assert.match(msg, /all withheld/);
  assert.match(msg, /needed to confirm it is a header/);

  // A genuine header is still named, or the error is useless.
  let real = "";
  try {
    parseTape([HEADER, "A1,1.00,TX,2024-01-15,2024-07-01,creditcard"].join("\n"),
      // Must PASS the slot allow-list so it reaches the header check.
      spec({ columns: { balance: "MISSING_AMOUNT", state: "ST", lastPaymentDate: "LPD" } as never, defaultDebtType: "credit_card" }));
  } catch (e) {
    real = (e as Error).message;
  }
  assert.match(real, /\bBAL\b/, "a real header must still be listed");
  assert.match(real, /matched \d+ of \d+ mapped/, "and say how much of the spec it recognised");
});

test("a column must positively look like the slot it is mapped to", () => {
  // The deny-list enumerates an open vocabulary and was twice found incomplete.
  // With six slots of known shape the closed form is the other direction: BOTH
  // look like the slot AND not look like identity.
  const chk = (slot: string, col: string) => {
    const cols: Record<string, string> = { balance: "BAL", state: "ST", lastPaymentDate: "LPD" };
    cols[slot] = col;
    try {
      parseTape(Object.values(cols).join(",") + "\n", spec({ columns: cols as never, defaultDebtType: "credit_card" }));
      return "allowed";
    } catch {
      return "refused";
    }
  };
  // The date slot has no downstream backstop — a birth date parses as a good
  // date and anchors the statute, making every account read time_barred, which
  // hands the whole tape to H1.
  for (const col of ["BDAY", "YOB", "BORN", "DOB", "BIRTH_DT", "ANNIVERSARY"]) {
    assert.equal(chk("lastPaymentDate", col), "refused", `${col} is not a last-payment date`);
  }
  for (const col of ["SS_NUM", "SOC_SEC", "TAXPAYER_ID", "GOVT_ID", "GOVERNMENT_ID",
    "DRIVER_LIC", "TEL", "PH_NO", "SPOUSE", "DEBTOR", "CUSTOMER", "PAN", "LANGUAGE", "VETERAN"]) {
    assert.equal(chk("id", col), "refused", `${col} is not an account id`);
  }
  // And the allow-list must not refuse the real thing.
  for (const [slot, col] of [
    ["lastPaymentDate", "LAST_PAY_DT"], ["lastPaymentDate", "DOLP"], ["lastPaymentDate", "LPD"],
    ["lastPaymentDate", "PAYMENT_DATE"], ["chargeOffDate", "CHARGE_OFF_DATE"], ["chargeOffDate", "CO_DT"],
    ["id", "ACCT_NO"], ["id", "LOAN_ID"], ["balance", "CURRENT_BALANCE"],
    ["state", "ADDR_ST"], ["state", "POSTAL_STATE"], ["state", "HOME_MAILING_STATE"],
  ] as const) {
    assert.equal(chk(slot, col), "allowed", `${slot}=${col} is legitimate`);
  }
});

test("an exemption is pattern-specific, not just slot-specific", () => {
  // Dropping the `e.pattern.source === re.source` check let the state slot's
  // /addr/ exemption forgive ANY pattern, so state=SSN_STATE, state=STATE_PHONE
  // and state=PROVINCE_EMAIL were all allowed with every test still passing.
  const chk = (col: string) => {
    const cols = { balance: "BAL", state: col, lastPaymentDate: "LPD" };
    try {
      parseTape(Object.values(cols).join(",") + "\n", spec({ columns: cols as never, defaultDebtType: "credit_card" }));
      return "allowed";
    } catch {
      return "refused";
    }
  };
  for (const col of ["SSN_STATE", "STATE_PHONE", "PROVINCE_EMAIL", "STATE_DOB", "STATE_SSN"]) {
    assert.equal(chk(col), "refused", `${col} carries identity the state exemption must not forgive`);
  }
  assert.equal(chk("ADDR_STATE"), "allowed", "the /addr/ exemption itself still works");
});

test("real seller header vocabularies are accepted for every slot", () => {
  // SLOT_REQUIRES is an allow-list, so the failure mode flipped from "lets
  // identity through" to "refuses a legitimate file". TOTAL_DUE, OUTSTANDING
  // and FILE_NUMBER were all refused before this sweep.
  const chk = (slot: string, col: string) => {
    const cols: Record<string, string> = { balance: "BAL", state: "ST", lastPaymentDate: "LPD" };
    cols[slot] = col;
    try {
      parseTape(Object.values(cols).join(",") + "\n", spec({ columns: cols as never, defaultDebtType: "credit_card" }));
      return "allowed";
    } catch {
      return "refused";
    }
  };
  const VOCAB: Record<string, string[]> = {
    balance: ["BAL", "BALANCE", "CURRENT_BALANCE", "CURR_BAL", "CURRBAL", "BAL_AMT",
      "FACE_VALUE", "FACE_AMT", "CHARGEOFF_BALANCE", "CO_BAL", "PRINCIPAL",
      "PRINCIPAL_BALANCE", "PRIN_BAL", "TOTAL_DUE", "AMOUNT_DUE", "AMT_DUE",
      "OUTSTANDING", "OUTSTANDING_BALANCE", "PLACEMENT_AMOUNT"],
    state: ["ST", "STATE", "STATE_CD", "ST_CD", "DEBTOR_STATE", "CONSUMER_STATE",
      "ADDR_STATE", "ADDRESS_STATE", "ADDR_ST", "MAILING_STATE", "HOME_STATE",
      "POSTAL_STATE", "PROVINCE", "REGION", "ST_ABBR"],
    lastPaymentDate: ["LPD", "DOLP", "LAST_PAY_DT", "LAST_PAYMENT_DATE", "LAST_PMT_DATE",
      "LAST_PMT_DT", "LASTPAYDATE", "DT_LAST_PAY", "LATEST_PAYMENT_DATE",
      "RECENT_PAYMENT_DT", "PAYMENT_DATE", "PAY_DT"],
    chargeOffDate: ["CODATE", "CO_DT", "CO_DATE", "CHARGE_OFF_DATE", "CHARGEOFF_DT",
      "CHG_OFF_DATE", "CHGOFF_DT", "DT_CHARGE_OFF", "CHARGEOFFDATE"],
    debtType: ["TYPE", "DEBT_TYPE", "PRODUCT", "PRODUCT_TYPE", "PRODUCT_NAME",
      "ACCOUNT_TYPE", "ACCT_TYPE", "PORTFOLIO_TYPE", "ASSET_CLASS",
      "LOAN_CLASS", "SEGMENT", "CATEGORY"],
    id: ["ACCT", "ACCT_NO", "ACCT_NUM", "ACCOUNT", "ACCOUNT_NO", "ACCOUNT_NUMBER",
      "ACCTNO", "LOAN_ID", "LOAN_NO", "LOAN_NUMBER", "ID", "ROW_ID",
      "PORTFOLIO_ID", "BATCH_NO", "SELLER_REF", "REFERENCE", "REF_NO",
      "FILE_NUMBER", "CLIENT_ACCT"],
  };
  for (const [slot, cols] of Object.entries(VOCAB)) {
    for (const col of cols) {
      assert.equal(chk(slot, col), "allowed", `${slot}=${col} is a real seller header`);
    }
  }
  // Widening the allow-list must not open an identity hole: the deny-list still
  // applies on top of it.
  for (const [slot, col] of [
    ["balance", "SSN_DUE"], ["balance", "PHONE_AMOUNT"], ["id", "SSN_FILE"],
    ["id", "CASE_DOB"], ["id", "CLAIM_SSN"],
  ] as const) {
    assert.equal(chk(slot, col), "refused", `${slot}=${col} carries identity`);
  }
});

test("one accidental cell match does not confirm a headerless row", () => {
  // The first version of the confirmation rule accepted a SINGLE match. A
  // headerless row can contain a cell equal to a mapped name by coincidence —
  // "ST" is this tool's own default state column AND a plausible street-suffix
  // cell in a split address — and that one hit re-opened the leak through the
  // front door: a row containing "ST" printed "Jane, Roe, 12 Elm".
  //
  // A genuine header matches nearly the whole spec; only the column being
  // complained about is missing. Half, minimum two, separates the cases.
  const bare = (row: string) => {
    try {
      parseTape(row, spec({
        columns: { balance: "BAL", state: "ST", lastPaymentDate: "LPD" } as never,
        defaultDebtType: "credit_card",
      }));
      return "";
    } catch (e) {
      return (e as Error).message;
    }
  };
  const PII = ["Jane", "Roe", "12 Elm", "Austin", "123-45-6789", "78701", "1500.00"];
  for (const [label, row] of [
    ["ST", "Jane,Roe,12 Elm,ST,TX,78701,123-45-6789,1500.00,01/15/2024"],
    ["BAL", "Jane,Roe,BAL,Austin,TX,78701,123-45-6789,1500.00,01/15/2024"],
    ["LPD", "Jane,Roe,LPD,Austin,TX,78701,123-45-6789,1500.00,01/15/2024"],
  ] as const) {
    const msg = bare(row);
    assert.ok(msg.length > 0, `${label} row should still fail to parse`);
    for (const v of PII) {
      assert.equal(msg.includes(v), false, `a lone "${label}" cell confirmed the row and leaked ${v}`);
    }
  }

  // Two matches on a three-column spec IS a header, and is listed.
  let real = "";
  try {
    parseTape([HEADER, "A1,1.00,TX,2024-01-15,2024-07-01,creditcard"].join("\n"),
      spec({ columns: { balance: "MISSING_AMOUNT", state: "ST", lastPaymentDate: "LPD" } as never, defaultDebtType: "credit_card" }));
  } catch (e) {
    real = (e as Error).message;
  }
  assert.match(real, /matched 2 of 3 mapped/);
  assert.match(real, /\bBAL\b/);
});
