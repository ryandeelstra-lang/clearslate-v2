# Build plan — Found Money features (ideas 1, 4, 5, 6)

Derived from the research in the "Found Money First" brief. Four features, built in
parallel by four agents against a pre-stabilised schema.

**Through-line:** give money back in week one without requiring behaviour change.

---

## Foundation (done before agents start)

Both schema and stylesheet are shared-mutable files — the two things that guarantee
collisions when agents run in parallel. Both are resolved up front:

- **Schema** — `rate_attempts` and `digest_subs` added and pushed to Neon.
  Agents **must not** edit `lib/db/schema.ts`.
- **Stylesheet** — agents **must not** edit `app/globals.css`. Every new feature
  ships a co-located **CSS Module** (`foo.module.css`). Existing global classes
  (`.btn-primary`, `.shell`, `.eyebrow`, `.card`) may be *used*, never changed.

### Existing primitives (read-only — do not modify)

| Path | What it gives you |
| --- | --- |
| `lib/insights/apr.ts` | `DEFAULT_APR`, `monthlyInterestCents`, `minimumPaymentCents`, `payoffProjection`, `payoffComparison`, `baselinePaymentCents` |
| `lib/insights/debt.ts` | `getDebtSummary`, `getCashflowFacts`, `buildPayoffPlan`, `getProfile` |
| `lib/insights/defaultApr.ts` | `defaultAprFor(type, subtype)`, `isMortgage` |
| `lib/insights/framing.ts` | `frame(cents)` → "18 tanks of gas" |
| `lib/format.ts` | `usd`, `usdCompact`, `percent`, `months` |
| `lib/session.ts` | `getUserId`, `requireUserId` |
| `lib/db/index.ts` | `getDb`, `schema`, `isDbConfigured` |

### House rules (from `docs/rules.md`)

- **Money is integer cents. Never floats.** Convert at the boundary.
- Validate all input server-side. Never trust the client.
- Never log or expose secrets or PII.
- Simplest thing that works. No speculative abstraction.
- Match existing patterns and naming.
- Server-only modules import `"server-only"`.
- APR stored scaled ×1e4 (`24.99%` → `249900`), fraction = `/1_000_000`.

---

## Feature 1 — Rate-cut call script  ·  `/savings`

**Why:** 83% of people who ask for a lower APR get one; average cut 6.3 points.
92% who ask get a late fee waived. This is money in week one with zero behaviour
change, and no major competitor does it.

**Owner:** Agent A

**Files (create only):**
```
lib/insights/negotiate.ts          pure: savings math + script generation
app/savings/page.tsx               server component, ranked call list
app/savings/attempt-tracker.tsx    client: status buttons
app/savings/savings.module.css
app/api/negotiation/route.ts       POST create/update attempt
```

**Pure core (`negotiate.ts`) — must be pure, no DB, no imports from `db`:**
- `AVG_APR_REDUCTION = 0.063` (LendingTree 2025)
- `SUCCESS_RATE = 0.83`
- `negotiationValue(balanceCents, aprFraction)` → `{ newApr, monthlySavedCents,
  annualSavedCents, lifetimeSavedCents }`. Floor `newApr` at a sane minimum
  (never below ~0.0499) so the promise stays credible.
- `rankTargets(accounts)` → sorted by `annualSavedCents` desc. **Only cards
  qualify** — `subtype === "credit card"`. Mortgages and auto loans don't
  negotiate this way; including them would be a lie.
- `buildScript({issuer, balanceCents, apr, yearsHeld?})` → structured object
  (`opening`, `ask`, `ifRefused`, `ifPushed`, `closing`) — **not** one blob of
  text, so the UI can render steps.

**"How to get there" coaching — this is required, not optional.** Each script
includes: call the number on the back of the card; ask for the **retention** or
**account review** department; state how long you've held the card and that you
pay on time; ask for a **specific** number, not "anything lower"; if refused,
ask what would need to change and when to call back; note that a refusal costs
nothing and doesn't affect credit.

**Honesty constraints:**
- 6.3 points is an **average**, never a promise. Label every figure as an estimate.
- If APR is estimated (not reported by Plaid), say so — the savings figure inherits
  that uncertainty.
- Never claim we contact the issuer. The user makes the call.

**Tracking:** `POST /api/negotiation` with `{accountId?, label, aprBeforeE4,
status, aprAfterE4?}`. Status in `planned|called|won|refused|postponed`.
Auth from session — never from the request body.

---

## Feature 4 — Payoff date as the hero  ·  modifies `/debt`

