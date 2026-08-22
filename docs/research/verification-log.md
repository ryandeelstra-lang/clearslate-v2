# Verification Log — H3 Gate Sprint

**Started:** 21 August 2026. Branch `h3-gate-sprint`.
Companion to `docs/decisions/18h-execution-plan.md`.

---

## Tooling note — `ask` unavailable

The plan (§1) assumed an `ask` command for querying external models as a
lead-generation aid. **It does not exist in this environment.** Checked: `which`,
`type`, shell aliases and functions in `~/.zshrc` / `~/.zprofile` / `~/.zshenv`,
`~/.claude/commands/`, `.claude/commands/`, `~/bin`, `~/.local/bin`. Not found.

**Impact: minimal.** The plan permitted `ask` only for generating candidate leads
and cross-checking reasoning, and explicitly forbade quoting it as a source for
any figure reaching a deliverable. Primary research runs on WebSearch/WebFetch
against primary sources, which is unchanged.

The *"`ask` outputs that failed verification"* section below is retained but is
expected to stay empty this sprint.

---

## Claims verified

| # | Claim | Source (URL) | Verified by | Notes |
| --- | --- | --- | --- | --- |

## Claims refuted

| # | Claim as stated | What is actually true | Source | Consequence |
| --- | --- | --- | --- | --- |
| R1 | `h3-ownership-as-product.md`: consumer pays **$1,059.25** at 4:1 to clear a $4,237 balance | **$847.40.** Clearing = `face / (R+1)`, not `face / R`. $1,059.25 is the **3:1** figure. The doc's own formula and its "20¢ of face" label both give $847.40 (1,059.25/4,237 = 25%, not 20%) | Internal arithmetic; verified by `core/portfolio.test.ts` | Net per account overstated ~$618 → **~$406**. **The error flattered the product** — the project's own signal. Doc corrected in place; → notes.md correction **#8** |
| R2 | `v2-plan.md` §U4: "RMAI CRB certification (**mandatory since 1 Jan 2025**)" — reads as mandatory *to operate* | Mandatory for **RMAI members only**, not a condition of operating as a debt buyer. Note `notes.md` states this correctly ("mandatory for debt-buying **members**"); it is `v2-plan.md` that drops the qualifier | Agent B (U4), primary source pending in `u4-licensing-map.md` | Licensing critical path is **less constrained** than rev. 2 assumed. Fix `v2-plan.md` in Block 4. This error ran *against* the product, which is why it survived unexamined |

## Claims unresolved

| # | Claim | What was searched | Why it could not be settled |
| --- | --- | --- | --- |

## `ask` outputs that failed verification

*Not applicable — `ask` unavailable this sprint. See tooling note above.*
