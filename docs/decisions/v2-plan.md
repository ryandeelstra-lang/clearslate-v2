# ClearSlate v2 — Operating Plan (rev. 2)

**Status:** Rewritten after six specialist critiques returned 4 × *seriously
flawed*, 2 × *sound with changes*, 0 × *sound*. Rev. 1 is superseded, not patched.
**Evidence base:** `docs/research/notes.md` — every figure sourced there.
**Date:** 21 August 2026

---

## Amendments since rev. 2 — read before using any number below

Recorded here rather than edited into the body, so that what the plan said and
what later research found are both visible.

### 27 August 2026 — U13 asset-class research (`docs/research/u13-asset-class-selection.md`)

Source: Jefferson Capital (NASDAQ: JCAP) SEC filings — the first current filing
from a debt buyer whose stated strategy *is* small-balance paper.

1. **The entry-price model is too generous.** `portfolio.ts`'s
   `GROSS_RECOVERY_BPS = 1680` derives from a 7¢ price × 2.4× multiple. The
   market now transacts at **5.4¢** (JCAP H1 2026, down from 6.7¢ in H1 2025) at
   **2.0–2.3×** US Distressed multiples. Implied gross recovery is **≈11–12¢ per
   $1**, roughly 30% below the constant every ceiling in this repo was computed
   from. **Every price ceiling printed to date is too high.** The correction is
   proportional and is the highest-value piece of desk work outstanding.
2. **The primary kill criterion is closer than it looked.** "Sellers will not
   clear at sub-5¢" was written against a 7¢ base. The market is at 5.4¢ and
   falling on rising supply. Sub-5¢ is no longer plainly outside the market.
3. **U7 has a partial answer, and it is not the one H3 wanted.** JCAP states in
   its 10-Q that "lower balance accounts typically carry higher costs and, as a
   result, require higher purchase price multiples." A small-balance discount
   exists — as **compensation for per-account cost**, not because the litigation
   option is dead. If that is the whole explanation, it is not alpha.
4. **The paper H3 wants has a specialist incumbent.** JCAP names its US focus as
   installment loans, telecom, utilities, auto and **small-balance credit card**,
   treats prime large-balance card as opportunistic, and claims barriers to
   entry. H3's "this paper is neglected" premise is wrong.
5. **Litigation is intensifying, not receding.** JCAP Q2 2026 court costs +74.6%
   YoY; court costs plus legal commission are ~50% of servicing spend.

### 27 August 2026 — U14 rehabilitation research (`docs/research/u14-rehabilitation.md`)

Opened by a product decision to include rehabilitating the person, not by a gap
in this plan.

6. **Financial literacy is an established null** — 0.1% of variance across 201
   studies and 585,168 participants, weakest in low-income samples, decayed by 20
   months. This repo now holds three large nulls, and this is the biggest.
7. **The debt relief is itself the rehabilitation intervention.** Each additional
   *account* cleared: +0.25 SD cognitive function, −11% anxiety, −10% present
   bias (PNAS 2019). Converges with Gal & McShane on **account count** as the
   governing variable. **The H3 bandit should optimise accounts cleared subject
   to cash ≥ break-even, not dollars collected.**
8. **Employment services cannot be delivered, only referred** — $10,500–$23,135
   per participant against a ~$27 account.
9. **Retraction:** `market.md`'s "personalised nudges beat static financial
   education by 3× — published CFPB research" does not survive checking. Second
   failed CFPB attribution in this repo.

**Net effect on the plan:** rev. 2's structure holds. Its arithmetic does not.
Nothing here triggers a kill criterion outright, and item 1 makes every existing
verdict worse. Do not quote a ceiling from this repo until it is recomputed.

---

## What changed and why

Rev. 1 proposed buying full-media charged-off paper, declining to litigate, and
leading with itemised purchases to hit the industry multiple faster. Three
independent findings killed it:

