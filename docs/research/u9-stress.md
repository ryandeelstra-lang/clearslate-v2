# U9 Stress Test — Does the Match Lift Survive Its Own Uncertainty?

**Date:** 28 Aug 2026
**Verdict: No. The simulation cannot currently support H3, and the numbers this repo has been publishing came from parameters tuned to produce them.**

---

## Why this was run

The gross-recovery correction the same day (`notes.md` #14) removed all margin from beneath H3. A voluntary-only book now covers neither purchase nor servicing: max affordable price is 2.43¢ at L=25% and 0.06¢ at L=48.2%, against a 5.4¢ market.

That makes H3 **entirely** dependent on the match mechanic rather than merely improved by it. Everything now rests on U9: *does the match lift cash materially above the voluntary baseline?* The simulation's answer was 11.66¢ at R=2. This test asked whether that number survives contact with its own stated uncertainty.

It does not, for two independent reasons that compound.

---

## Finding 1 — The parameters were tuned outside their own stated range

`calibration.ts` carried both a point estimate and an uncertainty range for the response sigmoid, and **the point estimate sat outside the range on both parameters, in the flattering direction:**

| Parameter | Point estimate | Stated range | |
|---|---|---|---|
| `baseline_k` | **1.5** | [0.5, 1.2] | above the ceiling |
| `baseline_R0` | **1.5** | [2.0, 3.5] | below the floor |

Higher `k` = steeper sigmoid = more responsive to the match. Lower `R₀` = the 50% payment threshold arrives at a shallower ratio. **Both mean more people pay.**

The comment sitting directly above them stated the intent outright:

> *"Calibrated to produce: R=0 baseline: ~6¢ ... R=3 target: >11¢ to beat break-even."*

The parameters were moved until the model returned the answer the thesis needed, and the honest range was left underneath, contradicting them. This is the exact failure `CLAUDE.md` names: *when an error flatters the product, that's a signal.*

**What the tuning was worth**, at R=2, median of 15 seeds:

| Parameters | Cash |
|---|---|
| Tuned (k=1.5, R₀=1.5) | **10.50¢** |
| In-range (k=0.8, R₀=2.5) | **5.95¢** |

**4.55¢** — against a break-even bar of 11.07¢. The tuning was the entire margin and then some.

k=0.8 / R₀=2.5 were the values in place *before* the tuning. They have been restored.

---

## Finding 2 — The headline was a single lucky seed

Separately from the tuning, the published figure was one run. Across 25 seeds on the **unmodified** simulation path, with the tuned parameters still in place:

| Ratio | Min | Median | Max | Clears the 11.07¢ bar |
|---|---|---|---|---|
| R=2 | 9.55¢ | **10.68¢** | 11.83¢ | **5 / 25 seeds (20%)** |
| R=3 | 9.30¢ | 10.23¢ | 11.21¢ | 3 / 25 seeds (12%) |

The published 11.66¢ sits near the top of a distribution whose **median does not clear**. Seed 42 was a good draw.

Seed noise alone is ~2.3¢ wide. The margin being claimed was ~0.6¢.

---

## Finding 3 — Under honest uncertainty, nothing clears

Monte Carlo, 60 trials per ratio, sampling `k ~ U[0.5, 1.2]`, `R₀ ~ U[2.0, 3.5]`, plus purchase price, servicing and up-front cost across their stated ranges:

| R | P10 | Median | P90 | Accounts cleared | **P(clears break-even)** |
|---|---|---|---|---|---|
| 1 | 1.94¢ | 3.98¢ | 6.23¢ | 57 | **0.0%** |
| 2 | 2.65¢ | 4.73¢ | 6.98¢ | 107 | **0.0%** |
| 3 | 4.38¢ | 6.28¢ | 7.75¢ | 203 | **0.0%** |
| 4 | 5.93¢ | 6.74¢ | 7.89¢ | 267 | **0.0%** |

Not "marginal". Zero, at every ratio, with the P90 of the best ratio still 3¢ short of the bar.

### What drives the answer

| Parameter | Range | Cash swing at R=2 |
|---|---|---|
| **sigmoid R₀** | 2.0–3.5 | **4.28¢** |
| sigmoid k | 0.5–1.2 | 1.19¢ |
| servicing bps | 373–541 | 0.47¢ |
| price bps | 500–670 | 0.47¢ |
| up-front cents | 130–250 | 0.47¢ |

**R₀ alone swings the answer by nine times more than the purchase price does.** Every cost parameter combined is worth ~1.4¢; the two behavioural parameters are worth 5.5¢. The business case is dominated by the one thing nobody has measured.

---

## Finding 4 — A model defect that inflates the largest segment

Surfaced while rewriting the behavioural tests. `match_sensitivity` scales the sigmoid's **steepness** (`k`) and nothing else, so every archetype's curve passes through exactly 50% at `R = R₀`:

| R | strategic settler (2.0×) | avoider (0.3×) |
|---|---|---|
| 0 | 1.8% | **35.4%** |
| 1 | 8.3% | 41.1% |
| 2 | 31.0% | 47.0% |
| **2.5 (= R₀)** | **50.0%** | **50.0%** |
| 3 | 69.0% | 53.0% |
| 5 | 98.2% | 64.6% |

Two wrong consequences:

1. **Avoiders sit at 35.4% payment probability with no match offered at all**, and 35–65% across the entire range. The archetype documented as *"ignores offer regardless of ratio"* is the flattest curve, not the lowest one.
2. **Below R₀ the ordering inverts** — the least match-sensitive archetype has the highest payment probability.

Avoiders are **37.5% of the book**, the largest segment. Inflating their payment probability inflates cash. The flattering direction, a third time in one day.

**Not fixed.** Every candidate fix — a per-archetype ceiling, a per-archetype R₀ shift — requires inventing parameters nobody has measured, and would only produce different unvalidated numbers. It is pinned by a test that asserts the defect *exists*, so that fixing it fails loudly and forces a docs update rather than a quiet change in outputs. Resolve it when U9 field data can discipline the choice.

Partial mitigation: in the full pipeline the sigmoid is composed with `response_rate` (avoider = 0.20), which suppresses avoiders before the sigmoid runs. So the end-to-end distortion is smaller than the table suggests — but the sub-R₀ inversion is wrong regardless of gating.

---

## The bar, stated properly

Break-even for the H3 baseline tape (1,000 accounts, $660,567 face) is **11.07¢**, not the 11.25¢ carried in the docs. The 11.25¢ figure assumed a $400 average balance; this portfolio averages $661, so up-front drag is 26bps rather than 44bps.

| Gross recovery | Voluntary baseline | Match must deliver |
|---|---|---|
| 8.25¢ | 4.27¢ | **2.59×** |
| 11.00¢ | 5.70¢ | **1.94×** |
| 12.00¢ | 6.22¢ | **1.78×** |

The 1.94× at 11¢ independently reproduces `H3_TARGETS.required_gross_voluntary_multiple`, which the IRR bridge derived by a different route. That consistency is the one encouraging thing here.

---

## What this does and does not establish

**Does not establish that H3 fails in reality.** The behavioural model has never been validated against a single real response. The stated ranges are themselves an unsourced prior — someone wrote them down. "0% across the range" means *our model, run honestly, gives no support*, not *H3 has a 0% chance*.

**Does establish that the simulation cannot be used to justify H3.** The 11.66¢ headline, the 74% ROI, and every derived figure are properties of a tuned parameter choice evaluated on one seed. They should not appear in a deck, a broker conversation, or an investor memo.

**The honest position:** U9 is unanswered, the simulation cannot answer it, and the model is now correctly showing that instead of concealing it. U9 has to be answered empirically, and the cost of answering it is the price of a portfolio.

---

## Consequences

1. **Every published figure derived from the tuned point is retracted.** `simulation-results.md`, `match-ratio-analysis.md`, `STATUS.md`, `README.md` and `simulation/README.md` all carried 11.66¢ / 74% ROI. Corrected.
2. **`calibration.ts` restored** to k=0.8 / R₀=2.5, with the contradiction documented and the superseded point retained for comparison.
3. **Regression tests added** (`stress/u9.test.ts`, plus rewrites in `behavioral/payment.test.ts`), including one that **fails if H3 ever starts clearing** — forcing whoever changes it to say whether that came from evidence or from re-tuning. Two behavioural tests that asserted tuned *magnitudes* were rewritten to assert *structure*, since magnitude is precisely the unvalidated part.
4. **R₀ is the highest-value thing to measure.** Any U9 field test should be designed to estimate the inflection point first; it is worth more than every cost parameter combined.
5. **Never quote a single seed again.** Seed spread is ~2.3¢, wider than any margin being claimed.

---

## Reproducing

```bash
node core/simulation/stress/u9-report.ts      # full report
node --test core/simulation/stress/u9.test.ts # regression tests
```
