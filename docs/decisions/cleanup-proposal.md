# Repo Cleanup Proposal

**Date:** 21 August 2026 · Block 5 of `18h-execution-plan.md`
**Gate verdict:** H3 **UNRESOLVED** → plan authorises **Tier 1 only**. Consumer-app
material is the live hedge and must not be archived.

## Files deleted: none

**Tier 1 was reduced to zero on inspection.** The plan named exactly one
unconditional deletion — `docs/PASTE_HERE.md` — on the reasoning that its intake
job was complete and the Google Doc *ClearSlate — Consolidated* was the source of
record.

**That reasoning was wrong**, and the pre-delete link check caught it:

- `docs/decisions/v1-CLAUDE.md:10` — *"Raw founder brief is archived in
  `docs/PASTE_HERE.md` (**safe to keep as the source of record**)."*
- `docs/SENSITIVE.md:9` — references it as "the original founder brief."

Two distinctions the original call missed:

1. **A documented decision already designates it the source of record.** An agent
   reversing that unilaterally, mid-sprint, is precisely the over-reach the plan's
   guardrails exist to prevent.
2. **It is not a duplicate of the Drive doc.** `PASTE_HERE.md` is a **frozen git
   snapshot of the *original* brief**. The Drive doc is **live and mutable** and
   has been edited since (last modified 20 Aug 2026). For a source-of-record
   purpose the immutable copy is the *better* artifact, not the redundant one.
   Deleting it would destroy the only frozen copy.

**Recommendation: keep.** If it is ever removed, both inbound links must be fixed
in the same commit.

## Tier 2 — proposed, NOT executed

Blocked by the gate verdict. Archive to `docs/v1-archive/` **only if H3 is
promoted**. If H3 is *killed*, this material becomes the primary path and
archiving it would be backwards.

| File | Lines | What it is |
| --- | --- | --- |
| `docs/TODO.md` | 96 | v1 card tasks — `UNIT_TOKEN`, Marqeta ranges, ACH |
| `docs/roadmap.md` | 76 | v1 card roadmap. **Links to `../backend/...` files absent from this repo** — the one genuine rot in the tree |
| `docs/research/v1-ui-slides.md` | 289 | v1 UI slides |
| `docs/decisions/plan-found-money.md` | 209 | v1 four-agent feature build plan |
| `docs/main_UI.md` | 26 | consumer-app product doc |
| `docs/onboarding.md` | 39 | " |
| `docs/features.md` | 46 | " |
| `docs/tech-stack.md` | 45 | " |
| `docs/behavioral-categories.md` | 61 | " |

**~887 lines.** Real bloat under a debt-buying thesis, and a real hedge if the
pivot reverses.

**Fixable independently of the gate:** `docs/roadmap.md`'s dangling `../backend/`
links point at nothing. Worth a header noting it describes a codebase not present
in this repo — that is a correctness fix, not archiving, and is safe now.

## `core/` — recommendation only, nothing touched

Eleven modules, all consumer-payoff logic. Under H1/H3 most is inert. But
`CLAUDE.md` calls this "the genuinely valuable code," it is verified and
exercised, and **deleting the only working code in the repo on an unresolved
strategic fork is not a call an agent makes.**

| Module | Under a debt-buying thesis |
| --- | --- |
| `apr.ts` | **Keep** — interest and amortisation math is reusable for portfolio modelling |
| `format.ts` | **Keep** — money/date display, thesis-independent |
| `payoffDate.ts` | **Keep** — small, generic |
| `defaultApr.ts` | Marginal — subtype APR defaults; charged-off paper does not accrue |
| `steps.ts` | Inert — 5-step consumer ladder |
| `framing.ts` | Inert — "18 tanks of gas" |
| `negotiate.ts` | Inert — rate-cut call scripts, assumes a live account |
| `transfer.ts` | Inert — balance transfers |
| `fees.ts` | Inert — fee detection on live statements |
| `categorize.ts` / `config.ts` | Inert — Plaid PFC mapping |

New this sprint: `core/portfolio.ts` + `core/portfolio.test.ts` — the first
`core/` module written *for* the debt-buying thesis. 12 tests, passing.

## Judged bloat but deliberately untouched

- `docs/user-profiles.md` (397 lines) — largest doc in the repo, consumer
  personas. Inert under H1/H3, but it is the only user-research artifact and the
  repo repeatedly flags "talk to 10 real users" as the top unstarted action.
- `docs/research/behavioral-psychology-audit.md` (476 lines) — largest research
  file. References `backend/` paths not in this repo. Its behavioural findings
  may still bear on U9.
- `.claude/agents/*` (14 agents) — several are card/consumer-shaped, but they are
  tooling, not documentation, and cost nothing at rest.

## Note for whoever runs cleanup next

The one Tier 1 deletion in the plan did not survive a two-minute link check.
Treat every remaining candidate the same way: **grep for inbound links first, and
check whether a decision doc has already ruled on the file.** Both answers were
one command away.
