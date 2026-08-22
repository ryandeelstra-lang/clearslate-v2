# Research Notes — ClearSlate v2

Durable record of what has been verified, what was wrong, and what is still open.
Every figure carries a source. Nothing enters this file unverified.

**Last updated:** 21 August 2026 (H3 gate sprint — corrections #8–#10 added,
litigation-by-balance and licensing sections verified)

---

## Source quality rules

Applied throughout. Violating these is how the first two drafts went wrong.

1. **SEC filings and peer-reviewed journals outrank everything.** Vendor case
   studies are marketing until proven otherwise.
2. **Never quote a multiple without its time horizon.** 2.4× over 15 years and
   2.4× over 4 years are different businesses.
3. **Distinguish % of face from multiple.** Confusing them produces
   order-of-magnitude errors.
4. **Distinguish share-of-complaints from account-level rates.** Cost us once.
5. **Model net, never gross.** Gross-multiple modelling flatters the product.
6. **When an error flatters the product, that's a signal.** Three separate
   instances found in the first plan draft.

---

## Verified market facts

### Pricing and returns

| Fact | Value | Source |
| --- | --- | --- |
| Charged-off card paper price | 5–15¢ per $1 face | Market range, multiple |
| Industry collection multiple | 2.3–2.5× | Encore MCM vintages, Q2 2026 |
| ERC horizon | 180 months | Encore definition |
| Implied gross recovery | ~16.8¢ per $1 face | 7¢ × 2.4 |
| Encore 2026 purchase guidance | $1.4–1.5B global | Q1/Q2 2026 |
| Encore 2025 purchases | $1.4B, 83% US | FY2025 |
| Encore Q2 2026 US purchases | $372M (record) | Q2 2026 8-K |
| Encore forward flow commitments | $557.4M min, at 30 Jun 2026 | Q2 2026 10-Q |
| Encore ERC | $10.2B (from $9.4B) | Q2 2026 |
| PRA ERC | $8.5B, +9.5% | Q1 2026 |

### Cost structure

