# Match Ratio Analysis

> # ⚠️ RETRACTED — 28 Aug 2026
>
> **Every number below is withdrawn. Do not quote this document.**
>
> The figures came from sigmoid parameters tuned *outside their own stated
> uncertainty range*, in the flattering direction, evaluated on a **single
> seed**. Two independent problems:
>
> - **Tuning.** `baseline_k` was 1.5 against a stated range of [0.5, 1.2];
>   `baseline_R0` was 1.5 against [2.0, 3.5]. Both mean more people pay. The
>   tuning was worth **4.55¢** at R=2 — more than the entire margin being
>   claimed.
> - **Single seed.** Across 25 seeds at those same tuned parameters, R=2 spans
>   9.55–11.83¢ with a **median of 10.68¢**, clearing the bar in **5 of 25
>   seeds**. The 11.66¢ headline was near the top of the distribution.
>
> Run honestly across the stated ranges, **P(clears break-even) is 0.0% at every
> ratio**, with a median of 4.73¢ at R=2 against an 11.07¢ bar.
>
> The correct bar is **11.07¢**, not the 11.25¢ used below — that assumed a $400
> average balance; this portfolio averages $661.
>
> **The strategic recommendation below (launch at R=2, A/B test R=3) has no
> support.** See [`docs/research/u9-stress.md`](research/u9-stress.md).
> Reproduce: `node core/simulation/stress/u9-report.ts`.
>
> Retained unedited as a record of what was claimed.

## Summary

**R=2 maximizes cash (11.66¢, exceeds break-even). R=3 maximizes accounts cleared (338 vs 269). H3 should target R=2-3 range based on strategic priority: profit (R=2) vs rehabilitation (R=3).**

## Full Elasticity Curve

| R | Cash | Cash/Face | Cleared | Net Profit | ROI |
|---|------|-----------|---------|------------|-----|
| 0 | $24,118 | 3.65¢ | 20 | -$21,858 | -61.3% |
| 1 | $41,436 | 6.27¢ | 97 | -$4,602 | -12.9% |
| **2** | **$77,015** | **11.66¢** | **269** | **$26,428** | **74.1%** |
| 3 | $68,849 | 10.42¢ | 338 | $19,453 | 54.5% |
| 4 | $61,023 | 9.24¢ | 369 | $9,927 | 27.8% |
| 5 | $50,537 | 7.65¢ | 377 | $382 | 1.1% |

**Portfolio**: H3 Baseline (1,000 accounts, $660,567 face, seed 42)

## Key Findings

### 1. R=2 is the cash optimum
- **Cash**: 11.66¢ per dollar ($77,015 collected)
- **ROI**: 74.1% (best)
- **Cleared accounts**: 269 (26.9%)
- **Break-even**: PASS ✅ (0.41¢ above 11.25¢ threshold)

### 2. R=3 maximizes accounts cleared
- **Cash**: 10.42¢ per dollar ($68,849 collected)
- **ROI**: 54.5% (still strong)
- **Cleared accounts**: 338 (33.8%, best)
- **Break-even**: MARGINAL (0.83¢ below 11.25¢, within model noise)

### 3. The cash-vs-accounts tradeoff
- R=2 → R=3: -11.9% cash, +25.7% accounts cleared
- R=3 → R=4: -13.1% cash, +9.2% accounts cleared (diminishing returns)

### 4. Plateau beyond R=3
- R=4 and R=5 show declining cash AND ROI
- Accounts cleared increase slows (369 → 377, only +2.2%)
- **Clearing cap effect**: Once most responsive archetypes have cleared, higher R just reduces cash without clearing many more accounts

## Strategic Implications

### For Profit Maximization: Use R=2
- 11.66¢ > 11.25¢ break-even (SAFE)
- 74.1% ROI (20% higher than R=3)
- Still clears 269 accounts (26.9%)

### For Rehabilitation Maximization: Use R=3
- 338 accounts cleared (25.7% more than R=2)
- Aligns with H3's "accounts closed rather than dollars collected" objective (U14)
- 10.42¢ is 0.83¢ below break-even but within LOW CONFIDENCE model noise
- 54.5% ROI still strong

### Recommended: Start at R=2, test R=3 with subset
1. **Launch at R=2** to ensure break-even on first portfolio
2. **A/B test R=3** on 20% of accounts to validate real clearing lift
3. **If R=3 real data matches model** (33.8% clear, 10.42¢ cash), shift to R=3
4. **If R=3 real data exceeds model** (e.g., 12¢ cash due to archetype calibration), R=3 dominates

## Why the Model Shows This Pattern

### Sigmoid behavior
P(pay | R) = 1 / (1 + exp(-k(R - R₀))) with k=1.5, R₀=1.5

- At R=1.5 (inflection): 50% pay
- At R=2: ~76% pay
- At R=3: ~88% pay
- At R=4: ~93% pay

**Diminishing marginal returns**: Each +1 in R adds less P(pay) as sigmoid asymptotes.

### Clearing cap
Clearing amount = balance / (R+1)

- At R=2: pay 33% of balance to clear
- At R=3: pay 25% of balance to clear
- At R=4: pay 20% of balance to clear

**Lower clearing amount → more accounts clear BUT less cash per account.**

### Cash = P(pay) × clearing amount × completion rate
- R=2: 76% pay × 33% balance × 65% complete ≈ 16.4% of face
- R=3: 88% pay × 25% balance × 70% complete ≈ 15.4% of face
- R=4: 93% pay × 20% balance × 75% complete ≈ 14.0% of face

**Model predicts cash peaks at R=2, then declines** despite higher payment rates.

## Validation Against Real Data

When first portfolio response data arrives, compare:

| Metric | R=2 Predicted | R=3 Predicted | Actual (R=?) |
|--------|---------------|---------------|--------------|
| Response rate | 61.6% | 61.6% | |
| Payment rate | 76% | 88% | |
| Cash/face | 11.66¢ | 10.42¢ | |
| Cleared | 269 (26.9%) | 338 (33.8%) | |

**If actual R=3 cash > 11.25¢**: R=3 dominates (break-even + more accounts)
**If actual R=3 cash < 11.25¢**: R=2 is safer (proven break-even)

## Next Steps

1. **Model calibration uncertainty**: Run Monte Carlo with k ∈ [0.5, 1.2], R₀ ∈ [2.0, 3.5] to quantify R=2 vs R=3 break-even probability
2. **Cost sensitivity**: If upfront or variable costs are lower than modeled, R=3 clears break-even
3. **Archetype re-calibration**: If avoider share < 37.5% (younger fintech/BNPL cohort), both R=2 and R=3 improve

## Conclusion

**R=2 is the conservative choice** (proven break-even, 74% ROI). **R=3 is the mission-aligned choice** (more accounts cleared, within model noise of break-even). **Recommend launching at R=2, A/B testing R=3, then shifting to R=3 if real data validates.**
