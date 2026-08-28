# CLAUDE.md — ClearSlate v2

**Mission: get people out of debt by buying it and changing what they owe.**

Read this first, then [docs/rules.md](docs/rules.md).

## What this is

**ClearSlate** — a debt-buying business that buys charged-off consumer debt at pennies on the dollar, then uses personalized match ratios and behavioral psychology to help people clear whole accounts. We own the paper, so unlike collection agencies, we can change the balance itself.

**Current hypothesis: H3 — Ownership as the product.** Buy small-balance fintech/BNPL debt where litigation is economically unviable, then treat the balance itself as the intervention. Use ML to set personalized match ratios per account (e.g., pay $1, we cancel $4 of what you owe), optimizing for **accounts closed** rather than dollars collected, because clearing whole accounts is what restores cognitive function and reduces anxiety.

## Binding Constraint

**ClearSlate only profits when principal goes down, never when it stays flat or grows.**

This is the operational constraint that guides the entire business. It structurally rules out revenue from late fees, penalties, or extended payment terms. The only way ClearSlate makes money is when people successfully reduce their debt principal — which perfectly aligns our incentives with helping people get out of debt.

## The thesis (H3)

Every digital-first collections operator optimizes *messages about a fixed balance*. An owner can change the balance. That authority is unavailable to a contingency servicer at any level of engineering skill, and it is the only durable asymmetry we've identified.

**Key insight:** A match ratio (pay $1, cancel $R of balance) costs only the forgiven face value, which we bought at ~5¢ per dollar. So a 3:1 match that lifts cash collections from 12.6¢ to 15¢ of face is profitable, even though it "gives away" 75% of the balance.

**Why accounts closed, not dollars collected:** Three independent literatures converge on account *count* as the governing variable:
- **Ong et al., *PNAS* 2019:** Each account cleared → +0.25 SD cognitive function, −11% anxiety, −10% present bias
- **Gal & McShane:** Proportion of accounts eliminated predicts staying debt-free better than dollars paid
- **Mani et al., *Science* 2013:** The bandwidth mechanism — debt held as separate mental accounts

Clearing accounts is itself the highest-evidence rehabilitation intervention available. It requires no behavior change, no curriculum, no daily engagement.

**The ML problem:** The right match ratio is per-account. Deep ratios for accounts unlikely to pay anything; shallow for accounts likely to pay well regardless. This is a contextual bandit maximizing accounts cleared subject to cash ≥ break-even.

## Asset class (U13, 27 Aug 2026)

**Buy fintech/BNPL-originated installment paper.**

**Why:**
1. **Email is the channel of record** — digitally originated loans use email for application, disclosure, servicing. Bank card tapes frequently lack usable email.
2. **Account-level provenance conveys** — the account *is* one transaction. No 12-statement media horizon problem.
3. **Balances land where match works** — BNPL commonly $200–$800; fintech installment $1k–$5k. Clearing is reachable.
4. **Within SOL, recent vintage** — no revival hazard from partial payments.

**De-prioritize:**
- **Medical** — cheapest paper, best optics, but no levers left (credit reporting gone, litigation gone). Price signals recovery.
- **Credit cards** — most modeled paper on earth, no structural edge over public buyers with actuarial teams.
- **Telecom/utility** — thin media, declared market leader (JCAP bought $7.8B face in one transaction).

**Buy box:**
- Class: Fintech/BNPL installment
- Vintage: Charged off within 18 months
- Balance: $200–$1,500, avg ≥$400
- States: U4 minimum-viable licensing set only
- SOL: Within SOL, ≥6 months headroom
- **Contact: ≥60% with creditor-used email** (the gate — below this the business is one mailed letter)

## The `core/` modules

All pure TypeScript. All tested. No framework dependencies.

- **`tape.ts`** — account-level tape parsing, the first per-account record type. Pre-purchase scoring only — no identity data (name, SSN, address, phone), no ECOA protected-class columns. Refuses to map those at parse. Reconciles face and count against seller's totals; detects duplicates. See U1/U13.
- **`sol.ts`** — statute of limitations per account. The table ships covering NY and TX only (statutes read and cited); everything else is `unknown` = unbuyable. See U12.
- **`segment.ts`** — per-balance-band economics and the buy-box wedge. Surfaces how per-account fixed costs dominate small balances. See U13 finding that JCAP states "lower balance accounts typically carry higher costs."
- **`underwrite.ts`** — portfolio-level underwriting. Ceiling price per portfolio given gross recovery, servicing costs, legal share. Linear in face and accounts.
- **`portfolio.ts`** — decay schedules, IRR, NPV. Money is integer cents; rates are integer basis points.
- **`bridge.ts`** — IRR bridge showing what each structural choice does to return. Recomputes from parameters. See `docs/research/notes.md` for narrative version.