| Fact | Value | Source |
| --- | --- | --- |
| Encore cost-to-collect | 44.1% ($1,142.2M ÷ $2,592.8M) | FY2025 |
| PRA cash efficiency ratio | 61.8% | Q1 2026 |
| PRA legal collection costs | $48.5M (+$15.1M YoY) | Q1 2026 |
| PRA legal collection fees | $17.1M | Q1 2026 |
| PRA legal as share of opex | 31% | Derived |
| PRA legal as share of collections | 11.9% | Derived |
| **PRA US legal collections** | **48.2% of US Core cash collections (FY2025)** — *corrected, was 53%* | [FY2025 10-K](https://www.sec.gov/Archives/edgar/data/1185348/000118534826000006/praa-20251231.htm) |
| Implied non-litigating cost-to-collect | ~65% | Applied to Encore FY2025 |

### Legal share of US Core collections — verified from the 10-K, 21 Aug 2026

PRA discloses this directly, split call center/other vs. legal
([FY2025 10-K](https://www.sec.gov/Archives/edgar/data/1185348/000118534826000006/praa-20251231.htm),
Supplemental Performance Data, $000s):

| U.S. Core | 2023 | 2024 | 2025 |
| --- | --- | --- | --- |
| Call center/other | $418,585 · 61.3% | $460,046 · 55.0% | $519,346 · **51.8%** |
| **Legal** | $263,954 · **38.7%** | $375,986 · **45.0%** | $482,576 · **48.2%** |
| Total Core | $682,539 | $836,032 | $1,001,922 |

Europe for contrast: legal is 39.5% of Core there in 2025 — the US is the
litigious market.

**Two readings, and the second matters more than the first.**

1. **The headline claim survives.** Legal is ~48% of US Core collections against
   31% of opex. Removing it still deletes roughly half the denominator to save a
   third of the numerator. Rev. 1's death is unaffected.
2. **The trend is the real finding: 38.7% → 45.0% → 48.2% in three years.**
   The incumbent is leaning *harder* into litigation every year, and it is
   working — US Core collections grew 47% over the same span. This
   **strengthens** the objection to any non-litigating strategy: the channel a
   voluntary-only book forfeits is not static, it is the one carrying incumbent
   growth. Note also that this is the *disclosed* direction of travel, so a
   projection for 2026 sits above 48.2%, which is the likeliest origin of the
   erroneous 53%.

See correction #10.

### Servicing cost — researched 22 Aug 2026

**Up-front, per account.** Charged at acquisition on every account whether or not
it ever pays. This is the input the small-balance thesis is most sensitive to,
because a flat per-account charge scales inversely with average balance.

| Component | Cost | Source | Confidence |
| --- | --- | --- | --- |
| Validation notice, print + mail, 1,000+ volume | **$0.80–$1.00** | [The Credit People](https://www.thecreditpeople.com/debt-collection/need-debt-collection-letter-services-printing-mail), [Postalocity](https://www.postalocity.com/who-we-serve/collection-agencies/) | Medium — vendor-quoted |
| USPS First-Class metered, Jul 2026 | $0.78 | [USPS 2026 rates](https://www.quadient.com/en-us/postage-rates/usps) | Official |
| USPS bulk presort | $0.20–$0.30 | Postalocity | Vendor-quoted |
| Pre-contact scrubs — bankruptcy, deceased, SCRA, attorney-represented | **$0.50–$1.50** | **NOT FOUND** | **Low — estimate only** |
| **Total per account** | **$1.30–$2.50** | mixed | |

**Every commercial scrub vendor quotes privately** — LexisNexis Accurint,
Experian FirstSweep, TransUnion TLOxp, RNN, BankruptcyWatch, LocateSmarter all
price by custom quote with nothing public. The scrub half of this range is an
estimate and should be treated as the weakest number in the model.

**~100% of it is genuinely up-front**, not collection-proportional: Reg F
§1006.34 requires the validation notice within five days of first contact, and
the scrubs must run *before* first contact to avoid an FDCPA violation. This
confirms the model's split.

`core/portfolio.ts` uses **175 cents** — mid-range, and labelled a placeholder.

**Ongoing servicing.** Encore FY2025 cost-to-collect **44.1%** (verified). PRA's
cash efficiency ratio of 61.8% implies ~38%. Stripping legal (31% of PRA opex)
gives ~26% for a non-litigating book, but that likely understates the contact
intensity needed to reach the same recovery without a litigation threat.
Estimated **400–500 bps** of face. The model's `SERVICING_BPS = 541` sits just
above that — i.e. slightly conservative. Still unverified.

### Substitution when litigation stops — the COVID natural experiment

Courts closed in 2020. If collections held, substitution is real: some accounts
that would have paid under legal pressure pay voluntarily instead.

| Period | PRA US call centre collections | Legal |
| --- | --- | --- |
| Q3 2020 vs Q3 2019 | **+37% YoY** | not separately disclosed |
| Q4 2020 vs Q4 2019 | **+22% YoY** | decreased, magnitude undisclosed |
| FY2020 vs FY2019 | total collections +$164.5M | opex fell on the "shift from legal to call centers" |

Source: [PRA Q4 2020 results](https://ir.pragroup.com/2021-02-25-PRA-Group-Reports-Fourth-Quarter-2020-Results).
Encore's 2020 profit exceeded $200M, up ~40%.

**Substitution exists. Its magnitude is not recoverable from public data, and the
natural experiment is badly confounded.** CARES Act stimulus paid cash directly
to precisely this population during precisely this window. Rising voluntary
collections in 2020 are consistent with substitution, with stimulus, or with
both, and no disclosure separates them — PRA does not publish a quarterly
channel split at all.

**Do not convert this into a substitution rate.** It supports the *direction*
only. Underwrite at the verified L = 48.2% (zero substitution, conservative);
run L = 35% as a sensitivity, labelled as such; and do not use the plan's
L = 25% until someone can say where it came from.

### Cost of capital

| Instrument | Rate | Source |
| --- | --- | --- |
| Securitisation facility | Term SOFR + 6.40% (6.65% floor) | 2026 facilities |
| Revolving facility | SOFR + 3.10% | 2026 facilities |
| Residual securitisation | 11.00% coupon | Mar 2025 |
| Upfront fees | 1.125% | — |
| Unused-line fees | 0.25–0.75% p.a. | — |
| **Effective hurdle used in modelling** | **10.02%** (SOFR 3.62% + 6.40%) | — |

A startup with no servicing track record prices worse than all of these.

---

## Media — what actually conveys with a portfolio

**This killed the first plan's central thesis. Record it carefully.**

- Media is a **contractual request right** in the purchase and sale agreement —
  a capped number of free document pulls in a defined window, then $5–$10+ per
  document, with the seller's obligation expiring. **It is not a document tape
  delivered at close.**
- FTC *Structure and Practices of the Debt Buying Industry* (~5,000 portfolios,
  90M accounts): only **~13% of portfolios** came with any account documents;
  only **~6% of accounts** bought by the largest buyers had documentation.
- **OCC Bulletin 2014-37** sets the norm at the **last 12 statements**.
- Standard tape fields: name, SSN, balance, date of last payment, charge-off
  date, address, phone. **Email is not standard.**
- Secondary/reseller paper — the channel open to a first-time buyer — has no
  direct claim on originator documents; requests route back through the primary
  buyer with added fees and delay, and chain of title degrades with each resale.
- **RMAI Certified Receivables Business certification has been mandatory for
  debt-buying members since 1 January 2025.**

**Consequence:** a maximally-documented buy yields roughly one year of statement
*images*, not the 36–60 statements of transaction history that built a balance.
Any strategy requiring itemised purchase history is constrained by data horizon
before it is constrained by price.

---

## Litigation — measured

Center for Responsible Lending, *Court System Overload* — 437,644 collections
cases filed by the top 20 debt buyers across California's most populous counties,
roughly half of all collections cases in the period.

| Outcome | Rate |
| --- | --- |
| Resolved cases ending in default judgment | 63.7–66.3% |
| All filed cases ending in wage garnishment | ~27% (~117,000 cases) |
| Average judgment | $5,925 |
| Defendants without an attorney | 98%+ |
| Dismissal rate when defendant had a lawyer | 100% |
| Dismissal when self-represented but present | 70% |
| Cases filed without minimum required documentation | 61% |
| Total garnished, top 10 counties 2012–2017 | $700M+ |

**Reading:** the channel's yield is a function of non-appearance, not of claim
validity. Industry summary: debt buyers "make money only when cases go
uncontested," on a model "built on scale, speed, and silence."

### Litigation by balance size — verified 21 Aug 2026

| Fact | Value | Source |
| --- | --- | --- |
| **Share of collection cases under $2,000** (UT, MN, MI) | **~50%** | [Pew, 2 Sep 2025](https://www.pew.org/en/research-and-analysis/articles/2025/09/02/debt-collection-lawsuits-surge-to-pre-pandemic-highs) |
| Defendants with legal representation | <4% | Pew, *ibid.* (agrees with CRL's 98%+ unrepresented) |
| Cost-model break-even to justify suit | $1,000–$1,600 (median ~$1,418) | Computed, `u8-litigation-economics.md` |
| Same, California small claims | **$373** | *ibid.* |
| Industry practice: large buyers | Avoid suing below ~$1,000 | Secondary, multiple |
| Industry practice: small collectors | File at **$500–$750**, in batches | Secondary, multiple |
| **Filing-rate differential by balance band** | **Does not exist in the public record** | Searched, not found |

**Consequence — this is load-bearing.** Small balances are **litigated
routinely**, not *de facto* exempt. The transition is a **gradient around
$500–$1,500**, not a floor. Any hypothesis resting on "litigation is
economically unavailable below $X" must be stated as a matter of *degree* and
must quantify the differential — which nobody has published.

The cost model and the empirical data disagree, and the empirical data wins.
Likely reconcilers: attorney-fee shifting, small-claims filing, and
portfolio-level cross-subsidy.

**Precedent:** CFPB action against Encore covering 2009–2015 ended in **$52M** in
fines and consumer refunds for filing thousands of inaccurate or unsupported debt
lawsuits.

---

## Regulatory trajectory

All pointing against the litigation channel.

- **New York CCFA:** statute of limitations for consumer-credit suits cut from
  **six years to three**. Signed **8 November 2021** (Chapter 593); the SOL
  provision took effect **~April 2022** (150 days after enactment), remaining
  provisions ~May 2022. Applies to debt buyers and original creditors alike.
  **⚠️ An earlier draft of these notes dated this April 2025. It is four years
  older than that, which materially changes what can be inferred from it —
  see Corrections log #7.**
- **Chain of title:** unbroken assignment from original creditor now required;
  a missing link means no standing. Against a 61% inadequate-documentation
  baseline this is a direct hit.
- **Illinois:** debt-buyer licensing reaffirmed 2025, fines raised to **$10,000
  per violation**.
- **Several states** now cap contacts below Regulation F levels.
- **Medical debt is unsettled:** federal court vacated the CFPB's
  credit-reporting rule July 2025 (FCRA preemption); CFPB issued an interpretive
  rule to the same effect October 2025; ~15 states have passed protections
  regardless. Treat jurisdiction by jurisdiction.

### Compliance obligations that bite immediately

- **Reg F §1006.34** — validation notice itemisation covers interest, fees,
  payments and credits **only**. It neither requires nor contemplates purchase
  detail.
- **Reg F §1006.38** — dispute verification **freezes collection until
  verification is mailed**. Every dispute stalls recovery directly.
- **Reg F §1006.6(d)(4)** — email permitted only to an address the creditor or
  the *immediately prior* collector already used and noticed. A first spot buy
  will not have this.
- **FDCPA §1692e(10)** — presenting purchase-level detail converts a tape error
  from a wrong balance into a misrepresentation.
- **GLBA Safeguards** — WISP, MFA, encryption, penetration testing, 30-day FTC
  breach notice.
- **Washington My Health My Data Act** — private right of action, reaching
  purchase-derived health inferences. Transaction history contains pharmacy and
  clinic data.
- **Licensing — revised 21 Aug 2026, see correction #9.** The "~30 states,
  6–18 months" figure describes **full coverage**, not time to first purchase.
  Verified paths:

  | Coverage | Cost | Time |
  | --- | --- | --- |
  | Minimum viable — 5 states, 21% of US | **~$16,000** | **3–4 months** |
  | Meaningful — 7 states, 36% of US | ~$70,000 | ~6 months |
  | Strong — 10 states, 52% of US | ~$183,000 | 8–12 months |

  **Ohio, Georgia and Virginia require no state collection-agency licence**
  (corroborated across compliance sources; ~38 of 52 US jurisdictions do
  license). Five states file via **NMLS**, allowing parallel applications.
  *Unverified:* municipal requirements inside the no-licence states, net-worth
  requirements, most processing times.
- **RMAI CRB certification** is mandatory for **RMAI members**, and is **not** a
  condition of operating as a debt buyer. `v2-plan.md` §U4 dropped that qualifier
  and read as mandatory-to-operate. Cost cited at $1,500–$3,500 by secondary
  sources; **not confirmed with RMAI**, timeline unknown.
- **1099-C / cancellation-of-debt income.**
  [26 CFR § 1.6050P-2(e)](https://www.law.cornell.edu/cfr/text/26/1.6050P-2):
  *"lending money includes acquiring an indebtedness not only from the debtor at
  origination but also from a prior holder."* **Debt buyers are applicable
  entities.** Forgiveness ≥$600 is reportable (identifiable event Code F).
  **De minimis escape, and its expiry date:** a new entity is outside the regime
  if lending income is *both* <$5M *and* <15% of gross income. An early-stage
  buyer likely sits outside it **and crosses in as it scales** — so a
  forgiveness-based mechanic is clean at launch and generates exposure exactly
  when volume makes it costly to unwind. **Do not build on the safe harbour.**
  Form 982 insolvency exclusion fits this population but is **not automatic** —
  the consumer must file it.

---

## Consumer signal

| Metric, 2025 | Value | Source |
| --- | --- | --- |
| CFPB debt collection complaints | 387,400 | Consumer Response Annual Report |
| Year-over-year increase | +86% | " |
| Top issue since 2013 | "Attempts to collect debt not owed" | " |
| That issue vs. prior 2-yr average | +115% | " |
| Complaints where consumer "did not recognise" debt | 45% | " |
| **Actual account-level dispute rate** | **~3% (low single digits)** | FTC debt-buying study |

**Correction recorded:** the 45% figure is a share of *complaints*, not an
account-level dispute rate. An earlier synthesis used it as though it were the
latter. The two differ by more than an order of magnitude.

---

## Behavioural interventions — what transfers and what does not

### Peer-reviewed, verified

| Intervention | Effect | Source | Transfers to charged-off? |
| --- | --- | --- | --- |
| Repayment-by-Purchase | +12.18% field (opt-in), +22.47% lab | *JMR* 61(3) 2024 | **No — see below** |
| Round-number debt targets | 3 field + 3 lab studies | *JCP* 31(2) 2021 | **No — lump sum** |
| Round-number payment anchoring | +15–20% at next rung; authors project up to 40% interest savings | *Management Science* | **No — SOL revival** |
| Per-person adaptive contact | +8.11% recovery, −63.39% actions | ICIS 2020 | Unproven — one non-US lending platform |

### Why Repayment-by-Purchase does not transfer

- Measured on **live statement balances held by engaged customers**. Opt-ins were
  younger, multi-product with the same bank, and had **lower** balances.
- Stated mechanism is purchase salience → **perceived progress toward reducing
  debt**. That signal does not exist on charged-off paper: no statement cycle, no
  account worth keeping, no credit line restored by paying.
- **Direct disconfirming evidence:** three field experiments on ~32,000
  non-performing borrowers (*J. Behavioral & Experimental Finance* 37, 2023) took
  nudges proven on *performing* loans and found most failed on defaulted debt,
  several backfiring — a post-promise reminder triggered repeated default; a
  salience cue reduced recovery.
- Prelec & Loewenstein prospective accounting: itemisation removes anticipated
  future benefit, the thing that buffers the pain of paying. Charged-off
  consumption is years old and fully consumed.
- Converts an abstract, externally-attributed number into a **personal moral
  inventory** — the guilt-to-shame conversion `findings.md` names as the churn
  mechanism.

### Why round-number mechanics do not transfer

- **Round-up defaults revive the statute of limitations.** In most states a
  partial payment restarts the limitations clock on time-barred debt. A $3
  round-up hands a future buyer a fresh right to sue for the full balance, and
  portfolios get resold.
- **Round targets need a reducible balance.** A round target on a $4,237
  charged-off lump is $4,000 — a number the person does not have. The research
  concerned paying *down* a revolving balance.

### Established nulls — do not build

- **Generic behavioural messaging on collection letters.** Two large,
  highly-powered RCTs: five envelope-design treatments, no effect; nine
  social-norm and deterrence treatments, all ineffective, several worse than the
  agency's original letter. *JEBO* S0167268122001329.

---

## Competitive position

| Operator | Model | Owns paper? | Notes |
| --- | --- | --- | --- |
| TrueAccord | Contingency servicer | No | HeartBeat ML since 2013, 20M+ interactions. Claims 50–80% above benchmark and ~98% self-service resolution — **self-reported**. |
| Symend | SaaS to creditors | No | Behavioural engagement platform, ~$52M raised. Claims +10% recovery — **self-reported**. |
| InDebted | Digital-first servicer | No | $25M+ raised, 91% automated, entered US via acquisition. |
| Encore / MCM | Debt buyer | Yes | Largest US buyer. 180-month horizon, litigation channel. |
| PRA Group | Debt buyer | Yes | #2. Legal = 53% of US core collections. |

**None of the digital-first operators owns the paper.** Their patience is
contractual. Both buyers that own paper underwrite to fifteen years and litigate.

---

## Corrections log

Recorded rather than silently amended, per project rules.

1. **Stacked effect sizes.** An early synthesis compounded five interventions
   (+20/+15/+25/+30/+20%) into an implied 60–70% recovery rate. Overlapping,
   different denominators, never tested in combination. **Discarded.**
2. **The 40% interest-savings figure.** A critique claimed this was an agent
   conflation. It is not — it appears in the authors' own policy section in
   *Management Science*. **Critique was wrong; agent was right.**
3. **Round-number direction.** A critique claimed the finding had been inverted.
   Both findings stand and are complementary. **Critique was wrong.**
4. **The 45% figure.** Used as an account-level dispute rate; it is a share of
   complaints. Real dispute rate ~3%. **Off by an order of magnitude.**
5. **Gross vs. net modelling.** 2.4× at 48 months modelled on gross collections.
   Three specialists independently flagged this as the product-flattering error
   the project's own rules name.
6. **Delinquency decay misapplied.** "Recovery halves after 6 months past due" is
   *delinquency-age-at-purchase* decay, already embedded in the 5–15¢ price. It
   is not the post-purchase collection curve. Invoking it for the 48-month
   horizon concealed a second premium — fresher paper is priced on top of any
   media premium.
7. **NY CCFA dated three years late.** Recorded as "effective April 2025"; the
   act was signed 8 November 2021 and the SOL provision took effect ~April 2022
   ([NY S153, Chapter 593](https://www.nysenate.gov/legislation/bills/2021/S153)).
   **Consequence: fatal to the H2 hypothesis as written.** A four-year-old
   statutory change in a market of sophisticated public buyers is fully priced.
   The "market has not repriced yet, we are early" branch does not exist. Caught
   by the debt-buyer-intel specialist during re-review, before the plan was
   acted on.
8. **H3 match arithmetic — clearing payment.** `h3-ownership-as-product.md` gave
   the 4:1 clearing payment on a $4,237 balance as **$1,059.25**. That is
   `face / R`; the correct divisor is `face / (R + 1)` = **$847.40**. The
   document's own formula and its own "20¢ of face" label both gave the right
   answer ($1,059.25 is 25¢ of face, and is the **3:1** figure). Net per account
   was overstated at ~$618 against a true ~$406. **The error flattered the
   product**, per rule 6. Caught while writing `core/portfolio.ts`; there is now
   a regression test named for it.
9. **Licensing timeline conflated with coverage.** `v2-plan.md` §U4 described
   licensing as "~30 states, **6–18 months**… the long pole," and that framing was
   repeated as grounds for a sequencing recommendation. The 6–18 month figure
   describes **~30-state coverage**, not **time to first legal purchase**, which
   is **3–4 months and ~$16,000** for a 5-state minimum-viable footprint — three
   of those states requiring no licence at all. This error ran *against* the
   business, which is likely why it survived unexamined for so long. Rule 6 cuts
   both ways: an error that makes the business look *harder* than it is also
   escapes scrutiny.
10. **The 53% figure — the project's most-cited number — was wrong.** These notes
    called "PRA US legal collections = 53% of US core cash collections" *"the
    single most consequential number found"* and cited it to Q1 2026. It is
    **48.2%** (FY2025), disclosed plainly in PRA's 10-K Supplemental Performance
    Data. The 53% figure appears in **neither** Q1 2026 primary document — the
    earnings release nor the full 10-Q — both fetched and searched; PRA does not
    publish a quarterly channel split at all. Most likely origin: a projection
    off a rising trend (38.7% → 45.0% → 48.2%), never labelled as one.
    **Consequences:** (a) the headline argument survives — ~48% is still roughly
    half of collections against 31% of opex, so rev. 1's death stands; (b) the
    *trend* is the more important fact and was missed entirely — the incumbent is
    leaning harder into litigation each year, which **strengthens** the case
    against a voluntary-only book; (c) the IRR bridge's −2,057bp legal-removal
    step is built on the wrong input and should be recomputed at L = 48.2%.
    **Process note:** this number survived six specialist critiques and two plan
    revisions without anyone opening the 10-K. It was reachable in one HTTP
    request. *SEC filings outrank everything* only helps if someone fetches one.
11. **FTC pricing quoted without vintage.** Research output presented the FTC
    study's 4.0¢ average / 7.9¢ (<3yr) / 2.2¢ (6–15yr) as market pricing. The
    contracts studied were signed **July 2006 – June 2009** — 17–20 years old,
    predating the post-2013 rise in paper prices. Reading 4.0¢ as current market
    would have appeared to defuse the **primary kill criterion** ("sellers will
    not clear at sub-5¢"). Today's range remains 5–15¢. See rule 2: never quote a
    figure without its period.

---

## Dead ends

Investigated and abandoned. Recorded so they are not re-investigated.

- **Buying "full media" portfolios.** Not a purchasable category. See Media
  section.
- **Repayment-by-Purchase as central intervention.** Wrong population,
  disconfirming field evidence, manufactures disputes, creates §1692e exposure,
  and reads as phishing on cold contact.
- **Round-up payment defaults.** Revive the statute of limitations.
- **Peer support / community features.** Research concerns peer support
  generally, not creditor-operated. A creditor running a forum where debtors
  identify themselves runs into FDCPA third-party disclosure.
- **Speed thesis as originally framed** (same 2.4× in 48 months without
  litigation). Arithmetically unavailable — see the IRR bridge below.

---

## The IRR bridge

Finance specialist, on a steep-decay curve (77% of collections in first 48
months), hurdle 10.02%, residuals 11%.

| Step | IRR | Change |
| --- | --- | --- |
| 180mo, 2.4×, legal intact | 13.01% | +299bp over hurdle |
| Compress to 48mo, multiple held | 22.27% | +926bp |
| Remove legal channel @ L=25% | 1.70% | −2,057bp |
| Add full-media premium @ +30% | **−13.2%** | −1,490bp |

**Compression is real, is the smallest of the three effects, and is the only
positive one.** It is also unavailable: a no-litigation book does not *compress*
the post-48-month tail, it *forfeits* it (13.01% → 1.86%), because that tail is
disproportionately judgment plans and garnishment.

At 2.0× legal ROI the net multiple falls from 1.342× to 1.056×. At 3.0× it falls
to **0.770× — a 23% loss of principal at any horizon.**

Stacking every published behavioural lift at full effect gives 1.425×, covering
the legal channel only to 29.8% — and that stack is fiction.

**To clear 11% residuals, a 48-month voluntary-only book needs a 1.94× gross
voluntary multiple: 81% of what the entire industry collects *with* courts, in
48 months instead of 180.**

---

## Open questions

Tracked in `docs/decisions/v2-plan.md` as gated unknowns. Summary:

- Will sellers clear at sub-5¢?
- Does paper in SOL-compressed jurisdictions reprice relative to comparable
  states?
- What does a fully-loaded servicing stack cost per account?
- What fraction of a tape carries Reg F-usable contact data?
- Licensing map, cost, and timeline across ~30 states.
- Does presenting *any* account detail on cold contact increase or decrease
  engagement? (Falsification study, measuring disengagement.)
