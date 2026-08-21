# Behavioral Categories

> "I'd actually go one level deeper than normal banks and create behavioral categories."

Banks categorize by **merchant type** (groceries, gas, restaurants). ClearSlate categorizes
by **behavior** — *why* the money left and whether it helps or hurts the debt goal. The same
$40 at Target is "Needs" if it's detergent and "Impulse" if it's a 11pm doom-scroll cart. The
behavioral lens is what lets the card "stop the bleeding" without nagging people about rent.

## The taxonomy

| Behavioral category | What's in it | Helps or hurts | Card treatment |
|---|---|---|---|
| **Debt Destroyers** | Extra debt payments, round-ups | ✅ Helps | Encourage / auto-route (not on the "stop the bleeding" page) |
| **Wealth Builders** | Investments, savings | ✅ Helps | Encourage |
| **Needs** | Groceries, gas, utilities, rent | ⚪ Neutral | Never block — track only |
| **Wants** | Restaurants, entertainment | 🟡 Discretionary | Cap |
| **Impulse** | Amazon, DoorDash, Target runs | 🟠 Risky | Cap (tight) / friction |
| **Dopamine Triggers** | Gambling, sports betting, alcohol, cannabis, luxury | 🔴 High-harm | Block or hard cap |
| **Subscription Creep** | Netflix, Spotify, recurring charges | 🟠 Silent leak | Surface + help cancel |
| **Financial Leaks** | Bank fees, overdrafts, interest | 🔴 Pure waste | Surface + alert |

## How this maps to what's built

The enforcement engine works on **internal buckets** (`backend/src/insights/categorize.ts`).
Behavioral categories are a grouping *over* those buckets:

- **Dopamine Triggers** → `gambling`, `alcohol`, `tobacco`, `cannabis` (+ luxury `shopping` later).
- **Wants** → `fast_food`, `coffee`, `entertainment`, `personal_care`.
- **Impulse** → `shopping` (+ merchant heuristics: Amazon/DoorDash/Target).
- **Needs** → `groceries`, `gas`, `rent` — *intentionally NOT on the rules page* ("stopping the
  bleeding" shouldn't fight rent or gas).
- **Subscription Creep** → `subscriptions` (detected via Plaid Recurring Transactions).
- **Debt Destroyers** → round-ups (the "attack debt" action — lives on its own surface, not the
  stop-the-bleeding rules page).
- **Financial Leaks** → bank fees / interest (from Plaid transactions + the debt profile).

## Data sources per category
- **Bank MCC** (Marqeta auth + Plaid) — gambling, alcohol, fast food, etc. → `backend/src/cards/mcc.ts`.
- **Plaid PFC** (transaction categorization) — groceries, restaurants, beer/wine/liquor → `categorize.ts`.
- **Plaid Recurring Transactions** — Subscription Creep (the Subscriptions tab).
- **Merchant-name heuristics** — Impulse (Amazon/DoorDash/Target), luxury — *future*.

## Known limitations / open
- **Cannabis has no reliable MCC.** Cannabis is federally illegal in the US, so card networks
  often block it and dispensaries route through workaround/cash MCCs (5912 pharmacies, 5999, etc.).
  So a "block cannabis" rule is **aspirational** until a better signal exists (merchant name,
  Plaid enrich). We still expose the category so the intent is captured.
- **Coffee folds into fast food at the card.** Coffee shops almost all ring as MCC 5814 (fast
  food) with no coffee-specific code, so the `coffee` bucket is **Plaid-PFC driven** (accurate for
  insights + a confessable cap); at JIT auth time a coffee buy is enforced under the `fast_food`
  rule. `tobacco` is the inverse — MCC-detectable at the card (5993) but not isolated by Plaid PFC.
- **Auto-cancel subscriptions** is not a Plaid (or any provider) capability — see the Subscriptions
  feature: detect + surface + guide-to-cancel, not one-tap cancel.
- **Impulse** needs merchant-name/time-of-day heuristics, not just MCC — not built yet.

## Why it matters
This is the differentiator. A normal budgeting app says "you spent $600 on shopping." ClearSlate
says "$420 of that was **Impulse** and **Dopamine Triggers** — the stuff keeping you in debt —
and your card can just say no." The behavioral layer is what turns categorization into enforcement
people actually want.
