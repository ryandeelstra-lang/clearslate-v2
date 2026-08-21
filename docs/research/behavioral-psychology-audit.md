# ClearSlate — Behavioral Psychology Audit

> **Scope & method.** This is an observational audit of the ClearSlate codebase (mobile app in `mobile/`, backend in `backend/`, design docs in `docs/`). No code was modified. Findings are drawn from what the product *actually does* (copy, flows, defaults, enforcement logic, notification text, projection math) plus design intent recorded in the docs.
>
> **A critical lens applied throughout:** ClearSlate is mid-build. Several of the most psychologically potent mechanisms in the founder brief (gamification/confetti, prizes, accountability circles, card vault, "name your debt," the debt mirror, leagues, "save $X a day") are **designed but not yet implemented**. I tag every finding as **[Implemented]**, **[Partial]**, or **[Designed — not built]** so the map reflects the forces operating on a user *today* versus the forces the team intends to operate later. Confidence levels reflect both psychological certainty and implementation status.

---

# Executive Summary

ClearSlate is, at its core, a **commitment device wearing the clothes of a debit card**. Its central psychological bet is that people in debt do not lack knowledge or intention — they lack *enforcement in the hot moment of purchase*. So the product moves the locus of control from the user's in-the-moment willpower (which fails) to a cold-state pre-commitment (rules set during onboarding) that the card mechanically honors at authorization time.

The product operates in two psychological acts:

