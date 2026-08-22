# H3 — Ownership as the product

**Status:** Draft hypothesis, opened 21 August 2026. Not yet gated.
**Relationship to rev. 2:** Additive, and **mutually exclusive with H1 on paper
selection.** See "Relationship to H1" below — you cannot run both on one book.
**Evidence base:** `docs/research/notes.md`. Unverified claims are registered at
the end of this document rather than used inline.

---

## Thesis

**Buy the paper, then treat the balance itself as the intervention.**

Every digital-first operator in this market optimises *messages about a fixed
balance*. An owner can change the balance. That authority is unavailable to a
contingency servicer at any level of engineering skill, and it is the only
durable asymmetry this project has identified.

Binding constraint unchanged: **ClearSlate only profits when principal goes
down.** H3 is the first hypothesis where the mechanism and the constraint are the
same action.

---

## What only an owner can do

`notes.md:250` records the structural fact this rests on:

> None of the digital-first operators owns the paper. Their patience is
> contractual.

| | TrueAccord / Symend / InDebted | ClearSlate under H3 |
| --- | --- | --- |
| Channel, timing, cadence | Yes | Yes |
| Message content | Yes | Yes |
| Settlement band | Creditor-approved, fixed | **Set at inference time** |
| Forgive principal | No — not their debt | **Yes** |
| Match / cancel-on-payment | Costs real cash | **Costs a claim bought at ~5¢** |

The last row is the whole hypothesis. A match is a cash expense for a servicer
and a discount for an owner. Same message to the consumer, entirely different
balance sheet.

---

## The economics of a match

Baseline from rev. 2, per $1 of face, voluntary-only:

```
Gross recovery, voluntary channel      12.6¢   (16.8¢ × 0.75)
Less servicing stack                  − 5.41¢
─────────────────────────────────────────────
Net collections                         7.19¢
```

Now add a match at ratio **R:1** — every $1 paid cancels $(R+1) of balance. Let
**C** = cash actually collected, in ¢ of face.

```
Net = C − 5.41¢
```

**The ratio does not appear.** Cancelled balance is not an expense; it is
forgiveness of face we never expected to collect. So:

> **A match beats the no-match baseline if and only if it lifts cash collections
> above 12.6¢ of face.** The ratio is behaviourally free.

That is the result worth understanding, and it is counter-intuitive enough to
state twice. Setting R = 1 versus R = 4 costs nothing directly. It only matters
through two channels:

1. **Its effect on C** — the entire bet, and unproven.
2. **The clearing cap.** A person who pays their balance to zero pays
   `100/(R+1)` ¢ of face and then stops. At R=1 that is 50¢; at R=3, 25¢; at
   R=4, 20¢. For a high-intent account that would otherwise have paid 30¢, a
   4:1 match is a giveaway.

### Worked example — $4,237 balance at a 5¢ basis

| | |
| --- | --- |
| Purchase price | $211.85 |
| Servicing (5.41¢ of face) | $229.22 |
| **Break-even collection** | **$441.07 — 10.4¢ of face** |
| Consumer pays, at 4:1, to clear entirely | $847.40 — 20¢ of face |

At 4:1 this person goes **completely debt-free for $847.40 on a $4,237 balance**,
and the account nets ~$406 over purchase price and servicing.

> **Correction, 21 Aug 2026.** This table originally read **$1,059.25** for the
> 4:1 clearing payment. That is `face / R`; the correct figure is
> `face / (R + 1)` = **$847.40**, which is what the formula in the section above
> and the "20¢ of face" label both say ($1,059.25 is 25¢ of face, not 20¢).
> The net was correspondingly overstated at ~$618. **The error made the account
> look more profitable than it is** — the project's own signal that an error is
> not a coincidence. Logged as correction #8 in `docs/research/notes.md`.

**Do not read that as a projection.** It is a statement that the match is
*affordable*, not that it *works*. It assumes a payment that is above the
industry's entire gross recovery on comparable paper. Every figure in that table
flatters the product, which by this project's own rule is precisely when to stop
and look harder.

### Where personalisation actually lives

The clearing cap is the reason this is an ML problem rather than a pricing
decision. The right match ratio is **per account**: deep for accounts unlikely
to pay anything, shallow for accounts likely to pay well regardless. That is a
contextual-bandit problem — which `market.md:104` already identifies as the
answer to cold start — and it is the concrete form of "AI adjusts the loan
because we own it."

This is also the honest answer to "why is this defensible?" Not the model. The
**authority to act on the model's output**, which competitors lack.

---

## Why the established nulls do not apply

`notes.md:233` records two large, well-powered RCTs — five envelope treatments
and nine social-norm/deterrence treatments — all ineffective, several worse than
the original letter. Those results have killed a lot of ideas in this repo and
they should be checked against every new one.

