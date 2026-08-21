# User Profiles — 7 Potential ClearSlate Users

Seven ultra-specific profiles to pressure-test the product against real lives. Each maps to a documented target persona (low-impulse-control spender / reluctant debt-holder) and/or a behavioral archetype, and includes their honest first reaction — including the ways they'd churn. These are personas, not real users; the low-impulse-control persona still needs interview validation (see docs/product-vision.md).

> Legend — **Hook** = the feature most likely to land. **Churn risk** = the thing most likely to make them quit. **Verdict** = would they actually convert.

---

## 1. Marcus Webb — "The Midnight Spender"

- **Age / location:** 27, Columbus, OH. Rents a 1BR alone.
- **Job / income:** Backend dev at a logistics startup. $94k base, paid bi-weekly. Cash-flow *positive* on paper.
- **Debt:** $19,400 across **4 credit cards** (one nearly maxed at 26.99%), plus $310/mo on a financed PS5-and-TV bundle. No student loans.
- **The real problem:** He doesn't overspend on *bills* — he spends at **11pm–2am**. DoorDash, Amazon "add to cart," Steam sales, a $240 mechanical keyboard he didn't need. Mornings he barely remembers ordering.

**Defining characteristics**
- High income, high impulse, *zero* visibility into the pattern because every individual purchase feels affordable.
- Buys to self-soothe after stressful on-call shifts. Classic ego-depletion late-night spending.
- Has tried Mint, YNAB, three budgeting spreadsheets. Abandoned all of them in under 3 weeks — they *show* the damage but don't *stop* it.
- Tech-literate, will read the docs, will poke at the API. Skeptical of "another finance app."

**Maps to:** Persona #1 (low impulse control / frictionless spender) · Archetype: **Midnight Spender** · late-night index, what-the-hell cascade.

**Initial thoughts (verbatim-style)**
> "Okay, a budgeting app that actually *declines* me? That's either genius or I'll rage-quit in a week. The late-night spending chart is kind of horrifying — I genuinely didn't know it was that concentrated. If it blocks DoorDash after 11pm I think I'd thank it. But if it declines my card at a restaurant in front of someone I'm out, full stop."

- **Hook:** Behavioral Analytics ("Your Spending Brain") — the temporal heatmap showing his 11pm–2am cliff is the *insight* that gets him invested; the cap-after-X rule on food delivery is the *fix*.
- **Churn risk:** A decline in a social/embarrassing context. He's the exact user the "declines must never embarrass" constraint exists for.
- **Verdict:** **High-value convert** if the first week shows him his own pattern. He's the prototype user — but only the analytics make him stay long enough to feel the enforcement working.

---

## 2. Priya Raman — "The Reluctant Debt-Holder"

- **Age / location:** 31, Raleigh, NC. Married, no kids yet.
- **Job / income:** Pediatric nurse. $78k. Household ~$140k with her partner.
- **Debt:** $61,000 in **federal + private student loans** (nursing school). Pays $720/mo, always on time, never late once.
- **The real problem:** She did *nothing wrong*. She's disciplined. But the balance barely moves and she has **no felt sense of progress** — it's an abstract number that depresses her every time she logs into the loan servicer.

**Defining characteristics**
- Not an impulse spender at all. Frugal, even. Her issue is **morale and visibility**, not control.
- Wants to *feel* the snowball working. Motivated by milestones, streaks, and seeing the curve bend.
- Would never describe herself as "bad with money" — and would be slightly offended by an app that assumes she is.
- Researches before committing. Will read reviews, will ask in a nursing Facebook group.

**Maps to:** Persona #2 (reluctant debt-holder) · responds to progress mechanics, not enforcement.

**Initial thoughts**
> "I don't need something to *stop* me — I need something to show me this is actually working. The payoff chart where the ClearSlate line bends earlier than the 'now' line… that's the first time in years I've felt anything but dread looking at this number. The round-up thing is cute but it's pennies. Show me the timeline."

- **Hook:** The two-line **payoff comparison chart** + the 5-step ladder bending toward "Debt-free." Round-ups and Save-X as a small momentum booster.
- **Churn risk:** Heavy-handed enforcement framing that treats her like an addict. If onboarding scolds her, she leaves. Also: if the projection feels fake/over-promised, she'll catch it.
- **Verdict:** **Sticky, low-drama convert.** Won't generate support tickets, will refer friends, but needs the *encouragement* surface tuned to not condescend. The honest-math payoff baseline (real payment, not a fantasy) is what earns her trust.