**Why:** nobody feels `$8,500`; everybody feels *"free on 14 March 2029"*.
Progress framing outperforms overage framing on retention.

**Owner:** Agent B — **the only agent permitted to touch `app/debt/page.tsx`**

**Files:**
```
lib/insights/payoffDate.ts         create — pure
app/debt/payoff-hero.tsx           create
app/debt/payoff-hero.module.css    create
app/debt/page.tsx                  MODIFY — insert hero, keep everything else
```

**Pure core:**
- `payoffDateFrom(months, from = new Date())` → `Date`
- `formatPayoffDate(d)` → `"March 2029"`
- `describeDelta(monthsSaved)` → `"7 weeks sooner"` / `"1 year, 2 months sooner"`

**UI:** Above the existing red interest block, lead with the date. Keep the
`$635/mo` bleed — it stays, just demoted below the date. Loss framing is fine
*because* a way out sits on the same page; the date is what people repeat aloud.

**Guardrails:**
- If `plan.now.neverPaysOff`, show "never, at this rate" — do **not** invent a date.
- Do not delete or restructure the existing chart, stats, accounts list, mortgage
  note, or disclaimer.

---

## Feature 5 — Weekly one-number check-in

**Why:** 90% of DAUs churn in 30 days because apps demand daily engagement exactly
when motivation dips. The design response is to **ask for less**.

**Owner:** Agent C

**Files (create only):**
```
lib/digest/compose.ts              pure: one-line message from before/after
lib/digest/send.ts                 server: delivery (provider-agnostic)
app/api/digest/subscribe/route.ts  POST subscribe / DELETE unsubscribe
app/api/digest/run/route.ts        POST — the cron entry point
app/digest/unsubscribe/page.tsx    token-based, no login required
app/digest/digest.module.css
```

**Pure core (`compose.ts`):**
- `composeDigest({totalDebtCents, previousTotalCents, payoffMonths})` →
  `{ headline, body }`. Three cases, all warm, none scolding:
  - **down** — "You're $340 closer than last month."
  - **flat** — "Holding steady. No new debt this month."
  - **up** — *never* shame. "Balance is up $120 this month. That happens." Plus
    one concrete next step.

**Delivery:** No email provider is configured. Build against an interface:
```ts
export interface DigestTransport { send(to: string, subject: string, body: string): Promise<void> }
```
Ship a `ConsoleTransport` that logs, selected when no provider env var is set.
**Do not add an email dependency.** The switch to Resend/Postmark must be one file.

**Cron:** `POST /api/digest/run` guarded by a `CRON_SECRET` bearer token; if the
env var is unset, refuse in production and allow in dev. Idempotent — skip anyone
whose `lastSentAt` is inside 6 days.

---

## Feature 6 — What-if slider  ·  `/what-if`

**Why:** anonymous zero-friction interaction drove 41% follow-up action within 72
hours. This is the best top-of-funnel asset available — it works **before signup**
and answers the only question a visitor has: *what would it take?*

**Owner:** Agent D

**Files (create only):**
```
app/what-if/page.tsx               static, public, NO auth, NO db
app/what-if/calculator.tsx         client component, all math client-side
app/what-if/what-if.module.css
```

**Rules:**
- **Entirely client-side.** No session, no database, no API call. It must render
  for a first-time visitor with no cookie.
- Import `payoffProjection` from `lib/insights/apr.ts` — it's pure and safe on the
  client. **Do not** import anything from `lib/db`, `lib/session`, or any module
  with `"server-only"`.
- Three inputs: balance, APR, monthly payment. One output that dominates: **the
  payoff date**, plus total interest.
- Recalculate on input, no submit button. Debounce not required — the math is
  microseconds.
- Prefill with a realistic example ($8,500 / 24.99% / $250) so the page is never
  empty on arrival.
- Below the result, one CTA to `/start`.
- Accessible: real `<label>`s, `<input type="range">` paired with a number input,
  `aria-live="polite"` on the result.

---

## Integration (mine, after agents finish)

1. `npx tsc --noEmit`
2. `npm run build`
3. Add nav/links so every new route is reachable — **the `/connect` lesson: an
   unreachable page is not shipped.**
4. Exercise each route against real Neon + Plaid sandbox data.
5. Report honestly, including anything unverified.

## Out of scope

Ideas 2 (balance transfer), 3 (fee recovery), 7 (milestone cards), 8 (free-forever
positioning). Also still open: delete/export endpoints promised by the privacy
policy, and deployment.