They do not reach H3. **Those experiments varied the message about a fixed
obligation. H3 varies the obligation.** A price change is a different class of
intervention, and nothing in the collections literature reviewed so far tests
one. That is an argument for why H3 *might* work where messaging did not — it is
not evidence that it does.

---

## The honest objection, stated up front

**H3 is structurally a re-run of rev. 1, with a different substitute mechanism.**

Rev. 1 died on this arithmetic (`notes.md`, IRR bridge): a non-litigating buyer
paying market price for litigable paper loses the legal channel, which is **53%
of PRA's US core collections**, and nothing in the behavioural stack replaces it.
Removing legal costs −2,057bp of IRR.

H3 wants **within-SOL paper** — see below — and within-SOL paper is priced *with*
the litigation option intact. Buying it and declining to sue reproduces rev. 1's
exact failure. The only difference is what is offered as a substitute:

| | Substitute for the legal channel | Status |
| --- | --- | --- |
| Rev. 1 | Behavioural messaging, itemised purchases | **Established null** |
| H3 | Changing the amount owed | Untested, not a null |

That is a real improvement in the quality of the bet. It is **not** a resolution
of the arithmetic. The IRR bridge's threshold stands: a 48-month voluntary-only
book needs a **1.94× gross voluntary multiple — 81% of what the industry collects
with courts, in 48 months instead of 180.**

**H3 is not viable unless it can buy paper at a price that reflects our not using
the litigation option.** Sellers do not discount litigable paper for a buyer's
private scruples.

---

## The paper-selection resolution — small-balance within-SOL

The way out is the same move rev. 2 made for H1, applied to a different axis.
H1 bought paper where litigation was unavailable *legally*. **H3 should buy paper
where litigation is unavailable *economically*.**

Below some balance threshold, filing suit costs more than the judgment is worth —
filing fees, service of process, attorney time. Nobody sues on a $400 account.
On that paper:

