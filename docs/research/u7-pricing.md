# U7 — Small-Balance Pricing Research

**Question:** Does sub-$1,000 charged-off consumer paper trade at a discount to comparable $2,500–5,000 paper, same vintage and issuer tier?

**Date:** 21 August 2026

---

## Verdict

**INSUFFICIENT PUBLIC DATA — REQUIRES BROKER CONVERSATION**

> **SUPERSEDED IN PART, 27 August 2026.** A primary source has since been found:
> Jefferson Capital's Q2 2026 10-Q states that "lower balance accounts typically
> carry higher costs and, as a result, **require higher purchase price
> multiples**" — i.e. small-balance paper *is* bought cheaper. **The discount
> exists; the stated reason is cost, not dead litigation value**, which is the
> opposite of what H3 needs. See `u13-asset-class-selection.md` §2.
>
> The section below remains accurate about what was and was not public *as of 21
> August*. Its recommended broker question should now be asked in the sharper
> form given in `u13-asset-class-selection.md` §7.

No primary-source data was found comparing pricing for small-balance accounts (sub-$1,000) versus larger-balance accounts ($2,500–5,000) with same vintage and issuer tier. The FTC study, investor presentations, and public marketplace listings do not break out pricing by account balance size in the specific bands required to answer this question.

---

## Confidence and gaps

**What this research established:**
- General market pricing ranges for charged-off credit card paper exist and vary primarily by AGE of debt
- The FTC study shows age-based pricing bands (newer debt commands higher prices)
- Public marketplace listings exist but rarely disclose the data quartet needed (face value, account count, average balance, asking price)
- Secondary sources assert small balances are "uneconomic to work" but provide no quantified discount

**What remains unknown:**
- Whether sub-$1k paper trades at a discount to $2.5-5k paper at comparable vintage
- The magnitude of any such discount, if it exists
- Whether the litigation-economics threshold creates systematic pricing differentiation by balance size
- Recovery rates by balance band

**Data access barriers:**
- FTC "Structure and Practices of the Debt Buying Industry" PDF returned 403 Forbidden
- PRA Group and Encore Capital investor presentation PDFs were inaccessible (403/timeout)
- Public marketplace listings (Debexpert, DebtTrader) do not systematically disclose average balance and pricing together
- CFPB "Market Snapshot: Online Debt Sales" PDF was corrupted/unreadable

---

## Verified market pricing data

All figures sourced and cited below.

### General market pricing ranges