---

## 3. Dontae Wilkins — "The Gambling Spiral"

- **Age / location:** 24, Newark, NJ. Lives with two roommates.
- **Job / income:** Warehouse shift lead. $48k + overtime, paid weekly. Cash is tight and lumpy.
- **Debt:** $7,800 across 2 cards and a **$1,500 cash-advance / payday-style loan** at a brutal rate. Balance swings with sports seasons.
- **The real problem:** **DraftKings, FanDuel, and a casino app.** Payday Friday → deposits within hours → broke by Sunday → cash advance to cover rent → fee spiral. The "what-the-hell" cascade in its purest form.

**Defining characteristics**
- Genuinely wants to stop. Has self-excluded from one app and re-signed up under a slightly different email.
- The damage clusters on a **payday cliff** — he's fine Monday–Thursday, dangerous Friday night.
- Shame-prone; will hide it from his girlfriend, who doesn't know the full amount.
- Lower trust in institutions; needs the product to feel like it's *on his side*, not surveilling him.

**Maps to:** Persona #1 (impulse) · Archetypes: **payday cliff + what-the-hell cascade** · the strongest case for *hard* enforcement.

**Initial thoughts**
> "If it can hard-block gambling MCCs so the deposit just… doesn't go through, that's the whole thing for me. I don't trust myself Friday at midnight. I trust myself right now, sober, on a Tuesday. Lock it in now so I can't undo it later when I'm hyped."

