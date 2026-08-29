# ClearSlate v2 - Status Summary

**Date**: 2026-08-28  
**Branch**: h3-gate-sprint  
**Build**: Virtual world simulation complete

## Executive Summary

> **⚠️ SUPERSEDED 28 Aug 2026.** The viability claim below is withdrawn.

Built a complete virtual world simulation framework to test the H3 debt-buying hypothesis.

**Current finding: the simulation does not support H3.** Two corrections landed on 28 Aug:

1. **Gross recovery** — the 22 Aug correction (16.8¢ → ~11¢) had landed in prose but never in `portfolio.ts`, which kept defaulting to the retracted number. Fixed. Consequence: a voluntary-only book covers neither purchase nor servicing (max price **2.43¢** at L=25%, **0.06¢** at L=48.2%, against a 5.4¢ market). H3 is now *entirely* dependent on the match mechanic.

2. **The match lift itself** — the sigmoid parameters had been tuned outside their own stated ranges, in the flattering direction, and the headline was a single seed. Across the stated ranges, **P(clears break-even) is 0.0% at every ratio** (median 4.73¢ at R=2, bar 11.07¢).

**The prior recommendation — launch at R=2, A/B test R=3 — has no support.** U9 is unanswered, the simulation cannot answer it, and answering it empirically costs the price of a portfolio.

See [`docs/research/u9-stress.md`](docs/research/u9-stress.md). Everything below this line predates the corrections.

---

### Original summary (retracted, retained as record)

**Key finding: Match ratio R=2 beats break-even (11.66¢ vs 11.25¢, 74% ROI), R=3 maximizes accounts cleared (338, 55% ROI).** Recommend launching at R=2, A/B testing R=3.

## What Was Built

### Core Modules (Ported from v1, Enhanced)
- ✅ `core/tape.ts` - Account-level tape parsing with defect detection
- ✅ `core/sol.ts` - Statute of limitations per state (NY, TX verified)
- ✅ `core/segment.ts` - Balance-band economics and buy-box wedge analysis
- ✅ `core/underwrite.ts` - Portfolio pricing with H3 upfront servicing costs
- ✅ `core/bridge.ts` - NPV/IRR agreement verification

### Simulation Framework (New, 3,148 lines)
- ✅ **Phase 1: Portfolio Generation** (7 files)
  - Log-normal balance distributions
  - Geographic assignment (SOL-aware)
  - Vintage/temporal data
  - Contact data (email/phone)
  - Defect injection
  - Deterministic (seeded RNG)

- ✅ **Phase 2: Behavioral Simulation** (3 files)
  - 5 consumer archetypes (early responder, hesitant engager, strategic settler, avoider, disputer)
  - Sigmoid match-response model: P(pay | R) = 1 / (1 + exp(-k(R - R₀)))
  - Per-archetype sensitivity adjustment
  - Payment timing (normal distributions)

- ✅ **Phase 3: Operational Simulation** (4 files)
  - Dispute modeling (3% base rate, risk-adjusted)
  - Compliance events (FDCPA, CFPB, state AG)
  - Servicing costs (upfront $1.75/acct, variable 5.41%, dispute $125, compliance $1k)

- ✅ **Phase 4: Scenario Library & Fixtures** (6 files)
  - H3 Baseline (good tape, 1k accounts)
  - Concentration Risk (80% uncovered states)
  - High Defect (30% defects)
  - Barbell Classic (100×$5k + 4000×$50)
  - CLI tools (cli.ts, sweep.ts)
  - Fixture generator

### Test Coverage
- 18/20 tests passing (2 edge cases in behavioral model, end-to-end fully passing)
- Statistical validation (KS test for distributions, χ² for geographic mix)
- Deterministic reproducibility (seeded RNG)
- All fixtures version-controlled

## Key Results

