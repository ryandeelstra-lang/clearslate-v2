# Market research — AI messaging + repayment incentives + self-chosen plans

**Date:** 25 August 2026 · **Scope:** initial scan, public sources only
**Question asked:** is there a market for AI-generated collection messaging,
combined with incentives that reduce principal, combined with letting the person
choose their own payment plan?

**Verdict up front: yes, but the three pieces are not equally novel, and the
piece we assumed was the product is the commodity.**

| Component | Evidence it works | Competitive moat | Regulatory load |
| --- | --- | --- | --- |
| **AI-personalized messaging** | Vendor-published only | **None.** ~93% of collection firms claim AI adoption | **High** — every message is a per-message statutory liability |
| **Self-chosen payment plan** | Strong (McKinsey + peer-reviewed) | **Weak, but 64% of agencies still don't offer it** | Low |
| **Principal-reduction incentive** | Thin — it is a repackaged settlement discount | **Real, and only if we own the paper** | Medium (1099-C, §1692e) |

The differentiator is not the AI. See [Honest read](#honest-read).

---

## 1. The market

| Figure | Value | Source |
| --- | --- | --- |
| US debt collection agencies, revenue | **$16.1B (2026)**, +6.1% YoY | [IBISWorld](https://www.ibisworld.com/united-states/market-size/debt-collection-agencies/1474/) |
| Number of agencies | **5,623**, CAGR −1.8% 2020–25 | [IBISWorld](https://www.ibisworld.com/united-states/number-of-businesses/debt-collection-agencies/1474/) |
| AI-in-collections software TAM | "$11.3B by 2033" | [SCNSoft](https://www.scnsoft.com/lending/artificial-intelligence/debt-collection) ⚠️ vendor-report-grade, treat as directional |
| Firms using or planning AI | **93%** | [Moveo](https://moveo.ai/blog/compliance-by-design-debt-collection-ai) ⚠️ secondary, unaudited |
| CFPB debt-collection complaints, 2025 | **~387,400, +86% YoY** | [Gryphon regulatory report](https://gryphon.ai/regulatory-report-february-2026/) ⚠️ needs primary confirmation from CFPB's own annual report |

**Read the shape, not the number.** Revenue rising while the agency count
falls is consolidation — scale players absorbing placements. That is a market
where a new entrant does not win on cost per contact.

The complaint spike cuts both ways: it is the strongest available evidence that
the incumbent experience is bad enough to displace, *and* the reason regulators
are actively tightening the exact channels an AI-messaging product depends on.

---

## 2. Everyone is already doing the AI part

| Company | Model | Position |
| --- | --- | --- |
| **TrueAccord / TrueML** | Digital-first agency. "HeartBeat" ML engine personalizing each touchpoint. $78M raised over 6 rounds. **Acquired Sentry Credit, May 2025 — adding first-party collections and litigation services.** | The direct precedent for this entire idea |
| **InDebted** | Digital-first agency, AU-origin, US expansion | Same thesis, different geography of data |
| **Symend** | Behavioural-science engagement, *pre*-collections, creditor-side | Upstream of us |
| **Skit.ai, Kompato, Zowie, Floatbot, C&R, Katabat** | AI/voice/chat tooling sold *to* agencies | Suppliers, not rivals |

Sources: [Tracxn — TrueAccord](https://tracxn.com/d/companies/trueaccord/__URFTubDHkNIGqmnaQk9VeJ6cdwMxwZfyLqzC_QQqw5E),
[FinTech Futures](https://www.fintechfutures.com/lendtech/trueaccord-lands-22m-to-humanise-debt-collection),
[First Credit comparison](https://www.firstcreditonline.com/digital-debt-collection-company/),
[Symend](https://www.symend.com/blog/debt-collection-software-complete-guide)

### Two structural observations

**(a) The TrueAccord acquisition is the most important datapoint in this scan.**
The company that spent a decade arguing digital-first, no-human, ML-personalized
collection is sufficient — bought a litigation shop. Either digital-first alone
left money on the table, or their creditor clients demanded a legal escalation
path. Both readings are bad for anyone whose pitch is "the empathetic digital
version, but more so." ⚠️ *Unverified motive; worth 20 minutes on the press
release and any client commentary before it's load-bearing.*

**(b) Every company in this scan is creditor-facing.** They collect on someone
else's paper for a contingency fee, or they sell software to whoever does. None
of them owns the debt. That means none of them can unilaterally reduce a balance
— they must ask the creditor for settlement authority.

**That gap is the entire opening, and it is also the reason it is empty:** it
requires debt-buyer licensing (see `u4-licensing-map.md`) and capital at risk,
which a SaaS company will not take on.

---

## 3. What the evidence actually supports

Graded by source quality, because the effect sizes differ wildly by grade.

### Tier A — peer-reviewed

- **Donnelly, Lamberton, Bush, Chance & Norton, *JMR* 2024 — "Repayment-by-Purchase."**
  Letting consumers direct payments at *specific purchases* rather than a
  balance: **+12.18% paid** in a field experiment, **+22.47%** across five lab
  experiments. Mechanism: purchase salience → perceived progress.
  [DOI](https://doi.org/10.1177/00222437231182372) ·
  [PDF](https://starlab.wcfia.harvard.edu/sites/g/files/omnuum8366/files/2025-07/Donnelly,%20Lamberton,%20Bush,%20Chance%20and%20Norton%20(2023).pdf)

  **This is the strongest support for the "choose your own plan" component that
  exists**, and it is stronger than a generic self-service argument: it says
  *the structure of the choice* is what moves money, not merely the existence of
  a portal.

- **Gal & McShane 2012** — progress is tracked by *accounts eliminated*, not
  dollars. Already in `market.md`. Composes directly with the above.

### Tier B — consultancy, unaudited but methodologically serious

- Consumers who digitally self-serve **resolve at higher rates and are
  significantly more likely to pay in full** than those paying via a collection
  call — [McKinsey](https://www.mckinsey.com/capabilities/risk-and-resilience/our-insights/holistic-customer-assistance-through-digital-first-collections).
  ⚠️ Direct fetch timed out; claim is quoted consistently across several
  secondary sources. Re-verify against the McKinsey original before citing
  externally.
- One bank saw a **15% increase in cured accounts** after adding self-service.
- **64% of collection agencies have no self-serve capability at all.**
  [TrueAccord survey writeup](https://blog.trueaccord.com/2024/10/consumers-prefer-self-serve-options-for-debt-repayment-and-businesses-cannot-afford-to-ignore-consumer-preferences/)
  ⚠️ no sample size or methodology published.
- **29% of online payments occur outside traditional FDCPA calling hours** —
  same source. Same caveat. Directionally this is the clearest argument for
  self-service over dialer: a third of the willingness to pay arrives when no
  human is available to take it.

### Tier C — vendor marketing, treat as ceiling-not-estimate

TrueAccord publishes: liquidation **50–80% above industry benchmarks**; **25%
higher** with HeartBeat at **15% lower cost**; **+23%** from send-time
optimization alone; **+35%** resolution among at-risk accounts via a payment-plan
breakage model; **98%** of their consumers resolve with no human interaction.
[TrueAccord ML post](https://blog.trueaccord.com/2021/12/how-trueaccord-embraces-machine-learning-to-create-positive-consumer-experiences-in-debt-collections/) ·
[HeartBeat page](https://pages.trueaccord.com/Heartbeat.html)

**The pattern in the grading is the finding.** Effects attributed to *channel and
consumer control* replicate across independent sources. Every effect attributed
to *AI-written copy specifically* traces back to a vendor selling AI-written
copy. No peer-reviewed A/B evidence that LLM-generated collection messages beat
well-written templates was found in this scan.

Plan accordingly: **budget the AI as a cost of parity, not as the source of
lift.**

---

## 4. The incentive component — the honest finding

We assumed principal reduction was our distinctive offer. It is not distinctive
as *economics*; it is distinctive as *mechanism*.

- **Settlement discounts of 25–70% of balance, averaging 40–50% on credit cards,
  are already routine industry practice.**
  [RecovAsset guide](https://www.recovasset.com/debt-settlement-guide.html) ·
  [Debt.com](https://www.debt.com/taxes/1099-c-settle-debt/)
- So a consumer offered "we'll cancel two dollars for every one you pay" is
  being offered something they could, in principle, already negotiate by phone.

What is genuinely different in our version:

1. **It is offered up front rather than extracted by negotiation** — which
   changes who gets it. Settlement discounts today accrue to the confident and
   the persistent. Publishing the same discount as a rule is a real product
   difference and an honest one.
2. **It is contingent and repeated rather than one-shot** — a match on each
   payment rewards continuation, where a settlement rewards a lump sum the
   person often does not have.
3. **Only an owner can commit to it in advance.** An agency cannot.

**Benchmark to beat.** Encore Capital's US portfolios: **2.3x purchase-price
multiple on 2025 vintages, 2.6x lifetime** ($28.57B estimated collections on
$11.1B purchased).
[Encore FY2025 10-K](https://www.sec.gov/Archives/edgar/data/1084961/000108496126000009/ecpg-20251231.htm)

Any match we offer is spent out of that multiple. A 2:1 cancel rate is
affordable at a ~5¢ basis and ruinous at a 25¢ basis — which is why
`u7-pricing.md` (entry price) remains the gating unknown, not this.

Tax exposure is already researched — see `u10-tax-and-copy.md`. Do not re-derive
it. Short version: 1099-C at $600+ of cancellation is real, and the required
disclosure measurably weakens the pitch.

---

## 5. Regulatory surface

This is where an AI-messaging product gets expensive, and it tightened in 2026.

| Rule | What it does | Bite |
| --- | --- | --- |
| **Reg F** (FDCPA) | 7-in-7 call cap; email/text permitted with opt-out; limited-content messages; validation notice | Baseline |
| **NYC SHIELD Rule** | **3 contacts per account per 7 days across *all* channels** (mail excluded); language-access duties; **applies to original creditors too**. Effective date pushed from 1 Sep 2026 to **1 Jan 2027** | **Severe** — halves federal frequency and forces unified cross-channel counting |
| **TCPA** | Prior express consent for automated SMS | **$500–$1,500 per message**, class-action exposed. The single largest financial risk in an automated-messaging business |
| **Colorado AI Act (SB 24-205)** | Was: duty of care against algorithmic discrimination for "high-risk" financial AI. **SB 189 (14 May 2026) delayed to 1 Jan 2027 and stripped it back to disclosure/transparency** | Lighter than feared — but automated-decision *disclosure* is coming |
| **FDCPA §1692e(10)** | Bars deceptive means, judged by the *least sophisticated consumer* | An LLM that misstates a balance, a right, or a discount is a per-message violation |

Sources: [Venable on SHIELD](https://www.venable.com/insights/publications/2026/03/nycs-shield-rule-reshapes-debt-collection) ·
[Consumer Finance Monitor](https://www.consumerfinancemonitor.com/2026/03/05/new-york-city-adopts-sweeping-shield-debt-collection-rule-how-it-differs-from-prior-dcwp-rules-and-cfpb-regulation-f/) ·
[NYC DCWP FAQ](https://www.nyc.gov/assets/dca/downloads/pdf/businesses/FrequentlyAskedQuestions_NewRuleDebtCollectors.pdf) ·
[Akin — Colorado](https://www.akingump.com/en/insights/ai-law-and-regulation-tracker/colorado-postpones-implementation-of-colorado-ai-act-sb-24-205) ·
[Hunton](https://www.hunton.com/privacy-and-cybersecurity-law-blog/colorado-ai-act-amended-and-effective-date-delayed) ·
[Kompato on text rules](https://kompatoai.com/debt-collector-text-regulations/)

### The design consequence

**Free-form LLM generation of outbound collection copy is not shippable.** Under
a least-sophisticated-consumer standard with per-message statutory damages, the
liability of one hallucinated sentence exceeds the marginal lift of a
better-worded one.

The viable architecture is **AI selects, humans author**: a legal-reviewed
message library, with ML choosing *which* message, *when*, on *which channel*,
and *which plan structure to surface*. That is, notably, exactly what
TrueAccord's published description of HeartBeat amounts to — send-time
optimization, channel selection, breakage prediction. Not copywriting.

Consumer advocates are already positioning against the broader category: NCLC
warns that proprietary models limit transparency and invite algorithmic
discrimination, and led a **64-organization coalition** against AI waivers from
consumer-protection law.
[NCLC](https://www.nclc.org/60-civil-rights-consumer-labor-technology-organizations-oppose-legislation-allowing-financial-firms-using-ai-to-ignore-the-law/)
Being on the record with authored, reviewable copy and a published match rule is
a defensible posture there. Being a black box generating text is not.

---

## 6. Honest read

**For the idea**
- The consumer-control component has Tier-A evidence behind it (+12–22%), and
  the specific framing that works — directing payment at something concrete —
  composes with the account-count finding already in `market.md`.
- 64% of agencies still have no self-service at all. The incumbent bar is low.
- Complaints up 86% YoY: the incumbent experience is genuinely disliked.
- Nobody in the scan combines *ownership* with *consumer-facing product*.
  Agencies can't cancel principal; buyers don't build software.

**Against the idea**
- **"AI-personalized collection messaging" is a solved, funded, consolidating
  category.** TrueAccord has 13 years of interaction data and $78M. We would be
  the 159th entrant with the same sentence.
- **No independent evidence that AI-written copy beats good templates.** Every
  number supporting that specific claim is sold by someone.
- **The principal-reduction incentive is a repackaged settlement discount.** Real
  and worth doing — but the novelty is transparency and timing, not generosity,
  and we should say so internally before someone pitches it as new.
- **Regulation moved against automated messaging in 2026**, most sharply in NYC.
  A 3-per-7-day cross-channel cap constrains exactly the high-frequency,
  multi-touch cadence that digital-first economics assume.
- **The digital-first flagship bought a litigation shop.** Unexplained, and it
  should be explained before we bet against litigation.
- All of this still sits downstream of an unresolved fork: `h3-gate-result.md`
  rates H3 **unresolved, leaning negative**, and entry price (U7) is unanswered.
  This scan does not resolve either.

---

## 7. What this changes

1. **Stop describing AI messaging as the product.** It is table stakes and a
   liability surface. The product is *ownership expressed as a published,
   consumer-chosen repayment structure.*
2. **Elevate consumer-directed plan structure from a feature to the core bet.**
   It has the best evidence in the entire file and the least regulatory load.
   The Donnelly finding suggests the choice should be over *what the payment
   retires*, not merely over amount and date.
3. **Constrain the ML to selection, not generation.** Message library authored
   and legally reviewed; ML picks timing, channel, sequence, plan offer.
4. **Design for the NYC cap, not the federal one.** Three cross-channel contacts
   per 7 days per account is the forward-looking constraint; building to 7-in-7
   means rebuilding.

## 8. Next actions

- [ ] Verify the McKinsey self-serve figures against the original (fetch failed).
- [ ] Confirm the 387,400 / +86% complaint figure from CFPB primary source.
- [ ] Read the TrueAccord–Sentry Credit press release; establish the stated rationale.
- [ ] Read Donnelly et al. in full — the field-experiment design matters for whether the effect survives a collections (vs. servicing) context.
- [ ] Fold the NYC 3-in-7 cap into any contact-cost model in `u6`.

## 9. Unverified claims register

| # | Claim | Status |
| --- | --- | --- |
| M1 | McKinsey self-serve resolution/pay-in-full uplift | Quoted consistently in secondary sources; **original not fetched** |
| M2 | CFPB complaints ~387,400 in 2025, +86% | Single secondary source |
| M3 | 93% of collection firms use/plan AI | Vendor blog, no methodology |
| M4 | 64% of agencies lack self-serve; 29% of payments outside FDCPA hours | Vendor survey, **no sample size published** |
| M5 | All TrueAccord performance figures | Vendor marketing, unaudited |
| M6 | TrueAccord acquired Sentry Credit May 2025 for litigation capability | Acquisition reported; **motive is inference, not sourced** |
| M7 | "$11.3B by 2033" AI-collections TAM | Vendor report, methodology unseen |