1. **The onboarding "reality + plan" act** — a tightly sequenced emotional funnel that (a) reduces friction to disclose financial data, (b) inflicts a controlled dose of *loss-framed pain* ("here's what your debt is silently costing you"), then (c) immediately offers *agency and hope* (a self-set payoff date, a payoff chart where the user's line wins, and a one-tap "activate my rules" moment). This is a textbook **problem-agitate-solve** arc executed with behavioral-economics precision.

2. **The enforcement + progress act** — the card silently enforces the user's own rules (hard declines, spend caps), passively redirects spare change to debt (round-ups), and reflects progress back (budget bar, debt-remaining counter, a 5-step "path to financial freedom" ladder). This is where habit and identity change are *intended* to happen, but it is the **least-built half** of the product today.

The dominant forces are **loss aversion**, **pre-commitment / self-binding**, **choice-architecture defaults**, **mental accounting**, **goal-gradient framing**, and **future-self connection**. The dominant *risks* are **decline-induced shame**, **psychological reactance** (hard blocks inviting rebellion or use of a different card), and an **enforcement-vs-debt gap** (the card governs new debit spending, but the debt lives on other credit lines the card can't block).

---

# Behavioral Objective

**Behavior ClearSlate is trying to create:**
- Setting and keeping *binding* spending limits on discretionary/high-harm categories.
- Continuous, painless contribution to debt principal (round-ups; redirected overspend).
- Regular self-monitoring of debt progress against a self-chosen finish line.
- Climbing a structured financial-health ladder (emergency fund → snowball → safety net → invest).

**Behavior it is trying to eliminate:**
- Impulse and emotional spending (the "see a shiny object, buy it instantly" persona — `docs/product-vision.md:12`).
- "Dopamine trigger" spending: gambling, sports betting, alcohol, cannabis, luxury (`docs/behavioral-categories.md:19`).
- Silent value leakage: subscription creep, bank fees, and above all *interest* — reframed as "pure waste" / "financial leaks."

**Habits it attempts to replace:**
- Frictionless tap-to-buy → a category the card may simply decline.
- "Out of sight, out of mind" balances → a forced **debt mirror** and an always-present interest counter.
- Willpower-based restraint in the moment → a rule pre-set in a calm moment.

**Emotional states it targets:**
- *Removes:* the shame/avoidance of not looking ("ostrich effect"), the dopamine pull of impulse buys.
- *Installs:* control, relief, hope, pride of progress — and, deliberately, a sharp early jolt of **regret/loss** to motivate action.

---

# Primary Psychological Mechanisms

| # | Mechanism | Where | Principle | Status |
|---|-----------|-------|-----------|--------|
| 1 | Hard auto-decline of banned categories | `backend/src/cards/engine.ts` | Pre-commitment / Ulysses contract | Implemented (simulated card) |
| 2 | Spend caps with velocity counters | `engine.ts`, `velocity.ts` | Self-imposed friction; mental budgeting | Implemented |
| 3 | Loss-framed onboarding "facts" | `mobile/src/screens/InsightsScreen.tsx` | Loss aversion; pain of paying | Implemented |
| 4 | Real-world framing of waste ("18 tanks of gas") | `backend/src/insights/framing.ts` | Concreteness / affect heuristic | Implemented |
| 5 | Self-set payoff date | `mobile/src/screens/PayoffGoalScreen.tsx` | Goal-setting; future-self; anchoring | Implemented |
| 6 | Opt-out seeded rule defaults | `mobile/src/components/RulesEditor.tsx` | Default effect; status-quo bias | Implemented |
| 7 | Round-up to debt | `backend/src/money/roundup.ts` | Mental accounting; painless saving | Implemented |
| 8 | Two-line payoff chart (your line wins) | `mobile/src/components/PayoffChart.tsx` | Contrast effect; hope; goal gradient | Implemented |
| 9 | 5-step "path to financial freedom" ladder | `backend/src/steps/catalog.ts` | Sub-goaling; goal gradient; identity ladder | Partial (engine built, UI not) |
| 10 | Decline / approaching-limit / transfer push | `backend/src/push/expo.ts` | Operant feedback; reinforcement | Partial (service built, tokens not wired) |
| 11 | Behavioral re-categorization of spend | `docs/behavioral-categories.md` | Reframing; moral mental accounting | Partial (buckets built, labels not surfaced) |
| 12 | Name your debt / vault / circles / prizes | `docs/features.md`, `product-vision.md` | Personification; friction; social proof; reward | Designed — not built |

---

# Core Habit Loops

ClearSlate contains four distinct loops. Only the first two run end-to-end today.

### Loop A — The Onboarding Commitment Loop **[Implemented]**
- **Trigger (external):** App open → animated intro, "Wipe the slate clean… a debit card that enforces your own spending rules to kill your debt." (`IntroScreen.tsx:71-74`).
- **Action:** Connect banks → set a payoff date → activate rules. Each step is small and sequenced (`App.tsx:27` progress steps).
- **Reward:** Emotional relief + closure — "You're all set… {N} rules are live and enforcing on every purchase. This is where the debt stops growing." (`WelcomeScreen.tsx:58-62`).
- **Investment:** Linked bank tokens, a stated goal, and a personal rule-set are all persisted server-side — raising the cost of abandoning and seeding the next loops.
- **Confidence:** High.

### Loop B — The Transaction Enforcement Loop **[Implemented backend / simulated card]**
- **Trigger:** User attempts a purchase (card authorization).
- **Action:** Swipe/tap. The user does nothing else — the *card* acts.
- **Reward:** Two-sided. Allowed purchases feel *frictionless and sanctioned* ("I'm allowed to enjoy this"); blocked purchases deliver a boundary the user *pre-authorized*, with an explanatory push ("$X at a gambling merchant was declined — you've blocked this category," `expo.ts:85-87`).
- **Investment:** Each approved spend increments the budget bar and velocity counters; the user's data footprint and "this month" picture deepen.
- **Confidence:** High (mechanism), Medium (real-world reward valence depends on whether declines feel like *relief* or *embarrassment* — see Risk Analysis).

### Loop C — The Round-Up Reinforcement Loop **[Implemented backend]**
- **Trigger:** A purchase settles (`POST /cards/clearing`).
- **Action:** Automatic — spare change is swept (`roundup.ts:35`).
- **Reward:** "We moved $X of round-ups toward your debt. **Nice work.**" (`expo.ts:126`) + a growing pending balance. The verbal praise ("Nice work") is explicit positive reinforcement for spending the user didn't consciously "do."
- **Investment:** An accumulating ledger/balance the user watches grow.
- **Confidence:** High.

### Loop D — The Progress / Ladder Loop **[Partial — backend only]**
- **Trigger:** Open app, or (designed) a 50%/80% step-progress push.
- **Action:** Check the Progress tab / step ladder.
- **Reward:** Debt-remaining shrinks; step completion (designed: confetti + recognition, `docs/features.md:24`).
- **Investment:** Completed steps and manual attestations persist (`user_steps`).
- **Confidence:** Medium (the celebratory *reward* — confetti, prizes — is the unbuilt piece; without it the loop currently rewards mostly with information, which is a weaker reinforcer).

---

# Friction Systems

ClearSlate's defining design decision is **asymmetric friction**: near-zero friction to *do the right thing*, hard friction to *do the wrong thing*. The friction philosophy is explicit in `docs/product-vision.md:17-20` — mild friction (approve/type-a-code) was rejected as "just makes people *feel* in control"; graduated pre-approval was rejected as too frustrating; **hardcore cold-turkey auto-decline was chosen.**

### F1 — Hard category block (cold-turkey decline) **[Implemented]**
- **Location:** `backend/src/cards/engine.ts:41-43`; rule set in `RulesEditor.tsx` (Block segment).
- **Behavior interrupted:** The entire purchase, at the merchant, in real time.
- **Why effective:** It removes the decision from the *hot state* entirely. Hyperbolic discounting and impulse depend on the option existing in the moment; a hard decline deletes the option, so willpower is never taxed.
- **Targets impulse spending:** Yes (the binary, no-negotiation form is aimed squarely at the low-impulse-control persona).
- **Targets emotional spending:** Yes for the categories chosen (gambling, alcohol, cannabis are "dopamine triggers").
- **Expected outcome:** Zero spend in blocked categories *on this card*; possible displacement to other cards (see reactance risk).
- **Confidence:** High.

### F2 — Monthly spend cap (velocity decline after limit) **[Implemented]**
- **Location:** `engine.ts:44-65`; counters in `velocity.ts`.
- **Behavior interrupted:** Only the *marginal* purchase past a self-set monthly ceiling.
- **Why effective:** Converts an abstract budget into a hard physical constraint. Most of the month feels free; the limit only bites at the margin, minimizing reactance while still capping total harm.
- **Targets impulse:** Partially (caps the *volume* rather than the act).
- **Targets emotional spending:** Partially.
- **Expected outcome:** Category spend asymptotes toward the cap; user self-rations as they approach it.
- **Confidence:** High.

### F3 — Approaching-limit warning **[Partial]**
- **Location:** `engine.ts:54-55` (computes `nearingLimit` at ≥80% of cap) → `expo.ts:97-118`.
- **Behavior interrupted:** Pre-emptive — warns *before* the wall, not at it.
- **Why effective:** Self-monitoring nudge; converts an invisible runway into a visible one, prompting voluntary restraint and avoiding the harsher decline event.
- **Expected outcome:** User slows category spend in the back half of the month.
- **Confidence:** Medium (logic built; depends on push tokens being wired).

### F4 — Round-up (invisible friction on cash) **[Implemented]**
- **Location:** `roundup.ts`.
- **Behavior interrupted:** None consciously — it taxes the *change*, not the purchase.
- **Why effective:** Friction so small it's below the perceptual threshold; mental accounting treats sub-dollar remainders as "not real money."
- **Confidence:** High.

### F5 — Manual-debt-entry escape hatch (friction *removal*) **[Implemented]**
- **Location:** `ConnectScreen.tsx:92-121` ("Can't connect? Enter your debt manually").
- **Note:** This is *negative* friction — a deliberately placed low-effort path to keep the highest-drop-off step (bank connect, flagged at `ConnectScreen.tsx:23`) from losing users. Choice architecture in service of completion.
- **Confidence:** High.

### F6 — Card vault (lock other cards behind friction) **[Designed — not built]**
- **Location:** `docs/features.md:32`, `docs/product-vision.md:29`.
- **Intent:** Re-create Dave Ramsey's "credit cards in a block of ice" — make using a competing card require deliberate in-app unlocking.
- **Confidence:** High (as design intent); not present in code.

---

# Incentive Systems

ClearSlate's incentive structure today is **predominantly intrinsic and informational**. The extrinsic reward layer (prizes, leagues, confetti) is designed but unbuilt — a significant gap for the impulse-driven persona who is most reward-sensitive.

### I1 — The payoff projection ("your line wins") **[Implemented]**
- **Location:** `backend/src/routes/insights.ts:56-69`, `PayoffChart.tsx`.
- **Immediate reward:** A green "ClearSlate" curve that visibly beats the red "Now" curve, plus "You'd save **$X** in interest" (`PayoffChart.tsx:78-80`).
- **Delayed reward:** A concrete debt-free date.
- **Emotional reward:** Hope, agency, relief.
- **Cognitive reward:** A coherent, numerically backed narrative replacing vague dread.
- **Principles present:** **Contrast effect**, **goal gradient**, **hope/optimism nudge**. Note: the "with ClearSlate" line is *structurally guaranteed to win* because `extraMonthly` has a $50 floor (`config.ts:13`, `insights.ts:58-61`) — so the optimistic path always shows acceleration even for a light spender. The code honestly flags this as "an estimate, not a promise."
- **Expected behavior:** Activation of rules; emotional buy-in to the plan.
- **Confidence:** High.

### I2 — Round-up "Nice work" reinforcement **[Implemented]**
- **Location:** `expo.ts:126`.
- **Immediate/emotional reward:** Verbal praise + a growing balance for effortless behavior.
- **Principle:** **Operant positive reinforcement** on a *variable, purchase-triggered* schedule (you don't know exactly when/how much a round-up lands) — the most habit-forming reinforcement schedule.
- **Confidence:** High.

### I3 — Step ladder completion **[Partial]**
- **Location:** `steps/catalog.ts`, `steps/engine.ts` (`newlyCompleted` drives celebration, `engine.ts:113`).
- **Designed reward:** Full-screen confetti + "genuine recognition" + (designed) a real prize/gift card (`features.md:24-25`).
- **Principles:** **Sub-goaling**, **goal gradient**, **operant reward**, and — via prizes — **variable extrinsic reward**.
- **Confidence:** Medium (auto-advance engine and idempotent completion are built and careful — e.g., viewing the ladder never re-triggers confetti, `steps.ts:22-24`; the *celebration UI and prizes are not built*).

### I4 — Progress indicators (onboarding dots, budget bar, debt counter) **[Implemented]**
- **Location:** `StepHeader.tsx` (Step N/M dots), `BudgetBar.tsx`, `ProgressScreen.tsx` ("DEBT REMAINING" big number).
- **Cognitive/emotional reward:** Visible movement toward a finish line; the satisfaction of measurement.
- **Principles:** **Goal-gradient effect**, **endowed progress**, **Zeigarnik effect** (an incomplete ladder pulls for completion).
- **Confidence:** High.

### I5 — Prizes, leagues, modes **[Designed — not built]**
- **Location:** `features.md:25-27`, `product-vision.md:26,31`.
- **Intent:** Small tangible rewards per level-up; "Monk mode / Debt Attack mode"; leaderboards of debt paid / saved.
- **Principles:** **Variable reward**, **social comparison/competition**, **identity-as-mode**.
- **Confidence:** High (as intent); absent from code.

---

# Commitment Devices

This is the product's spine — ClearSlate is fundamentally a **self-binding** tool.

### C1 — Rule activation = a Ulysses contract **[Implemented]**
- **Location:** `RulesScreen.tsx` ("Activate my rules"), comment at `RulesScreen.tsx:4-6` ("turns a passive viewer into an owner"); enforced at `engine.ts`.
- **Mechanism:** In a calm, rational moment the user *binds their future self*. The card then honors the past self's wishes against the future self's impulses — the classic Ulysses-and-the-mast structure.
- **Why it works:** Resolves the **intertemporal conflict** between the planning self and the acting self by making the planning self's decision physically binding.
- **Expected behavior:** Durable reduction in targeted spend regardless of momentary willpower.
- **Confidence:** High.

### C2 — Self-set payoff finish line **[Implemented]**
- **Location:** `PayoffGoalScreen.tsx` ("How fast do you want to be debt-free?" → drag to a date).
- **Mechanism:** A **public-to-self goal** with a concrete date ("Debt-free by [Month Year]"). Self-set (not imposed) goals trigger ownership and consistency pressure.
- **Principles:** **Goal-setting theory**, **commitment & consistency**, **implementation intention**.
- **Confidence:** High.

### C3 — Round-up auto-enrollment **[Implemented]**
- **Location:** `RulesEditor.tsx:157-160` ("Round-up stays on by default… a Debt Destroyer").
- **Mechanism:** A standing commitment to contribute, defaulted on, that the user must actively *leave*.
- **Confidence:** High.

### C4 — Accountability partner / circles **[Designed — not built]**
- **Location:** `product-vision.md:30,40`, `features.md:33-35` ("Accountability partner — core to the model").
- **Mechanism:** **Social commitment device** — adding observers raises the reputational cost of relapse.
- **Confidence:** High (as stated-core intent); not in code.

---

# Behavioral Economics Findings

### BE1 — Loss aversion (the onboarding "gut punch") **[Implemented]**
- **Where:** `InsightsScreen.tsx` facts 0–2, eyebrows "THE INTEREST," "WHERE IT GOES," "**THE WASTE**." Copy: "$X /mo is what your debt costs you in interest alone"; "$X in extra interest you don't need to pay — that's [18 tanks of gas], **gone for nothing**" (`InsightsScreen.tsx:163-204`).
- **How it influences:** Frames the status quo as an active, ongoing *loss* ("bleeding," "waste," "gone for nothing") rather than a neutral balance. Losses loom ~2× larger than equivalent gains, so loss-framing maximizes motivational charge.
- **Why it works:** Kahneman/Tversky prospect theory — people work harder to stop a loss than to capture a gain.
- **Confidence:** High.

### BE2 — Present bias / hyperbolic discounting (the core problem the card solves) **[Implemented]**
- **Where:** The entire enforcement model (`engine.ts`); design rationale in `product-vision.md:17-20`.
- **How:** Impulse spending is present bias incarnate — the immediate reward is over-weighted vs. the discounted future cost. Hard declines and caps neutralize it by removing the in-the-moment option.
- **Confidence:** High.

### BE3 — Mental accounting **[Implemented + reframed]**
- **Where:** Round-ups (`roundup.ts`) treat sub-dollar change as a separate, painless "bucket"; **behavioral categories** (`behavioral-categories.md`) re-label the *same dollar* as "Needs" vs "Impulse" by intent ("$40 at Target is Needs if it's detergent and Impulse if it's an 11pm doom-scroll cart").
- **How:** Money is deliberately *not* fungible here — it is tagged by moral/behavioral meaning so the user reasons about "Impulse" and "Dopamine Triggers" rather than neutral totals.
- **Confidence:** High (round-ups), Medium (behavioral labels are built as buckets but not yet surfaced to the user).

### BE4 — Anchoring **[Implemented]**
- **Where:** Default 36-month payoff (`PayoffGoalScreen.tsx:12`); seeded default rules (gambling=block, fast-food=cap at a rounded value, `RulesEditor.tsx:110-114`); per-category fallback caps (`RulesEditor.tsx:39-47`).
- **How:** The presented default becomes the reference point most users adjust *from* rather than *replace*.
- **Confidence:** High.

### BE5 — Status-quo bias / default effect (used *for* the user) **[Implemented]**
- **Where:** Opt-out rule seeding and always-on round-up (`RulesEditor.tsx:109-114, 157-160`).
- **How:** Defaults are sticky. By defaulting to *restriction*, ClearSlate makes the healthy choice the path of least resistance — the same lever that defaults users *into* harm elsewhere, inverted.
- **Confidence:** High.

### BE6 — Choice architecture / decision-fatigue reduction **[Implemented]**
- **Where:** Onboarding asks essentially *one* question (the payoff date) and estimates the rest from Plaid (`PayoffGoalScreen.tsx:22-23`, `App.tsx:26`); a three-way Allow/Cap/Block segmented control compresses a complex policy into one tap per category (`RulesEditor.tsx:253-266`).
- **How:** Minimizing decisions preserves the limited willpower budget for the decisions that matter.
- **Confidence:** High.

### BE7 — Concreteness / affect heuristic (real-world framing) **[Implemented]**
- **Where:** `framing.ts` + `config.ts` — abstract interest dollars become "tanks of gas / months of Netflix / Chipotle burritos / lattes," deliberately tuned to a "satisfying, graspable count" of 3–40 units.
- **How:** Concrete, affect-laden referents are processed more vividly than abstract dollars, amplifying felt loss.
- **Confidence:** High.

### BE8 — Cognitive dissonance (the debt mirror) **[Designed — not built]**
- **Where:** `product-vision.md:28` — "ClearSlate balance dropped $200 this month. Your Discover balance grew $340. A mirror they can't ignore."
- **How:** Deliberately surfaces a contradiction between self-image ("I'm getting out of debt") and behavior, creating dissonance the user resolves by changing behavior.
- **Confidence:** High (as intent); not in code.

### BE9 — Endowment / IKEA effect over the plan **[Implemented, emergent]**
- **Where:** The user *builds* their rule-set and *drags* their own payoff date.
- **How:** Self-constructed plans are valued more highly and defended more — increasing adherence.
- **Confidence:** Medium.

---

# Emotional Design Findings

| Emotion | Where | Why / Trigger | Expected response | Confidence |
|--------|-------|---------------|-------------------|-----------|
| **Loss / regret** | `InsightsScreen.tsx` facts ("THE WASTE," "gone for nothing"); red "Now" line | Agitate the problem before offering the fix | Motivated action; rule activation | High |
| **Hope / agency** | `PayoffChart.tsx` green line, "Debt-free in N months," "your card helps you hit it" | Immediately follow pain with a winnable path | Buy-in, optimism, continuation | High |
| **Relief / closure** | `WelcomeScreen.tsx` "You're all set… this is where the debt stops growing" | Reward completing the commitment | Sense of resolution; reduced anxiety | High |
| **Control / empowerment** | Allow/Cap/Block matrix; "puts them in control — not the fake 'feel in control'" (`product-vision.md:9`) | Ownership of one's own constraints | Engagement, identity adoption | High |
| **Pride / recognition** | Step completion (designed confetti); "Nice work" round-up push | Celebrate milestones | Repeat, share, persist | Medium (confetti unbuilt) |
| **Security / trust** | `ConnectScreen.tsx` trust rows ("Read-only… never see your password… bank-level encryption") | Lower the fear that blocks bank-linking | Complete the connect step | High |
| **Urgency** | Concrete future date + monthly interest counter ("Interest / mo" in danger red, `CardHomeScreen.tsx:32`) | Make the cost of delay salient | Sustained attention to payoff | Medium |
| **Aggression toward debt (externalized enemy)** | "kill your debt," "attacking your debt," "Debt Attack mode"; designed "name your debt" | Turn debt into a named adversary | Channel frustration into payoff | Medium (naming unbuilt) |
| **Shame (risk / partly unintended)** | Decline push; "THE WASTE" framing | Side-effect of strong loss framing & public declines | *Either* corrective *or* avoidance/churn | Medium — see Risk |

Color is doing systematic emotional work: **red = danger/loss** (interest, over-budget, "Now" line, Block), **green = safety/gain** (on-track, "ClearSlate" line, Allow, round-up ON), **blue = brand/neutral-action** (Cap, CTAs) — `theme.ts:5-21`, `PayoffChart.tsx:6-7`, `RulesEditor.tsx:335-339`.

---

# Addiction Prevention Findings

ClearSlate is, in effect, a **harm-reduction tool for spending behavior**, borrowing directly from the anti-porn/anti-phone app playbook (cited explicitly, `product-vision.md:13`).

- **Increases purchase friction:** Yes — up to absolute (hard block) for "Dopamine Triggers" (gambling, alcohol, cannabis), the highest-harm bucket (`behavioral-categories.md:19`, `RulesEditor.tsx:29-31`). **Confidence: High.**
- **Creates cooling-off periods:** **Weak/absent.** The team explicitly *rejected* graduated pre-approval ("press 'fast food' 10 min before so the impulse passes") as too frustrating (`product-vision.md:19`). The chosen model is binary (allow/block/cap), not time-delayed. There is no "wait 10 minutes" cooling-off in the build. **Confidence: High (that it's absent).**
- **Forces conscious decisions:** Yes, but *up front* (at rule-setting), not at point-of-sale. The conscious decision is moved earlier, not inserted into the impulse moment.
- **Makes spending visible:** Yes — budget bar, "spent this month," interest counter, designed debt mirror. The measurement-makes-you-change ("Hawthorne") effect. **Confidence: High.**
- **Reduces dopamine-driven purchases:** Yes by design for blocked categories; the explicit "Dopamine Triggers" category name shows intentional targeting of reward-seeking spend. **Confidence: High.**

**Notable addiction-research nuance / risk:** binary cold-turkey blocking can trigger **reactance and the abstinence-violation effect** — a single circumvented block can read as total failure and trigger a binge on another card. The product's *intended* counter (vault + accountability on off-platform purchases) is unbuilt, leaving this gap currently open.

---

# Motivation Architecture

ClearSlate blends all three motivation types, but the **balance shifts over the build timeline**:

- **Intrinsic (dominant today):** control, competence, relief, the satisfaction of watching debt fall. Most of what's *built* rewards intrinsically.
- **Identity-based (strong, designed):** "the path to financial freedom," "stop the bleeding," future-self framing via a concrete debt-free date, and the planned "name your debt" (turning quitting into "losing to a named enemy," `product-vision.md:27`). The 5-step ladder is lifted from the Dave Ramsey "Baby Steps" identity arc — *becoming* a financially responsible person, not just doing tasks.
- **Extrinsic (designed, mostly unbuilt):** prizes/gift cards, leagues, modes. Currently thin.

**Future-self connection** is the throughline: the payoff-date picker, the "Debt-free by [Month Year]" labels (`PayoffGoalScreen.tsx:27-29`, `ProgressScreen.tsx:38-39`), and the framing of money saved as a future freed self. This directly targets the **present-self/future-self discontinuity** that drives under-saving.

**Risk to motivation balance:** for the headline persona (low impulse control, high reward sensitivity, `product-vision.md:12`), intrinsic + identity motivation is often *insufficient* — this is precisely the population that responds to immediate, variable, extrinsic reward. The reward layer that would serve them best (prizes, confetti, leagues) is the least-built part of the product.

---

# User Identity Transformation

**Onboarding — beliefs and contracts established:**
- *Belief installed:* "My debt is actively, quantifiably costing me right now, and it is stoppable." (Insights facts.)
- *Belief installed:* "Real control means enforcement, not vibes." (`product-vision.md:9`.)
- *Contract secured:* a self-authored rule-set + a dated payoff goal — a behavioral contract with one's future self, confirmed by "You're all set… this is where the debt stops growing."

**Daily use — reinforced habits:** checking progress; experiencing the card as a benevolent boundary; watching round-ups accrue; staying "on track" (green) vs "over" (red).

**Long-term — intended identity shift:** from *"someone debt happens to"* → *"someone who runs a system that gets them out of debt."* The 5-step ladder encodes a **progression of selves**: bleeding-stopper → saver → debt-slayer → secure → investor. Each completed step is an identity upgrade, not just a task checkbox — the James Clear "every action is a vote for the person you want to become" model, structurally embedded in `steps/catalog.ts`.

**Self-signaling:** choosing to *block* gambling or cap alcohol is an act of self-definition ("I'm the kind of person who doesn't do this") that the user performs to themselves — a quiet but durable identity lever present the moment a rule is set.

---

# Hidden Psychological Mechanisms

Mechanisms operating whether or not they were explicitly designed:

- **HM1 — Optimism/progress bias baked into the projection.** The "with ClearSlate" line *cannot lose* (the $50 `EXTRA_MONTHLY_FLOOR` guarantees acceleration, `config.ts:13`). Users may read a structurally optimistic estimate as a forecast. Honestly disclaimed in code as "an estimate, not a promise," but the visual asymmetry still nudges. **Confidence: High.**
- **HM2 — Escalation of commitment / sunk cost.** Effort invested in connecting banks, dragging a goal, and hand-building rules raises the psychological cost of quitting the app — a self-reinforcing retention force. **Confidence: Medium.**
- **HM3 — Disclosure escalation (foot-in-the-door).** "Link **all** your accounts… The more you connect, the more we can catch" (`ConnectScreen.tsx:131-134`) — one easy link makes the next feel natural, escalating data sharing. **Confidence: Medium.**
- **HM4 — Fresh-start effect.** "ClearSlate / **Wipe the slate clean**" brands the whole experience as a temporal landmark / clean break, which boosts goal initiation. **Confidence: Medium.**
- **HM5 — Authority/social proof (mild).** "works with 12,000+ banks… powered by Plaid" borrows institutional trust (`ConnectScreen.tsx:154`, trust rows). Stronger social proof (circles, leagues) is designed but unbuilt. **Confidence: Medium.**
- **HM6 — Peak-end / sequencing of affect.** Onboarding deliberately ends each fact on a single number to "let each reality land before the next" (`InsightsScreen.tsx:37`) and closes the arc on relief ("You're all set"). The emotional *peak* (loss) and *end* (relief) are engineered. **Confidence: Medium.**
- **HM7 — Measurement reactivity (Hawthorne).** Simply making "Spent this month" and "Interest / mo" continuously visible changes behavior independent of any rule. **Confidence: Medium.**
- **HM8 — Variable-ratio reinforcement in round-ups.** Round-up amounts and timing are unpredictable (depend on purchase remainders), which is the most habit-forming reinforcement schedule — likely unintentional but real. **Confidence: Medium.**
- **HM9 — Default-as-endorsement.** Seeding "gambling = block, fast food = cap" silently communicates "these are the things people like you restrict," normalizing restriction via implied social norm. **Confidence: Medium.**

---

# Psychological Strengths

1. **Correct theory of the problem.** It treats debt as a *self-control/architecture* failure, not an information failure — and builds enforcement, not another dashboard. This is the single most important thing it gets right.
2. **Asymmetric friction done well.** Frictionless for good behavior, hard friction for harmful behavior — the opposite of most fintech, which makes spending effortless.
3. **Pre-commitment moved to the calm state.** Decisions are made when the rational self is in charge and honored when it isn't.
4. **Defaults aligned with the user's stated interest** (opt-out restriction + always-on round-up) — paternalistic, but *libertarian* paternalism: fully editable.
5. **Emotionally sequenced onboarding** that pairs loss with immediate agency, avoiding pure fear-mongering.
6. **Concrete future-self anchoring** (a real date), which is a well-evidenced lever against present bias.
7. **Honest internal guardrails** — the code repeatedly flags its own optimistic estimates as estimates (`config.ts:12-13`, `PayoffChart.tsx:25`), and the decline push explains *the user's own rule* rather than scolding.

---

# Psychological Weaknesses

1. **The enforcement-vs-debt gap.** The product is a **debit card**, but the debt sits on **credit cards/loans**. The card can block *new debit spending* but cannot block charges on the very credit lines causing the debt. Enforcement and the harm are on different rails — the strongest mechanism (hard block) doesn't touch the actual debt instrument. The "debt mirror" addresses *awareness* of this, but it's unbuilt. **Confidence: High.**
2. **Reward layer is the unbuilt half.** The persona most in need (impulsive, reward-driven) is served *least* by what currently ships, because confetti/prizes/leagues/modes are all designed-not-built. Today's reinforcement is mostly informational. **Confidence: High.**
3. **No cooling-off / graduated friction.** Binary block/allow forgoes the well-evidenced "add a 10-minute delay" lever (consciously rejected). Some users churn on a hard block who would have tolerated a delay. **Confidence: Medium.**
4. **Loss-heavy onboarding can backfire.** "THE WASTE… gone for nothing" is potent but risks shame/avoidance (the **ostrich effect**) for anxious users, who may disengage rather than act. No detectable tone-modulation for emotionally fragile users. **Confidence: Medium.**
5. **Projection optimism.** A line that always wins can erode trust if reality underperforms it, despite the disclaimer. **Confidence: Medium.**
6. **Aspirational "redirected savings" math.** Projections assume capped/under-budget money is *actually* redirected to debt, but nothing except round-ups enforces that redirection — capped money can simply be spent elsewhere. The motivational chart may overstate real-world impact. **Confidence: Medium.**

---

# Risk Analysis

### R1 — Decline-induced public embarrassment → churn **(the product's own #1 risk)**
- **Where:** `engine.ts` declines; risk named in `product-vision.md:20` ("a declined card is embarrassing… no one uses a product that embarrasses them in front of friends").
- **Psychology:** Social pain is processed like physical pain; a single embarrassing decline at a register can permanently sour the relationship and override months of benefit.
- **Status:** The mitigation ("make declines never happen in embarrassing moments") is stated as a *constraint* but **no mechanism implementing it exists in code** — declines fire uniformly regardless of social context. This is the highest-priority open behavioral risk.
- **Confidence:** High.

### R2 — Psychological reactance & displacement
- **Where:** Hard blocks (`engine.ts`).
- **Psychology:** Removing a freedom can intensify desire for it and provoke rebellion — most easily expressed by reaching for a different card. The intended counters (vault, off-platform accountability) are unbuilt; the off-platform-purchase response is explicitly still "TBD" (`product-vision.md:45`).
- **Confidence:** Medium–High.

### R3 — Abstinence-violation / all-or-nothing relapse
- **Psychology:** Binary blocking frames one slip as total failure, which can trigger a binge. A more forgiving, graduated structure would reduce this; the current model is binary.
- **Confidence:** Medium.

### R4 — Shame spiral from loss-framing + declines
- **Psychology:** Compounding "you're wasting money" messaging with "transaction declined" pushes can move a user from *guilt* (adaptive) to *shame* (maladaptive, avoidance-inducing).
- **Confidence:** Medium.

### R5 — Over-trust in optimistic projections
- **Psychology:** If the green line is read as a promise and reality lags, the violated expectation can produce disproportionate disengagement.
- **Confidence:** Medium.

### R6 — Ethical note: potent persuasion aimed at a vulnerable population
- The same machinery that gets people *out* of debt (loss framing, defaults, commitment, variable reward) is the machinery the consumer-credit industry uses to get them *in*. ClearSlate points it the prosocial direction, but the asymmetry of power over a financially stressed, impulse-prone user warrants ongoing care — especially around shame, hard declines in public, and honest projection framing.
- **Confidence:** High (as a consideration).

---

# Complete Behavioral Map

```
                       ┌──────────────────────────────────────────────────────┐
                       │  IDENTITY GOAL: "I run a system that kills my debt"   │
                       └──────────────────────────────────────────────────────┘
                                              ▲
        ┌─────────────────────────────────────┼─────────────────────────────────────┐
        │                                      │                                     │
   ACT 1: REALITY + COMMITMENT          ACT 2: ENFORCE + REINFORCE          PROGRESS / IDENTITY
   (onboarding — BUILT)                 (daily — BACKEND BUILT)             (BUILT engine / UNBUILT UI)
        │                                      │                                     │
  Intro: "Wipe the slate clean"        Hard block (Ulysses contract) ──┐      5-step ladder
   └ fresh-start, aggression           Spend cap (velocity)            │       └ goal gradient,
  Connect: trust copy, "link all"      Approaching-limit warning       │         sub-goaling,
   └ disclosure escalation,            Round-up → debt (mental acct,   │         identity ladder
     friction removal                   variable reward, "Nice work")  │      Debt-remaining counter
  Payoff date slider                   Decline push (operant feedback) │       └ measurement effect
   └ future-self, anchoring(36),       Budget bar / interest counter   │      Step confetti + PRIZES
     self-set goal commitment           └ Hawthorne, loss-framed        │       └ [DESIGNED-NOT-BUILT]
  Insight "facts" (LOSS)               Behavioral re-labeling           │      Leagues / modes
   └ loss aversion, concreteness        (Impulse/Dopamine Triggers)     │       └ [DESIGNED-NOT-BUILT]
     ("18 tanks of gas"),               └ moral mental accounting       │      Name-your-debt / mirror
     peak-end sequencing                  [buckets built, labels not]   │      Vault / accountability
  Payoff chart (HOPE, your line wins)                                   │       └ [DESIGNED-NOT-BUILT]
   └ contrast effect, optimism floor                                    │
  Rules activation ("ACTIVATE")  ◄──────── opt-out DEFAULTS ────────────┘
   └ commitment device, choice arch       (status-quo bias for good)
  Welcome: "You're all set" (RELIEF)
        │
        └────────────► INVESTMENT (tokens, goal, rules, ledger) ──────► raises switching cost,
                                                                         seeds every later loop
   ───────────────────────────────────────────────────────────────────────────────────────────
   PRIMARY FORCES:  loss aversion · present-bias correction · pre-commitment · defaults ·
                    mental accounting · goal gradient · future-self · concreteness/affect
   OPEN RISKS:      public-decline shame (R1, unmitigated) · reactance/displacement (R2) ·
                    all-or-nothing relapse (R3) · shame spiral (R4) · projection over-trust (R5)
```

### Master finding index

| ID | Mechanism | Location | Principle | Expected behavior | Status | Confidence |
|----|-----------|----------|-----------|-------------------|--------|-----------|
| F1 | Hard category block | `cards/engine.ts:41` | Pre-commitment | Zero spend in blocked cats | Built (sim card) | High |
| F2 | Spend cap / velocity | `cards/engine.ts:44`,`velocity.ts` | Self-binding budget | Spend asymptotes to cap | Built | High |
| F3 | Approaching-limit warning | `engine.ts:54`,`push/expo.ts:97` | Self-monitoring nudge | Slows late-month spend | Partial | Medium |
| F4 | Round-up friction-on-change | `money/roundup.ts` | Mental accounting | Painless debt contribution | Built | High |
| F5 | Manual-entry escape hatch | `ConnectScreen.tsx:118` | Friction removal | Higher onboarding completion | Built | High |
| F6 | Card vault | `features.md:32` | Friction lock | Avoid competing cards | Designed | High(intent) |
| I1 | Payoff projection (line wins) | `routes/insights.ts:56`,`PayoffChart.tsx` | Contrast/hope | Activate rules, buy-in | Built | High |
| I2 | "Nice work" round-up push | `push/expo.ts:126` | Positive reinforcement | Keep round-up on | Built | High |
| I3 | Step completion celebration | `steps/engine.ts:113` | Reward/goal gradient | Climb ladder | Partial | Medium |
| I4 | Progress indicators | `StepHeader.tsx`,`ProgressScreen.tsx` | Goal gradient/Zeigarnik | Continue & return | Built | High |
| I5 | Prizes/leagues/modes | `features.md:25` | Variable/extrinsic reward | Habitual engagement | Designed | High(intent) |
| C1 | Rule activation (Ulysses) | `RulesScreen.tsx`,`engine.ts` | Self-binding | Durable spend reduction | Built | High |
| C2 | Self-set payoff date | `PayoffGoalScreen.tsx` | Goal-setting/consistency | Adherence to plan | Built | High |
| C3 | Round-up auto-enroll | `RulesEditor.tsx:157` | Default commitment | Standing contribution | Built | High |
| C4 | Accountability partner/circles | `product-vision.md:40` | Social commitment | Relapse deterrence | Designed | High(intent) |
| BE1 | Loss-framed facts | `InsightsScreen.tsx:163` | Loss aversion | Motivated action | Built | High |
| BE2 | Present-bias correction | `engine.ts` | Hyperbolic discounting | Impulse suppressed | Built | High |
| BE3 | Mental accounting/relabeling | `roundup.ts`,`behavioral-categories.md` | Non-fungible money | Reasons by intent | Partial | High/Med |
| BE4 | Anchoring (defaults) | `PayoffGoalScreen.tsx:12`,`RulesEditor.tsx:39` | Anchoring | Adjust from defaults | Built | High |
| BE5 | Status-quo bias for good | `RulesEditor.tsx:109` | Default effect | Keep healthy defaults | Built | High |
| BE6 | Decision-fatigue reduction | `App.tsx:26`,`RulesEditor.tsx:253` | Choice architecture | Complete onboarding | Built | High |
| BE7 | Real-world framing | `insights/framing.ts` | Concreteness/affect | Felt loss ↑ | Built | High |
| BE8 | Debt mirror (dissonance) | `product-vision.md:28` | Cognitive dissonance | Resolve via behavior | Designed | High(intent) |
| BE9 | IKEA/endowment over plan | self-built rules+goal | Endowment effect | Defend the plan | Built(emergent) | Medium |
| HM1 | Optimism/progress bias | `config.ts:13` | Progress bias | Over-trust projection | Built | High |
| HM2 | Sunk-cost retention | onboarding investment | Escalation of commitment | Resist churn | Built(emergent) | Medium |
| HM3 | Disclosure escalation | `ConnectScreen.tsx:131` | Foot-in-the-door | Link more accounts | Built | Medium |
| HM4 | Fresh-start branding | `IntroScreen.tsx:71` | Fresh-start effect | Goal initiation | Built | Medium |
| HM5 | Authority/social proof | `ConnectScreen.tsx:154` | Trust transfer | Complete connect | Built | Medium |
| HM6 | Peak-end sequencing | `InsightsScreen.tsx:37` | Peak-end rule | Positive memory of flow | Built | Medium |
| HM7 | Measurement reactivity | `CardHomeScreen.tsx:32` | Hawthorne effect | Spend awareness ↑ | Built | Medium |
| HM8 | Variable round-up schedule | `roundup.ts` | Variable-ratio reward | Habit strength ↑ | Built(emergent) | Medium |
| HM9 | Default-as-norm | `RulesEditor.tsx:110` | Social norm signal | Normalize restriction | Built | Medium |

---

*End of audit. No code was modified; this document is observational only.*
