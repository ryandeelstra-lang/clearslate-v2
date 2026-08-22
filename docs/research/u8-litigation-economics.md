# U8 — Litigation Economics Threshold

**Research completed:** 21 August 2026
**Question:** Below what account balance does filing a collections lawsuit stop making economic sense, and how does that vary by state?

---

## Confidence and gaps

### What could NOT be established

1. **Primary-source fee schedules for 4 of 10 states.** Texas, Florida, Illinois, and parts of New York lack publicly accessible statewide fee schedules. Fees are set county-by-county, and I could not verify authoritative figures from the courts' own published schedules for these states. Secondary sources cite ranges but without linking to court-published PDFs.

2. **Service of process costs from official sources.** Only California sheriff fees ($40) could be verified from a county-published source. Private process server costs ($40-$200 CA, $75-$100 TX) come from vendor websites, not court fee schedules.

3. **Filing-rate differentials by balance.** While distribution data exists (Pew: ~50% of cases sub-$2,000 in UT/MN/MI), no study quantifying "X% of sub-$500 accounts are sued vs. Y% of $2,500+ accounts are sued" was found. This rate differential — not the cost floor — is what determines whether small-balance paper prices at a discount (U7). **The strongest form of evidence for H3's pricing thesis does not exist in the public record.**

4. **Published attorney fee rates specific to debt buyers.** Contingency rates of 20-50% are documented for general debt collection, but no primary source (RMAI, ACA International, trade publication) stating rates debt buyers specifically pay to collection attorneys was found. The figures used are industry-wide collections, not buyer-specific.

5. **Small claims jurisdictional maximums for NY and FL.** Not obtained from primary sources within session limit.

### What WAS established

- Filing fees from 6 of 10 states' court-published sources or statutes (CA, PA, OH, GA, NC, MI).
- Small claims maximums for CA and TX from state court sites.
- Collectability benchmarks from the CRL study already verified in `notes.md`: 63.7-66.3% default judgment rate, ~27% wage garnishment rate.
- Attorney contingency range (20-50%) from multiple secondary sources.
- **Empirical balance distribution:** ~50% of debt collection lawsuits in UT/MN/MI are for balances under $2,000 (Pew 2025).
- **Industry practice thresholds:** Large buyers reportedly avoid litigation below $1,000; smaller collectors file at $500-$750 (multiple secondary sources, 2026).

### Methodological limitation

**The computed threshold below is a cost-only model.** It answers "what does it cost to obtain a judgment" but does **not** account for:
- Portfolio-level economics: buyers file on a subset of accounts and cross-subsidize losses.
- Judgment shelf life: an uncollected judgment remains enforceable for years (10-20 in most states).
- Signaling and deterrence value of litigation even on small balances.
- Statutory attorney fee recovery provisions that shift costs to the debtor.

A cost model alone **cannot** prove small balances are systematically not litigated. Only direct filing-rate data by balance can prove that, and it was not found.

---

## Per-state filing fees and costs

