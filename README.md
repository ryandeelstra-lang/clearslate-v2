# ClearSlate v2

**Mission: get people out of debt by buying it and changing what they owe.**

A debt-buying business that buys charged-off consumer debt at pennies on the dollar, then uses personalized match ratios and behavioral psychology to clear whole accounts — not just reduce balances.

## Status

**Simulation framework complete. It does not support H3.**

Two corrections on 28 Aug 2026 removed the case that had been claimed:

- **Gross recovery.** The 22 Aug correction (16.8¢ → ~11¢) had landed in the docs but never in `portfolio.ts`, which kept defaulting to the retracted number. Now fixed, with no default at all — callers pass it explicitly. Consequence: a voluntary-only book covers neither purchase nor servicing (max affordable price **2.43¢**, or **0.06¢** under the verified legal share, against a **5.4¢** market).
- **The match lift.** The response-model parameters had been tuned *outside their own stated uncertainty ranges*, in the flattering direction, and the published figure was a single seed. Swept honestly, **P(clears break-even) is 0.0% at every ratio.**

Then a third correction partly reversed the second:

- **Servicing cost (U6).** `SERVICING_BPS = 541` was labelled in the code as *"a PLACEHOLDER pending U6. It is not an observed figure."* It is **2.3–8.3× too high** for a digital operation — it came from a buyer that runs call centres and litigates — *and* it was in the wrong unit. Built bottom-up, servicing at scale is **0.33–0.99¢**, not 5.41¢.

**With that corrected, H3 clears at R=3–4 under honest untuned parameters.** H3 does not fail on behaviour; it failed on an inherited cost placeholder.

**The constraint is scale — but far less of it than first modelled.** A fourth correction, prompted by the question *"why does it cost any money to maintain?"*, found that the annual-cost model had priced an **incumbent**: 30 state licences, a bought collections platform, compliance and ops headcount. None of those apply.

| | Incumbent assumption | Actual (lean) | Overstated |
|---|---|---|---|
| Licensing | $21k–75k (30 states) | **$375–1,425** | 15–50× |
| Software | $4.8k–60k (Katabat/Tratta) | **$800–1,200** (self-built) | 6–60× |
| Ops staff | $45k–180k | **$0** (34 disputes/yr) | — |
| **Annual** | **$95,788–434,988** | **$11,175–30,625** | **9–14×** |

Texas requires a $10,000 bond and **no licence**. New York State requires **no licence**. `sol.ts` covers exactly those two states, and the buy box already says *minimum-viable set only*.

**What a viable pilot actually costs:**

| Accounts | Face | Purchase @5.4¢ | + annual fixed | **Total capital** | Median clears |
|---|---|---|---|---|---|
| 1,000 | $661k | $35,671 | $11,175 | $46,846 | — |
| 2,000 | $1.3M | $71,342 | $11,175 | **$82,517** | R=4 |
| 5,000 | $3.3M | $178,354 | $11,175 | **$189,529** | R=3, R=4 |

So the pilot that answers U9 empirically **is fundable** at roughly $83k–190k, not the ~$3.6M the incumbent model implied.

Full detail: [`u9-stress.md`](docs/research/u9-stress.md) · [`u6-servicing.md`](docs/research/u6-servicing.md)
Reproduce: `node core/simulation/stress/scale-report.ts`

**Next gate**: Debt-buyer licensing (30 states, 6-18 months, RMAI CRB)

## The Thesis

Buy small-balance fintech/BNPL debt, set match ratios per account (pay $1, we cancel $2-3 of balance), optimize for **accounts closed** rather than dollars collected. Why accounts? Each account cleared → +0.25 SD cognitive function, −11% anxiety, −10% present bias (Ong et al., *PNAS* 2019).

**Binding constraint**: ClearSlate only profits when principal goes down, never when it stays flat or grows.

## Quick Start

```bash
# Install dependencies
npm install

# Generate simulation fixtures
node core/simulation/fixtures/generate.ts

# Run H3 baseline at R=3
node core/simulation/cli.ts h3-baseline 3 42

# Run match elasticity sweep
node core/simulation/sweep.ts

# Run all tests
npm test
```

## Start Here

1. **[STATUS.md](STATUS.md)** — simulation results, strategic recommendation
2. **[CLAUDE.md](CLAUDE.md)** — current mission, H3 hypothesis, what we're building
3. **[docs/simulation-results.md](docs/simulation-results.md)** — full H3 validation analysis
4. **[docs/match-ratio-analysis.md](docs/match-ratio-analysis.md)** — R=2 vs R=3 comparison
5. **[docs/rules.md](docs/rules.md)** — how to work in this repo

## Layout

```
core/
  tape.ts              Account-level tape parsing (no PII, no ECOA columns)
  sol.ts               Statute of limitations per account
  segment.ts           Per-balance-band economics
  underwrite.ts        Portfolio-level price ceilings
  portfolio.ts         Decay schedules, IRR, NPV
  bridge.ts            IRR bridge (what each choice does to return)
  
  simulation/          Virtual world framework (3,148 lines)
    generators/        Portfolio generation (balances, geography, temporal, contacts, defects)
    behavioral/        Consumer archetypes, match-response model, payment outcomes
    operational/       Disputes, compliance, servicing costs
    scenarios/         H3 baseline, concentration risk, high defect, barbell
    fixtures/          Fixture generator
    cli.ts             Simulation CLI
    sweep.ts           Match elasticity sweep
    
  fixtures/
    virtual-world/     Generated scenario CSVs (deterministic, seeded)

docs/
  decisions/           Operating plans, hypotheses, lessons
  research/            Sourced research (behavioral, asset class, rehabilitation)
  simulation-results.md    H3 validation results
  match-ratio-analysis.md  R=2 vs R=3 strategic comparison

.claude/agents/        Specialist agents (debt acquisition, legal, behavioral, finance)
```

## Key Results

### H3 Baseline, 1,000 accounts, $660k face

**Break-even: 11.07¢ per dollar** (5.40¢ purchase + 5.41¢ servicing + 0.26¢ up-front)

Monte Carlo across the model's own stated parameter ranges — 60 trials per ratio, sampling the response sigmoid plus price, servicing and up-front cost:

| R | P10 | Median | P90 | Cleared | **P(clears break-even)** |
|---|-----|--------|-----|---------|--------------------------|
| 1 | 1.94¢ | 3.98¢ | 6.23¢ | 57 | **0.0%** |
| 2 | 2.65¢ | 4.73¢ | 6.98¢ | 107 | **0.0%** |
| 3 | 4.38¢ | 6.28¢ | 7.75¢ | 203 | **0.0%** |
| 4 | 5.93¢ | 6.74¢ | 7.89¢ | 267 | **0.0%** |

Even the P90 of the best ratio falls ~3¢ short. The single parameter that moves this most is the sigmoid inflection point R₀ (4.28¢ of swing) — **nine times more than purchase price** — and it is the one thing nobody has measured.

Earlier versions of this file reported 11.66¢ and 74% ROI at R=2. That came from tuned parameters on one seed and is retracted; see the status section above.

## What This Is NOT

This is a debt-buying business. It is not:
- A consumer fintech app with spending rules
- A debit card or BaaS product
- A financial literacy curriculum
- A litigation-based collections operation

If you see v1 artifacts (spending rules, card vault, Plaid transactions, BaaS, Unit, Marqeta), they should be removed.
