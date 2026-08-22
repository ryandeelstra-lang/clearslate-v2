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
| V1 | **~Half of all debt collection cases are for less than $2,000** (Utah, Minnesota, Michigan) | [Pew, *Debt Collection Lawsuits Surge to Pre-Pandemic Highs*, 2 Sep 2025](https://www.pew.org/en/research-and-analysis/articles/2025/09/02/debt-collection-lawsuits-surge-to-pre-pandemic-highs) | Lead, independent corroboration — exact sentence confirmed via search after the page 403'd to direct fetch | **Directly contradicts H3's premise that small balances are *de facto* non-litigable.** Caveat: covers *all* collection cases (medical, original creditors, small local collectors), not specifically debt-buyer purchases of charged-off card paper. See Block 4 |
| V2 | Pew reports **<4% of people sued for debt have legal representation** | Same as V1 | Lead | Consistent with `notes.md` CRL figure (98%+ unrepresented). Two independent sources agree |
| V3 | **Ohio, Georgia and Virginia require no state-level collection agency licence** | Multiple independent compliance vendors concur ([Harbor Compliance](https://www.harborcompliance.com/debt-collection-agency-license), [Cornerstone](https://cornerstonelicensing.com/debt-collection-state-laws/), [SoloSuit](https://www.solosuit.com/posts/states-require-license-debt-collector)); Agent B reports verification against state sources | Lead, corroboration pass | **Directionally confirmed but caveated.** These are secondary sources; ~38 of 52 US jurisdictions do license. **Municipalities within these states may impose their own requirements** — unverified. Also unverified: whether a *debt-buyer*-specific licence differs from a *collection-agency* licence in each |

## Claims refuted

| # | Claim as stated | What is actually true | Source | Consequence |
| --- | --- | --- | --- | --- |
| R1 | `h3-ownership-as-product.md`: consumer pays **$1,059.25** at 4:1 to clear a $4,237 balance | **$847.40.** Clearing = `face / (R+1)`, not `face / R`. $1,059.25 is the **3:1** figure. The doc's own formula and its "20¢ of face" label both give $847.40 (1,059.25/4,237 = 25%, not 20%) | Internal arithmetic; verified by `core/portfolio.test.ts` | Net per account overstated ~$618 → **~$406**. **The error flattered the product** — the project's own signal. Doc corrected in place; → notes.md correction **#8** |
| R2 | `v2-plan.md` §U4: "RMAI CRB certification (**mandatory since 1 Jan 2025**)" — reads as mandatory *to operate* | Mandatory for **RMAI members only**, not a condition of operating as a debt buyer. Note `notes.md` states this correctly ("mandatory for debt-buying **members**"); it is `v2-plan.md` that drops the qualifier | Agent B (U4), primary source pending in `u4-licensing-map.md` | Licensing critical path is **less constrained** than rev. 2 assumed. Fix `v2-plan.md` in Block 4. This error ran *against* the product, which is why it survived unexamined |
| R3 | Agent C's draft of `u7-pricing.md` cited "**< 0.5¢ (117 of 176 listings)**" to a CFPB page | **The figure is not on that page.** Fetched and checked: it states only that the report "reviewed three online debt websites" and "analyzed the price, type, and age of debt." No counts, no bands. The agent cited it to a source the same document called "corrupted/unreadable" — a number cannot be read from an unreadable file | Lead, [CFPB page fetched](https://www.consumerfinance.gov/data-research/research-reports/market-snapshot-online-debt-sales/) (report published 12 Jan 2017) | **Unsourced number caught before use.** Retracted in place in `u7-pricing.md`. This is the exact failure mode the standing rules exist to prevent, and it happened anyway — evidence the anti-fabrication contract needs enforcing at review, not just at instruction |
| R5 | Lead's own guidance to Ryan, this session: *"licensing is 6–18 months… nothing in the debt-buying thesis can be tested for a year"* — repeated as the basis for a sequencing recommendation | **Wrong.** Agent B's map gives a minimum-viable path of **~$16k and 3–4 months** across 5 states, three of which (OH, GA, VA) require no licence at all. The 6–18 month figure in `notes.md`/`v2-plan.md` describes ~30-state coverage, not time-to-first-purchase — the two were conflated | `u4-licensing-map.md`; V3 above | **The sequencing advice built on it was wrong** and is retracted. Licensing is not an 18-month absolute blocker. Correct `v2-plan.md` §U4 and the "long pole" framing in `CLAUDE.md` → History in Block 4 |
| R4 | FTC pricing figures (4.0¢ avg / 7.9¢ under 3yr / 2.2¢ at 6–15yr) presented in `u7-pricing.md` without vintage | Figures are real but the contracts studied were signed **July 2006 – June 2009** — **17–20 years old**, predating the post-2013 rise in paper pricing | [Oregon Legislature summary of the FTC study](https://olis.oregonlegislature.gov/liz/2013R1/Downloads/CommitteeMeetingDocument/10002); FTC press release 403s to fetch | **Would have defused a kill criterion on stale data.** `v2-plan.md` makes "sellers will not clear at sub-5¢" the *primary* kill criterion; reading "FTC avg 4.0¢" as current market makes sub-5¢ look routine. `notes.md` puts today's range at 5–15¢. Vintage warning added in place |

## Claims unresolved

| # | Claim | What was searched | Why it could not be settled |
| --- | --- | --- | --- |

## `ask` outputs that failed verification

*Not applicable — `ask` unavailable this sprint. See tooling note above.*