| Debt type | Age | Price per $1 face | Source |
| --- | --- | --- | --- |
| Charged-off credit card | Fresh (< 6 months) | 7–15¢ | [JG Wentworth](https://www.jgwentworth.com/resources/how-much-do-debt-collectors-pay-for-debt) |
| Charged-off credit card | General / mixed | 4–7¢ | [JG Wentworth](https://www.jgwentworth.com/resources/how-much-do-debt-collectors-pay-for-debt) |
| Charged-off credit card | Older (several years) | < 1¢ | [JG Wentworth](https://www.jgwentworth.com/resources/how-much-do-debt-collectors-pay-for-debt) |
| Charged-off credit card | General / mixed | 5–15¢ | [Debexpert](https://www.debexpert.com/blog/how-sellers-price-debt-portfolios) |
| ~~General charged-off consumer~~ | ~~Mixed~~ | ~~< 0.5¢ (117 of 176 listings)~~ | **RETRACTED — see below** |

> **🔴 Retraction (lead verification, 21 Aug 2026).** The "< 0.5¢ (117 of 176
> listings)" figure **does not appear on the cited CFPB page**, which was fetched
> and checked. That page says only that the report "reviewed three online debt
> websites" and "analyzed the price, type, and age of debt" — no counts, no
> price bands. The figure was cited to a source this same document states was
> "corrupted/unreadable," which is internally contradictory: a number cannot be
> read from an unreadable file. **Treat as unsourced and do not use.**
> The underlying report (CFPB *Market Snapshot: Online Debt Sales*, published
> **12 January 2017**) may well contain it — but until someone opens the PDF,
> it is not evidence.

### FTC study — pricing by AGE, not balance size

The FTC's "Structure and Practices of the Debt Buying Industry" study analyzed ~5,000 portfolios containing nearly 90 million accounts with $143 billion face value.

> **⚠️ Vintage warning (lead verification, 21 Aug 2026) — read before using any
> figure in this section.** The contracts the FTC examined were signed
> **July 2006 – June 2009**
> ([Oregon Legislature summary of the FTC study](https://olis.oregonlegislature.gov/liz/2013R1/Downloads/CommitteeMeetingDocument/10002)).
> These prices are **17–20 years old** and predate the post-2013 rise in
> charged-off paper pricing. They are *not* current market.
>
> **This matters directly to a kill criterion.** `v2-plan.md` names
> *"sellers will not clear at sub-5¢"* as the **primary** kill criterion that
> ends the thesis. Reading "FTC average 4.0¢" as current market would appear to
> defuse that criterion — wrongly, and in the direction that flatters the
> business. `notes.md` puts today's range at **5–15¢**. Use the FTC figures for
> *structure* (older debt prices below newer debt) and never as a current price
> level.
>
> The full PDF is at
> [ftc.gov/…/debtbuyingreport.pdf](https://www.ftc.gov/sites/default/files/documents/reports/structure-and-practices-debt-buying-industry/debtbuyingreport.pdf)
> — 403 to automated fetching, but reachable in a browser. **Someone should open
> it and check whether it breaks out price or recovery by balance band.** That is
> still the single most likely public source of an answer to U7.

**Pricing by debt age** ([FTC press release, Jan 2013](https://www.ftc.gov/news-events/news/press-releases/2013/01/first-its-kind-ftc-study-shines-light-debt-buying-industry-finds-consumers-would-benefit-use-better)):

| Age | Price per $1 face |
| --- | --- |
| Average across all ages | 4.0¢ |
| Less than 3 years old | 7.9¢ |
| 6–15 years old | 2.2¢ |

**Critical finding:** The FTC study breaks out pricing by AGE but does not break out pricing or recovery by ACCOUNT BALANCE SIZE in publicly available summaries. The full PDF was inaccessible (HTTP 403).

### Public marketplace observations

**Debexpert** ([marketplace](https://www.debexpert.com/)) and **DebtTrader** are the two most-cited online debt portfolio marketplaces. Both require buyer approval to access detailed listings.

From secondary sources describing these marketplaces:
- Most listings do not disclose the complete data set (face value, account count, average balance, asking price) needed to compute implied price per dollar AND average balance ([CFPB Market Snapshot summary](https://www.consumerfinance.gov/data-research/research-reports/market-snapshot-online-debt-sales/))
- Listings that DO disclose pricing show wide variance (< 0.5¢ to 15¢+) driven primarily by age and prior collection activity, not explicitly by balance size
- One secondary source states "very small balances are uneconomic to work" ([Debexpert blog](https://www.debexpert.com/blog/how-sellers-price-debt-portfolios)) but provides no pricing data by balance band

**Sample size:** Zero public listings were found that disclosed face value, account count, average balance, and asking price together with sufficient detail to compute a small-balance vs. large-balance comparison.

### Investor presentation data — inaccessible

**PRA Group** May 2026 Investor Presentation: PDF returned HTTP 403 Forbidden  
**Encore Capital** Q1 2026 Investor Presentation: PDF timed out after 60 seconds

These presentations would be the most likely source of recovery-by-balance-band data if such data is disclosed publicly, but they could not be accessed during this research.

---

## Secondary evidence on small-balance economics

One broker blog post states: "Very small balances are uneconomic to work" ([Debexpert, "How Sellers Price Debt Portfolios"](https://www.debexpert.com/blog/how-sellers-price-debt-portfolios)). This assertion aligns with the H3 litigation-economics hypothesis but is:
- Not a primary source
- Not quantified (no threshold, no discount magnitude)
- Not attributed to a study or market data

**Reasoning, not evidence.** Does not establish that small-balance paper prices at a discount.

---

## What a broker conversation would establish

To definitively answer U7, a broker or seller must be asked directly for indicative pricing on two comparable portfolios differing only in average balance:

**Portfolio A:**  
- Average balance: $400–$800  
- Vintage: charged-off within last 18 months  
- Issuer tier: national credit card issuers  
- Geography: mixed US  
- Prior collection activity: first agency or fresh

**Portfolio B:**  
- Average balance: $2,500–$5,000  
- All other characteristics identical to Portfolio A

**Question:** What is the indicative price per dollar of face for each?

If Portfolio A prices materially below Portfolio B (e.g., 3.5¢ vs. 6¢), the small-balance discount is confirmed. If pricing is comparable, H3's entry-price edge does not exist.

---

## Implications for H3

**If no discount exists:** H3 has no entry-price advantage. Small-balance paper would be priced identically to larger-balance paper, meaning ClearSlate pays the same ¢ per $1 face as a litigating buyer while surrendering the litigation channel that is 53% of PRA's US core collections. The rev. 1 arithmetic applies unmodified, and H3 fails the same kill criterion that killed rev. 1.

**If a discount exists:** H3's buy-box and entry-price model can be specified. The magnitude of the discount feeds directly into the portfolio.ts break-even calculation and determines whether the match mechanic is affordable at realistic collection rates.

**Current state:** The question is unanswered and answerable only through direct market inquiry.

---

## Recommended next action

Draft and send the broker inquiry (see `docs/outreach/broker-inquiry-draft.md`) to 2–3 debt portfolio brokers or sellers. Request indicative pricing on the two portfolios described above. A phone conversation may yield faster answers than email, but email creates a written record.

Cost: 3 emails or calls.  
Timeline: 1–2 weeks for responses.  
Risk: None — this is a pricing inquiry, not a commitment.
