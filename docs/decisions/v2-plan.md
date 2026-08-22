# ClearSlate v2 — Operating Plan (rev. 2)

**Status:** Rewritten after six specialist critiques returned 4 × *seriously
flawed*, 2 × *sound with changes*, 0 × *sound*. Rev. 1 is superseded, not patched.
**Evidence base:** `docs/research/notes.md` — every figure sourced there.
**Date:** 21 August 2026

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
