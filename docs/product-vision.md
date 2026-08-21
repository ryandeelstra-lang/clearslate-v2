# Product Vision

## The pitch
A **debit card where you set your own spending rules during onboarding — and the card enforces them.** Block gambling, cap fast food, auto-route cashback/round-ups to debt principal. We enforce.

**Mission: get people out of debt.**

## The core problem
Users get into shitty debt and are then kept in it. ClearSlate gives them a tool that actually puts them in control — not the fake "feel in control" of screen-time limits, but real enforcement.

## Target personas
1. **Low impulse control / frictionless online spenders** — see a shiny object, buy it instantly. (The "19 credit cards of debt" person.) *Needs user interviews to validate.*
   - Solution: limit spending through **friction**, like anti-phone/anti-porn apps do.
2. **Reluctant debt-holders** — didn't do much wrong (student loans, etc.) but struggle to *see progress* paying it down.
   - Solution: make them **feel in control and feel progress**.

## Friction philosophy
- Mild friction (approve/type a code) just makes people *feel* in control — not enough.
- **Pre-approval option**: require pre-approving a purchase (e.g., press "fast food" 10 min before) so impulse passes. → Likely too frustrating; users churn.
- **Hardcore option (chosen direction)**: cold-turkey auto-decline of banned categories. Risk: a declined card is embarrassing. Key design constraint: **make declines never happen in embarrassing moments** — no one uses a product that embarrasses them in front of friends.

## Core feature ideas
- **Category controls**: during setup, pick categories (Fast Food, Entertainment, Gambling, etc.) and either **fully ban** or **set a monthly limit** (e.g., $40/mo). Card notifies as they approach the limit and blocks going over.
- **Round-up to debt**: round purchases up to the next dollar, put the spare change toward debt.
- **"X a day" toward debt**: a scroll bar of relatable objects (pen → latte) to visualize a daily contribution.
- **Modes**: Monk mode, Debt Attack mode, etc.
- **Name your debt**: let users name it ("my Vegas mistake," "my Amazon phase") — personifying it makes quitting feel like losing to a named enemy.
- **Plaid-powered debt mirror**: connect all accounts; show contradictions — "ClearSlate balance dropped $200 this month. Your Discover balance grew $340." A mirror they can't ignore.
- **Card vault**: have users photograph other cards and "lock" them in-app; using one requires going in and unlocking it. Pure friction (digital "credit cards in a block of ice," à la Dave Ramsey).
- **Accountability circles**: friend circles + challenges to stay accountable.
- **Gamification (Business Idea #1)**: every step level-up gives a **prize** — make recognition feel real. Sustainable if prizes are small; explore partnering with a company for gift cards.

## The 5-step plan (path to financial freedom)
1. Stop the bleeding — create an extra income of $200/month
2. Save $500 emergency fund
3. Debt Snowball method
4. Save 3–6 months of expenses
5. Invest

> A big part of the model: ensure there is an **accountability partner**.

## Anti–other-card (open question)
We get card data from Plaid, so we can see purchases on cards that aren't ours. Two ideas:
1. **Vault** (friction lock, above).
2. Trigger **accountability options** when an off-platform purchase is detected. → *What should those options be? TBD.*

## Open questions
Tracked centrally in [docs/TODO.md](TODO.md) (section D — Non-engineering / decisions) — including validating the low-impulse-control persona (user interviews) and deciding the off-platform accountability options.
