# U14 — Rehabilitation as product

**Researched:** 27 August 2026
**Question:** The pitch now includes rehabilitating the person — fixing spending,
helping them find work, reducing shame, raising financial literacy. What does the
evidence say each of those is worth, what can a debt buyer actually afford, and
what does adding them do to the binding constraint?

**Prompted by:** an explicit product decision, not by a gap in the plan. Recorded
here because three of the four items have a real evidence base and one of them
has an established null that would otherwise have been built.

---

## Verdict

**Three of the four are sound. The fourth — financial literacy — is a null, and
it is the one every company in this category builds.**

And the finding that reorganises the whole idea:

> **The debt relief is not the precondition for rehabilitation. It is the
> rehabilitation intervention with the strongest evidence behind it.**

Paying off an *account* — not paying down a balance — measurably improves
cognitive function, cuts anxiety and reduces present bias in exactly this
population. That is a published, randomised-adjacent field result, and it means
H3's core mechanic is already the highest-evidence rehabilitation lever
available. Everything else is either a referral or a null.

**Design consequence, stated once because it is the point of this file:** the
per-account match ratio should be optimised to **maximise the number of accounts
brought to zero**, subject to cash clearing break-even — not to maximise dollars
collected. Three independent literatures converge on account *count* as the
variable that matters, and none of them converge on dollars.

---

## Confidence and gaps

**Established, primary or peer-reviewed:**
- The financial-education null (meta-analysis, 201 studies, 585,168 participants).
- Debt relief → cognitive and psychological improvement (PNAS 2019).
- The mechanism (Science 2013).
- Sectoral employment effect sizes and per-participant costs (multiple RCTs).

**Not established:**
- Whether any of this transfers to **cold, post-charge-off contact**. Every study
  below was run on people who had already engaged — enrolled in a charity
  programme, applied to a training provider, sat in a classroom. This repo has
  now failed the same transfer three times (Repayment-by-Purchase, round-number
  targets, Karlan & List). **Assume it fails until measured.**
- Whether referral actually converts. A link in a letter is not a placement.
- Anything about spending behaviour specifically. Not researched; see §6.

**Retracted in the course of this research:** see §8. A claim already in
`market.md` that would have justified building the null did not survive checking.

---

## 1. Financial literacy — established null, do not build

[Fernandes, Lynch & Netemeyer, *Management Science* 60(8), 2014](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2333898)
— meta-analysis of **201 studies, 585,168 participants**:

- Interventions to improve financial literacy explain **0.1% of the variance** in
  the financial behaviours studied.
- Effects are **weaker in low-income samples** — i.e. weakest precisely in our
  population.
- Effects **decay**; even many-hour interventions have negligible behavioural
  effect at 20 months or more.

This sits alongside the two RCT nulls already in `notes.md` (five envelope
treatments, nine social-norm/deterrence treatments). It is a larger and older
null than either, and it is unambiguous.

**What survives.** The authors' own alternative is *just-in-time* education:
guidance attached to a specific decision at the moment it is made, rather than a
curriculum delivered in advance. That is not a literacy product; it is a
well-timed sentence in a payment flow, and it costs nothing.

**Rule for this project:** ClearSlate ships no course, no module, no quiz, no
"financial health score." It may ship one sentence of explanation at the moment
a person is deciding something, which is a different thing wearing the same word.

---

## 2. Debt relief itself is the intervention

