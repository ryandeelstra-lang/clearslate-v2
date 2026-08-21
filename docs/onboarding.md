# Onboarding Flow

Goal: near-zero work for the user. Connect accounts in clicks, gather goals while data loads in the background, then deliver an emotional "here's your reality + here's the plan" moment.

## Flow & timing targets
1. **Intro** — fancy graphics; keep them from losing interest. **< 1 min**
2. **Connect accounts** — connect all accounts in a few button clicks via Plaid Link. Target **< 1 min** (hard cap ~60s). Show loading state while Plaid fetches.
   - We need: **current debt** and **spending history**. (Look into best way to pull these numbers.)
3. **Parallel questionnaire** (runs while Plaid fetches in background) — get the user invested. **< 1 min / ~3–4 questions**:
   - Total debt
   - Monthly budget estimate (e.g., $1,800)
   - Top financial goal (pay off debt / build savings / stop overspending)
   - Store answers immediately.
4. **Show insight graphs** — **< 15 sec** to view. The emotional hook (see below).
5. **Show the 5-step plan** — jump to the step they're currently on; let them scroll through steps. **15s+**
6. **Settings & discovery** — circle back: let them set their rules and explore the app. **15s+**
7. **Done — fully onboarded.**

## Insight / emotional hook
Using their real data, generate a few statistics that emphasize money they're paying unnecessarily. Interest math uses a fixed default APR of **24.99%** (`DEFAULT_APR`, shown as an estimate). Example for $3,000 debt:
> "You may incur ~$62/month in interest alone, take 4–5 years to pay off, and pay ~$700 more than necessary — that's over **18 tanks of gas**."

Display in a clean UI with nice plots:
- **Card 1**: monthly interest cost
- **Card 2**: biggest overspend category vs their stated budget
- **Card 3**: real-world framing of the excess (tanks of gas, months of Netflix, Chipotle burritos)
- **Payoff timeline chart**: two curves — *current trajectory* vs *with ClearSlate rules active* — showing months to payoff and total interest under each.

## Budget bar
After the plan, ask for their monthly budget, then show last month as the budget bar (see [features.md](features.md#budget-bar)) — e.g. red = rent 64%, blue = fast food. Then ask what they'd like us to **enforce** next month.

## Example rules surfaced during setup
- "Cap fast food at $100/month. Decline transactions after."
- "Block all gambling merchant category codes completely."
- "Round up all purchases and auto-route the spare change to the highest-interest debt."

## Notes / open questions
- Pre-onboarding data fetch to shorten the wait — tracked in [TODO.md](TODO.md).
- Unknown exactly how long Plaid fetch / categorization takes — design the questionnaire to flex to fill that time.