1. **Transaction-level purchase history does not convey with the trade.** Media is
   a request right with a per-document fee and an expiry; the OCC norm is 12
   statements. Confirmed independently by two specialists from the FTC study.
2. **Legal is 53% of PRA's US core collections** against 31% of opex. Removing it
   deletes a large share of the denominator to save a small share of the numerator.
3. **The arithmetic inverts.** Compression is real, is the smallest of three
   coupled effects, and is the only positive one — and it is unavailable, because
   a no-litigation book forfeits the post-48-month tail rather than compressing it.

Rev. 1 was also self-contradicting: it argued incumbent profitability rests on
default judgments (legal share large) while assuming the same multiple without
them. **You cannot have both.**

---

## Thesis (rev. 2)

**Buy paper on which litigation is already structurally unavailable — and pay a
price that reflects that, while surrendering nothing we intended to use.**

Rev. 1 asked a non-litigating buyer to match a litigating buyer's returns. That is
arithmetically impossible. Rev. 2 inverts it: buy the specific paper where the
litigation option is *already gone for everyone*, so the discount is real and the
sacrifice is zero.

Binding constraint unchanged: **ClearSlate only profits when principal goes down.**

### The entry-price question

Finance's reframing, which replaces the speed thesis entirely:

```
Gross recovery                16.8¢ per $1 face
Less legal channel @ L=25%    × 0.75
Less servicing stack          − 5.41¢
──────────────────────────────────────────
Net collections               7.19¢ per $1 face

Required price, full media    6.14¢   (vs 7¢ base)
Thin-media equivalent         4.72¢
```

**Kill criterion: sellers will not clear at sub-5¢.** Computable today, testable
with conversations rather than capital.

---

## Candidate hypotheses

> **Standing as of 21 August 2026: H2 is withdrawn on a corrected date. H1 is the
> only hypothesis left, and H1 is the one carrying the serious ethical objection.
> If H1 fails its ethics gate, rev. 2 has no thesis and requires a rev. 3 rather
> than an amendment.** This is stated here rather than buried because it is the
> single most important fact about the current plan.

### H1 — Time-barred paper with a binding no-sue covenant

Time-barred debt is priced at a deep discount *because the litigation option is
gone*. A buyer who never litigates surrenders nothing they were going to use.

**Structure required to make this defensible, not predatory:**
- Contractual covenant never to sue on the account, binding on ClearSlate.
- **No mechanism that can revive the limitations clock.** No round-ups, no
  auto-debit defaults, no partial-payment prompts without explicit
  SOL disclosure and affirmative acknowledgement.
- Covenant survives resale, or the paper is never resold. Decide before buying.
- Time-barred disclosure delivered prominently, not in a footer — already legally
  required in several states, treated here as a design principle.

**The honest objection to state plainly:** collecting on time-barred debt is the
practice consumer advocates object to most, precisely because partial payment
revives the clock. If the covenant and the no-revival architecture do not fully
neutralise that, **H1 fails on the binding constraint and is abandoned.** This is
a question for the legal and behavioural gates, not a decision to make here.

### H2 — Jurisdictions where litigation is becoming impractical — **WITHDRAWN**

**H2 rested on a date that was wrong by three years and does not survive the
correction.**