## Non-negotiables

- **Money is integer cents. Never floats.** Convert at the boundary.
- **Never let an estimate masquerade as a fact.** Label every assumed rate.
- **When an error flatters the product, that's a signal.** Every v1 math bug made ClearSlate look more necessary than it was. Same for v2.
- **Never put words in a user's mouth** about facts you don't have.
- **Accuracy, not modesty.** We can use any incentive, framing, or mechanism that is legal, accurately described, and reduces principal. The constraint is accuracy, not modesty. If a truthful version of a message is weaker than a false one, we ship the truthful one and improve it.
  - **Example:** A dollar-for-dollar match on a portfolio bought at ~5¢ per $1 face:
    - ❌ "Every dollar you put in, we put in." (Implies we contribute cash)
    - ✅ "Every dollar you pay, we cancel two dollars of what you owe." (Identical economics, fully truthful, better line)

## Open unknowns (Phase 0)

See `docs/decisions/v2-plan.md` and `docs/decisions/h3-ownership-as-product.md` for full context.

**Critical path:**
- **U1** — Media rights specification (how many statements, format, warranty)
- **U6** — Contact channel fill rate and fully-loaded servicing cost per account
- **U7** — Does small-balance paper carry a litigation discount beyond cost? (Partial answer: JCAP says cost, not litigation)
- **U10** — 1099-C exposure (cancellation-of-debt income)
- **U11** — Does H3 make ClearSlate a "creditor" under Reg B? (Disparate impact exposure)
- **U4 licensing** — ~30 states, 6–18 months, RMAI CRB. **The long pole.** Starts day one.

**Kill criteria:**
- Sellers will not clear at sub-5¢ (market is at 5.4¢ and falling)
- U9 shows match does not lift cash collections above 12.6¢ voluntary baseline
- U9 shows match increases disengagement
- U10 finds unavoidable 1099-C exposure with no clean disclosure path

## Current status

**Nothing shipped.** Phase 0 — filling unknowns, no portfolio capital committed. Licensing not started.

**Recent milestones:**
- H3 hypothesis opened (21 Aug 2026) — replaces H1, mutually exclusive on paper selection
- U13 asset class research (27 Aug 2026) — recommends fintech/BNPL, de-recommends medical
- U14 rehabilitation research (27 Aug 2026) — financial literacy is null; clearing accounts is the intervention
- Corrected gross recovery from 16.8¢ to ~11–12¢ (JCAP SEC filings)
- Built `tape.ts`, `sol.ts`, `segment.ts`, `underwrite.ts`, `bridge.ts` with full test coverage

**Next:**
- Broker inquiry on fintech/BNPL paper (U7 pricing, U6 contact fill, U1 media)
- Complete U4 licensing research for minimum-viable state set
- Legal gate: U10 (1099-C) and U11 (Reg B)

## Entity

- **ClearSlate LLC** — Texas, filed under Ryan Deelstra at 13201 Coleto Creek Trail
- **EIN:** 42-2819082
- **Domain:** clearslatedebit.com (Vercel-managed)

## Where things are

| Path | What it is |
| --- | --- |
| `core/` | **Pure, dependency-free underwriting and tape-parsing logic.** No DB, no framework. This is the genuinely valuable code. |
| `docs/decisions/` | **Operating plans and hypotheses.** `v2-plan.md` (rev. 2), `h3-ownership-as-product.md` (draft H3), `lessons-from-v1.md` (what went wrong). |
| `docs/research/` | **Sourced research.** `findings.md` (behavioral), `u13-asset-class-selection.md` (fintech/BNPL), `u14-rehabilitation.md` (accounts closed objective), `notes.md` (consolidated with corrections log). |
| `docs/outreach/` | **Broker inquiry drafts.** Not sent yet. |
| `docs/rules.md` | **Source of truth for AI behavior on this project.** Generic fintech rules — money as integer cents, validate input, no secrets in code. |
| `.claude/agents/` | **Specialist agents.** Debt acquisition, legal, behavioral psychology, finance, collections operations, etc. |

## What we are NOT building

This is a debt-buying business, not:
- ❌ A consumer fintech app with spending rules or behavioral analytics
- ❌ A debit card or BaaS product
- ❌ A financial literacy curriculum (0.1% of variance across 201 studies)
- ❌ A human coaching service ($10,500–$23,135 per participant vs ~$27 account value)
- ❌ A litigation-based collections shop

If you see references to "spending rules," "round-ups," "card vault," "Plaid transactions," "BaaS," "Unit," or "Marqeta" — those are v1 artifacts and should be ignored or removed.
