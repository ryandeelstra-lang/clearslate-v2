# CLAUDE.md — ClearSlate v2

Project memory. Read this first, then [docs/rules.md](docs/rules.md).

## What this is

**ClearSlate** — getting people out of debt. This repo is a **fresh start**,
carrying forward the decisions, research, and proven math from v1 while leaving
its accumulated mistakes behind.

**Mission: get people out of debt.**

## Binding Constraint

**ClearSlate only profits when principal goes down, never when it stays flat or grows.**

This is the operational constraint that guides the entire business. It structurally rules out revenue from late fees, penalties, or extended payment terms. The only way ClearSlate makes money is when people successfully reduce their debt principal — which perfectly aligns our incentives with helping people get out of debt.

## The v2 thesis

**Use consumer psychology and machine learning to build a debt payoff plan per
person — treating them like a human being, not a spreadsheet.** Two people with
identical debt should get different payoff orders, payment sizes, timing, and
language, because they are different people. The system learns what works for
each of them.

**Stance (decided):** psychology is used to *help people win at what they
already want* — never to pressure, shame, or manufacture urgency. This is not
only an ethics call: the research in `docs/research/findings.md` shows shame
produces short-term compliance then long-term avoidance, and ~90% of these apps'
users are gone within 30 days. The empathetic version is the one that retains.

**Allowed:** payday-aligned payments, streaks, plans sized to what someone will actually
sustain, opt-in commitment devices, loss framing about interest *paired with a
way out*.
**Never:** shame, fake urgency, nudging toward debt that
profits us, or hiding the math behind a recommendation.

## Accuracy, not modesty

**We can use any incentive, framing, or mechanism that is legal, accurately
described, and reduces principal — including ones that feel aggressive. The
constraint is accuracy, not modesty. If a truthful version of a message is
weaker than a false one, we ship the truthful one and improve it.**

This rule exists to prevent two opposite failures. It rules out timidity: an
offer is not disqualified for being bold, and "get people out of debt as fast as
possible" is the goal. It also rules out the specific temptation that debt
*ownership* creates — describing forgiveness of a claim we bought at pennies as
though it were cash we contributed.

**Worked example, decided 21 August 2026.** A dollar-for-dollar match on a
portfolio bought at ~5¢ per $1 face:

| Framing | Verdict |
| --- | --- |
| ~~"Every dollar you put in, we put in."~~ | **Rejected.** Implies we contribute cash. We forgive a claim that cost us a nickel. |
| **"Every dollar you pay, we cancel two dollars of what you owe."** | **Approved.** Identical economics, fully truthful, and a better line — it foregrounds the balance falling. |

The rejection is a legal call before it is an ethical one: FDCPA **§1692e(10)**
bars deceptive means, judged in most circuits by the *least sophisticated
consumer*, and the gap between "we contribute" and "we forgive" is material
because it changes how generous the offer appears and who the consumer thinks we
are. CFPB UDAAP sets a lower bar still. **Confirm with the legal gate before any
match copy ships.**

Note what the example cost us: nothing. That is the usual result, and it is the
reason this rule is cheap to hold.

## Where things came from

| Path | What it is |
| --- | --- |
| `core/` | **Pure, dependency-free logic ported from v1.** No DB, no framework, no imports beyond each other. This is the genuinely valuable code. |
| `docs/` | Product vision, onboarding, features, roadmap, entity/legal — carried over unchanged. |
| `docs/rules.md` | **Source of truth for AI behaviour on this project.** |
| `docs/research/findings.md` | Sourced research with links. Drove v1's feature ranking. |
| `docs/decisions/lessons-from-v1.md` | **Bugs, traps and process lessons. Read before writing code.** |
| `docs/decisions/v2-plan.md` | **The live operating plan (rev. 2).** Hypotheses, gated unknowns, kill criteria. |
| `docs/decisions/h3-ownership-as-product.md` | Draft hypothesis: the balance itself as the intervention. **Candidate rev. 3 — replaces H1 rather than amending it.** |
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

## History

Milestones only, oldest first. Source of record: **ClearSlate — Consolidated**
([Drive](https://docs.google.com/document/d/1DsU8U5AmcMLznejXc65Xht4btPByOT3RpTiSOWgxm_c/edit),
last modified 20 Aug 2026). ⚠️ marks a conflict that is not yet reconciled.

- **ClearSlate LLC** — acquired. Texas, filed under Ryan Deelstra at 13201 Coleto
  Creek Trail. SOSDirect credentials live in the Drive doc's Ops section.
- **EIN** — obtained. ⚠️ The same doc lists **two**: `42-2819082` (Build Timeline)
  and `42-2678974` (Ops, with an LLM summary naming it). Unreconciled.
- **clearslatedebit.com** — acquired, Vercel-managed. ⚠️ Under a Vercel org named
  "Alpha", which looks like an employer account.
- **Plaid** — sandbox acquired, client ID on file. 🔴 Credentials exposed, see below.
- **Unit (BaaS)** — sandbox complete. 🔴 Live admin token exposed, see below.
- **Sandbox KYC test** — passed.
- **Reg E dispute flow** — done, off Unit's template.
- **Privacy Policy** — done, 28 May 2026. ⚠️ Promises delete/export endpoints that
  do not exist.
- **Marqeta** — not started.
- **Business bank account** — not started.
- **Sandbox card + ACH end-to-end test** — not started.
- **Web app** — ⚠️ Drive Tab 2 says "Site is done"; this repo says never deployed
  and the domain serves a static placeholder. Unreconciled.
- **v2 pivot to debt buying** — Aug 2026. Rev. 2 plan, H1 gated, H3 opened.
- **Debt-buyer licensing** (~30 states, 6–18 months, RMAI CRB) — **not started.
  The long pole under every current hypothesis.**

### 🔴 Open security item

The Drive doc's *Ops — Legal & API* section contains a **live Unit admin token**
(expires 30 May 2027; scopes include `payments-write`, `ach-payments-write`,
`wire-payments-write`, `cards-sensitive`) and a **Plaid recovery code**, both in
plaintext. Flagged 19 Aug 2026, still present 20 Aug. **Rotate both, delete the
block, and purge Drive revision history.** Until then, treat the Unit org as
compromised.

### What carries into the debt-buying business

Most of the above was built for the **card** business. Under H1/H3, the LLC, EIN
and domain carry. Unit, Marqeta, Reg E and the KYC flow **do not** — different
regulatory surface entirely (FDCPA / Reg F / state debt-buyer licensing). Do not
count that groundwork as progress against the current thesis.

## Status

**Nothing built yet.** Repo initialised, context ported, awaiting the scope
conversation.