- The litigation option is already worthless **to every buyer**, so the discount
  should be real and we surrender nothing (H1's logic, intact).
- **The SOL is not expired**, so there is no revival hazard — which removes the
  objection that killed the match mechanic against H1's paper. The match induces
  repeated partial payments by design; on time-barred paper that is a machine for
  handing a future buyer a fresh right to sue.
- Small balances are where a match can plausibly clear someone **completely**.
  A $400 balance at 3:1 is $100 and done. "Debt-free" becomes a reachable
  outcome rather than a slogan, which is the mission stated literally.

**This is the most promising branch and the least verified.** The claim that
small-balance paper is systematically non-litigated, and prices accordingly, is
registered as unverified below. If it is wrong, H3 has no paper to buy and the
objection above is fatal.

---

## Relationship to H1

**Mutually exclusive on paper selection.** H1 buys time-barred paper. H3 needs
within-SOL paper. One book cannot be both.

They are also opposed on mechanism: H1's defensibility depends on *suppressing*
partial payments (no round-ups, no auto-debit, affirmative SOL acknowledgement),
while H3's central mechanic *manufactures* them. Choosing H3 does not amend H1 —
it replaces it.

Rev. 2 stated that H1 is the only surviving hypothesis and that its failure would
require a rev. 3. **H3 is the candidate rev. 3.** If it gates successfully, the
plan should be rewritten around it rather than patched.

---

## New unknowns

Numbered continuing from rev. 2 (U1–U6).

### U7 — Does small-balance paper price below its face-adjusted peers?
The load-bearing question. Compare $/face for sub-$1,000 accounts against
$2,500–5,000 accounts of the same vintage, issuer tier, and channel. If small
balances carry **no** discount, the litigation option is already priced at zero
everywhere and H3 has no entry-price edge.
**Fill:** `sub-$1k ______¢ / $2.5–5k ______¢ / spread ______`

### U8 — Litigation-economics threshold
Below what balance does filing become uneconomic, by state? Drives the buy box
directly. Filing fee + service + attorney cost, against judgment collectability.
**Fill:** `______ median threshold / range ______`

### U9 — Match-response elasticity *(the bet)*
Does a match lift cash collections above the 12.6¢ voluntary baseline, and how
does response vary with R? Must measure **disengagement** alongside payment, per
rev. 2's U5 — a mechanic that raises payment among engaged accounts while driving
avoidance among the rest is invisible in a recovery metric.
**Cannot be answered before Phase 1.** Everything upstream of it is preparation.
**Fill:** `C at R=1 ______¢ / R=3 ______¢ / disengagement delta ______`

### U10 — 1099-C exposure
Cancellation-of-debt income is reportable at ≥$600 by applicable entities under
§6050P. A 4:1 match on a $4,237 balance cancels ~$3,178. Most of this population
is insolvent and could exclude via Form 982 — but that requires them to know, and
handing someone an unexpected tax form is a harm the binding constraint does not
tolerate silently. **Determine: does a debt buyer qualify as an applicable
entity, and does the match structure change the answer?** Legal gate.
**Fill:** `applicable entity Y/N ______ / disclosure required ______`

---

## Kill criteria

- **U7 shows no small-balance discount.** No entry-price edge; the rev. 1
  arithmetic applies unmodified and H3 dies with it.
- **U9 shows C ≤ 12.6¢.** The match does not pay for itself. Note this is a
  *low* bar — clearing it is necessary, not sufficient; the real target is the
  1.94× voluntary multiple.
- **U9 shows the match increases disengagement.** Binding-constraint violation,
  same test that governs U5.
- **U10 finds unavoidable 1099-C exposure with no clean disclosure path.** The
  mechanic hands tax bills to insolvent people. Redesign or abandon.
- **Match copy cannot be written accurately.** Per CLAUDE.md → *Accuracy, not
  modesty*. If the truthful description of the offer does not motivate, the offer
  is not what we thought it was.

---

## Unverified claims register

Per `notes.md` source-quality rules, none of these enter that file until sourced.

1. **Small-balance accounts are systematically not litigated and price at a
   discount.** Plausible and load-bearing (U7/U8). Currently reasoning, not
   evidence.
2. **Match framing outperforms an equivalent flat settlement discount.**
   **Citation VERIFIED 21 Aug 2026; transfer REJECTED.** Karlan & List
   ([*AER* 97(5), 2007](https://www.aeaweb.org/articles?id=10.1257%2Faer.97.5.1774);
   [NBER w12338](https://www.nber.org/papers/w12338)) is exactly as cited —
   >50,000 prior donors, ratios of $1:$1 / $2:$1 / $3:$1, the match raised both
   revenue per solicitation and response rate, and larger ratios "had no
   additional impact." **But the mechanism does not carry to H3, and the specific
   "1:1 is enough" conclusion is probably wrong here.**

   **Why the mechanism does not transfer:**

   | | Karlan & List | H3 |
   | --- | --- | --- |
   | Who funds the match | **A third-party lead donor** | **The creditor who profits from collection** |
   | What the payer's money buys | More of a cause they already support | Reduction of their own liability |
   | Signal carried | A major donor endorses this charity — a quality signal | None. An offer from the profiting counterparty, to a population where "debt not owed" is the top complaint category since 2013 |
   | Population | **Prior donors** — a warm list with demonstrated affinity | Defaulted accounts, often years post-charge-off, cold contact |
   | Affect of paying | Warm glow | Not that |

   Karlan & List identify **two** effects — a price effect and a
   lead-donor signal effect. Only the price effect has an analogue in H3, and
   stripped of the signal it is simply **a 50% settlement discount**, which the
   collections industry already offers routinely. The novelty the study measured
   is largely absent.

   **The sharper problem — why "1:1 is enough" may actively mislead.** In
   charitable giving there is **no finish line**; a donor is never "done," so
   diminishing returns above 1:1 make sense. In H3 the ratio determines
   `100/(R+1)` — **whether paying off the balance is reachable at all.** That is
   a threshold effect with no counterpart in the donation setting.
   `docs/research/market.md` carries the finding that actually governs this:
   Gal & McShane's result that **proportion of accounts eliminated** predicts
   staying debt-free better than dollars paid, rate, or income. **Set the ratio
   by reachability, not by Karlan & List's diminishing-returns curve.**

   This is the third time a behavioural result has been proposed for transfer
   into this population (after Repayment-by-Purchase and round-number targets)
   and the third time the transfer fails on the same fault line: **the mechanism
   was measured on engaged people with a live relationship, and charged-off
   accounts have neither.**
3. **A match is materially different from a settlement offer in consumer
   perception.** Assumed throughout. If consumers read them identically, the
   entire mechanic reduces to a discount that the industry already offers, and
   H3's novelty is only the per-account ratio.

---

## Immediate next actions

1. **U7 and U8 are desk research** — no capital, no licensing dependency. Start
   here; they are cheap and they gate everything else.
2. **U10 to the legal gate** alongside the §1692e(10) match-copy review already
   flagged in CLAUDE.md.
3. **U4 licensing continues regardless.** It is the long pole under every
   hypothesis and does not care which one survives.
4. **Do not build anything.** U9 is the bet and it cannot be measured before a
   portfolio exists. Rev. 2's build-order critique applies here too: optimising a
   mechanic with no accounts attached is optimising a funnel step with no traffic.
