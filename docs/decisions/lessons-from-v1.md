# Lessons from v1 — bugs, traps, and things that cost real time

Written while they were fresh. Most of these are invisible until they bite, and
several shipped to a live page before being caught. Read this before writing v2.

---

## Correctness bugs that reached a rendered page

### 1. Credit-card APR applied to a mortgage
The first debt page used one `DEFAULT_APR` of 24.99% for every account missing a
reported rate — **including a mortgage**. It rendered $2,331/month in interest
on $163,706 of "debt".

Correct figures were **$635/month on $107,404** — a **3.7× overstatement**, and
every dollar of the error flattered the product.

**Fix:** subtype-aware defaults (`core/defaultApr.ts`) — mortgage 6.8%, auto
7.5%, student 6.5%, HELOC 8.5%, card 24.99% — and mortgages excluded from the
payoff headline entirely, with a note explaining why.

**Rule for v2:** never let one default rate span instruments. And when an error
flatters the product, treat that as a signal, not a coincidence.

### 2. Mortgage payments credited against consumer debt
`monthlyDebtPaymentCents` summed **all** Plaid `loan_payment` outflows —
including the mortgage payment — while `totalDebtCents` deliberately *excluded*
the mortgage. So mortgage money was being credited against credit-card debt.

Payoff date moved **January 2031 → March 2033** once fixed. Over two years too
optimistic.

**Fix:** when a mortgage exists, detected payments are untrustworthy; fall back
to the sum of minimum payments, which map 1:1 onto the debts actually modelled.

**Rule for v2:** a detected aggregate is only usable if every component is
attributable to something you're modelling.

### 3. Plaid duplicates accounts across Link sessions
**Plaid mints a new `account_id` on every Link session.** Linking four
institutions in the sandbox produced **27 account rows for 14 real accounts**,
and the debt total read **$270,699** instead of $107,404.

This is not a sandbox artifact — in production, a user reconnecting the same bank
**silently doubles their debt**.

**Fix:** deduplicate at read time on `name + mask + subtype`, freshest row wins.

**Rule for v2:** never treat `account_id` as a stable identity across sessions.

### 4. The optimistic projection presented as fact
The payoff hero led with the *accelerated* date — the one assuming the user
redirects half their impulse spending, which they had not agreed to do.

**Fix:** headline is the **current trajectory**; the accelerated date sits
underneath as the prize. The gap is the motivation; the honest number is the one
in large type.

### 5. A script that coached the user to lie
The rate-cut call script said *"I've been a customer for several years"* —
hardcoded, because Plaid doesn't report card open dates. Every user would have
been told to make a claim they might not be able to make truthfully.

**Fix:** prompt them to state their own history, whatever it is.

**Rule for v2:** never put words in a user's mouth about facts you don't have.

### 6. "Lifetime savings" that assumed a frozen balance
A helper multiplied annual savings by 10. For anyone actually paying the card
down, that overstates the benefit several-fold. Removed rather than displayed.

---

## The design-system trap that made a page unreadable

**In v1's CSS, `--ink` is the dark BACKGROUND and `--paper` is the light TEXT.**
That is backwards from what the words mean. An agent wrote `color: var(--ink)`
— the intuitive reading — and shipped a page where the heading, labels, results
and inputs were all **invisible**: near-black text on a near-black ground, with
white input boxes.

**For v2: rename the tokens.** Use `--bg` / `--surface` / `--text` / `--text-muted`.
Names that can be misread *will* be misread.

---

## Framework and tooling gotchas

- **Drizzle takes a single `.where()`.** Chained calls replace rather than
  combine — use `and(...)`.
- **A union-typed `getDb()` breaks method overloads.** Returning
  `neon-http | node-postgres` made the parameterized `.returning({...})` form
  vanish from the type. Pick one driver per environment, or narrow the type.
- **`react-plaid-link` v5 types `public_token` as `string | null`.** Guard it.
- **Next 16:** `cookies()` and `searchParams` are async. `turbopack.root` must be
  pinned or the build walks up and finds the home-directory lockfile.
- **Plaid Liabilities only covers credit cards and student loans.** Mortgages,
  auto loans and HELOCs come back with no APR — you *must* estimate, and you
  must label the estimate.
- **Plaid prepares transaction history asynchronously.** The first
  `transactionsSync` after Link returns only what's ready (16 of 48 rows in
  testing). Real fix is the `HISTORICAL_UPDATE` webhook; the interim fix is a
  re-sync on page load.
- **The Plaid sandbox has no `income` transactions.** Any feature gated on
  detected income will appear permanently broken there.

---

## Process lessons

**Verifying served HTML is not verifying the page.** Multiple features were
reported "verified" on the strength of `curl` output and passing typechecks,
then turned out to be visually broken. **Screenshots caught in ten minutes what
HTML inspection missed entirely.** For v2: a feature is not done until it has
been *looked at*, at desktop and mobile width.

**An unreachable page is not shipped.** `/connect` was built, tested, and
completely unlinked — the hero said "connect your accounts" with no way to do
it. Audit every route for an inbound link as part of "done".

**Parallel agents need disjoint file ownership.** Two shared files —
`schema.ts` and `globals.css` — would have collided every time. Stabilising both
*before* dispatch, and giving each agent a CSS Module, made 4-way parallelism
work. Agents also inherit your naming traps: warn them explicitly.

**A too-greedy scripted edit deleted ~800 lines of CSS** (every style block
between two markers). Prefer targeted edits; verify what a replacement actually
spans.

---

## Still unfinished when v1 was set aside

- Milestone share cards (idea 7) — never built
- Weekly digest has working API + cron but **no subscribe UI anywhere**
- Email delivery is a **console stub**, not real sending
- **No delete/export endpoints**, which the published privacy policy promises
- **Zero automated tests** in the web app (the v1 backend had 215)
- Never deployed — `clearslatedebit.com` still serves a static placeholder
