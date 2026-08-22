# Research Notes — ClearSlate v2

Durable record of what has been verified, what was wrong, and what is still open.
Every figure carries a source. Nothing enters this file unverified.

**Last updated:** 21 August 2026

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
| **PRA US legal collections** | **53% of US core cash collections** | Q1 2026 |
| Implied non-litigating cost-to-collect | ~65% | Applied to Encore FY2025 |

**The 53% figure is the single most consequential number found.** Legal is 31%
of expense and 53% of collections. Any model removing it deletes a large share of
the denominator to save a small share of the numerator.

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
- **Licensing:** ~30 states, **6–18 months**. This is the long pole and belongs
  in Phase 0.

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