The draft asserted New York cut its limitations period from six to three years
"effective April 2025." The Consumer Credit Fairness Act was in fact signed
**8 November 2021**, with the SOL provision taking effect **~April 2022**
([NY S153, Ch. 593](https://www.nysenate.gov/legislation/bills/2021/S153)).

That is **four years and four months** of elapsed time in a market whose principal
buyers are public companies with actuarial pricing teams. A known statutory change
of that age is fully priced. The "market has not repriced yet, so we are early"
branch — the only branch in which H2 produced an edge — **does not exist.**

What remains is the general observation that repricing helps litigating buyers
equally: they simply buy the same unsuable paper cheaper and keep their courthouse
strategy everywhere else. A non-litigating operator gets no *relative* advantage
from a discount that is available to everyone.

**Residual form, much weaker:** a bet on *future* SOL compression in other states,
timed to buy ahead of each change. That is a wager on legislative calendars rather
than an operating thesis, and it is not something to build a company on. Recorded,
not pursued.

---

## Unknowns

Rewritten per critique. **Dependencies are now explicit** — rev. 1 ran U3 parallel
to U2 when U3 was undecidable without it.

### U1 — Media rights specification *(replaces "full-media price premium")*
Rev. 1 asked what full media costs versus thin. Both the legal and market
specialists flagged that this **returns a reassuring number for a category that
exists while the category the thesis needs does not** — it would have passed the
gate on a false positive.

**Ask instead, for one real tape, in writing:** how many statements back; structured
data or images; free-request cap; per-document cost after; how long the seller's
obligation survives closing; what accuracy warranty attaches.

**A negative answer is a kill criterion, not a pricing input.** Cost: three emails.

### U2 — Legal share of collections — **ANSWERED**
PRA: **53% of US core cash collections**, against 31% of opex. Now a modelling
parameter, not an open question. Confirm against Encore when filings are pulled by
hand.

### U3 — Net entry price *(depends on U2, U6)*
Not "does compression preserve the multiple." **What entry price makes a
voluntary-only book clear an 11% cost of capital, net of a fully-loaded servicing
stack?** Model in integer cents, consistent with `core/`.
**Fill:** `full-media ______¢ / thin ______¢ / observed market ______¢`

### U4 — Licensing map — **moved into Phase 0**
~30 states, **6–18 months**, plus RMAI CRB certification (mandatory since
1 Jan 2025). Operations called this the long pole; "no capital committed" cannot
include it without costing a year. Starts immediately.
**Fill:** `______ states / $______ / ______ months / RMAI: ______`

### U5 — Falsification study *(respecified)*
Rev. 1 asked whether people "respond differently" to itemised purchases. That is
not directional and cannot separate *engages* from *disputes and goes dark*.

**Now:** randomised holdout measuring **disengagement** — mail opened, contact
initiated, dispute filed, subsequent silence. Not payment. Avoidance is
statistically invisible in a recovery metric, and every rev. 1 gate measured only
recovery.

**Recruiting fixed:** people who agree to discuss their charged-off debt with a
stranger are selected *against* concealment — the exact failure mode the study
exists to detect. Recruit accordingly.
**Fill:** `______ / 10 completed · disengagement delta ______`

### U6 — Contact channel and fully-loaded servicing cost *(new)*
Two specialists added this independently.

**Contact:** what fraction of a candidate tape carries a Reg F-usable email or
mobile? Email is not a standard tape field, and §1006.6(d)(4) permits emailing only
an address the creditor or immediately prior collector already used and noticed. If
the answer is near zero, the business runs on one mailed validation notice against
a 10–30% undeliverable rate.

**Cost:** fully-loaded cost to service one account — validation mail, pre-contact
bankruptcy/deceased/SCRA/attorney-represented scrubs, dispute verification under
§1006.38, CFPB complaint response, high-risk merchant account, compliance.
**Fill:** `______% Reg F-usable contact / $______ per account`

### U13 — Which asset class *(new, 27 Aug 2026 — `u13-asset-class-selection.md`)*
Rev. 2 and H3 both argue about balance band. Neither asked what *kind* of paper,
and every price in this repo was credit-card-derived. Research recommends
**fintech / BNPL-originated installment**, on two grounds unrelated to price: it
is the only class where the originator's email is the channel of record (the only
real answer to U6), and where account-level provenance conveys because the
account *is* one transaction (U1's media-horizon problem does not arise).
Medical is de-recommended — cheapest paper, best optics, no remaining lever once
courts and credit reporting are both gone.
**Fill:** `class ______ / email fill ______% / seller warrants prior use Y/N ______`

### U14 — What rehabilitation can be delivered *(new, 27 Aug 2026 — `u14-rehabilitation.md`)*
Not "does rehabilitation help" — it does — but what survives a $27 account.
Answer: clearing whole accounts (core), just-in-time guidance (free), non-shaming
copy (free), warm referral to WIOA/sectoral programmes (free). Not: any
curriculum (null), any human coaching or delivered employment service
(200–900× the value of an account).
**Fill:** `referral conversion ______% / accounts-cleared objective modelled Y/N ______`

---

## Phases

### Phase 0 — Fill the unknowns *(no portfolio capital; licensing spend starts)*

Parallel: U1, U5, U6, and the H2 pricing comparison. **U4 licensing starts day one**
— it is the long pole and cannot wait for the others.
**U3 runs last**, once U2 is confirmed and U6 returns.

**Gate:** U3 shows a clearing price at or below observed market, *and* U1 returns a
media specification that supports whatever intervention survives U5, *and* U5 shows
account detail on cold contact does not increase disengagement.

**If sellers will not clear at sub-5¢, the thesis is wrong.** Rewrite, do not patch.

### Phase 1 — One small spot portfolio

Spot, not forward flow — forward flow requires a servicing track record and
committed capital, and sellers do not offer it to unproven buyers. Size so total
loss is survivable.

**Build order, inverted per critique.** Rev. 1 led with in-session optimisations
that fire only on someone already authenticated — optimising a funnel step with no
traffic.

1. **The mailed piece.** Verifiable identity for a company nobody has heard of, a
   compliant validation notice, and a no-login path to a first payment.
2. **Dispute and verification handling.** §1006.38 freezes collection until
   verification is mailed; this is load-bearing infrastructure, not a back office.
3. **Self-service portal.** No outbound calling.
4. **Whatever survived U5** — and only what survived.

**Gate:** letter → portal-visit rate. That is the step the project's own established
null predicts will fail, so it is measured first.

### Phase 2 — Second portfolio, instrumented
Same profile, different vintage. Measure which interventions move net recovery, per
segment, against the U3 model.
**Gate:** net recovery clears the U3 model, not a gross multiple.

### Phase 3 — Scale the source
Forward flow becomes available only now, because only now is there a track record
to show a seller. **If the no-sue covenant from H1 is in force, resale is
constrained — decide the resale position before Phase 1, not here.**

---

## Kill criteria

- **Sellers will not clear at sub-5¢.** Primary. Ends the thesis.
  **Status 27 Aug 2026:** not triggered, and closer than written. The market is
  transacting at 5.4¢ and falling (U13 §1). But note the criterion was set
  against a 16.8¢ gross-recovery assumption that is now believed ~30% too high —
  **the required entry price falls with it, so a market price we can meet is not
  the same as a price that clears.** Recompute before treating this as passed.
- **U1 returns no transaction-level history under any warranty** — any
  detail-dependent intervention is dead on data horizon regardless of price.
- **U5 shows account detail on cold contact increases disengagement.** The
  intervention harms the people it is meant to help; binding constraint violated.
- **H1 cannot be structured without SOL-revival risk.** H1 abandoned.
- **H2 — already triggered.** Withdrawn 21 August 2026 on a corrected effective
  date. Retained in this list as a record of a kill criterion that fired.
- **U6 servicing cost exceeds the net-collection headroom in U3.** No business.

---

## What this plan deliberately does not do

- **No litigation.** Structural. Now priced as an entry-price bet rather than
  asserted as a values position.
- **No round-up defaults or auto-debit on time-barred paper.** Revives the statute
  of limitations. Non-negotiable.
- **No round-number payment targets on lump sums.** A round target on $4,237 is
  $4,000 — a number the person does not have.
- **No itemised purchase history** unless U1 proves it conveys *and* U5 proves it
  does not increase disengagement. Both, not either.
- **No generic behavioural messaging.** Two powered RCTs.
- **No forward flow before a servicing track record.**
- **No outbound calling as primary channel.**
- **No revenue from fees or penalties.** Binding constraint.
- **No gross-multiple modelling.** Net of fully-loaded servicing, always.