- **Hook:** **Full block on gambling category codes** + **Strict Mode** (lock the rule set for 31 days so his future hot-state self can't soften it — a Ulysses contract). The accountability partner texted *at the reach* is a backstop.
- **Churn risk:** Off-platform leakage — he uses a card that isn't ClearSlate to gamble. The Vault (cooling-off lock) and Plaid debt-mirror exist precisely to catch this, but he has to actually vault the other card. If he keeps an escape hatch, the product fails him.
- **Verdict:** **Highest *impact* convert, highest *fragility*.** When it works it changes his life; when it leaks it does nothing. He's the argument for Strict Mode + Vault + partner all working together, not enforcement alone.

---

## 4. Hannah Brooks — "The Lifestyle-Creep Optimizer"

- **Age / location:** 34, Austin, TX. Married, one toddler.
- **Job / income:** Marketing manager. $112k. Partner earns $90k. **High income, high outflow.**
- **Debt:** $4,200 revolving credit (carries a balance "for points"), $0 student loans, but a **$680/mo car lease** and **$340/mo in subscriptions and recurring upgrades** she's lost track of.
- **The real problem:** Not impulse, not loans — **death by a thousand recurring charges and "treat" spending.** Five streaming services, two meal kits, a Pilates membership she uses twice a month, premium everything. Each justified individually.

**Defining characteristics**
- Doesn't *feel* in debt — feels successful. The $4,200 revolving balance is invisible to her because she "pays it off mostly."
- Highly responsive to framing about *opportunity cost* and *future self*, less to shame.
- Optimizer mindset: if you show her she's leaking $410/mo, she'll want to plug it for the dopamine of efficiency.
- Will evaluate the app like a product manager. Wants polish; bounces on anything that looks janky.

**Maps to:** Edge of Persona #1 (frictionless, but not desperate) · Archetypes: **leaks (latte factor) + future-self compounding**.

**Initial thoughts**
> "I'm not the target market for a 'get out of debt' app, I'm fine… wait, $410 a month in stuff I forgot about? Compounded over 20 years that's *how much*? Okay, the leaks and future-self cards are genuinely doing something to my brain. Cap the dumb categories, kill three subscriptions, route the difference. I'd treat this like a min-maxing game."

- **Hook:** **Subscriptions tab** (Plaid Recurring) + the **Leaks** and **Future-Self** behavioral cards (small charges annualized + compounded at 7%). Round-up-to-debt as the satisfying "swept it" loop.
- **Churn risk:** She doesn't feel enough pain to tolerate friction. If a cap blocks a purchase she actually wanted, she resents it. Needs *soft* controls (caps, visibility) more than hard blocks. Also churns instantly on UI jank.
- **Verdict:** **Convert via vanity/optimization, not crisis.** Expands the TAM beyond the desperate-debtor base — but only if the product respects that she's not in a hole, she's plugging leaks. Different copy, same engine.

---

## 5. Earl Jensen — "The Older Restart"

- **Age / location:** 53, Spokane, WA. Divorced, two adult kids.
- **Job / income:** HVAC technician, self-employed. ~$70k but **irregular** — great summers, lean winters.
- **Debt:** $28,000 across cards (some from the divorce + a stretch of unemployment), a **$9k medical bill** in collections, financed work truck.
- **The real problem:** Not impulse — **circumstance + a cash-flow timing mismatch.** Winters he floats expenses on cards; summers he means to pay it down but it slips. Feels behind for his age and quietly ashamed.

**Defining characteristics**
- Not very tech-forward. Uses his phone for texts, calls, and one banking app he tolerates. **Low patience for setup friction.**
- Distrusts "fintech" and anything that smells like it'll sell his data or nickel-and-dime him.
- Motivated by dignity and by *catching up*, not by gamification (badges feel childish to him).
- An **accountability partner** that's his older sister would actually mean something — he respects her.

**Maps to:** Persona #2 (reluctant, circumstantial) with cash-flow volatility · stress-tests onboarding simplicity + trust.

**Initial thoughts**
> "I don't need a video game, I need to not be in this hole by 60. If connecting my bank takes more than two minutes I'm done — I've got jobs to run. The chart showing I could be debt-free in X years instead of never… that I'd put on my fridge. And no, I'm not photographing my cards for some app to keep."

- **Hook:** **Dead-simple onboarding** (< 1 min connect), the **payoff timeline**, and an **accountability partner (his sister)**. The honest framing ("here's your real monthly payment vs. with ClearSlate") respects his intelligence.
- **Churn risk:** Onboarding friction (the dev-build/Plaid Link hurdle could lose him before he starts), distrust of data handling, and feature bloat that feels like a toy. Irregular income also breaks naive "stop the bleeding" gates — the auto-cashflow gate must handle his lumpy months gracefully (it falls back to a discretionary check when income is undetectable, which helps).
- **Verdict:** **Convertible but the most fragile in the funnel's *first 90 seconds*.** Represents an underserved, high-trust-if-earned demographic. Win him on simplicity + dignity or lose him instantly.

---

## 6. Sofia Delgado — "The Gig-Economy Tightrope"

- **Age / location:** 22, Phoenix, AZ. Lives with her mom, contributes to rent.
- **Job / income:** Rideshare + delivery driver + occasional bartending. **Income is daily, volatile, all-app-based.** ~$2,600/mo on a good month.
- **Debt:** $2,900 on a single card, $600 BNPL (Klarna/Afterpay across a few orders), no student loans. *Small* debt — the leverage point is *now*, before it compounds.
- **The real problem:** **No buffer + BNPL normalizing four-payment impulse buys.** One slow week or a car repair and she's borrowing. Lives transaction-to-transaction with no sense of a monthly picture because income arrives in $40 chunks.

**Defining characteristics**
- Native to app-based money. Comfortable with the interface; *uncomfortable* with the volatility.
- BNPL feels free until four of them stack. Doesn't think of it as debt.
- Wants to build something, not just escape something — emergency fund is the dream, not just payoff.
- Highly responsive to micro-mechanics: **Save-X-a-day**, round-ups, streaks. Small wins feel huge at her scale.

**Maps to:** Persona #1-adjacent (impulse via BNPL) + early-stage builder · best fit for **Step 1/2** of the ladder (stop the bleeding → $500 fund).

**Initial thoughts**
> "Most of these apps assume I get a paycheck on the 1st and 15th. I get paid like forty times a week in tiny amounts. If it can read that and still tell me if I'm net-positive this month, cool. Save-a-dollar-a-day I can do. A $500 emergency fund honestly sounds amazing — I've never had one."

- **Hook:** **Save-X-a-day** + **round-ups** + the **$500 emergency fund** milestone (Step 2). The real-time **MTD budget** that makes sense of chunked income. Capping BNPL-style impulse categories.
- **Churn risk:** Volatile/low income means caps and "net non-negative month" gates can misfire and feel punishing or wrong. If the app declines something she truly needed in a lean week, trust evaporates. The micro-amounts must feel meaningful, not insulting.
- **Verdict:** **Long-term ideal — caught early.** Lowest debt, highest *prevention* value. If ClearSlate keeps her from becoming Marcus or Dontae in five years, that's the mission. Needs the income model to handle gig volatility natively.

---

## 7. Trevor Mrealy — "The Skeptic / Tinkerer"

- **Age / location:** 29, Seattle, WA. Roommates.
- **Job / income:** QA engineer. $88k, stable, paid bi-weekly.
- **Debt:** $11,000 — mostly a **0% promo-balance-transfer card** he's gaming, plus ~$1,300 actual revolving. Financially *literate*, debt is semi-intentional.
- **The real problem:** Doesn't have a behavioral problem so much as a **discipline-around-the-edges** problem — and a deep distrust of any app that touches his money or "enforces" anything. He's the guy who'll find the loophole.

**Defining characteristics**
- Privacy-paranoid. First question is "where do my Plaid tokens live and are they encrypted." (They are — AES-256-GCM at rest.)
- Will try to defeat the enforcement to see if it's real: spend on the other card, soften the cap, time a purchase around a reset.
- Not desperate — evaluating whether the *concept* is sound. Could become an evangelist or a loud critic.
- Hates over-promising. The moment a projection feels like marketing, he discounts the whole product.

**Maps to:** The **adversarial evaluator** — not a documented persona, but the user who finds the holes (off-platform leakage, soft-friction gaps) the product must survive.

**Initial thoughts**
> "Auto-decline at authorization? Prove it. What stops me from just using my other card — oh, the Vault and the debt-mirror, clever. And it's a *debit* card so there's no overdraft hole to exploit. Fine. Show me the security model and don't lie to me with the payoff chart and I might actually respect this."

- **Hook:** **Strict Mode** (he respects a real commitment device he *can't* weasel out of), the **encryption/security story**, and the honest, non-inflated payoff math. The Vault + Plaid debt-mirror closing the off-platform loophole earns grudging approval.
- **Churn risk:** Any discoverable loophole (off-platform spend with no consequence, a cap that resets exploitably, a fail-open he can trigger), or any whiff of dishonest framing. He'll write the negative review that scares off ten Priyas.
- **Verdict:** **Not the core market, but the most valuable *stress test*.** If the product survives Trevor — closes the leaks, tells the truth, encrypts the tokens — it's ready for everyone else. Convert him and he's a megaphone.

---

## 8. Jamal Okafor — "The Freshman (Prevention Play)"

- **Age / location:** 18, College Station, TX. Dorm. First semester at A&M.
- **Job / income:** Part-time campus job, ~$500/mo. Parents cover tuition + a monthly stipend.
- **Debt:** **$0 today** — but just got pre-approved for his first student credit card with a $1,500 limit and a 27.24% APR he didn't read. One BNPL order already open for a gaming chair.
- **The real problem:** Nothing yet. That's the point. He's standing at the exact fork where Marcus and Dontae took a wrong turn five years ago. Zero financial habits, infinite confidence.

**Defining characteristics**
- No felt urgency — he doesn't *have* a problem to solve, which is the hardest user to motivate.
- Parents are the real stakeholders; **his mom would pay for this app** to keep him on rails.
- Phone-native, attention span measured in seconds. Onboarding must be near-instant and feel like a game, not a lecture.
- Susceptible to exactly the late-night/social spending the analytics suite detects — before the pattern hardens.

**Maps to:** Pure **prevention** play (not a documented persona) · parental-payer dynamic · earliest possible intervention on Persona #1's trajectory.

**Initial thoughts**
> "My mom made me download this. I thought it'd be annoying but the 'set rules so future-you can't be dumb' thing is kind of funny. I capped fast food and DoorDash because honestly I know I'd blow my whole stipend on it. The little streak thing is dumb but I checked it three times today."

- **Hook:** **Gamification + streaks** + dead-simple caps. The **accountability partner = his mom** (or he hates that — see risk). Save-X framing on his tiny income.
- **Churn risk:** No pain = no retention; he forgets it exists by week three. Parental surveillance framing makes him resent it and disable it the moment he can. Must feel like *his* tool, not his mom's leash.
- **Verdict:** **Lowest urgency, highest lifetime value if retained.** The mission's purest form — stop the debt before it starts. Likely a **B2B2C / parental-gift** acquisition channel rather than self-serve. Retention is the whole challenge.

---

## 9. Kayla Simmons — "The Status Spender"

- **Age / location:** 26, Atlanta, GA. Rents a nice apartment she slightly can't afford.
- **Job / income:** Social media coordinator. $52k. Income does not match her feed.
- **Debt:** $16,500 across cards + a **$2,200 designer-bag installment plan**, regular Sephora/Revolve/brunch spend. Minimums only.
- **The real problem:** **Identity and social pressure.** Spending is performance — the bottomless brunch, the outfit for the photo, the trip everyone's posting. Stopping feels like admitting she's not who her feed says she is.

**Defining characteristics**
- Spends to belong and to project success; the debt is a *symptom* of an identity, not just impulse.
- Knows the numbers are bad, avoids looking. Shame + avoidance loop.
- Highly responsive to **counter-identity** framing ("you're someone who's building wealth, not renting status") — the archetype classifier's whole point.
- Aesthetics matter enormously. A clinical-looking app loses her; a beautiful one she'll screenshot.

**Maps to:** Persona #1 (impulse, social-triggered) · Archetype: **identity-based / counter-identity** + restaurant/retail cascades.

**Initial thoughts**
> "It called me a 'Lifestyle Performer' and honestly? Rude. Accurate. The bag plan plus the brunches is more than my car payment, I'd just never added it up. I don't want to be broke and look rich. Cap the eating-out and Sephora, route the rest. If the app itself looks good I'll actually open it."

- **Hook:** **Archetype + counter-identity** behavioral card, caps on dining/retail buckets, the **future-self** compounding number reframing a bag as retirement money. Beautiful UI is non-negotiable.
- **Churn risk:** Friction that collides with a social moment (declined at brunch) = the embarrassing-decline failure mode, amplified by an audience. Also bounces hard on ugly/janky UI.
- **Verdict:** **Convert via identity, not math.** Big segment (image-driven millennials/Gen Z). The counter-identity engine is built for her, but enforcement must be invisible-in-public and the product must be *pretty*.

---

## 10. Diego & María Castillo — "The New-Parent Squeeze"

- **Age / location:** Both 33, Sacramento, CA. New baby, just bought a small condo.
- **Job / income:** Diego — teacher, $62k. María — dental hygienist, $74k (just back from unpaid leave). Dual income, no slack.
- **Debt:** $9,800 cards (built during leave + baby setup), $0 student loans left, **$1,900/mo daycare** is the line item that broke the budget.
- **The real problem:** **Circumstantial cash-flow squeeze + a shared-finances coordination problem.** Neither overspends recklessly; together, life costs more than it did, and they don't have a shared view, so each assumes the other is tracking it.

**Defining characteristics**
- Two people, one budget, **no single source of truth.** The fights are about money but really about visibility.
- Time-poor and exhausted — anything requiring weekly effort dies.
- Motivated by *family* framing and by progress they can see together.
- María is the researcher/adopter; Diego will use it only if it's effortless.

**Maps to:** Persona #2 (reluctant, circumstantial) · stress-tests **shared/household finance** and the partner mechanic between spouses.

**Initial thoughts**
> "We're not irresponsible, we just had a baby and daycare costs more than our mortgage. We need to both *see the same thing* without a Sunday budget meeting that ends in an argument. If it shows us net-positive or not for the month and quietly caps the takeout we lean on when we're fried, that's enough."

- **Hook:** **Real-time MTD budget** as the shared mirror + the **accountability partner = each other** + the "stop the bleeding" net-cashflow gate. Caps on the convenience spending exhaustion drives.
- **Churn risk:** No true multi-user/household account yet (auth is per-user) — if they can't share one view, the core need goes unmet and they leave. Also: enforcement that misfires on a genuinely needed baby purchase.
- **Verdict:** **Strong, sympathetic segment that exposes a product gap** — household/joint accounts. High retention *if* shared visibility exists; today they'd hack it by sharing one login. A roadmap signal.

---

## 11. Renée Caldwell — "The Medical-Debt Avalanche"

- **Age / location:** 44, Knoxville, TN. Single, one teenager.
- **Job / income:** Office manager. $58k. Steady.
- **Debt:** **$41,000 — almost entirely medical** (a cancer treatment, partly covered, mostly not), now spread across two cards, a medical credit line at 22.9%, and **$12k in collections**. Plus the original modest card balance.
- **The real problem:** **Zero behavioral fault.** She did everything right and got buried by a health crisis. Her need is not control — it's a *plan*, *dignity*, and not being treated like she's irresponsible.

**Defining characteristics**
- Resents the entire "you overspend" premise of finance apps; her debt came from staying alive.
- Emotionally raw about money — every statement is a reminder of being sick. Avoidance is protective.
- Needs realistic hope: a concrete payoff path, however long, beats vague dread.
- Will respond to genuine empathy and honesty; will instantly reject shame, gamification, or hype.

**Maps to:** Persona #2 taken to its blameless extreme · stress-tests **tone, framing, and the honest-math promise** under emotional load.

**Initial thoughts**
> "I don't need a budgeting drill sergeant. I need to believe this is payable before I'm 60. If your chart is honest — if it doesn't pretend round-ups will fix $41k — I'll trust you. The first app that talks to me like an adult who got unlucky instead of a screw-up gets my money."

- **Hook:** The **honest payoff timeline** (real payment baseline, no fantasy), the **5-step ladder** giving structure, and **encouraging-but-not-childish** framing. Round-ups/Save-X as *small* honest momentum, never oversold.
- **Churn risk:** Any framing that implies fault. Gamification that feels flippant about a serious situation. Over-promising on the payoff — she'll catch it and feel manipulated.
- **Verdict:** **Mission-critical for tone.** She proves the product must serve blameless debt with dignity, not just impulse-control. The honest-baseline decision (real payment, not slider fantasy) was made for exactly her. Loyal if respected.

---

## 12. Bao Nguyen — "The Immigrant Provider"

- **Age / location:** 38, San Jose, CA. Wife + two kids; parents abroad.
- **Job / income:** Nail-salon owner-operator + some DoorDash. ~$66k, **mostly cash and irregular.**
- **Debt:** $13,000 cards, a **high-fee store card**, and reliance on **check-cashing / remittance services** that quietly bleed fees. Sends **$600/mo home** to parents — non-negotiable, cultural obligation.
- **The real problem:** **Thin credit + high-fee financial products + a fixed family obligation**, not impulse. He's frugal on himself; the leak is *predatory fees* and *expensive credit* he uses because mainstream options weren't built for him.

**Defining characteristics**
- Trust is earned slowly; burned before by fine print. Reads carefully, in a second language.
- Cash-heavy income makes most budgeting apps useless (Plaid sees little of it).
- Deeply motivated by **family / providing**, by building credit, and by stopping fee leakage.
- Will not gamble or splurge — the product's *enforcement* angle barely applies; its *visibility + fee-killing + credit-building* angle is everything.

**Maps to:** New financial context (underbanked / immigrant provider) · stress-tests **cash-income handling, fee transparency, and trust** — not enforcement.

**Initial thoughts**
> "I don't overspend. The fees overspend for me — the check casher, the store card, all of it. If this shows me what those cost me in a year and helps me build credit so I qualify for normal rates, that is worth real money. But a lot of my income is cash. Can it even see that?"

- **Hook:** The **leaks** analytics applied to *fees*, the **subscriptions/recurring** sweep catching the store card, honest debt-mirror. Round-ups toward the high-fee balances first.
- **Churn risk:** **Cash income is invisible to Plaid** — the app may badly misread his finances and feel wrong/irrelevant. Trust collapses on any hidden fee or aggressive upsell. Remittance outflow could trip naive "overspend" logic if miscategorized.
- **Verdict:** **Underserved, high-trust-if-earned, but exposes a data limit** (cash blindness). The mission ("get people out of debt") clearly includes him, but the product as built (Plaid-centric, enforcement-centric) only half-fits. A segment that argues for fee-transparency + manual cash entry on the roadmap.

---

## 13. Connor Pike — "The Speculator"

- **Age / location:** 25, Denver, CO. Roommates.
- **Job / income:** Junior financial analyst (the irony). $71k, paid bi-weekly.
- **Debt:** $14,000 cards — much of it because he **funds a brokerage/crypto account with credit** and "trades the float," plus options and a leveraged crypto position currently underwater. Calls it investing, not gambling.
- **The real problem:** **Speculation as the vice**, distinct from Dontae's sports book. It's socially sanctioned ("I'm building wealth"), which makes it *harder* to confront — the dopamine of a green candle is the same loop, dressed as ambition.

**Defining characteristics**
- Financially literate enough to rationalize, not disciplined enough to stop. The most self-deceiving profile.
- Treats credit as working capital for bets; doesn't viscerally feel the 25% APR eating his "edge."
- The vice doesn't map cleanly to a blockable MCC (brokerage/crypto transfers look like normal transfers), so **hard enforcement is awkward**.
- Responds to *cold math* — show him the APR drag vs. his actual returns and the story cracks.

**Maps to:** Persona #1 in disguise (impulse rationalized as investing) · stress-tests **enforcement on a non-obvious category** + honest-math confrontation.

**Initial thoughts**
> "I'm not gambling, I'm investing — okay, the chart comparing my 'returns' to what the credit-card interest is quietly costing me is uncomfortable. Blocking it is harder though; a transfer to my brokerage looks like any transfer. Strict Mode capping how much I can move while I'm hyped might actually be the play."

- **Hook:** **Future-self / honest-math** confrontation (APR drag vs. real returns), **Strict Mode** to throttle hot-state funding, the debt-mirror showing the position underwater against growing card debt.
- **Churn risk:** Enforcement can't cleanly catch brokerage/crypto funding (looks like transfers, which the system intentionally excludes from spend math), so the *block* he might want isn't there. He may decide the app "doesn't get" his situation and leave. Also a loophole-finder like Trevor.
- **Verdict:** **A category the product only partly addresses today.** Conversion depends on the *insight* layer (math that breaks the rationalization) more than enforcement. Flags a real gap: speculation-as-debt isn't a simple MCC block.

---

## 14. Whitney Tran — "The Recovering Shopaholic"

- **Age / location:** 36, Portland, OR. Lives alone, in active recovery.
- **Job / income:** Graphic designer (freelance + retainer). ~$68k, somewhat variable.
- **Debt:** $22,000 cards built over years of compulsive online shopping; in **therapy for it**, two years sober from alcohol, and aware her shopping is partly a **replacement behavior**.
- **The real problem:** **Clinically-aware compulsion.** Unlike Marcus (passive, late-night), Whitney *knows* exactly what's happening in the moment and still can't stop alone — she wants a hard external brake she literally cannot override when triggered.

**Defining characteristics**
- The most self-aware user; speaks the language of triggers, cravings, and relapse.
- Wants **maximum, irreversible friction** during hot states — effort-friction isn't enough, she needs *time* friction (the exact insight behind the Vault redesign and the cooling-off delay).
- Works with a therapist; an accountability partner could be a sponsor or her therapist.
- Will trust the product *more* the harder it is to weasel out of — commitment devices are her love language.

**Maps to:** Persona #1 at the clinical end · the strongest case for the **Vault cooling-off delay + Strict Mode** as genuine commitment devices grounded in the hot/cold empathy gap.

**Initial thoughts**
> "I don't need gentle. I need a wall. The fact that unlocking a vaulted card takes an hour of cooling-off instead of a retype — that's the first product that understands a craving passes if you can't act on it *right now*. Strict Mode for 31 days so I can't soften my own rules when I'm spiraling? Yes. Lock me out of myself."

- **Hook:** The **Vault** (mandatory cooling-off, pledge confrontation, sealed-day streak, reason history) + **Strict Mode** + caps on her trigger retailers. The behavioral framing toward change, not shame, fits her recovery model.
- **Churn risk:** If *any* lever turns out to be softer than promised (an instant override, a too-short delay), it breaks the therapeutic trust and she's gone — and might warn her recovery community. The opposite of most users: too *little* friction loses her.
- **Verdict:** **The product's behavioral thesis personified.** Validates the whole "time-friction over effort-friction" redesign and the commitment-device suite. Highest emotional stakes, potentially the most loyal advocate, and a possible **clinical/therapist referral channel.**

---

## 15. Greg Halvorsen — "The Co-Pilot (Partner-First)"

- **Age / location:** 41, Minneapolis, MN. Married to someone in debt.
- **Job / income:** Operations manager. $96k, financially stable, **debt-free himself.**
- **Debt:** **None.** He's not the user-in-debt — he's the **accountability partner** his wife (or brother) named when *they* signed up.
- **The real problem:** He has no problem to solve for himself. His entire relationship to the app is **receiving slip/milestone texts and deciding when to intervene** — the human half of the accountability mechanic.

**Defining characteristics**
- Cares about the person he's backing, wants to help without nagging or surveilling.
- Touches the product rarely — a text when his wife reaches for a vaulted card, a celebration when she clears a step.
- His experience is **entirely notification-driven**; he never opens the app for himself.
- Could become a *user* if the partner experience is good (he sees the value), or could feel like an unpaid narc if it's clumsy.

**Maps to:** Not a debtor at all — the **partner / network side** of the accountability + Vault-reach + step-completion texts. Stress-tests the SMS layer and the referral/network-growth loop.

**Initial thoughts**
> "I got a text that said my wife was about to unlock a card she'd sealed, with the reason she'd written when she was calm. I called her, we talked, she didn't buy it. That's… exactly the right amount of involvement. I'm not policing her, I'm just *there* at the moment that matters. Honestly made me want to set up my own rules too."

- **Hook:** The **partner SMS at the reach** (texted during the cooling-off window so he can intervene *before* the purchase), milestone-completion celebrations, the partner-removal cooldown (he stays in the loop even if she tries to ditch oversight in a weak moment).
- **Churn risk:** Bad SMS UX — too many texts (alert fatigue), too few (feels pointless), or framing that makes him feel like a snitch. If the partner experience is annoying, he tells the primary user to turn it off, killing the mechanic.
- **Verdict:** **The growth + efficacy multiplier, not a revenue seat (yet).** Validates that accountability is a *two-sided* product and a natural referral vector — a great partner experience converts the co-pilot into a primary user. Easy to under-invest in; arguably as important as the debtor's experience.

---

## Coverage summary

| # | User | Core persona | Primary lever | Biggest churn risk |
|---|------|-------------|---------------|--------------------|
| 1 | Marcus | Low impulse control | Behavioral analytics + caps | Embarrassing decline |
| 2 | Priya | Reluctant debt-holder | Payoff chart + ladder | Condescending tone |
| 3 | Dontae | Impulse (gambling) | Hard block + Strict Mode | Off-platform leakage |
| 4 | Hannah | Frictionless optimizer | Subscriptions + leaks/future-self | Friction with no felt pain |
| 5 | Earl | Reluctant (circumstantial) | Simple onboarding + partner | First-90-seconds setup friction |
| 6 | Sofia | Early-stage / prevention | Save-X + emergency fund | Gig-income gate misfires |
| 7 | Trevor | Adversarial evaluator | Strict Mode + security + honesty | Any discoverable loophole |
| 8 | Jamal | Prevention (freshman) | Gamification + simple caps | No pain = forgotten; parental-leash resentment |
| 9 | Kayla | Impulse (status/social) | Counter-identity + caps + beautiful UI | Public decline; ugly UI |
| 10 | Diego & María | Reluctant (circumstantial) | Shared MTD budget + mutual partner | No household/joint account (product gap) |
| 11 | Renée | Reluctant (blameless/medical) | Honest payoff + dignified tone | Any hint of fault-framing or hype |
| 12 | Bao | Underbanked / provider | Fee-leak visibility + credit-building | Cash income invisible to Plaid |
| 13 | Connor | Impulse (speculation) | Honest-math confrontation + Strict Mode | Vice isn't a blockable MCC |
| 14 | Whitney | Clinical compulsion | Vault cooling-off + Strict Mode | Any lever softer than promised |
| 15 | Greg | Accountability partner (non-debtor) | Partner SMS at the reach | Alert fatigue / feeling like a narc |

**Spans both documented target personas, all six behavioral archetypes, and the full debt spectrum ($0 prevention → $61k), income types (salaried / self-employed / gig / cash / dual / none), tech comfort, life stage (18 → retirement-adjacent), and emotional stance (desperate → skeptical → optimizing → blameless → clinically self-aware), plus the non-debtor partner side of the product.**

**Gaps these profiles surface (roadmap signals):**
- **Household / joint accounts** — Diego & María (and any couple) have no shared view today; auth is per-user.
- **Cash-income handling** — Bao's mostly-cash earnings are invisible to a Plaid-centric model; argues for manual entry + fee transparency.
- **Speculation-as-debt** — Connor's brokerage/crypto funding looks like transfers (intentionally excluded from spend math), so enforcement can't cleanly catch it; the *insight* layer carries the weight.
- **Two-sided accountability** — Greg shows the partner experience is a product (and a referral channel), not just an SMS feature.

Open validation need stands: the low-impulse-control personas (1, 3, 9, 13, 14) still require real user interviews to confirm — see docs/product-vision.md.
