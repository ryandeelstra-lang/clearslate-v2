# U13 — Which paper to buy (asset class, not balance band)

**Researched:** 27 August 2026
**Question:** U7 and U8 asked *what size* account to buy. Neither asked *what
kind*. Every pricing figure in this repo is credit-card-derived. This file asks
which asset class a non-litigating, digital-only, principal-forgiving owner
should be buying at all.

**Primary source of record:** Jefferson Capital, Inc. (NASDAQ: JCAP) —
[Form 10-Q for the quarter ended 30 June 2026](https://www.sec.gov/Archives/edgar/data/2046042/000110465926095946/jcap-20260630x10q.htm)
(filed 13 Aug 2026) and its
[Form DRS registration statement](https://www.sec.gov/Archives/edgar/data/2046042/000110465925009613/filename1.htm).
This is the first time this project has read a current SEC filing from a debt
buyer whose stated strategy **is** small-balance paper. It changes several
numbers the model has been running on.

---

## Verdict

**Buy fintech/BNPL-originated installment paper, recent vintage, small balance,
in the U4 minimum-viable licensing states. De-prioritise medical. Do not lead
with prime credit card.**

The reason is not price. It is that this is the only class where the two things
ClearSlate specifically needs are both true:

1. **A Reg F-usable email or mobile that the originator actually used.** U6
   named this and nothing has answered it. On a digitally-originated loan the
   consumer's email *is* the account of record — it is how the loan was applied
   for, disclosed, and serviced. On a bank card it is frequently absent from the
   tape. This is the difference between a business and one mailed letter against
   a 10–30% undeliverable rate.
2. **Account-level provenance that actually conveys.** Rev. 1 died partly on
   U1: transaction history does not convey, the OCC norm is 12 statements. On a
   BNPL account **the account is one transaction**. There is no 12-statement
   horizon problem because there is no statement series — there is a loan, a
   merchant, and an amount, all natively in a database rather than in a
   microfiche vault.

**But read the next section before treating that as good news.** The same
research materially weakens the H3 arithmetic, and the honest reading is that
U13 improves the *operability* of the thesis while making its *return threshold*
harder to hit.

---

## Confidence and gaps

### Established from primary sources
- Current market entry price and collection multiples, from an SEC filing dated
  six weeks ago (not a broker blog, not the 2013 FTC study).
- That an incumbent states in a filing that **lower-balance accounts require
  higher purchase price multiples** — i.e. they are bought cheaper, for a stated
  reason. This is the first primary-source evidence bearing on U7.
- Asset-class TAM and charge-off ratios for the US market, 2019 vs 2023.
- That the largest specialist in small-balance paper is *increasing* its
  litigation spend, not decreasing it.

### Not established
- **Price per dollar by asset class.** JCAP discloses a blended figure across
  geographies and both business lines. No issuer, buyer or broker publishes
  price by class. U7's core comparison still requires a broker conversation.
- **Contact-data fill rates by class.** The claim that fintech tapes carry
  usable email at materially higher rates than card tapes is **reasoning, not
  evidence** — see the unverified register. It is the load-bearing claim of this
  file and it is answerable with two emails.
- **Whether any of these classes will be sold to a first-time buyer.** Seller
  approval, not price, is the first gate. Unexamined here.
- Recovery rates by class. Nobody discloses them.

---

## 1. What the current market actually costs — and what it returns

All figures from the JCAP 10-Q for Q2 2026 unless noted.

| | H1 2026 | H1 2025 |
| --- | --- | --- |
| Face purchased | $5,581.3M | $4,517.0M |
| Purchase price | $301.9M | $300.5M |
| **Price as % of face** | **5.4%** | **6.7%** |

Same money, 24% more face. Supply is up and price is down — consistent with the
record card balances and elevated charge-offs reported through 2025–26.

**This is the first datapoint that speaks directly to rev. 2's primary kill
criterion.** `v2-plan.md` says *"sellers will not clear at sub-5¢"* ends the
thesis. A public buyer's blended book — weighted toward telecom, utilities,
installment and small-balance card — is transacting at **5.4¢**, down from 6.7¢
a year ago. Sub-5¢ is no longer obviously outside the market. It is one bad
quarter of supply away.

Note what that figure is *not*: it is company-wide, spanning the US, UK, Canada
and Colombia, and both Distressed and Insolvency lines. **A US-only price is not
disclosed.** Do not quote 5.4¢ as a US spot price.

### Collection multiples — the number that pressures H3

US Distressed, gross collections ÷ purchase price, undiscounted, no deduction
for cost-to-collect:

| Vintage | Current multiple | Original estimate at year of purchase |
| --- | --- | --- |
| 2021 | 2.06× | 1.97× |
| 2022 | 1.94× | 2.00× |
| 2023 | 2.23× | 2.11× |
| 2024 | 2.19× | 1.98× |
| 2025 | 2.09× | 2.05× |
| 2026 | 2.29× | 2.29× |

All-segment total for the 2026 vintage: **1.92×**.

**Three consequences, and none of them flatter the model.**

**(a) `GROSS_RECOVERY_BPS = 1680` is too high.** `portfolio.ts` derives 16.8¢
from a 7¢ price × a 2.4× multiple. Both inputs are stale. At today's 5.4¢ and a
US Distressed multiple of 2.0–2.3×, implied gross recovery is **≈11–12¢ per $1
of face, all-channel, courts included** — roughly 30% below the constant the
model runs on. Every ceiling this repo has printed is therefore too generous.
Because `underwrite()` is linear in gross recovery, the correction is
proportional and immediate.

⚠️ **Caveat, stated because the arithmetic is tempting and slightly wrong:**
5.4¢ is the blended company price and 2.0–2.3× is the US Distressed multiple.
Multiplying one by the other mixes populations. Treat 11–12¢ as an order-of-
magnitude correction that says "1680 is too high", not as a replacement
constant. The replacement constant needs a US-only price, which is not public.

**(b) H3's stated threshold is above what the best small-balance specialist
achieves *with* courts.** `h3-ownership-as-product.md` carries the IRR bridge's
requirement: a 48-month voluntary-only book needs a **1.94× gross voluntary
multiple**. JCAP's 2026 US Distressed vintage is estimated at 2.29× and its
all-segment book at 1.92× — over 180 months, with an in-house UK law firm,
external US collection counsel, and rising court spend. **We would need to match
that in 48 months with no litigation at all.** This does not kill H3. It does
mean the threshold was set at "roughly the whole industry's lifetime result" and
should be read that way.

**(c) The incumbent is doubling down on courts.** Q2 2026 servicing expense:

| Line | Q2 2026 | Q2 2025 | Change |
| --- | --- | --- | --- |
| Court costs | $21.7M | $12.4M | +74.6% |
| Legal commission | $10.8M | $6.7M | +61.9% |
| Agency and repo commission | $15.0M | $12.6M | +19.0% |
| Communications | $8.3M | $5.8M | +42.8% |
| Offshore | $4.1M | $3.3M | +23.8% |
| Other | $5.0M | $2.7M | +84.0% |
| **Total** | **$64.8M** | **$43.5M** | **+48.9%** |

Court costs plus legal commission are **50% of servicing spend**, and the
fastest-growing lines in the business. The filing describes court costs as
"incurred upfront at the outset of consumer litigation in anticipation of
generating future collections."

Read plainly: the specialist in exactly the small-balance paper H3 wants to buy
is spending half its servicing budget on the channel H3 forgoes, and increasing
it by 75% year over year. That is the strongest available evidence that the
litigation option on small balances **is not worthless**, which is U8's finding
arrived at from the other direction.

---

## 2. The first primary-source evidence on U7

U7 asked whether sub-$1,000 paper trades below comparable $2,500–5,000 paper and
returned INSUFFICIENT PUBLIC DATA. There is now a partial answer, in a filing:

> "Fresher accounts, for example, typically carry lower associated collection
> expenses, while **older accounts and lower balance accounts typically carry
> higher costs and, as a result, require higher purchase price multiples to
> achieve the same net profitability** as fresher accounts."
> — JCAP 10-Q, Q2 2026

A higher required multiple at a given expected collection is a **lower price per
dollar of face**. So small-balance paper does appear to price at a discount.

**Do not celebrate.** The stated mechanism is not the one H3 needs:

| | H3's premise | What the filing says |
| --- | --- | --- |
| Why small paper is cheap | The litigation option is worthless, so the discount is free to a non-litigator | Per-account collection costs are higher, so the discount is compensation for cost |
| What a buyer surrenders | Nothing (we weren't going to sue) | Nothing — the cost is still incurred |

If the discount is cost compensation, **it is not alpha**. It is the market
correctly pricing the same per-account drag that `segment.ts` exists to surface:
a flat cost per account is a larger share of a small balance. We would be paid a
discount to absorb a cost we also have to pay, and our cost structure has no
established advantage over an incumbent running offshore servicing at scale.

**This is the third time in this repo that a mechanism turned out to be priced.**
H2 died on a four-year-old statute already in the price. Rev. 1 died on the legal
channel being in the price. U7's discount, if it is cost compensation, is in the
price too. The pattern is worth naming: *a discount visible from outside the
industry is usually a discount the industry has already explained to itself.*

The residual H3 question is narrower and still open: **is any part of the
small-balance discount attributable to the litigation option being worthless,
over and above the cost explanation?** That is the broker question, and it is now
sharper than U7's original phrasing.

---

## 3. The incumbent's stated strategy is H3's buy box

This is the finding that should be most uncomfortable.

JCAP describes its US strategy as:

> "we primarily focus on acquiring and servicing accounts in consumer asset
> classes that are large and growing but also **underpenetrated by other debt
> buyers**. Examples include consumer installment loans, telecom receivables,
> auto finance loans, utilities receivables and **small balance credit card
> receivables**. We also **opportunistically** purchase nonperforming
> prime-originated large-balance credit card receivables, that certain other
> major debt purchasers in the United States focus primarily on…"

and:

> "We also have capabilities in smaller balance receivables, including smaller
> consumer installment loans, **'buy now, pay later' loans**, telecom and
> utilities receivables, and small balance credit card debt. Certain parts of
> the installment loan asset class we have focused on, such as 'buy now, pay
> later,' other point of sale financings and **fintech originated installment
> loans have grown more quickly than other asset classes.**"

They further claim "significant barriers to entry" in collecting small-balance
accounts, ~4.3% of the US market by face purchased in 2023, and that they are
the largest US purchaser of telecom receivables — including a single December
2023 telecom portfolio with **$7.8 billion** of face.

**What this does to H3's premise.** H3 reasons that small-balance paper is
neglected because nobody can litigate it economically. The largest player in
that paper says the opposite: it is their core book, they believe they have a
data moat in it, and they treat *prime large-balance card* as the opportunistic
sideline. The neglect H3 assumed is not neglect — it is a segment with a
specialist incumbent who prices it with a proprietary model and a 20-year
performance history.

That does not make the paper unbuyable. It does mean **we will not be the only
informed bidder, and we should stop describing this paper as overlooked.**

---

## 4. The US market by class

From the JCAP DRS TAM table (2023 balances, estimated charge-off ratios; sources
in the filing are FRBNY, Equifax, TransUnion, FFIEC call reports):

| Class | 2023 balances | Charge-off ratio | Annual charge-offs | 2019→2023 charge-off growth |
| --- | --- | --- | --- | --- |
| Credit cards — prime | $961.9B | 4.1% | $39.1B | +45.3% |
| Credit cards — non-prime | $167.1B | 15.7% | $26.2B | +10.4% |
| Auto — non-prime | $415.0B | 7.8% | $32.5B | −3.0% |
| Personal loans — non-prime | $174.0B | 10.5% | $18.2B | **+54.5%** |
| Student | $1,601.0B | 1.0% | $15.6B | +96.5% |
| Auto — prime | $1,192.0B | 0.4% | $5.3B | −7.6% |
| Personal loans — prime | $380.0B | 1.0% | $3.8B | +54.2% |
| Telecom and utilities | $56.3B | 8.1% | $4.6B | +28.4% |
| **Total US** | **$4,947.3B** | **2.9%** | **$145.3B** | **+25.7%** |

"Personal loans" is where fintech installment and BNPL sit, and it is the
fastest-growing non-prime pool in the table. Student is large and growing but the
federal government does not sell, so the addressable slice is private only.
Telecom is the smallest pool in the table and has a declared market leader.

---

## 5. Class-by-class assessment

Scored against what ClearSlate actually is: no litigation, no outbound calling,
digital servicing, a match mechanic that needs within-SOL paper and balances
small enough that clearing is reachable.

### Fintech / BNPL installment — **recommended**

**For.** Digitally originated, so email and mobile are the servicing channel of
record rather than an optional tape column — the single best available answer to
U6. Account = one transaction, which sidesteps U1's media-horizon problem
entirely. Balances land where the match mechanic works (BNPL commonly a few
hundred dollars; fintech installment $1k–$5k). Fastest-growing supply pool.
Written-contract SOL, so recent vintages are comfortably within SOL for H3, and
the charge-off is fast — commonly 90–120 days of non-payment for BNPL versus 180
for bank card, so "fresh" paper is genuinely fresh.

**Against.** JCAP names it explicitly as a focus. The borrower population skews
young and thin-file — least ability to pay, which is exactly the population where
a match ratio has to be deep to reach clearing, and deep ratios cap the clearing
payment at `100/(R+1)`. BNPL carries elevated fraud and identity-theft dispute
rates. Balances small enough that the flat per-account cost dominates: at a $300
average balance, the repo's placeholder $1.75/account up-front is **58bps of
face** before anything else happens.

### DDA / deposit-account overdraft — **recommended as a small second sleeve**

**For.** Bank-originated, so email is usually present and used. Balances are
small and uniform. A live secondary market exists — JCAP buys DDA from "banks,
credit unions, lenders, as well as other debt buyers." Sellers are motivated and
the paper is unglamorous.

**Against, and read this before it becomes copy.** The intuitive pitch is "pay
this and get your banking access back." **That is not true and must never be
written.** A ChexSystems record persists roughly five years; payment updates the
status to paid, it does not remove the entry. Under *Accuracy, not modesty*, the
truthful version — "this stops being an unpaid item, though the record remains
for its full retention period" — is materially weaker than the tempting version,
so we ship the truthful one. Flagging it here because this is precisely the shape
of error CLAUDE.md warns about: the false version flatters the product.

### Small-balance credit card — **acceptable, not differentiated**

Best data quality, clearest SOL treatment, deepest supply. Also the most
thoroughly modelled paper on earth, priced by three public companies with
actuarial teams. No structural edge; we would be a price-taker with a worse cost
base. Reasonable as a control sleeve to calibrate our own model against a class
where public benchmarks exist.

### Telecom / utility — **not recommended for a first purchase**

Cheap and high-volume, but the smallest pool in the TAM table with a declared
market leader who bought $7.8B of face in one transaction. Thin media, frequent
disputes over early-termination fees, and the contact channel of record is a
phone number on a service the consumer has cancelled. Utilities additionally
carry state PUC overlays not researched here.

### Medical — **mission-aligned, business-hostile. Do not lead with it.**

The temptation is obvious and should be stated: it is the cheapest paper in the
market (Undue Medical Debt reports buying at roughly **1¢ per $1** on average,
and acquired a $30B Pendrick portfolio in April 2025 at **under a penny**), the
balances are small, and forgiving medical debt is the most defensible thing this
company could do.

Five reasons it is the wrong first purchase:

1. **The leverage is gone.** The CFPB's medical-debt reporting rule was **vacated
   11 July 2025** (E.D. Tex.) — but the practical protections mostly survived it:
   the three NCRAs voluntarily removed medical collections under $500 in 2023,
   and roughly 15 states now ban medical-debt credit reporting outright, nine of
   those effective in 2025 or on 1 January 2026. For a buyer who has already
   given up courts, giving up credit reporting too leaves **no lever except
   persuasion**. That is a real test of H3's thesis, but it is not a test to run
   with the first cheque.
2. **The price signals the recovery.** Paper trading under a penny is not a
   bargain; it is the market's estimate of what it collects.
3. **State law is moving against buyers specifically.** Virginia's Medical Debt
   Protection Act (effective **1 July 2026**) permits sale only where the buyer
   accepts the same restrictions — including returning the debt if the patient
   qualifies for financial assistance. Minnesota, California and Oregon require
   charity-care screening before collection. This is a moving compliance target
   layered on top of debt-buyer licensing.
4. **The balance is often wrong.** Chargemaster pricing, insurance
   mis-adjudication and §501(r) presumptive eligibility mean a material share of
   any medical file is not validly owed at the stated amount. "Never let an
   estimate masquerade as a fact" applies to the *balance itself*.
5. **A public reference price we lose against.** A nonprofit visibly abolishes
   this exact paper at ~1¢. A for-profit buying the same paper to collect on it
   is one journalist away from being the contrast in that story — whatever the
   match ratio.

### Auto deficiency, student, payday — **excluded**

Auto deficiency: UCC Article 9 notice defects are a standard defence and the
balances are large. Private student: non-dischargeable, long-lived, and the
segment most associated with abusive collection. Payday: unlicensed-lender
debts are void or uncollectable in a number of states, and buying them would
put the binding constraint under strain from day one.

---

## 6. Proposed buy box

Stated as a specification to take to a broker, not a decision.

| Parameter | Target | Why |
| --- | --- | --- |
| Class | Fintech / BNPL / point-of-sale installment | U6 contact data; U1 media conveys |
| Vintage | Charged off within 18 months | Within SOL with headroom; contact data still live |
| Placement | First or second agency, never tertiary | Tertiary means the contactable accounts are gone |
| Balance | $200–$1,500 | Clearing reachable at R≤3; above the band where flat cost dominates |
| Average balance | ≥$400 | At $1.75/account up-front, below this the drag exceeds 44bps |
| States | U4 minimum-viable set only | Unlicensed collection is not a risk we price |
| SOL | Within SOL, ≥6 months headroom | H3; matches `sol.ts` buy-box default |
| Contact | **≥60% with a creditor-used email** | The gate. Below this the business is one letter |
| Size | Total loss survivable | Rev. 2 Phase 1, unchanged |
| Price | Bid from a corrected gross-recovery figure, not 16.8¢ | §1(a) above |

**The contact-rate row is the one to fight for.** If a seller cannot represent
and warrant email fill and prior-use, this class loses its entire advantage over
small-balance card, and the recommendation reverts to "no differentiated class
exists — buy the cheapest thing you are licensed for."

---

## 7. What to ask, and of whom

Additions to the U1/U7 broker inquiry. Each is one email.

1. **The U7 question, sharpened.** Not "do small balances trade cheaper" — the
   filing says they do. Ask: *"Of the discount on sub-$1,000 paper, how much
   reflects higher cost-to-collect, and how much reflects reduced litigation
   value? Would a buyer who covenanted never to sue see any further discount?"*
   A broker who says "none" has answered H3's kill criterion.
2. **Contact data, in writing.** *"On your fintech and BNPL tapes: what
   percentage of accounts carry an email address, and will the seller represent
   that the originator or immediately prior collector used and noticed that
   address, per 12 CFR §1006.6(d)(4)?"* Reg F's safe harbour turns on prior use,
   not mere presence. A tape full of unusable emails is worth nothing.
3. **Class price comparison.** Indicative ¢/$1 for the same vintage and average
   balance across fintech installment, BNPL, small-balance card and DDA. Four
   numbers, one email — the comparison nobody publishes.
4. **Seller access.** Whether a newly-licensed, non-RMAI buyer can be approved at
   all, and by whom.

---

## 8. Consequences for the code

Findings, not changes. None applied.

1. **`GROSS_RECOVERY_BPS = 1680` is likely 30% too high** (§1a). Every ceiling
   printed to date is too generous. The CLI already discloses this value as
   assumed; the disclosure is now known to be optimistic and should say so.
2. **`DebtType` has no case for this recommendation.** The union covers
   `credit_card`, `retail_card`, `personal_loan`, `medical`, `telecom`,
   `auto_deficiency`, `payday`, `student`. There is no `bnpl` and no `dda`.
   `personal_loan` is a defensible home for fintech installment; BNPL and DDA
   would map to it silently, which is exactly the "quietly resolve an ambiguity"
   shape `tape.ts` refuses everywhere else.
3. **`sol.ts` keys the limitations period on written-vs-open-account, but NY does
   not.** CPLR 214-i runs on whether the obligation is a *consumer credit
   transaction*, a different axis. Medical debt in NY sits under **CPLR 213-d**
   (three years from treatment, hospitals and licensed providers) — a third rule
   again. A telecom service bill is plausibly neither, and would fall to the
   six-year contract period rather than three. `limitYearsFor` cannot currently
   express this. **Unverified — flagged, not asserted.**
4. **U6's servicing placeholders look conservative, which is the safe
   direction.** TrueAccord puts cost-to-collect at "$4.50 to more than $16" per
   account for unsecured consumer debt; the repo assumes $1.75 up-front plus
   5.41¢ of face variable, which on a $500 balance totals ≈$28.80. The unit
   basis of TrueAccord's figure is unstated, so the two are not directly
   comparable — but nothing here suggests the repo is under-costing servicing.

---

## 9. Unverified claims register

Per `notes.md` rules, these do not enter that file until sourced.

1. **Fintech and BNPL tapes carry Reg F-usable email at materially higher rates
   than bank-card tapes.** The load-bearing claim of this file. Structurally
   plausible — the loan was originated and serviced by email — but **no fill-rate
   data was found for any class.** Question 2 in §7 answers it.
2. **Small-balance paper carries a litigation discount over and above its cost
   discount.** The filing establishes the cost discount only. If there is no
   further discount, H3's entry-price edge does not exist and U7's kill criterion
   fires.
3. **BNPL settlements commonly land at 40–60¢ on the dollar.** Widely repeated
   in consumer-facing content, no primary source. If true it would be far above
   the industry's gross recovery on card paper and should be treated as
   suspicious until sourced — an unusually favourable number from an unusually
   weak source is the pattern this project has been burned by three times.
4. **A telecom service obligation is not a "consumer credit transaction" under
   NY CPLR 214-i.** Reasoning from the statutory text; no case read.

---

## 10. Immediate next actions

1. **Send the four questions in §7.** No capital, no licensing dependency, and
   question 2 gates the entire recommendation.
2. **Correct `GROSS_RECOVERY_BPS`, or at minimum re-run every prior ceiling at
   1100–1200bps and see which verdicts flip.** This is desk work and it is the
   most consequential item in this file.
3. **Do not buy medical to be liked.** If the mission argument for medical is
   compelling later, it survives being run second.
4. **U4 licensing continues regardless** — unchanged under every class here.
