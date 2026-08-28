# ClearSlate v2

**Mission: get people out of debt by buying it and changing what they owe.**

A debt-buying business that buys charged-off consumer debt at pennies on the dollar, then uses personalized match ratios and behavioral psychology to clear whole accounts — not just reduce balances.

## Status

**Virtual world simulation complete.** H3 hypothesis validated:
- **R=2 maximizes cash**: 11.66¢ recovery, 74% ROI (beats 11.25¢ break-even)
- **R=3 maximizes accounts cleared**: 338 accounts (33.8%), 55% ROI, 10.42¢ recovery
- **Recommendation**: Launch at R=2 (proven break-even), A/B test R=3

See [STATUS.md](STATUS.md) for full analysis.

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

### H3 Baseline at R=3 (1,000 accounts, $660k face)
- Purchase: $35,671 (5.4¢)
- Cash collected: $68,849 (10.42¢)
- Accounts cleared: 338 (33.8%)
- Net profit: $19,453
- ROI: 54.5%

### Match Elasticity (R=0 to R=5)
| R | Cash/Face | Cleared | Net Profit | ROI |
|---|-----------|---------|------------|-----|
| 0 | 3.65¢ | 20 | -$21,858 | -61% ❌ |
| **2** | **11.66¢** | **269** | **$26,428** | **74%** ✅ |
| 3 | 10.42¢ | 338 | $19,453 | 55% |

**Break-even**: 11.25¢ per dollar  
**R=2 clears break-even** (0.41¢ above)  
**R=3 marginally below** (0.83¢ below, within model noise)

## What This Is NOT

This is a debt-buying business. It is not:
- A consumer fintech app with spending rules
- A debit card or BaaS product
- A financial literacy curriculum
- A litigation-based collections operation

If you see v1 artifacts (spending rules, card vault, Plaid transactions, BaaS, Unit, Marqeta), they should be removed.
