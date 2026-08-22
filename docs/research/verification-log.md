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
| V4 | `notes.md`: PRA **legal collection costs $48.5M (+$15.1M YoY)** and **legal collection fees $17.1M**, Q1 2026 | [PRA Q1 2026 earnings release, SEC](https://www.sec.gov/Archives/edgar/data/1185348/000118534826000019/q12026earningsrelease.htm) — fetched directly (SEC 403s to WebFetch; needs a User-Agent) | Lead | **Exact match.** Filing shows costs `48,458` vs `33,394` (Δ $15.06M) and fees `17,071`, in $000s. Also confirmed in the same document: cash efficiency ratio **61.8%**, ERC **$8.5B up 9.5%**, total cash collections $551.9M up 11.0% |
| V5 | `h3-ownership-as-product.md` cites Karlan & List (2007, *AER*) from memory: a 1:1 match raised giving, while 2:1 and 3:1 did no better | [AEA](https://www.aeaweb.org/articles?id=10.1257%2Faer.97.5.1774), [NBER w12338](https://www.nber.org/papers/w12338) | Lead | **Citation holds exactly.** >50,000 prior donors; match ratios $1:$1 / $2:$1 / $3:$1. Match raised revenue per solicitation and response rate; "larger match ratios… had no additional impact." **But see the transfer analysis below — the citation being correct is not the same as the finding applying.** |
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
| **X1** | 🔴 **`notes.md`: "PRA US legal collections = 53% of US core cash collections", cited to Q1 2026.** `notes.md` calls this **"the single most consequential number found."** | Both Q1 2026 primary documents, fetched in full from SEC EDGAR: the [earnings release](https://www.sec.gov/Archives/edgar/data/1185348/000118534826000019/q12026earningsrelease.htm) and the [full 10-Q](https://www.sec.gov/Archives/edgar/data/1185348/000118534826000021/praa-20260331.htm) (2.0MB). Searched for channel-mix tables, "collections by channel", any 53% in a collections context | **Not present in either.** No channel-mix table exists; zero mentions of "digital" as a channel; the sole "53%" regex hit is a false positive inside "153%" in a vintage table. Legal collection **costs and fees** are disclosed (V4) — the **share of collections** is not. **This does not refute the figure** — it may come from an investor presentation, an earnings call, or derivation. But it is **not verifiable at the source it is cited to**, and `notes.md` rule 1 says SEC filings outrank everything |

### Why X1 matters more than anything else in this log

The 53% figure is load-bearing for the entire project. It is the basis for
rev. 1's death ("removing legal deletes a large share of the denominator"), for
rev. 2's structure, and for the objection that H3 is a re-run of rev. 1. The
IRR bridge's −2,057bp legal-removal step is built on it.

**Action:** locate the actual source, or downgrade it to derived/estimated and
re-examine every conclusion resting on it. Candidates not yet checked: PRA's Q1
2026 investor presentation (403'd for Agent C), the Q1 2026 earnings call
transcript, and PRA's FY2025 10-K.

## `ask` outputs that failed verification

*Not applicable — `ask` unavailable this sprint. See tooling note above.*
