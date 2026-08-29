# LOCKED — The $20,000 Decision

**Date:** 29 Aug 2026
**Status:** Decided. Not a menu.

---

## The decision

**Run a 3-arm, group-sequential match experiment. Get the paper on contingency if possible, buy ~1,400 accounts at 4.0¢ if not. Spend nothing until sourcing is confirmed.**

| | |
|---|---|
| **Design** | 3 arms — R=0 (control), R=2, R=4 |
| **Analysis** | Group-sequential, O'Brien–Fleming, 3 looks |
| **Primary outcome** | Payment rate per account |
| **Secondary** | Cash per dollar of face; accounts cleared; dispute rate |
| **Randomisation** | Stratified by balance band and vintage |
| **Control arm** | Delayed treatment — offered the same match once the trial closes |
| **Stop rule** | Stop at any look where the boundary is crossed |

---

## Why this beats the previous plan

The earlier plan reached 1,060 accounts by trimming costs. It treated three inputs as fixed that were not.

### 1. We were paying blended price for the cheapest segment

The market spans **<1¢ to 15¢** — fresh paper 7–15¢, several-year-old under 1¢, small balances explicitly discounted (*"very small balances are uneconomic to work"*), secondary placements *"price sharply lower."*

**5.4¢ is JCAP's blend across all balances, ages and types.** We are buying the cheapest segment in the market and were budgeting the average price for it.

| Price | Cost/account | Accounts | Validity |
|---|---|---|---|
| 5.4¢ | $13.50 | 1,060 | blended — not our segment |
| **4.0¢** | **$10.00** | **1,399** | **inside the buy box — the honest pick** |
| 3.0¢ | $7.50 | 1,814 | already worked once; baseline reads low |
| 1.5¢ | $3.75 | 3,269 | ⚠️ destroys external validity |

**1.5¢ buys the most accounts and ruins the answer. Not a trade to make.**

### 2. We assumed we have to buy

A creditor placing accounts on **contingency with pre-authorised settlement bands** costs **$0 to acquire** and answers the identical question. The budget then supports ~16,000 accounts rather than 1,400.

The creditor's economics are good: they sell nothing, and net 60–70% of whatever we collect on paper they have already written off — comparable to a 5.4¢ sale, without the sale. **The blocker is trust and settlement authority, not economics.**

⚠️ **The brand confound is real and cuts against us.** Servicing as *"on behalf of [known lender]"* gets better response than *"ClearSlate, who bought your debt."* A contingency result would **overstate** what we achieve as an unknown buyer. **Mitigation: insist on servicing under ClearSlate's own brand.** That is negotiable and worth holding out for — without it the result does not transfer.

### 3. We powered a fixed-n trial

Fixed-n to detect a doubling is 354/arm. Group-sequential with 3 looks: max 361/arm, but **expected 232/arm** when the effect is real.

And the effect the model predicts is not a doubling — it is **6% → 43.1% at R=4, a 7× lift**. Against an effect that large the trial crosses the boundary at the **first look, around 18 accounts per arm.**

**We would know inside weeks, having spent a fraction of the budget.** That is the single largest efficiency available, and it costs nothing but analysing the data three times instead of once.

---

## Budget

**Fallback (purchase), if contingency is unavailable:**

| | |
|---|---|
| Paper: 1,399 accounts @ 4.0¢, $250 avg | $13,990 |
| Validation mail @ $0.93 | $1,301 |
| Day-one fixed | $4,700 |
| **Total** | **$19,991** |

466 per arm — detects a **2.0×** lift, comfortably inside the predicted 7×.

**Primary (contingency):** $4,700 fixed + mail only on accounts worked. Leaves ~$14,000 as reserve — which funds the *second* experiment, or the licence set if the first answer is good.

---

## Order of operations

1. **Send the broker inquiry.** It has been sitting in `docs/outreach/broker-inquiry-draft.md` unsent. Ask two things: can we buy ~$350k face of recent-vintage small-balance fintech/BNPL paper, and at what price for that segment specifically.
2. **In parallel, approach fintech lenders directly** about contingency placement with pre-authorised settlement bands at R=2 and R=4, serviced under our brand.
3. **Counsel — scoped, not general.** See below.
4. **File the TX bond** (~$100).
5. **Buy or take placement. Randomise. Run. Look three times.**

**Nothing is spent until step 1 or 2 returns an answer. Both plans die on sourcing, not on money.**

---

## What the counsel budget must actually buy

Not "review the letters." Scope it to one question worth ~$1 per account, forever:

> §1006.34(a)(1)(i) permits validation information **(A)** in the initial communication, **(B)** within five days, or **(C)** orally. §1006.42(b) attaches the E-SIGN requirement only to **(B)**.
>
> **If (A) or (C) avoids E-SIGN, the mailed validation notice is avoidable — and with it the entire per-account cost floor.**

I could not resolve this from the regulation text and will not guess. It is the highest-value legal question in the business: at 100k accounts it is worth ~$93,000 a year, and it determines whether "email-first" is a real operating model or a slogan.

Second question for the same spend: exact §1692e-safe wording for the match offer.

---

## What we learn, and what we still will not know

**Learn:** whether the match lifts payment and by how much; the **dose–response slope** between R=2 and R=4, which is what calibrates R₀ — the parameter that swings cash 9× more than purchase price does; the true voluntary baseline; real contact fill, deliverability and dispute rates.

**Still unknown:** retention and multi-account LTV (one tape, one cycle); whether small-balance response generalises to $400+ balances; whether *self-directed* clearing produces the psychological benefit that *gifted* clearing provably does not (Kluender 2024) — that needs the wellbeing instrument at intake and +90 days, which must be **pre-registered before the first contact or it cannot be claimed at all**.

---

## Reproducing

```bash
node core/simulation/stress/locked-plan.ts
```
