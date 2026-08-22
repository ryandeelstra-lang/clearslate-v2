# Questions and Actions for Ryan

Things the H3 gate sprint could not do, because they require a human. Kept short
and actionable. **Ordered by urgency.**

---

## 🔴 1. Rotate exposed credentials — today

The Google Doc **ClearSlate — Consolidated**, section *Ops — Legal & API*,
contains in plaintext:

- A **live Unit admin token**. Expires 30 May 2027. Scopes include
  `payments-write`, `ach-payments-write`, `wire-payments-write`, `cards-sensitive`
  — move money and read full card numbers.
- A **Plaid recovery code** and client ID.

The doc labels these "placeholders," but the token carries a real `orgId`, your
email as `sub`, and a 2027 expiry. Your own *Analysis & Direction* doc flagged
this on 19 Aug; the Consolidated doc was modified 20 Aug and they are still there.

**Do:** rotate the Unit token in the Unit dashboard; regenerate Plaid keys; delete
the block from the doc; **purge Drive revision history** (Drive retains old
versions) or move the doc to a fresh file. Until then treat the Unit org as
compromised.

*No credentials are committed to this repo — verified by scan. `docs/SENSITIVE.md`
is the scan report, not a file of secrets.*

## ⚠️ 2. Reconcile the EIN

The same Drive doc lists two, and `CLAUDE.md` carries both:

- `42-2819082` — Build Timeline, Phase 0 step 2
- `42-2678974` — Ops section, with an LLM summary naming it

One is wrong. You cannot open a business bank account or file a state licensing
application on the wrong number. **Do:** call the IRS Business & Specialty line
(800-829-4933) or check the SS-4 confirmation letter. Then correct `CLAUDE.md`
and the Drive doc.

## 3. Send the broker inquiry — the highest-value action available

**This is the single most valuable thing you can do this week.** U7 — does
small-balance paper trade at a discount? — is the question H3 lives or dies on,
and **it cannot be answered from public sources.** Zero public data points
compare pricing by balance band. It is a phone call, not a research project.

Draft is written and ready at **`docs/outreach/broker-inquiry-draft.md`** — not
sent, no contact details included. It asks for indicative pricing on two
otherwise-identical portfolios (avg balance $400–800 vs. $2,500–5,000, same
vintage), and folds in the six U1 media-rights questions so one email covers both.

**Add one question when you send it** (from U8, below): *what are your observed
filing rates by balance band?* Brokers and buyers know this operationally and
nobody publishes it. Same email, no extra cost, and it fills the other gap.

Cost: 3 emails. Timeline: 1–2 weeks. Risk: none — a pricing inquiry is not a
commitment.

## 4. Open the FTC report by hand — 20 minutes

[debtbuyingreport.pdf](https://www.ftc.gov/sites/default/files/documents/reports/structure-and-practices-debt-buying-industry/debtbuyingreport.pdf)
returns 403 to automated fetching but loads in a browser. **Check whether it
breaks out price or recovery by balance band.** It is the cheapest remaining shot
at answering U7 from public data.

Caveat when reading it: the contracts studied were signed **July 2006 – June
2009**. Use it for *structure*, never for current price levels.

## 5. Lawyer review list

**Tax attorney** — 1099-C exposure is confirmed, not hypothetical. Debt buyers
are "applicable entities" under
[26 CFR § 1.6050P-2(e)](https://www.law.cornell.edu/cfr/text/26/1.6050P-2).
Priority questions:
1. Does ClearSlate's structure fall inside the de minimis threshold today — and
   **when does it cross out of it?** (A forgiveness mechanic is clean at launch
   and creates exposure as it scales. Do not build on the safe harbour.)
2. Pre-offer disclosure obligations before a consumer accepts a match.
3. Any duty to help consumers file Form 982, or to verify insolvency.
4. Double-1099-C risk where the original creditor already filed.

**FDCPA / collections attorney** — the approved match line survives the
least-sophisticated-consumer standard but has a gap:
1. **Does the offer need a tax-consequence disclosure?** Telling someone they are
   "debt-free" when a 1099-C may follow is arguably deceptive by omission.
2. Minimum required disclosures for a match offer.
3. **Bait-and-switch exposure if an ML model varies the match ratio per account.**
   This one is specific to the H3 design and worth asking early.
4. State UDAP exposure: CA UCL, NY GBL §349, MA Ch. 93A.

## 6. Open decisions the research cannot make

- **H1 vs. H3 is still unresolved, and both are still open.** H3's central
  premise took a hit (see below) but was not killed. H1's ethics gate has never
  been run.
- **The match pitch is weaker than it looked.** An honest offer has to mention
  possible tax consequences, which undercuts "debt-free." Decide whether the
  mechanic still earns its complexity once it is described truthfully.
- **`CLAUDE.md` and `findings.md` now disagree about streaks.** "Streaks" was
  moved into the *Allowed* list during this session; `findings.md` cites the
  ~90%-churn-in-30-days research as the basis for banning them. One of the two
  should change.

---

## What the sprint found that changes your plans

**Licensing is not an 18-month wall.** Minimum viable is **~$16,000 and 3–4
months** across 5 states — Ohio, Georgia and Virginia require no state licence at
all. The "6–18 months" figure describes ~30-state coverage, not time to first
purchase. **I gave you the wrong sequencing advice earlier in the session on the
strength of that conflation, and I'm retracting it.**

**Small balances are litigated routinely.** ~50% of all collection cases in UT/MN/MI
are for balances under $2,000 (Pew, verified). H3 assumed litigation was
economically unavailable there. It is *less common*, on a gradient around
$500–$1,500 — not absent. This weakens H3's buy box.

---

## Also worth resolving, not urgent

- **Vercel org.** `clearslatedebit.com` sits under an org named "Alpha," which
  looks like an employer account rather than a personal one. Resolve before any
  real user data is attached.
- **"Site is done" vs. never deployed.** Drive Tab 2 says the site is done; this
  repo says it was never deployed and the domain serves a static placeholder.
  Which is true?
- **Privacy policy promises delete/export endpoints that do not exist.** Live
  policy, unbuilt feature.
