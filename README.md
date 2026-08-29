# ClearSlate v2

**Mission: get people out of debt by buying it and changing what they owe.**

A debt-buying business that buys charged-off consumer debt at pennies on the dollar, then uses personalized match ratios and behavioral psychology to clear whole accounts — not just reduce balances.

## Status

**Simulation framework complete. It does not support H3.**

Two corrections on 28 Aug 2026 removed the case that had been claimed:

- **Gross recovery.** The 22 Aug correction (16.8¢ → ~11¢) had landed in the docs but never in `portfolio.ts`, which kept defaulting to the retracted number. Now fixed, with no default at all — callers pass it explicitly. Consequence: a voluntary-only book covers neither purchase nor servicing (max affordable price **2.43¢**, or **0.06¢** under the verified legal share, against a **5.4¢** market).
- **The match lift.** The response-model parameters had been tuned *outside their own stated uncertainty ranges*, in the flattering direction, and the published figure was a single seed. Swept honestly, **P(clears break-even) is 0.0% at every ratio.**

This does not prove H3 fails — the behavioural model has never met a real response. It proves the simulation cannot be used to argue H3 works. **U9 is the gating unknown, and answering it costs the price of a portfolio.**

Full detail: [`docs/research/u9-stress.md`](docs/research/u9-stress.md) · reproduce with `node core/simulation/stress/u9-report.ts`

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