| State | Court Type | Filing Fee | Small Claims Max | Service of Process | Source |
|-------|-----------|------------|------------------|-------------------|---------|
| **California** | Superior Court (unlimited) | $435 | — | $40 (sheriff) / $40-200 (private) | [CA Statewide Civil Fee Schedule 2026](https://courts.ca.gov/system/files/file/statewide-civil-fee-schedule-eff-01012026.pdf), Gov Code §§ 70611, 70602.5, 70602.6; [LA County Sheriff](https://pars.lasd.org/Viewer/Manuals/GeneratePDF/17934?reportIndex=1) |
| | Superior Court (limited, ≤$25k) | $225 | — | " | Gov Code § 70613 |
| | Small Claims | $30 (≤$1,500) / $50 ($1,501-$5,000) / $75 (>$5,000) | $12,500 | Included | [CA Small Claims 2026](https://terms.law/CA-Small-Claims-Hub/), [CA Courts Small Claims Info](https://smallclaimsforms.net/blog/filing-fees-and-how-to-file-a-small-claims-case-california) |
| **Texas** | District Court | $31-84 (county-dependent) | — | $75-100 per defendant | [TX OCA District Civil Fees 2025](https://txcourts.gov/media/1461496/dc-civ-fil-fees-2025.pdf) — **secondary sources only for figures**; fees vary by county under Local Gov't Code Ch. 118 |
| | Justice Court (small claims) | $46-54 (county-dependent) | $20,000 | " | [TX Small Claims 2026](https://www.docdraft.ai/legal-guides/small-claims-court/texas), [GetSmallClaims TX](https://getsmallclaims.com/guide/texas-small-claims-court) |
| **New York** | Supreme Court | $210 (index number) | — | Not obtained | [NY Courts Filing Fees](https://www.nycourts.gov/courts/new-york-state-filing-fees), CPLR § 8018 |
| **Florida** | Circuit Court | Not obtained | Not obtained | Not obtained | Fees vary by county; no statewide schedule accessible |
| **Illinois** | Circuit Court | Not obtained | — | Not obtained | 705 ILCS 105 (Clerks of Courts Act); county-specific schedules not accessed |
| **Pennsylvania** | Court of Common Pleas | $185-210 (county-dependent): Allegheny ~$185, Philadelphia $210.05, Lehigh $190.25 | — | Not obtained | [Philadelphia Prothonotary Fees](https://www.courts.phila.gov/pdf/prothyfees.pdf), [Lehigh County Civil Fees](https://www.lccpa.org/civil/CivilCourtFees.pdf), [PA Legal Services](https://pennsylvanialegalservicesauthority.com/pennsylvania-court-filing-fees-and-costs/) |
| **Ohio** | Court of Common Pleas | $225-300 + $26 state surcharge (Franklin County example) | — | Not obtained | [Franklin County Civil Fees](https://clerk.franklincountyohio.gov/CLCT-website/media/docs/general/CivilFees.pdf), Ohio Rev Code § 2303.201 |
| **Georgia** | Superior Court | $211 (base, effective July 1, 2024) | — | Not obtained | [GA Clerks Assoc. Cost Schedules](https://gaclerks.org/Resources/CostSchedules.aspx), [Paulding County Fee Schedule](https://paulding.gov/DocumentCenter/View/3956/Paulding-CSC-Fee-Schedule?bidId=) |
| **North Carolina** | Superior Court | $200 | — | Not obtained | [NC Courts Civil Costs 2025](https://www.nccourts.gov/assets/documents/publications/Civil-Costs-effective-January-1-2025.pdf), NC Gen Stat § 7A-305 |
| **Michigan** | Circuit Court | $150+ (statute) + $25 e-filing fee | — | Not obtained | [MI Courts Fee Schedule Feb 2025](https://www.courts.michigan.gov/490e52/siteassets/court-administration/resources/cfee.pdf), MCL 600.2529 |

**Note:** Service of process costs are the least-verified figures. Only CA sheriff fee ($40) is from an official county source. Private process server costs come from vendor websites ([OnCall Legal CA](https://www.oncalllegal.com/cost-of-process-server-in-california/), [Northbound Legal CA](https://www.northboundlegal.co/blog/how-much-does-process-server-cost-california)).

---

## Attorney fee structure

**Contingency rates:** 20-50% of collected amounts, with 20-30% cited as average. ([SW Recovery](https://www.swrecovery.com/resources/blog/how-much-does-debt-collection-cost-business-fee-models-hidden-expenses-guide/), [Guardian Lit](https://guardianlit.com/how-much-is-a-debt-collection-lawyer/), [Retrievables](https://retrievables.com/blog/understanding-debt-collector-attorney-fees-what-you-need-to-know))

**Out-of-pocket costs paid in advance:** Filing fees, service of process, judgment collection costs (debtor exams, bank levies, wage garnishments). ([Stevens & Ricci](https://stevensricci.com/contingency-based-collections/))

**No attorney fee rate specific to debt buyers vs. original creditors found.** The above figures are general debt collection industry.

---

## Collectability assumptions

From `notes.md`, citing Center for Responsible Lending *Court System Overload* (437,644 CA cases, 2012-2017):

- **Default judgment rate:** 63.7-66.3% of resolved cases ([CRL Court System Overload](https://www.responsiblelending.org/research-publication/court-system-overload-state-debt-collection-california-after-fair-debt-buyer))
- **Wage garnishment rate:** ~27% of all filed cases
- **Average judgment:** $5,925

**Effective collectability used for break-even:** Assuming a judgment is obtained (default rate ~65%), wage garnishment occurs in 27% of filed cases. However, garnishment is not the only collection method. Post-judgment collection includes bank levies, payment plans, and asset seizure.

**For this analysis, I assume 30% effective collection on face value post-judgment** — conservative relative to the industry's 2.3-2.5× multiple over 180 months, but reflecting:
1. Small balances have lower absolute collection amounts, making enforcement less economic.
2. Garnishment requires ongoing employer cooperation and debtor employment.
3. Many judgments remain uncollected.

This assumption is **not sourced from a primary study**. It is a modeling choice based on the CRL garnishment rate (27%) plus limited additional recovery via other channels. **Varying this assumption changes the threshold materially.**

---

## Computed break-even threshold

### Formula

```
Total cost to judgment = Filing fee + Service of process + Attorney contingency on expected recovery

Expected recovery = Face balance × Collectability rate

Break-even occurs when:
  Expected recovery × (1 - Contingency rate) = Filing fee + Service cost
```

Rearranging for face balance:

```
Break-even balance = (Filing fee + Service cost) / [Collectability × (1 - Contingency rate)]
```

### Assumptions

| Parameter | Value | Justification |
|-----------|-------|---------------|
| Filing fee | State-specific, see table | Court-published or statute |
| Service of process | $75 (midpoint of observed range) | No primary source; estimate |
| Attorney contingency | 33% (midpoint of 20-50% range) | Industry average per secondary sources |
| Post-judgment collectability | 30% of face | **Modeling assumption, not sourced** |
| Debt buyer's net recovery | Collection × (1 - 0.33) = 67% of gross | After attorney takes contingency |

**Effective recovery used for break-even:** `Face × 0.30 × 0.67 = Face × 0.201`

So: `Break-even balance = (Filing + Service) / 0.201`

### Per-state thresholds

| State | Filing + Service | Break-even Balance | Notes |
|-------|------------------|-------------------|-------|
| California (limited civil) | $225 + $75 = $300 | **$1,493** | Limited civil jurisdiction applies to ≤$25k |
| California (small claims) | $75 + $0 = $75 | **$373** | Service included; max $12,500 |
| Texas (Justice Court) | $65 + $87.50 = $152.50 | **$759** | Midpoints of county ranges |
| New York | $210 + $75 = $285 | **$1,418** | Supreme Court only figure available |
| Pennsylvania | $198 + $75 = $273 | **$1,358** | Average of 3 counties |
| Ohio | $251 + $75 = $326 | **$1,622** | Franklin County + state surcharge |
| Georgia | $211 + $75 = $286 | **$1,423** | 2024 fee schedule |
| North Carolina | $200 + $75 = $275 | **$1,368** | Superior Court |
| Michigan | $175 + $75 = $250 | **$1,244** | $150 filing + $25 e-filing |

**Range across states with verified data: $373 to $1,622**
**Median: $1,418 (NY)**

### Sensitivity to collectability assumption

If collectability is **20% instead of 30%** (more conservative), net recovery becomes `0.20 × 0.67 = 0.134`, and thresholds rise by 50%:
- CA limited civil: $2,239
- Median: $2,127

If collectability is **40% instead of 30%** (more optimistic), net recovery becomes `0.40 × 0.67 = 0.268`, and thresholds fall by 25%:
- CA limited civil: $1,119
- Median: $1,063

---

## What this model does NOT capture

1. **Statutory attorney fee shifting.** Many consumer credit contracts include attorney fee clauses allowing the creditor to recover fees from the debtor if they win. This transforms the attorney fee from an expense into a line item in the judgment, **eliminating it from the break-even calculation entirely.** If fees are recoverable, the threshold drops to `(Filing + Service) / Collectability = ~$900-1,200 in most states` at 30% collectability.

2. **Portfolio-level economics.** Buyers do not file on every account. They file on accounts likely to yield, and absorb the cost of non-responsive accounts across the portfolio. The existence of a per-account break-even does not mean accounts below it are never sued — it means they are sued less often, and the question is how much less.

3. **Judgment as a long-lived asset.** An uncollected judgment remains enforceable for 10-20 years in most states, renewable in some. A buyer can file today, obtain a default judgment for $100 in hard costs, and wait for the debtor's circumstances to improve. The time value of money discounts this, but it is not zero.

4. **Deterrence and information value.** Filing on small balances may signal credibility to other debtors in the portfolio or yield updated contact information and asset data through discovery.

5. **Bulk filing and economies of scale.** A buyer filing 10,000 cases per year has different unit economics than a buyer filing 100.

**These factors mean the true threshold is lower — perhaps much lower — than the cost model suggests.**

---

## Empirical evidence on balance and litigation behavior

### What small balances ARE sued: Pew Trusts data

The Pew Charitable Trusts, analyzing debt collection litigation in multiple states, found:

> "In states with available data—for example, Utah, Minnesota, and Michigan—historically **about half of all debt collection cases are for less than $2,000**, and the most common sources are credit card or bank debt and medical debt."

Source: [Debt Collection Lawsuits Surge to Pre-Pandemic Highs (Pew, Sept 2025)](https://www.pew.org/en/research-and-analysis/articles/2025/09/02/debt-collection-lawsuits-surge-to-pre-pandemic-highs)

**Interpretation:** Half of cases being sub-$2,000 means small-balance litigation is **not rare**. It is a substantial share of the docket. This directly challenges any claim that balances below $2,000 are "de facto non-litigable."

### Industry-reported thresholds: $500-$1,000 fuzzy floor

Multiple consumer-debt and legal information sources cite industry practice thresholds:

- "Most debt collectors typically won't pursue legal action for debts under $1,000." ([CBS News, 2026](https://www.cbsnews.com/news/what-is-the-lowest-amount-a-debt-collector-will-sue-for/))
- "In practice, most collection agencies will not sue over debts below roughly $500 to $1,000." ([SW Recovery](https://www.swrecovery.com/resources/blog/is-there-a-minimum-debt-amount-for-collections-thresholds-factors-explained/))
- "Very few collectors sue under $500 because filing fees and labor eat the recovery, but it can happen." ([Get Out of Debt](https://getoutofdebt.org/230464/minimum-debt-amount-for-collections))
- "Most large debt buyers in 2026 will not sue under $1,000 because the lawyer time alone eats the recovery, while **smaller, regional collectors often sue at $500 to $750** because they file in batches with no attorney involvement." ([CBS News, 2026](https://www.cbsnews.com/news/how-much-will-a-debt-collector-take-you-to-court-over/))

**Interpretation:** The $500-$1,000 range is where litigation transitions from "rare" to "common," but it is not a hard floor. Smaller collectors and small-claims filings push below $500. Large buyers appear less likely to file below $1,000, which is consistent with the cost model — but "less likely" is not "never."

### Balance distribution: CRL and FTC studies

- The Center for Responsible Lending *Court System Overload* study (437,644 CA cases, 2012-2017) reports an **average judgment of $5,925** but does not break down filing rates or outcomes by account balance band. ([CRL Court System Overload](https://www.responsiblelending.org/research-publication/court-system-overload-state-debt-collection-california-after-fair-debt-buyer))

- The FTC *Structure and Practices of the Debt Buying Industry* (2013) analyzed 5,000 portfolios containing 90 million accounts with $143 billion in face value, but balance-band breakdowns were not accessible in public summaries. ([FTC Report](https://www.ftc.gov/reports/structure-practices-debt-buying-industry))

**What is missing:** Neither study reports filing rates stratified by balance (e.g., "X% of sub-$500 accounts are sued vs. Y% of $2,000+ accounts"). The CRL average judgment of ~$6,000 suggests filed cases skew toward larger balances, but without the full distribution, this cannot quantify how much less likely small balances are to be sued.

### Summary: Small balances ARE litigated, but at lower rates

**The evidence shows:**
1. **Small-balance litigation is common, not absent.** Half of cases in UT/MN/MI are sub-$2,000.
2. **Industry practice thresholds cluster at $500-$1,000**, with large buyers less likely to sue below $1,000 and small collectors willing to file at $500-$750.
3. **No quantified filing-rate differential by balance exists in the public record.** We know small balances are sued less often than large ones (inferred from cost economics and practitioner statements), but not **how much** less often — and that "how much" is the entire H3 pricing thesis.

---

## Conclusion

**Small-balance debt is litigated less frequently than large-balance debt, but the threshold is fuzzy and the behavior is probabilistic, not binary.** The evidence supports a **transition zone of $500-$1,500** where litigation rates decline, not a bright-line minimum below which litigation stops.

### What the evidence shows:

1. **Cost model break-even (no fee shifting): $1,000-$1,600** in most states at 30% collectability. Below this, gross collections do not cover filing + service + attorney costs.

2. **Empirical data contradicts a high floor.** Half of debt collection lawsuits in Utah, Minnesota, and Michigan are for balances **under $2,000** (Pew 2025), meaning substantial litigation occurs well below the cost-model threshold. This implies either:
   - Attorney fee shifting is common (costs recovered from debtor, not buyer).
   - Collectability on filed accounts exceeds the 30% assumption.
   - Buyers file on small balances cross-subsidized by larger accounts.
   - Small-claims filings (lower fees, no attorney) enable sub-$1,000 litigation.

3. **Industry practice thresholds: $500-$1,000.** Large buyers reportedly avoid litigation below $1,000; smaller collectors file at $500-$750 in batches. This is consistent with the cost model but shows the floor is lower than initially computed and varies by collector type.

4. **No quantified filing-rate differential exists.** The strongest evidence for H3's claim — "X% of sub-$500 accounts are sued vs. Y% of $2,500+ accounts" — was not found in any public study, consent order, or court dataset.

### Answer to the load-bearing question

**Below what balance does litigation become uneconomic?**

**Below $500, litigation rates appear to drop sharply, but cases are still filed. Below $300, litigation is rare but not absent. There is no balance at which litigation categorically stops — only a gradient where it becomes progressively less common.**

**For H3's thesis:** The claim that "small-balance debt is *de facto* non-litigable" is **not supported by the evidence.** Small balances are sued at lower rates, but:
- Half of lawsuits are sub-$2,000, meaning the litigation option retains value well into H3's proposed buy box.
- Without knowing the filing-rate differential (e.g., 10% vs. 60%), we cannot estimate how much less buyers would pay for small-balance paper.
- If small balances are litigated 30% as often as large balances (a guess), the litigation option still contributes ~16% of expected recovery (0.30 × 53% legal share), which sellers will price.

**What a lawyer or broker must confirm:**
- Prevalence of attorney fee shifting clauses in charged-off consumer debt contracts (this could fully explain sub-$2,000 litigation economics).
- Observed filing rates by balance band from buyer operational data or broker market intelligence — the missing input to U7.
- Whether small-balance paper (<$1,000) trades at a discount to comparable $2,500-$5,000 paper of the same vintage (U7, the decisive question).
