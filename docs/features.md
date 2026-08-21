# Feature Catalog

Concrete features (the "what"). The "why" lives in [product-vision.md](product-vision.md); **build status & sequencing** live in [roadmap.md](roadmap.md) and [TODO.md](TODO.md) — this catalog doesn't repeat them.

## Spending rules engine
User-defined rules the card enforces at authorization time. Rule types:
- **Cap** — monthly dollar limit per category; decline after limit reached. Notify as the limit approaches.
- **Block** — permanently block merchant category codes (MCC) outright (gambling, adult content, etc.).
- **Round-up** — round each purchase up to the next dollar; route spare change to a destination account (highest-interest debt). Accumulates and transfers (see round-up note in roadmap re: ACH timing).
- **Save X** — commit to saving an object/amount X per day (gated behind reaching Step 1).

Enforcement path must be fast (JIT funding webhook, p99 < 150ms). See [tech-stack.md](tech-stack.md).

## Budget bar
iOS-storage-style horizontal bar: monthly budget split into colored segments by category, proportional to spend, updating in real time from Plaid webhooks.

## Insights — Behavioral Analytics ("Your Spending Brain")
Analytics beyond a normal bank: we have the card + every transaction (plus precise `auth_events` timestamps), so we model the *behavior* behind the spend, not just the categories. Lives in the Insights tab. Backend modules in `backend/src/insights/behavioral/` (pure core + thin db adapter, mirroring `apr.ts`); routes under `GET /insights/behavioral/*`; self-fetching mobile cards in `mobile/src/components/behavioral/`. Five modules, each tied to a documented psychological mechanism (copy names the bias plainly, frames toward change, never shames):
- **Spending Fingerprint** (`/fingerprint`) — day×time-of-day heatmap, "late-night index", and a post-payday spending-spike "cliff". *Ego depletion / willpower decay; fresh-start & present bias.* (Time-of-day layer is driven by card `auth_events`; Plaid txns are date-only.)
- **Impulse Cascades** (`/cascades`) — the "gateway" purchase that opens a spending spree; binge-session detection; the same-day "what-the-hell" cascade. *Licensing effect; what-the-hell effect; abstinence violation.*
- **Spending Archetype** (`/archetype`) — names the user's pattern (Midnight Spender, Weekend Blowout, Subscription Hoarder, Retail Therapist, Grazer, Steady Hand) + a counter-identity move. *Identity-based habit change; self-perception; labeling.*
- **Future Self** (`/future-self`) — the monthly leak compounded at ~7% over 10/20/30y; "this $6 coffee is really $X of future-you". *Hyperbolic/temporal discounting; future-self continuity.*
- **Leak Detector** (`/leaks`) — small-ticket high-frequency charges annualized into a shocking number, each with a "cap this category" target. *Latte factor; mental accounting; denominator neglect.*

## Notifications
- **Decline push**: explains which rule fired — e.g., "Fast food cap reached ($100/mo). Transaction of $12.40 at McDonald's was declined."
- **Step progress push**: at 50% and 80% of a step's criteria — "You're $40 away from Step 3." Time for evenings (higher open rates).
- **Transfer push**: on round-up/ACH transfer.

## Gamification & progress
- **5-step ladder** (see product vision): vertical ladder UI — completed = green check, current = highlighted, future = grayed.
- **Level-up celebration**: recognition moment on step completion (in-app `CelebrationModal`, no confetti dependency). Must feel like a genuine moment, not a transaction.
- **Prizes (Business Idea #1)**: small reward per level-up; explore gift-card partnerships.
- **Modes**: Monk mode, Debt Attack mode, etc.
- **Leagues**: leaderboards of how much you put toward debt and/or how much you saved.

## Behavioral / accountability features
- **Name your debt** — personify it.
- **Plaid debt mirror** — show contradictions across accounts.
- **Card vault** — photograph and "lock" other cards; unlocking requires deliberate in-app friction.
- **Accountability circles** — friend circles to stay accountable.
- **Challenges** — group/individual challenges.
- **Accountability partner** — core to the model.

## Anti–other-card (TBD)
Detect off-platform purchases via Plaid → either vault friction or trigger accountability options (options TBD). Rationale + the two ideas: [product-vision.md](product-vision.md).
