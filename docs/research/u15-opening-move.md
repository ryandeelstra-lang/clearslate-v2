# U15 — The Opening Move: Why Leading With the Discount Is Wrong

**Date:** 28 Aug 2026
**Status:** Research complete. Recommends a structural change to the contact sequence and a correction to a load-bearing claim in CLAUDE.md.
**Trigger:** Ryan's instinct that "offering to reduce their debt right off the gate" is not the best way to get paid.

**The instinct is correct, and the evidence is stronger than expected. But the research also surfaced something more important: the single study this entire business rests on has been contradicted by a larger, better-identified experiment. That correction is §1. The opening-move answer is §2 onward.**

---

## §0. Summary of findings

| # | Finding | Evidence | What it does to us |
|---|---|---|---|
| 1 | **Debt forgiveness, delivered as a gift, produces no measurable improvement in mental health or financial wellness.** | Kluender et al. 2024, NBER w32315 — two RCTs, 83,401 people, $169M face | **Breaks** the rehabilitation claim as currently written in CLAUDE.md |
| 2 | Generic nudges on already-defaulted debt are null, and some backfire | Latvia hospital RCT (n=9,196); Netherlands RCTs | Kills social-norm and prosocial framing before we build it |
| 3 | Personalization (using the person's name) is the one messaging lever that reliably works | Latvia RCT: ~1pp lift on ~1% base — a doubling | Keep. Cheap. Real. |
| 4 | Reactance is measurable and expensive: 20% withheld a planned payment after an upsetting collector contact | McKinsey collections survey | Any control-flavored framing costs cash |
| 5 | Percentage framing beats dollar framing | Kuan et al. 2025 PNAS, 13M-person RCT with US Dept. of Education | Free lift. We currently use dollars. |
| 6 | Our opening email is textually indistinguishable from a debt-relief scam | FTC, state AG, and consumer-advocacy scam-warning literature | This is the actual bottleneck, not price |
| 7 | Effort justification / IKEA effect: outcomes people *produce* are valued far above identical outcomes they *receive* | Norton, Mochon & Ariely; endowment/psychological-ownership literature | **This is the escape hatch from finding #1** |
| 8 | Algorithmic decisions about *who and when to call* beat human collectors by 23.4% with fewer contacts | Zhou & Wang 2024, Netherlands RCT (n=7,839) | The ML edge is in targeting/timing, not in copy |

---

## §1. The finding that breaks the current thesis

CLAUDE.md currently states:

> **Clearing accounts is itself the highest-evidence rehabilitation intervention available.** It requires no behavior change, no curriculum, no daily engagement.

**That sentence is no longer true, and it fails our own house rule: "When an error flatters the product, that's a signal."**

### What we were relying on

**Ong, Theseira & Ng (2019), *PNAS*** — the source of the "+0.25 SD cognition, −11% anxiety, −10% present bias per account cleared" numbers quoted throughout this repo.

Reading the actual design:
- **n = 196** low-income Singaporeans
- A charity (Methodist Welfare Services "Getting Out of Debt") paid off their debts
- **Quasi-experimental, not randomized.** It exploits variation in *how* relief was structured — for a fixed dollar amount, some people had more accounts cleared than others. It does **not** randomize whether relief happened.
- Beneficiaries were **passive recipients**

### What contradicts it

**Kluender, Mahoney, Wong & Yin (2024), NBER w32315** — "The Effects of Medical Debt Relief: Evidence from Two Randomized Experiments"

- **n = 83,401** (426× larger)
- **$169M face value** relieved, 2018–2020, with RIP Medical Debt
- **Two actual randomized controlled trials**
- Same delivery mechanism: a third party pays, the person receives a letter

Results:
- **No effect on mental health** on average — with **detrimental effects for some subgroups** in pre-registered heterogeneity analysis
- **No effect** on physical health, healthcare utilization, or financial wellness
- **No effect** on credit report outcomes absent counterfactual credit reporting
- Debt relief **reduced** payments on the person's remaining medical bills

Authors' conclusion: "the strong correlations documented in prior research do not translate into causal effects."

### The honest read

We have a small quasi-experimental study saying account-clearing helps, and a large RCT saying debt relief doesn't. The RCT wins on identification and on power. **Anyone doing diligence on us will find Kluender in about four minutes.** We should find it first, in writing, before they do.

### Why this is not fatal — the distinction that survives

Both studies tested the *same* thing: **debt extinguished for you, by someone else, while you did nothing.**

Neither tested what ClearSlate actually proposes: **the person pays, with their own money, by their own decision, and the account closes as a result of their action.**

That is a different psychological event, and the difference is not cosmetic:

- **Effort justification / IKEA effect** — people systematically overvalue outcomes they produced. A cleared account you *bought* is not the same object as a cleared account that *arrived*.
- **Psychological ownership** — intensified by personal effort; drives valuation.
- **Self-signaling** (Gneezy et al., pay-what-you-want work) — people take costly action partly to learn what kind of person they are. Paying to clear a debt is legible self-evidence of being someone who handles their obligations. Receiving forgiveness in the mail carries no such signal — and may carry the opposite one, which is a candidate mechanism for Kluender's *detrimental* subgroup effects.
- **Reactance** cuts the same way: an unrequested gift that re-labels you "person who needed charity" can threaten self-concept. A purchase does not.

**So the corrected claim is:**

> ClearSlate is not in the debt-forgiveness business. Forgiveness-as-gift has been tested at scale and does nothing (Kluender 2024). ClearSlate is in the **agency-restoration** business: the person closes the account themselves, with their own money, at a price that makes closing achievable. Whether *self-directed* clearing produces the psychological benefits that *gifted* clearing does not is an **open empirical question** — and it is precisely the question our first portfolio answers.

This is a weaker claim than the one currently in CLAUDE.md. It is also defensible, novel, and testable — and it converts our first portfolio from "a trade" into "the first experiment anyone has run on this mechanism."

**Required edits:** CLAUDE.md's "highest-evidence rehabilitation intervention" line, `docs/research/u14-rehabilitation.md`, and the H3 doc all need this correction. Filed as a follow-up.

---

## §2. Why the discount is the wrong opening move

Five independent reasons converge. Any one would justify a change; together they make the current email close to the worst available option.

### 2.1 We are textually identical to a scam

FTC and state AG scam-warning literature lists the following red flags for debt-relief fraud:
- unsolicited contact about a debt
- a promise to eliminate a large fraction of the balance (**"70 or 80 percent"** is named explicitly)
- pressure to act before a deadline
- claims of a special method others don't have

Our current subject line:

> **"Take control: Clear your Affirm account for $291.67"**

...promising to cancel **67% of the balance**, from a company Ryan has never heard of, with a **21-day deadline**, describing a mechanism no other collector offers.

**We hit four of four.** A well-informed consumer — exactly the segment most likely to have $291 available — should be *more* likely to ignore us, not less. The discount is not a benefit at first contact; it is the primary evidence against our legitimacy.

### 2.2 Nudges on defaulted debt are mostly null, and some backfire

- **Latvia hospital debt RCT** (n=9,196, 8 arms): baseline payment rate ~1%. Generic reminders: **causal null**. Social norms ("80% of patients pay on time, you're in a minority"): **null**. Loss-framed and gain-framed public-good appeals: **null**. Only personalization moved anything (~1pp — a doubling, but on a 1% base).
- **Netherlands RCTs**: social-norm and deterrence nudges "all ineffective and tended to induce backfiring effects."

The literature is telling us that once someone has defaulted, clever copy mostly does not work. What survives is *personalization* — which the authors attribute to reduced social distance and humanization, not to persuasion.

**Implication:** our lift will not come from a better sentence. It comes from being credible, being easy, and reaching the right person at the right moment.

### 2.3 Reactance is a real, priced cost

**20% of surveyed consumers withheld a payment they had planned to make** after an upsetting contact from a collector. Debt contact threatens autonomy; threatened autonomy produces refusal-to-assert-control.

Self-determination research on autonomy-supportive framing is consistent: *providing genuine choice* raises compliance, while controlling phrasing triggers reactance and reduces persuasiveness.

Our current page does offer a choice (lump sum vs. plan) — good. But the email arrives with the price, the deadline, and the CTA already decided. The only choice offered is *how* to comply.

### 2.4 Anchoring: we open at our floor and call it a ceiling

Negotiation research is unambiguous that first offers anchor — **but only credible ones**. An anchor that lacks credibility "undermines your negotiating position and trustworthiness."

By opening at a 67% discount:
- we have set the **best** number we will ever say, first
- every subsequent message can only repeat or worsen it
- we have no concession left to make, which removes the reciprocity move that actually closes deals
- a strategic responder's correct play is to **wait** — if they cut 67% unprompted in email #1, email #3 will be better

Our own simulation flags the strategic settler archetype at 17.5% of the population with 2× match sensitivity. Those are precisely the people who will read an unprompted 67% cut as an opening bid.

### 2.5 The discount does nothing for the largest segment

Our model puts **avoiders at 37.5%** — the biggest group, 20% response rate.

The shame literature is specific: **shame predicts avoidance; guilt predicts repair.** Engaging with the debt means confronting evidence of personal failure, so not engaging is protective. Financial loss activates the same neural circuits as physical pain, and debt stress measurably degrades cognitive function.

**A discount is a price intervention aimed at a non-price barrier.** For 37.5% of the book, cutting the number from $875 to $291 changes nothing, because the obstacle was never the number — it was opening the email at all.

---

## §3. What the evidence says to do instead

### 3.1 The core inversion

> **Current:** Prove the offer, then hope they believe us.
> **Proposed:** Prove ourselves, then let them discover the offer.

Trust is the binding constraint at first contact. Price is the binding constraint at second contact. We currently solve them in the wrong order.

### 3.2 Revised sequence

**Contact 1 — Recognition. No offer, no ask, no number to accept.**

Purpose: be verifiable, be personal, be zero-pressure. State who we are, that we bought the account, and exactly what we will and won't do (no lawsuits, no wage garnishment, no credit-report damage from us). Include the FDCPA validation notice — not as legal boilerplate but as the *product*: here is your right to make us prove this, here is the one-click button to exercise it.

- Personalization: proven lever (Latvia)
- Zero ask: removes reactance trigger
- Inviting a dispute: strongest possible legitimacy signal. Scams do not hand you a dispute button.
- "We will never sue you" is true, differentiating, and directly addresses the fear that drives avoidance

**Contact 2 — Options. Autonomy-framed, percentage-anchored.**

Only now introduce that the balance is movable. Frame as **choice among options they control**, not a single take-it-or-leave-it price. Percentage framing (Kuan et al. 2025: −0.14pp delinquency vs. dollar framing).

**Contact 3 — The offer, earned rather than gifted.**

Present clearing as something they complete, not something we hand over. Effort justification is the entire reason our mechanism might succeed where Kluender's failed — so the copy must never describe this as a gift, charity, or forgiveness. It is a purchase they make.

**Contact 4 — Implementation intention.**

Ask *when and how* they plan to pay. If-then planning prompts run **d ≈ 0.65**, 2–3× follow-through in meta-analysis, with larger effects under contingent if-then format and high motivation. This is the cheapest unclaimed lift available to us.

**Temporal landmark overlay.** Where the calendar permits, time contact 3–4 to a fresh-start landmark (1st of month, new year, their birthday if we hold it). Dai, Milkman & Riis: 20–30% lift in a retirement-savings field experiment.

### 3.3 What to stop doing

| Stop | Why |
|---|---|
| Leading with the discount | §2 in full |
| Dollar-only framing | Percentage beats dollars (PNAS 2025) |
| "We cancel $2 for every $1" as the headline | Reads as scam; it's a mechanism, not an opener |
| Any social-norm line ("most people in your situation…") | Null in Latvia, backfired in Netherlands |
| Any prosocial/moral appeal | Null in Latvia (both loss- and gain-framed) |
| 21-day countdown in email #1 | Named FTC scam marker; also unnecessary — we own the paper, we set the clock |
| Calling it forgiveness, relief, or a gift | Destroys the effort-justification mechanism that is our only defense against Kluender |

### 3.4 Where the ML actually belongs

Zhou & Wang (2024), Netherlands RCT, n=7,839: algorithmic decisions about **whom to contact and when** achieved **23.4% higher repayment with fewer contacts** than human collectors. The signal came from predicting *motivations and impediments*, not from better scripts.

This relocates the H3 machine-learning claim. The edge is **not** primarily "ML picks the optimal match ratio." It is:
1. **Timing and sequencing** — when is this person reachable and receptive
2. **Triage** — who gets a deep ratio, who needs no discount at all, who should be left alone
3. **Impediment classification** — is this a price problem, a trust problem, or a shame problem, because those need different treatments

Match ratio remains the lever only we possess. But the proven ML lift in this literature is in targeting, and we should say so rather than overclaiming.

---

## §4. Open questions this creates

1. **Does self-directed clearing beat gifted clearing?** The central untested question. Our first portfolio is the experiment. Needs a pre-registered design and a validated wellbeing instrument at intake and +90 days, or we will not be able to claim anything.
2. **Does a no-offer first contact beat an offer-first first contact?** Directly testable, 50/50 split, first portfolio. This is the highest-value A/B we can run.
3. **Does inviting disputes raise or lower net recovery?** It should raise trust and raise disputes simultaneously. Our simulation prices disputes at $125 each. Unknown whether the trust gain exceeds the dispute cost.
4. **Percentage vs. dollar framing on a 67% discount.** "We cancel 67% of what you owe" vs. "$583 comes off." Free to test.
5. **Does the strategic-settler segment actually hold out for a better offer?** Our model assumes a static sigmoid. Real people negotiate. Needs a holdout arm that receives no second, better offer.

---

## §5. Recommended immediate actions

1. **Correct CLAUDE.md.** The "highest-evidence rehabilitation intervention" claim must be rewritten to the agency-restoration framing in §1. Add Kluender to the corrections log in `docs/research/notes.md`.
2. **Rewrite contact 1** as a recognition/legitimacy email with no offer. Keep the built offer page — just don't link the price in email #1.
3. **Add percentage framing** everywhere a discount is stated.
4. **Strip** social-norm, prosocial, and countdown-in-email-1 elements before they get written.
5. **Add an implementation-intention prompt** at the point of offer acceptance.
6. **Build the dispute button into email #1**, not into an FAQ at the bottom of the offer page.
7. **Pre-register the wellbeing measurement** before the first portfolio, or the rehabilitation claim stays unfalsifiable and therefore worthless.

---

## Sources

- Kluender, R., Mahoney, N., Wong, F., & Yin, W. (2024). *The Effects of Medical Debt Relief: Evidence from Two Randomized Experiments.* NBER Working Paper 32315. https://www.nber.org/papers/w32315
- Ong, Q., Theseira, W., & Ng, I. Y. H. (2019). *Reducing debt improves psychological functioning and changes decision-making in the poor.* PNAS 116(15). https://www.pnas.org/doi/10.1073/pnas.1810901116
- Kuan, et al. (2025). *Behavioral nudges prevent loan delinquencies at scale: A 13-million-person field experiment.* PNAS 122. https://www.pnas.org/doi/10.1073/pnas.2416708122
- *Personalized messaging enhances hospital debt collection while prosocial appeals fail: Evidence from a field experiment.* https://pmc.ncbi.nlm.nih.gov/articles/PMC11443582/
- *Nudging debtors to pay their debt: Two randomized controlled trials.* Journal of Economic Behavior & Organization. https://www.sciencedirect.com/science/article/pii/S0167268122001329
- Zhou, Y., & Wang, Q. (2024). *Artificial Intelligence and Debt Collection: Evidence from a Field Experiment.* SSRN 4905228. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4905228
- Dai, H., Milkman, K. L., & Riis, J. (2014). *The Fresh Start Effect: Temporal Landmarks Motivate Aspirational Behavior.* Management Science 60(10). https://pubsonline.informs.org/doi/10.1287/mnsc.2014.1901
- McKinsey. *Behavioral insights and innovative treatments in collections.* https://www.mckinsey.com/capabilities/risk-and-resilience/our-insights/behavioral-insights-and-innovative-treatments-in-collections
- Gneezy, A., et al. *Pay-what-you-want, identity, and self-signaling in markets.* PNAS. https://pubmed.ncbi.nlm.nih.gov/22529370/
- FTC Consumer Advice. *Signs of a debt relief scam.* https://consumer.ftc.gov/consumer-alerts/2017/06/signs-debt-relief-scam
- CFPB. *§ 1006.34 Notice for validation of debts.* https://www.consumerfinance.gov/rules-policy/regulations/1006/34/
