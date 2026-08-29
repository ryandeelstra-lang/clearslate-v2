# The $20,000 Experiment

**Date:** 28 Aug 2026
**Budget:** $20,000, hard.
**Purpose: answer U9 — does the match lift payment? — not to make money.**

---

## The reframe

Every model in this repo has asked *"does the portfolio turn a profit?"* At $20k that is the wrong question. No tape this small clears break-even, and chasing one wastes the budget.

The right question is: **what is the cheapest experiment that answers U9?**

U9 is the single gating unknown. `notes.md` #14 established that a voluntary-only book covers neither purchase nor servicing, so H3 is *entirely* dependent on the match mechanic. `u9-stress.md` established that the simulation cannot answer whether the match works — the numbers that said it did came from tuned parameters on one seed.

Answering it needs **statistical power, not margin**. The tape is R&D expense. Budget it as such.

---

## Day-one cost, honestly scoped

| Item | Low | High | |
|---|---|---|---|
| Texas third-party debt collector bond ($10k coverage) | $50 | $100 | Tex. Fin. Code §392.101. Texas requires **no licence** |
| Outside counsel: validation notice + match copy review | $1,500 | $3,500 | One-time. **Do not cut this** — the match copy is the §1692e surface |
| Infrastructure | $0 | $300 | Vercel/Neon/Resend free tiers; domain owned |
| Entity + registered agent + accounting | $300 | $800 | ClearSlate LLC exists; marginal only |
| **Total** | **$1,850** | **$4,700** | |

### Deferred, with the trigger that ends each deferral

| Item | Cost | Defer because | Trigger |
|---|---|---|---|
| RMAI membership + certification | $2,500–5,000 | Required by **sellers**, not by law | First seller who demands it, or any forward flow |
| E&O / cyber insurance | $1,500–5,000 | Common in purchase agreements | Seller demands it, or first tape with identity data at volume |
| NYC licence + $25k bond | $275–1,350 | Buy **TX-only** | Any NY account in the tape |
| ~28 more state licences | $20,000–73,000 | This is U4, the long pole | Not needed to answer U9 |

**Deferred total: $24,275–$84,350.** Treating these as day-one costs is exactly what made the earlier model say $20k was impossible.

---

## What the budget buys

Paper at 5.4¢, plus $0.93/account for the validation notice Reg F makes unavoidable, after $4,700 of fixed cost:

| Avg balance | Accounts | Detects a lift to | vs baseline |
|---|---|---|---|
| $250 | **1,060** | 10.7% | **1.8×** |
| $400 | 679 | 12.1% | 2.0× |
| $661 | 417 | 14.2% | 2.4× |
| $1,000 | 278 | 16.5% | 2.7× |

### This deliberately inverts the buy box

U13 sets *"Balance: $200–$1,500, avg ≥$400"* because per-account costs crush small balances. **That is correct for a tape you intend to profit from and wrong for one you intend to learn from.** Smaller balances buy more accounts per dollar, and accounts are statistical power.

The first tape should be bought against different criteria than every tape after it. Say so explicitly to any broker, and record it so the exception does not silently become the rule.

---

## The design

**3 arms × ~353 accounts: R=0 (control), R=2, R=4.**

| Arms | Per arm | Detects | |
|---|---|---|---|
| 2 | 530 | 1.8× | most power per comparison |
| **3** | **353** | **2.0×** | **recommended** |
| 4 | 265 | 2.2× | |

Why three:

- **R=0 measures the true voluntary baseline** — itself an unknown we have only ever estimated (5.96¢, derived from a gross-recovery figure that was itself wrong for six days).
- **R=2 and R=4 bracket the range and give a dose–response slope.** That slope is what calibrates **R₀**, the sigmoid inflection point the sensitivity analysis showed swings cash **9× more than purchase price does**. A single test ratio cannot estimate a slope.
- A single ratio answers *"does it work."* Three arms answer *"what should we set it to,"* which is the question that immediately follows.

**Power check:** the model at honest parameters predicts payment rates of R=0 7.2%, R=2 20.7%, R=4 43.1% — a 4.7× effect at R=3. The design detects 2.0×. We are **overpowered for the predicted effect**, which is the right place to be given how consistently this model has erred in the flattering direction. If reality is half what the model claims, we still detect it.

### The control arm, and the mission

Withholding the match from ~353 people sits badly against *"get people out of debt."*

**Resolve it with delayed treatment.** When the experiment closes, offer the control arm the same match. We own the paper, so it costs nothing but forgone balance we were never going to collect. The comparison stays clean, and nobody is worse off for having been randomised.

---

## What this buys, and what it does not

**Buys:**
- A powered answer to **U9** — whether the match lifts payment, by how much, and the slope between ratios
- The **true voluntary baseline**, currently an estimate stacked on a corrected estimate
- Real **contact fill** and email deliverability (the other half of U6)
- Real **dispute rate** against the 3% assumption
- A **compliance track record**, which is what makes the next licence and the next seller cheaper

**Does not buy:**
- A profit. Expect to lose most of the $20k. That is the price of the answer.
- External validity beyond the balance band purchased. Small-balance response may differ from $400+ response. State the band in any result.
- Anything about **retention or multi-account LTV** — one tape, one cycle.

---

## The unresolved risk, and the first thing to do

**Can a $265,000-face tape even be sourced?** Brokers deal in $1M+ face and may not transact this small, or may only offer picked-over paper — which would wreck external validity in a way no sample size fixes.

That is a sourcing question, not a modelling one, and **it should be tested before any of the $20k is spent.** A broker conversation costs nothing and could invalidate this entire plan. `docs/outreach/broker-inquiry-draft.md` exists and has never been sent.

**Order of operations:**
1. Broker inquiry — can we buy this small, and what does small-balance fintech/BNPL paper actually cost?
2. If yes → counsel review of the validation notice and match copy ($1,500–3,500)
3. TX bond filing (~$100)
4. Buy, randomise, run
5. If no → the servicing-first route, or a larger raise

Nothing else in the plan matters until step 1 returns an answer.

---

## Reproducing

```bash
node core/simulation/stress/budget-report.ts
```
