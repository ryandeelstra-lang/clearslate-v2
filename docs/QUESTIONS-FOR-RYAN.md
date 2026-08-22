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

## 3. Broker conversations — U7

*To be completed by the sprint. A draft inquiry email will be at
`docs/outreach/broker-inquiry-draft.md`. Drafted only — not sent.*

## 4. Lawyer review list

*To be completed by the sprint (Agent D, U10).*

## 5. Open decisions the research cannot make

*To be completed at synthesis.*

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