### H3 Baseline at R=3
| Metric | Value |
|--------|-------|
| Face value | $660,567 |
| Purchase price | $35,671 (5.4¢) |
| Cash collected | $68,849 (10.42¢) |
| Accounts cleared | 338 (33.8%) |
| Net profit | $19,453 |
| ROI | 54.5% |

**Break-even**: 11.25¢ (MARGINAL - 0.83¢ below, within model noise)

### Match Elasticity Sweep (R=0 to R=5)
| R | Cash/Face | Cleared | Net Profit | ROI |
|---|-----------|---------|------------|-----|
| 0 | 3.65¢ | 20 | -$21,858 | -61.3% |
| 1 | 6.27¢ | 97 | -$4,602 | -12.9% |
| **2** | **11.66¢** | **269** | **$26,428** | **74.1%** ✅ |
| 3 | 10.42¢ | 338 | $19,453 | 54.5% |
| 4 | 9.24¢ | 369 | $9,927 | 27.8% |
| 5 | 7.65¢ | 377 | $382 | 1.1% |

**Key insight**: R=2 maximizes cash (11.66¢, exceeds break-even), R=3 maximizes accounts cleared (338).

### Strategic Recommendation
1. **Launch at R=2** - Proven break-even, 74% ROI, 269 accounts cleared
2. **A/B test R=3** - On 20% of accounts to validate real clearing lift
3. **If R=3 real data ≥ 11.25¢** - Shift to R=3 (dominates: more accounts + break-even)
4. **If R=3 real data < 11.25¢** - Stay at R=2 (safe break-even)

## Stress Test Scenarios

All scenarios generated with correct QC flags:

### Concentration Risk
- 80% in uncovered states (vs 20% baseline)
- **QC Flag**: `high_unknown_sol_share` ✅
- **Verdict**: Unbuyable under H3 (cannot determine SOL)

### High Defect
- 30% defect rate (vs 2.7% baseline)
- **QC Flags**: `high_defect_rate` ✅
- **Verdict**: Reject or demand steep discount

### Barbell Classic
- 100 accounts × $5k + 4,000 accounts × $50
- Mean $171, median $50 (extreme skew)
- **QC Flag**: `barbell_detected` ✅
- **Verdict**: Flag cross-subsidy, segment filtering required

## Model Calibration Status

### HIGH CONFIDENCE
- ✅ Cost model ($1.75 upfront, 5.41% variable)
- ✅ Geographic distribution (KS p > 0.05)
- ✅ Balance distribution (log-normal fit)
- ✅ Dispute rate (3% FTC verified)

### LOW CONFIDENCE
- ⚠️ Behavioral model (absolute recovery 3.65¢ vs ~6¢ research, 39% below)
- ⚠️ Archetype proportions (literature-based, not empirical)
- ⚠️ Avoider share (37.5% may be high for fintech/BNPL)

**Model is internally consistent** (monotonic elasticity, deterministic, reasonable differentiation) **but produces lower absolute recovery than market research.** Use for RELATIVE comparisons (R=2 vs R=3), not absolute predictions.

## What This Validates

✅ **H3 hypothesis is viable** at R=2-3 range  
✅ **Break-even proven** (R=2: 11.66¢ > 11.25¢)  
✅ **Accounts-closed objective achievable** (R=3: 338 cleared vs 20 at baseline)  
✅ **Cash lift significant** (2.85× at R=3 vs R=0)  
✅ **Profitability strong** (R=2: 74% ROI, R=3: 55% ROI)  

## What's Next

### Immediate (Pre-Launch)
1. ✅ Simulation framework - COMPLETE
2. ⏳ Debt-buyer licensing (30 states, 6-18 months, RMAI CRB) - **LONG POLE**
3. ⏳ Portfolio sourcing (broker outreach, forward-flow agreements)
4. ⏳ Legal review of match mechanics (FDCPA §1692e(10) compliance)

### Post-Launch (Continuous)
1. Calibrate behavioral model to real response data
2. A/B test match ratios (R=2 vs R=3)
3. Track actual vs predicted (response rate, payment rate, clearing rate)
4. Refine archetype proportions with empirical estimates

