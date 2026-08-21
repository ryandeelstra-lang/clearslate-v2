# CLAUDE.md — ClearSlate v2

Project memory. Read this first, then [docs/rules.md](docs/rules.md).

## What this is

**ClearSlate** — getting people out of debt. This repo is a **fresh start**,
carrying forward the decisions, research, and proven math from v1 while leaving
its accumulated mistakes behind.

**Mission: get people out of debt.**

> ⚠️ **The focus of v2 is not yet fixed.** The founder described it as "the thing
> that is going to help people pay off their debt once I have bought it" — that
> needs pinning down before any code is written. Until it is, treat this file's
> scope section as open.

## Where things came from

| Path | What it is |
| --- | --- |
| `core/` | **Pure, dependency-free logic ported from v1.** No DB, no framework, no imports beyond each other. This is the genuinely valuable code. |
| `docs/` | Product vision, onboarding, features, roadmap, entity/legal — carried over unchanged. |
| `docs/rules.md` | **Source of truth for AI behaviour on this project.** |
| `docs/research/findings.md` | Sourced research with links. Drove v1's feature ranking. |
| `docs/decisions/lessons-from-v1.md` | **Bugs, traps and process lessons. Read before writing code.** |
| `docs/decisions/v1-CLAUDE.md` | The complete v1 decision log — mobile app, enforcement engine, card rails. |

## The `core/` modules

All pure. All ported from working, exercised v1 code.

- `apr.ts` — interest, minimum payments, `payoffProjection`, two-scenario
  comparison. **Independently verified**: $8,500 @ 24.99% paying $250 → 60
  months, matching a from-scratch reimplementation.
- `defaultApr.ts` — subtype-aware fallback rates + `isMortgage`. Exists because
  v1 shipped a bug pricing a mortgage like a credit card.
- `negotiate.ts` — rate-cut math and call script. Floors targets at a realistic
  ~14%; skips cards already under ~16%.
- `transfer.ts` — balance-transfer math. Models the fee **up front**, the 0%
  intro window, and reversion. **Can return a net loss** — that's deliberate.
- `fees.ts` — fee detection. Keeps genuinely-waivable fees separate from
  interest charges, which are *not* waivable. Verified on synthetic data.
- `categorize.ts` / `config.ts` — Plaid PFC → internal buckets, impulse buckets.
- `framing.ts` — "$X = 18 tanks of gas".
- `steps.ts` — the 5-step ladder, position derived live from finances.
- `format.ts`, `payoffDate.ts` — money/date display helpers.

## Non-negotiables

Carried from v1's `docs/rules.md` and reinforced by what went wrong:

- **Money is integer cents. Never floats.** Convert at the boundary.
- **Never let an estimate masquerade as a fact.** Label every assumed rate.
- **When an error flatters the product, that's a signal.** Every v1 math bug
  made ClearSlate look more necessary than it was.
- **Never put words in a user's mouth** about facts you don't have.
- **A feature isn't done until it's been looked at** — screenshots at desktop
  and mobile, not just passing typechecks.
- **An unreachable page isn't shipped.** Audit for inbound links.
- Simplest thing that works. Match existing patterns. Ask before large
  assumptions.

## Entity (unchanged from v1)

ClearSlate LLC, Texas. EIN obtained — **note: v1 docs list it two different
ways (42-2819082 and 42-2678974); reconcile before it's used anywhere.**
Domain `clearslatedebit.com` is owned and Vercel-managed.

⚠️ The v1 Vercel project sits under an org named **"Alpha"**, which appears to be
an employer account rather than a personal one. Worth resolving before real
users or a database of financial data are attached to it.

## Status

**Nothing built yet.** Repo initialised, context ported, awaiting the scope
conversation.
