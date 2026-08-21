# Market research — personalized debt payoff

Done before committing to an architecture. Conclusion up front: **the thesis is
validated by evidence, but it is not greenfield.** A funded competitor is
already executing it. Their weakness is not their technology.

---

## The thesis has real evidence behind it

**Personalized behavioral nudges outperform static financial education by 3× in
behaviour change** — published CFPB research. Platforms that surface targeted,
timely prompts against real transaction data close the gap between guidance and
action.

That is about as good a validation as this idea can get: the consumer-protection
regulator's own research says personalization works better than the generic
advice everyone else ships.

Source: [Miquido roundup of AI fintech](https://www.miquido.com/blog/ai-fintech-companies/)

---

## The single most actionable behavioural finding

Gal & McShane (Kellogg, *Journal of Marketing Research*, 2012):

> The strongest predictor of whether a consumer stayed debt-free after a payoff
> plan was **not** the dollar amount paid, **not** the interest rate, and
> **not** household income — it was the **proportion of accounts eliminated**
> (debts closed ÷ debts open at intake).

People track progress on **completion count**, not dollars saved. Paying down a
single large balance produces no discrete victory, so progress feels invisible
and they quit.

**Implication:** debt *snowball* (smallest balance first) beats *avalanche*
(highest rate first) on completion, while costing modestly more interest. The
2023 *Southern Economic Journal* paper quantifies that pecuniary cost.

**This is the highest-value personalization axis we have.** The general finding
favours snowball; the open question — and the actual ML opportunity — is
predicting *for whom* avalanche is safe, because those users keep the interest
savings without losing motivation.

Sources: [Kellogg](https://www.kellogg.northwestern.edu/news_articles/2012/snowball-approach.aspx),
[Hamilton 2023, Southern Economic Journal](https://onlinelibrary.wiley.com/doi/full/10.1002/soej.12612),
[NBER w20125](https://www.nber.org/system/files/working_papers/w20125.pdf)

---

## Who is already doing this

| Company | What they do | Overlap |
| --- | --- | --- |
| **Bright Money** | Consumer app. "Bright Plan" — AI-driven personalized debt payoff. Markets *MoneyScience*, "34 algorithms", patented. | **Direct competitor.** Same thesis. |
| **Payitoff** | Embeddable debt-guidance for banks and lenders. Low/no-code personalized repayment strategies. | B2B2C — different distribution. |
| **Method Financial** | Debt account connectivity and payment rails. | Infrastructure — potential *supplier*. |
| **Tranqui** (YC) | ML-driven personalized communication + repayment plans — but on the **collections** side, creditor-facing. | Adjacent, opposite side of the table. |
| **Cleo** | $138M raised. Conversational finance assistant. | Adjacent, not debt-payoff specific. |

Sources: [YC credit & lending](https://www.ycombinator.com/companies/industry/credit-and-lending),
[CB Insights — Bright](https://www.cbinsights.com/company/bright-money),
[Finder review](https://www.finder.com/credit-building/bright-money)

---

## Where the opening actually is

Bright Money's problem is **not** its algorithms. It is how it treats the people
using it. From reviews and complaint boards:

- **$89–$97/year subscription**, charged to people who came because they are in
  debt.
- **Default annual billing at signup** — the UX makes it easy to be charged ~$97
  without realising.
- **It took money out of a user's "stash"** — the savings they were accumulating
  to pay down debt — **to pay its own subscription fee.**
- **No option to remove a connected bank account.**

Set that against the retention research already in this repo: people in
financial hardship frequently **cannot** pay for these apps, and free-tier caps
are a top-cited frustration.

**So the wedge is the business model, not the model.** Charging someone in debt
to look at their own debt — and then taking it out of their payoff savings — is
the category's quiet absurdity. Refusing to do that is a position that can be
said out loud, and it costs nothing we were otherwise going to earn.

This is exactly what `docs/decisions/` idea 8 ("free forever on seeing your own
debt") was already reaching for. The market research turns it from a nice
principle into a competitive strategy.

Sources: [ComplaintsBoard](https://www.complaintsboard.com/bright-money-b133809),
[The Ways To Wealth review](https://www.thewaystowealth.com/bright-money-review/),
[Hunter Vault on budgeting-app churn](https://huntervault.app/blog/why-budgeting-apps-dont-work/)

---

## What this says about the ML architecture

**Contextual bandits are explicitly the industry answer to cold start.** They
make good decisions for a brand-new user from patterns learned across all users,
while continuously refining per-individual — unlike recommender systems, which
need history before they say anything useful. They also beat static A/B tests by
allocating traffic dynamically instead of splitting it evenly.

That maps directly onto our situation: **zero users on day one, and a need to
personalize from the first session.**

Sources: [Optimizely](https://www.optimizely.com/insights/blog/contextual-bandits-in-personalization/),
[Statsig](https://www.statsig.com/perspectives/personalized-testing-at-scale),
[Kameleoon](https://www.kameleoon.com/blog/contextual-bandits),
[Hightouch](https://hightouch.com/blog/contextual-bandits-for-marketers)

---

## Honest read

**For us**
- Regulator-backed evidence that personalization beats generic advice (3×).
- A specific, published, highly actionable behavioural lever (account-count
  progress) that most competitors ignore in favour of interest-rate math.
- The market leader is monetizing the person in debt, badly, and users are
  loudly unhappy about exactly that.
- Bandits solve the cold-start problem we actually have.

**Against us**
- **Bright Money exists, is funded, and claims patents.** "AI-personalized debt
  payoff" is not a novel pitch to an investor or a user.
- Personalization claims are cheap; "34 algorithms" is marketing. Ours would be
  too, unless the *outcome* is measurably better.
- Still **zero users**, which every planning document in this repo has flagged
  as the real bottleneck. No amount of architecture substitutes for ten people.

**The differentiator cannot be "we use ML."** It has to be that we are the one
that does not charge people in debt to see their own debt, and that our plans
are ones people actually finish.