## Files Created

### Core Simulation (23 files, 3,148 lines)
```
core/simulation/
  generators/          - 7 files (portfolio, balance, geography, temporal, contact, defects)
  behavioral/          - 3 files (consumer, match-response, payment)
  operational/         - 4 files (disputes, compliance, servicing, simulate)
  scenarios/           - 4 files (h3-baseline, concentration-risk, high-defect, barbell-classic)
  fixtures/            - 1 file (generate.ts)
  types.ts             - Shared types
  calibration.ts       - Market parameters
  cli.ts               - Simulation CLI
  sweep.ts             - Match elasticity sweep
  end-to-end.test.ts   - Integration tests
  README.md            - Framework documentation
```

### Documentation
- `docs/simulation-results.md` - Full H3 validation analysis
- `docs/match-ratio-analysis.md` - R=2 vs R=3 strategic comparison
- `STATUS.md` - This file

### Fixtures (Version-Controlled)
- `core/fixtures/virtual-world/h3-baseline.csv` (1,000 accounts)
- `core/fixtures/virtual-world/concentration-risk.csv` (1,000 accounts)
- `core/fixtures/virtual-world/high-defect.csv` (1,000 accounts)
- `core/fixtures/virtual-world/barbell-classic.csv` (4,100 accounts)

## Commands

```bash
# Generate all fixtures
node core/simulation/fixtures/generate.ts

# Run H3 baseline at R=3
node core/simulation/cli.ts h3-baseline 3 42

# Run match elasticity sweep
node core/simulation/sweep.ts

# Run all tests
npm test

# Run simulation tests only
npm test -- core/simulation

# Run end-to-end integration test
node --test core/simulation/end-to-end.test.ts
```

## Dependencies

```json
{
  "seedrandom": "^3.0.5"  // Deterministic RNG
}
```

## Git Status

Untracked new files:
- ✅ Complete simulation framework (`core/simulation/`)
- ✅ Generated fixtures (`core/fixtures/virtual-world/`)
- ✅ Documentation (`docs/simulation-results.md`, `docs/match-ratio-analysis.md`)
- ✅ Package files (`package.json`, `package-lock.json`)

Modified files:
- ✅ `CLAUDE.md` - Updated with simulation completion
- ✅ `README.md` - Added quick start, status
- ✅ `core/underwrite.ts` - Aligned with H3 upfront costs
- ✅ `docs/decisions/h3-ownership-as-product.md` - Simulation results
- ✅ `docs/research/` - Updated benchmarks

Deleted files (v1 card business cleanup):
- ✅ Removed 12 v1 card modules (apr.ts, negotiate.ts, transfer.ts, etc.)
- ✅ Removed 9 v1 docs (product-vision.md, features.md, etc.)

## Conclusion

> ~~**Virtual world complete. H3 hypothesis validated. R=2 beats break-even (11.66¢, 74% ROI). R=3 maximizes accounts cleared (338, 55% ROI). Next gate: debt-buyer licensing.**~~
>
> *Retracted 28 Aug 2026.*

**Virtual world complete. H3 hypothesis is not validated — and the simulation cannot validate it.**

The framework is real and the corrections it surfaced are the valuable output: a stale recovery constant that had survived its own retraction for six days, a `Math.round` on a price ceiling that quoted above the ceiling, response parameters tuned outside their stated ranges, a headline resting on one seed, and a sigmoid that gives the "ignores offers" archetype a 35% payment probability at zero match.

None of that is a business case. All of it is worth knowing before committing capital.

**U9 is the gate.** The match must deliver 1.94× the voluntary baseline at 11¢ gross recovery, and nothing in this repo can tell you whether it does. Answering it empirically costs the price of a portfolio — which is now the cheapest remaining way to find out.

**Next gate: debt-buyer licensing** (30 states, 6–18 months, RMAI CRB) — unchanged, and still the long pole.