[Ong, Theseira & Ng, *PNAS* 116(15), 2019](https://www.pnas.org/doi/10.1073/pnas.1810901116)
— field study of **196 chronically indebted low-income households** in Singapore
receiving debt relief of up to S$5,000 (~3 months' household income) through a
charity programme:

| Effect of **one additional account paid off** | |
| --- | --- |
| Cognitive functioning | **+0.25 SD** |
| Likelihood of exhibiting anxiety | **−11%** |
| Likelihood of exhibiting present bias | **−10%** |
| Share with GAD symptoms, pre → post relief | **78% → 53%** |

The authors' interpretation: debt is **not fungible**. It is held as separate
mental accounts, each of which consumes cognitive bandwidth. Closing an account
releases the bandwidth; reducing a balance does not.

The mechanism is
[Mani, Mullainathan, Shafir & Zhao, *Science* 341, 2013](https://www.science.org/doi/10.1126/science.1238041):
financial worry imposes a cognitive load that measurably degrades performance in
the poor and not in the well-off, within the same person across the harvest cycle.

**Why this matters more than it first appears.** It converges with a finding
already in `market.md` from an unrelated literature — Gal & McShane's result that
the strongest predictor of staying debt-free is the **proportion of accounts
eliminated**, not dollars paid, not the rate, not income. Two separate research
programmes, one on psychology and one on consumer behaviour, land on the same
variable.

**So the "rehabilitation" claim in the pitch is not aspirational.** Clearing
accounts is, on the published evidence, the thing that restores the capacity that
everything else depends on. This is also why sequencing matters: coaching someone
whose bandwidth is consumed by debt is coaching them at their worst, and every
literacy study above was run in exactly that condition.

⚠️ **The honest limit.** Ong et al. studied people enrolled in a charity
programme receiving relief *funded by a third party*, with no counterparty
relationship to the debt. Our version is relief offered by the entity that
profits from the payment. The psychology of an account reaching zero may well be
the same; the psychology of *who cleared it* is untested. Registered in §9.

---

## 3. Employment — the best evidence in the file, and unaffordable to deliver

Sectoral employment programmes are the strongest randomised evidence in
workforce development. They also cost more per person than an entire portfolio
of our accounts is worth.

| Programme | Earnings effect | Cost per participant |
| --- | --- | --- |
| [Project QUEST](https://evidencebasedprograms.org/programs/project-quest/) | **+15–20%/yr (~$6,000) sustained into years 9–14**; +$54,280 cumulative | ~$10,500 direct (~$14,400 all-in) |
| [Year Up](https://www.mdrc.org/work/publications/effects-sector-focused-training-after-10-years) | **+40.3%** earnings at 3 years | $23,135 net; 1.66:1 benefit-cost |
| [WorkAdvance / Per Scholas](https://www.towardsemployment.org/wp-content/uploads/WorkAdvance_5-Year_Report_ES_Final.pdf) | **+14%** long-term earnings at 7 years | — |

Sector-focused programmes generally produce **+14–38%** earnings in the year
after training, persisting at **+12–34%** in the latest year measured
([J-PAL evidence review](https://www.povertyactionlab.org/sites/default/files/publication/Evidence-Review_Sectoral-Employment_2222022_0.pdf)).

### The arithmetic that settles it

Take a $500 account, bought at the current market price established in U13:

| | |
| --- | --- |
| Purchase price at 5.4¢/$1 | **$27** |
| Expected gross recovery at ~11¢/$1 (U13-corrected) | **$55** |
| Up-front servicing (repo placeholder) | $1.75 |
| Project QUEST, per participant | **$10,500** |
| Year Up, per participant | **$23,135** |

A single sectoral training placement costs **roughly 400–900× the purchase price
of an account**, and **190–420× everything we ever expect to collect on it.**

There is no match ratio, no ML model, and no cost discipline that closes a gap of
that size. **ClearSlate cannot fund employment services out of collections.**

**What it can do, at approximately zero marginal cost, is refer.** These
programmes exist, are publicly and philanthropically funded, and are free at the
point of use. The public workforce system (WIOA / American Job Centers) is
nationwide. A warm handoff costs a paragraph and a link.

**The honest framing for the pitch is therefore "we connect you to this," not "we
do this."** Claiming to provide job training we do not provide is a §1692e(10)
problem before it is a credibility problem.

---

## 4. Shame — already established here, with one addition

`findings.md` establishes it: shame produces short-term compliance then long-term
avoidance; users work harder to avoid negative feelings than to chase positive
ones; anonymous, low-friction entry produced follow-up action within 72 hours for
41% of users by bypassing "gateways of shame."

The addition U14 makes is about *where* the shame happens.

**The validation notice is the shame event.** It is the first thing a person
receives, it arrives unsolicited from a company they have never heard of, and it
names a debt they have probably been avoiding for a year. Every downstream
mechanic — the match, the portal, any referral — is gated behind whether that
envelope produces engagement or avoidance. Rev. 2 already made the mailed piece
the first build item and letter → portal-visit the first gate; U14 supplies the
reason that ordering is right.

This is the highest-leverage surface in the entire product and it is a sheet of
paper with legally mandated content on it.

---

## 5. What a debt buyer can actually afford

| Intervention | Marginal cost per person | Evidence | Verdict |
| --- | --- | --- | --- |
| Clearing whole accounts | Already the business | PNAS 2019, Gal & McShane | **Core** |
| Ordering payoff to maximise accounts closed | Zero — a model objective | Same | **Core** |
| Just-in-time guidance at a decision | ~Zero | Fernandes et al.'s own alternative | Ship |
| Non-shaming letter and portal copy | ~Zero | `findings.md` | Ship |
| Warm referral to WIOA / sectoral providers | ~Zero | RCTs above | Ship |
| Referral to NFCC non-profit counselling | ~Zero | Not researched | Investigate |
| Financial literacy curriculum | Real | **0.1% of variance** | **Never** |
| In-house coaching (human) | $50–$500+ | Not researched | Unaffordable |
| Employment services (delivered) | $10,500–$23,135 | Strong, but | **Unaffordable** |

The pattern is stark: **everything affordable is either the core mechanic, a
sentence, or a link.** That is not a limitation to apologise for. It is the
correct shape for a business whose unit of value is $27.

---

## 6. Spending behaviour — not researched, and one warning

No new research was done on spending interventions. Two things already in the
repo bear on it and neither is encouraging:

- `findings.md`: ~90% of these apps' daily active users are gone within 30 days,
  because they demand engagement exactly when motivation dips.
- `behavioral-psychology-audit.md`: the v1 hard-decline architecture carried
  documented risks of reactance, displacement to other cards, and shame spirals —
  and it governed a **debit** card while the debt sat on **credit** lines it could
  not touch.

Additionally, connecting bank accounts to diagnose spending requires Plaid-level
data on a person who is currently in a collection relationship with us. See §7.

**Open, and worth researching before any spending feature:** how much of this
population's difficulty is *volatile income* rather than *overspending*. If it is
volatility, budgeting advice is the wrong instrument entirely and payday-aligned
timing — already an allowed mechanic under CLAUDE.md — is the right one.

---

## 7. Four risks the rehabilitation layer creates

**1. Asking about employment reads as locating assets for garnishment.**
This is the most serious one. To a person with a charged-off debt, a collector
asking where they work has exactly one historical meaning: wage garnishment. Our
no-sue position is real, but it is *our* private knowledge until proven. Any
employment feature that begins by asking about the person's job will read as
hostile no matter how it is worded. Design constraint: **referral must be
one-directional — we hand over a link, we do not collect employment data.**

**2. It is coaching someone to pay us.** Creditor-funded counselling has a long
and unflattering history. The mitigation is structural, not tonal: referral to
programmes we neither run nor profit from, and no conditioning of any debt term
on participation.

**3. Reg B exposure widens (U11).** U11 already flags that setting the match
ratio per account may make ClearSlate a creditor "setting the terms of the
credit" under 12 CFR §1002.2(l), with collection procedures expressly inside
§1002.2(m). **Conditioning terms on programme participation would make that
worse**, because participation correlates with everything protected-class status
correlates with. If rehabilitation is offered, it must be offered to everyone
identically and must never be an input to the ratio.

**4. It requires exactly the data `tape.ts` refuses to hold.**
`tape.ts` deliberately cannot carry a name, SSN, address, phone, or any
protected-class column, on the principle that a type that cannot hold identity
cannot leak it. Rehabilitation needs identity, contact, employment and possibly
transaction data. **These are two different systems with two different threat
models**, and the boundary between them is a design decision, not an
implementation detail. Nothing in `core/` should learn about a person.

---

## 8. 🔴 Retraction — the "3× CFPB" claim

`market.md` currently opens with:

> "**Personalized behavioral nudges outperform static financial education by 3×
> in behaviour change** — published CFPB research."

**This did not survive checking and should not be used.** The only citation is a
[vendor blog roundup](https://www.miquido.com/blog/ai-fintech-companies/); no CFPB
publication carrying a 3× figure was located. It is described in `market.md` as
"about as good a validation as this idea can get" and as coming from "the
consumer-protection regulator's own research," which is a much stronger claim
than a marketing roundup can support.

**This is the second time a CFPB attribution in this repo has failed
verification** — the first was the "< 0.5¢, 117 of 176 listings" figure retracted
in `u7-pricing.md`. Both were retracted for the same reason: a specific number
attributed to a regulator, sourced to something that was not the regulator.

What replaces it is weaker and better: the *direction* is supported by Fernandes
et al.'s own recommendation of just-in-time over curriculum. The **3× magnitude
has no source.**

---

## 9. Unverified claims register

1. **Ong et al.'s effects survive when the relief comes from the profiting
   counterparty rather than a charity.** Untested. The single largest assumption
   in the rehabilitation thesis.
2. **Referral converts.** No data. A link in a letter to a person who has just
   learned a stranger owns their debt is a weak instrument.
3. **Optimising for accounts-cleared rather than dollars does not reduce cash
   below break-even.** This is a modelling claim and it is checkable in
   `portfolio.ts` today — it does not need a portfolio.
4. **Income volatility, not overspending, is the dominant driver.** Plausible,
   unresearched, and it would change which spending feature is correct.

---

## 10. The tension with `findings.md`, stated plainly

`findings.md` ends with the project's own through-line:

> "The things that work give money back in the first week **without asking anyone
> to become a different person.**"

Rehabilitation, read literally, asks people to become a different person. That is
a real conflict between an established finding and a product decision, and
pretending otherwise would be the kind of quiet contradiction rev. 1 died of.

**The resolution this research supports:**

> Rehabilitation is an **outcome we cause**, not a **curriculum we deliver**.

We cause it by bringing accounts to zero, which the PNAS result says restores
cognitive function, cuts anxiety and reduces present bias — no behaviour change
demanded, no course completed, no daily check-in. Then, for the people who want
more, we hand them a link to a programme that has RCT evidence behind it and
costs them nothing.

That version asks nothing of the person in week one, which is the finding, and
still gets them further than a payment plan, which is the ambition.

---

## 11. Next actions

1. **Respecify the H3 bandit objective as accounts-cleared, cash-constrained.**
   Desk work, no capital, checkable against `portfolio.ts` now. It is the one
   place where this research changes code rather than copy.
2. **Write the referral list before writing referral copy.** WIOA / American Job
   Centers coverage, plus any sectoral provider in the U4 licensing states.
3. **Do not build a literacy feature.** If it returns, this file is the answer.
4. **Add "rehabilitation offered but not conditioned" to the U11 legal gate**, so
   the fair-lending review covers it in one pass rather than two.
