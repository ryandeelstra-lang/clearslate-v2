# Research findings

Everything here came from actual sources, not intuition. Each claim carries its
link. These findings drove the v1 feature ranking and should drive v2's.

---

## What people actually read

- **~80%** of landing-page visitors read only the **headline and the first
  sentence** of the subhead before deciding whether to continue.
- **~57%** never scroll past the first viewport on desktop; **64%** on mobile.
- Internet users read about **20%** of the text on a page.
- **66%** read the headline and the CTA button — and little else.

**Implication:** anything that must be seen goes above the fold. Trust content
placed below the hero is trust content most people never see.

Sources: [digitalapplied](https://www.digitalapplied.com/blog/landing-page-statistics-2026-conversion-data-points),
[seosherpa](https://seosherpa.com/landing-page-statistics/)

---

## The single highest-value fact

**83%** of cardholders who asked their issuer for a lower APR in 2025 **got
one** — the highest rate since tracking began in 2021. Average reduction:
**6.3 percentage points**. Separately, **92%** who asked for a late-fee waiver
got it.

On $8,500 at 24.99%, a 6.3-point cut is roughly **$540/year for one phone
call**, with zero behaviour change required.

**Caveat learned the hard way:** the 6.3-point average comes from cards
averaging ~25% APR. Subtracting it from an already-low card produces a target no
issuer will grant (asking for 6.20% on a credit card makes the caller look
uninformed). v1 floors the target at ~14% and doesn't show cards under ~16% at
all.

Source: [LendingTree, 2025](https://www.lendingtree.com/credit-cards/study/lower-apr-ask/)

---

## Why debt apps lose their users

- **~90%** of daily active users are gone **within 30 days**.
- The cause is not bad software: these apps **demand daily engagement exactly
  when motivation dips**, and don't adapt when effort drops — so a normal
  low-energy week reads to the user as personal failure.
- People **in financial hardship often cannot pay** for the app, and free-tier
  caps on how many debts you can track are a top-cited frustration.

**Implication:** the design response is to **ask for less**, not more. No
streaks. No daily check-ins. And never paywall someone's view of their own debt.

Source: [Hunter Vault analysis](https://huntervault.app/blog/why-budgeting-apps-dont-work/)

---

## Shame is the churn mechanism

- Shame-based motivation produces **short-term panic followed by long-term
  avoidance** — people give up entirely.
- Users work **harder to avoid negative feelings than to chase positive ones**,
  so apps foregrounding progress retain better than apps foregrounding
  overspending.
- **41%** of users took a follow-up financial action **within 72 hours** when
  the entry point was anonymous and low-friction — bypassing what the research
  calls the "gateways of shame".

**Implication:** no accusatory copy, no "damage", no judgment. Anonymity and
speed are conversion levers for this audience, not just niceties.

Unresolved tension: the founder brief wants a gut-punch number, and v1 shows one
($635/mo in interest). That is defensible **only because a way out sits on the
same page** — loss framing plus agency, rather than shame. If users bounce off
that screen, soften it first.

Sources: [Simply Psychology](https://www.simplypsychology.com/articles/debt-shame-psychology),
[Eleven Space](https://www.elevenspace.co/blog/designing-for-financial-behavior-ux-that-builds-better-money-habits),
[Journal of Consumer Affairs 2024, via Alibaba product insights](https://www.alibaba.com/product-insights/ai-powered-financial-literacy-bots-vs-certified-credit-counselors-do-chatbots-reduce-shame-driven-avoidance)

---

## Market conditions

- Consumers carrying card balances now pay **20%+ APR**, and delinquencies are
  rising.
- Non-profit credit counselling routinely negotiates rates down to **6–10%** —
  proof the sticker rate is soft and most people never test it.
- Balance-transfer intro offers currently run **up to 21 months at 0%**.

Sources: [Bankrate](https://www.bankrate.com/credit-cards/advice/how-to-negotiate-with-credit-card-companies/),
[Motley Fool](https://www.fool.com/money/research/credit-card-debt-statistics/)

---

## Community behaviour

**#debtfreecommunity** is an established behaviour — people already post payoff
milestones publicly without prompting, and celebrating milestones measurably
reinforces the habit.

**Implication:** shareable milestone cards are the only zero-marginal-cost
acquisition channel available. Gift-card prizes break the unit economics; status
does not.

Source: [NerdWallet](https://www.nerdwallet.com/article/finance/smart-money-podcast-embrace-financial-vulnerability-to-get-out-of-debt-social-medias-impact-on-financial-freedom)

---

## The through-line

**The things that work give money back in the first week without asking anyone
to become a different person.**

Behaviour change is where these apps lose 90% of their users. Rate-cut calls,
fee waivers, and balance transfers all pay off before the user has changed a
single habit — which is why they outrank budgeting features.

---

## Research gap — worth closing

The searches returned solid aggregate statistics but **thin primary user voice**
(Reddit threads, review mining). Nobody has yet talked to a real person in debt
about this product. Every planning doc in this repo says the same thing:

> Get 10 real users before writing more code.

That remains the highest-value unstarted action.
