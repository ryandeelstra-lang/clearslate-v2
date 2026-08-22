# 18-Hour Execution Plan — H3 Gate Sprint

**Authored:** 21 August 2026, by Opus. **Executed by:** Sonnet.
**Read this entire file before starting.** It is written to be executed cold, with
no access to the conversation that produced it.

---

## 0. What you are doing and why

ClearSlate is deciding whether to become a **debt buyer** that uses ownership of
the paper — the authority to change what someone owes — as its product. Two
hypotheses are live and **mutually exclusive**:

- **H1** (`docs/decisions/v2-plan.md`) — buy *time-barred* paper, covenant never
  to sue. Requires *suppressing* partial payments, because they revive the
  statute of limitations.
- **H3** (`docs/decisions/h3-ownership-as-product.md`) — buy *small-balance
  within-SOL* paper, then use match/forgiveness mechanics. Its central mechanic
  *manufactures* partial payments by design.

**Your job in these 18 hours is to gate H3.** At the end, H3 should be either
promoted to the plan of record or killed, on evidence. You are not building a
product. You are not writing application code beyond one pure module.

**The decisive question is U7:** does small-balance paper trade at a discount to
comparable larger-balance paper? If it does not, H3 has no entry-price edge, the
rev. 1 arithmetic applies unmodified, and H3 dies. Everything else is supporting.

### Required reading before you start (in order)

1. `CLAUDE.md` — project memory, non-negotiables, the *Accuracy, not modesty* rule
2. `docs/rules.md` — AI behaviour rules
3. `docs/research/notes.md` — verified facts, **and the corrections log**
4. `docs/decisions/v2-plan.md` — the rev. 2 plan and its gated unknowns U1–U6
5. `docs/decisions/h3-ownership-as-product.md` — H3, its unknowns U7–U10
6. `docs/decisions/lessons-from-v1.md` — process traps, especially parallel-agent
   file ownership

---

## 1. Standing rules — these override any instinct to be helpful

This project has a documented history of research errors, **every one of which
made the business look more attractive than it was.** `notes.md` carries a
seven-item corrections log. Assume you will make the eighth unless you are
disciplined.

### The anti-fabrication contract

- **Every number ships with a URL to a primary source.** No URL, no number.
- **"Not found" is a successful outcome.** Write it down and move on. An honest
  gap is worth more than a plausible guess, and infinitely more than a number you
  half-remember.
- **Never state a figure you did not read this session at a source you can link.**
  Not from training data. Not from a model's summary. Not from a secondary
  article citing an unnamed study.
- **Primary sources outrank everything:** SEC filings (10-K/10-Q/8-K), court fee
  schedules published by the court, state statutes and agency sites, peer-reviewed
  journals, CFPB/FTC/OCC publications. Vendor blogs and law-firm marketing pages
  are leads, not evidence.
- **Distinguish, always:** % of face vs. multiple; gross vs. net; share-of-
  complaints vs. account-level rate; a multiple without its time horizon is
  meaningless.
- **When a finding flatters the thesis, slow down and re-verify it.** That is the
  project's own rule and it exists because it kept happening.

### Using the `ask` command

The machine has an `ask` command that queries external models (Gemini and
others). **First run `ask --help` or equivalent to learn its actual syntax before
relying on it.**

Use it for:
- Generating candidate leads ("which states license debt buyers?") that you then
  verify one by one against the state's own site.
- Cross-checking your reasoning on an argument.
- Suggesting search terms and sources you have not thought of.

**Do not use it for:** any number, date, citation, or fee that will appear in a
deliverable. External models fabricate citations for precisely this class of
query — plausible-looking case names, statute numbers, and dollar figures that do
not exist. **Every `ask` output is a hypothesis to verify, never a source to
quote.** If you cannot independently confirm it at a primary source, it does not
ship.

### Hard prohibitions

- **Do not send any email, form, or outbound message to anyone.** You may *draft*
  outreach; a human sends it.
- **Do not touch credentials.** There is an open security item (a live Unit admin
  token in a Google Doc). Rotating it is a human task in the Unit dashboard. Do
  not attempt it, and never paste a token into any file you write.
- **Do not commit to `main`.** Work on the branch created in Block 0.
- **Do not edit `docs/research/notes.md` before Block 4.** It is the verified-facts
  file. Research drafts go in their own files.
- **Do not edit any file owned by another agent.** See the ownership table.
- **Money is integer cents. Never floats.**

---

## 2. File ownership

v1's clearest process lesson: parallel agents collide on shared files. Ownership
is disjoint and exclusive. **An agent may read anything; it may write only its own
files.**

| Owner | Writes | Never touches |
| --- | --- | --- |
| Agent A (U8) | `docs/research/u8-litigation-economics.md` | everything else |
| Agent B (U4) | `docs/research/u4-licensing-map.md` | everything else |
| Agent C (U7) | `docs/research/u7-pricing.md`, `docs/outreach/broker-inquiry-draft.md` | everything else |
| Agent D (U10) | `docs/research/u10-tax-and-copy.md` | everything else |
| You (lead) | `core/portfolio.ts`, `core/portfolio.test.ts`, `docs/research/verification-log.md`, `docs/decisions/h3-gate-result.md`, `docs/QUESTIONS-FOR-RYAN.md`, and `notes.md` **in Block 4 only** | agent-owned research files |

Create `docs/outreach/` if it does not exist.

---

## 3. Schedule

Times are elapsed hours from start. If a block overruns, **cut scope inside the
block, do not delete a later block.** Block 4 and Block 5 are mandatory — an
unsynthesised pile of research is a failed sprint.

---

### Block 0 — Setup (0:00–0:45)

1. `git checkout -b h3-gate-sprint`. Confirm you are not on `main`.
2. Read the six documents listed in §0.
3. Run `ask --help` (or equivalent) and record the working syntax at the top of
   `docs/research/verification-log.md`.
4. Create `docs/research/verification-log.md` with these sections, to be filled
   throughout: *Claims verified*, *Claims refuted*, *Claims unresolved*,
   *`ask` outputs that failed verification*.
5. Create `docs/QUESTIONS-FOR-RYAN.md`. Seed it with the two known human-only
   items: **rotate the Unit token and Plaid credentials** (see `CLAUDE.md` →
   History → Open security item), and **reconcile the EIN** (`42-2819082` vs
   `42-2678974`, both in the same Drive doc).

**Gate:** branch exists, `ask` syntax known, two scaffolding files created.

---

### Block 1 — Parallel research (0:45–8:45)

Dispatch four agents. Give each the standing rules from §1 **verbatim in its
prompt** — agents do not inherit this file's context automatically, and the
anti-fabrication contract is the whole ballgame.

Each agent's deliverable opens with a **Confidence and gaps** section stating
what it could not establish. That section is mandatory and is read first.

---

#### Agent A — U8: litigation economics threshold

**Question:** Below what account balance does filing a collections suit stop
making economic sense, and how does that vary by state?

This is the load-bearing input to H3's buy box. H3 claims small balances are
*de facto* non-litigable because suing costs more than the judgment is worth.
Test that.

**Do:**
- For **10 states** — CA, TX, NY, FL, IL, PA, OH, GA, NC, MI — establish from the
  court's own published fee schedule: civil filing fee by claim tier, small-claims
  filing fee, small-claims jurisdictional maximum, and service-of-process cost.
- Find published evidence on **contingency and flat-fee rates** collection
  attorneys charge debt buyers. Trade press and RMAI/ACA materials are acceptable
  if they name a figure and a source; label them as secondary.
- Compute a **break-even balance** per state: total cost to obtain a judgment,
  divided by realistic collectability. State your collectability assumption
  explicitly and cite it — `notes.md` has CRL data on default-judgment and
  garnishment rates that is directly relevant.
- Look for **direct evidence** of buyer behaviour by balance: any study, filing,
  consent order, or court dataset showing suit rates as a function of account
  size. This is stronger than a computed threshold. The CRL *Court System Overload*
  study is already cited in `notes.md` — check whether it breaks out balance.

**Deliverable:** `docs/research/u8-litigation-economics.md` — a per-state table,
the computed threshold with its assumptions shown, any direct evidence found, and
a single bolded sentence answering: *below what balance is litigation
uneconomic?*

---

#### Agent B — U4: licensing map

**Question:** What does it cost, and how long does it take, to be licensed to buy
and collect consumer debt in the states that matter?

This is the long pole under **every** hypothesis and it has not started. The map
is valuable regardless of how H3 gates.

**Do:**
- Identify which states require a debt-buyer or debt-collector licence. Use `ask`
  to generate the candidate list, then **verify each against the state regulator's
  own site.**
- Go deep on **12 states**, prioritised by consumer population. For each: statutory
  cite, licence name, application fee, surety bond amount, net-worth requirement,
  stated processing time, renewal cadence, and whether a registered agent or
  in-state office is required.
- Shallow pass on the remainder: does a licence exist, yes or no, with a link.
- **NMLS**: which of these file through NMLS, and what does that add?
- **RMAI Certified Receivables Business** — mandatory for debt-buying members since
  1 Jan 2025 per `notes.md`. Verify that, then get: cost, prerequisites, audit
  requirements, timeline.
- Produce a **critical path**: cheapest and fastest set of states that gives
  meaningful coverage, and the calendar time to first legal purchase.

**Deliverable:** `docs/research/u4-licensing-map.md` — the table, the critical
path, and a bolded total: *$______ and ______ months to first legal purchase.*

---

#### Agent C — U7: small-balance pricing *(the decisive question)*

**Question:** Does sub-$1,000 charged-off paper trade at a discount to comparable
$2,500–5,000 paper, same vintage and issuer tier?

**Be honest about the ceiling here.** Portfolio pricing is negotiated and largely
private. You will probably not find a definitive public answer, and **saying so
clearly is the correct outcome.** Do not manufacture a number to fill the gap.

**Do:**
- Search public marketplace listings (Debexpert, DebtTrader, and similar) for
  listings that disclose face value, account count, average balance, and asking
  price. Record every data point with its URL. Compute implied ¢/$1 face and
  average balance per listing.
- Look for balance-band pricing in: FTC's *Structure and Practices of the Debt
  Buying Industry*, CFPB market monitoring reports, Encore and PRA investor
  presentations and 10-Ks, and academic work on debt-buying markets.
- Check whether the FTC study — already cited in `notes.md` — breaks out price or
  recovery by balance band. It is the single most likely public source.
- Assemble whatever comparison the data supports and **state the sample size and
  its limits plainly.** Three listings is three listings, not a market.
- Draft a broker inquiry: a short, specific, professional email requesting
  indicative pricing on sub-$1k vs $2.5–5k paper, same vintage. Also draft the
  U1 media-rights questions from `v2-plan.md` §U1 into the same email.
  **Draft only. Do not send. Do not look up or include broker contact details.**

**Deliverable:** `docs/research/u7-pricing.md` and
`docs/outreach/broker-inquiry-draft.md`. The research file must open with one of
three verdicts, bolded: *discount confirmed* / *no discount found* /
**insufficient public data — requires broker conversation**. The third is the
most likely and is perfectly acceptable.

---

#### Agent D — U10: tax exposure and match-copy legality

Two separable questions, one owner.

**D1 — 1099-C.** Under IRC §6050P and its regulations, is a debt buyer an
"applicable entity" required to file Form 1099-C on cancelled debt ≥$600? Get to
the actual regulation, not a tax-prep blog. Then: does the identifiable-event
framework treat a negotiated match/forgiveness as a reportable discharge? What is
the Form 982 insolvency exclusion, and what would a consumer have to do to use it?
Find whether debt buyers in practice issue 1099-Cs on settlements.

**Why it matters:** a 4:1 match on a $4,237 balance cancels ~$3,178. If that
generates an unexpected tax bill for an insolvent person, the mechanic harms the
people it is meant to help and violates the binding constraint.

**D2 — §1692e(10) match copy.** `CLAUDE.md` records a decision that *"Every dollar
you put in, we put in"* is rejected as deceptive, and *"Every dollar you pay, we
cancel two dollars of what you owe"* is approved. **Pressure-test the approved
line.** Find FDCPA case law on the least-sophisticated-consumer standard as
applied to settlement and discount offers. Does the approved line survive? Are
there state-law analogues (California Rosenthal Act, NY DFS rules) that go
further? What disclosures would need to accompany it?

**Deliverable:** `docs/research/u10-tax-and-copy.md`, two clearly separated
sections, each ending in a bolded verdict and a list of what a lawyer must confirm.

---

### Block 2 — Verification (8:45–12:00)

Do not skip this. This is where the eighth correction gets caught.

1. **Re-verify the load-bearing numbers already in `notes.md`** against primary
   sources. Priority order: **PRA legal = 53% of US core cash collections** (the
   single most consequential figure in the repo), Encore's cost-to-collect,
   the 2.3–2.5× multiple with its 180-month horizon, and the 5–15¢ price range.
   Log each as confirmed, refuted, or unresolved in the verification log.
2. **Verify Karlan & List (2007, *American Economic Review*), "Does Price Matter
   in Charitable Giving?"** `h3-ownership-as-product.md` cites it from memory as
   finding that a 1:1 match raised giving while 2:1 and 3:1 did no better. Find
   the paper. Confirm or refute the direction and the ratio finding. Then answer
   the harder question in writing: **the study concerns donations to a charity;
   H3 concerns payments to a company that owns your debt. Does the mechanism
   plausibly transfer?** This project has twice been burned assuming a behavioural
   result transfers across populations — see `notes.md` on Repayment-by-Purchase
   and round-number targets. Be skeptical.
3. **Cross-check the four agent outputs against each other.** If Agent A's
   threshold and Agent C's pricing bands disagree about what "small balance"
   means, reconcile it now.
4. Log every `ask` output that failed verification. That list is evidence about
   how much to trust the tool next time.

**Deliverable:** `docs/research/verification-log.md`, complete.

---

### Block 3 — The entry-price model (12:00–15:30)

Build the model that consumes all of the above. Pure, dependency-free, matching
the existing `core/` style — read `core/apr.ts` first and follow its conventions.

**`core/portfolio.ts`** — no DB, no framework, no imports outside `core/`.
**Integer cents throughout. Basis points as integers for rates.**

Implement:

- `breakEvenCents({ faceCents, pricePerDollarBps, servicingCentsPerDollar })` —
  the collection needed to cover purchase price plus servicing.
- `matchOutcome({ faceCents, ratio, consumerPaidCents })` — returns balance
  cancelled and remaining balance. Cancelled is capped at face; a consumer can
  never be credited past zero.
- `clearingPaymentCents({ faceCents, ratio })` — what a consumer pays to reach
  zero at ratio R. Equals `faceCents / (R + 1)`.
- `netPerDollarFace({ collectedCents, faceCents, servicingCentsPerDollar })` —
  net cents per $1 of face.
- `matchBeatsBaseline({ ... })` — implements the result derived in
  `h3-ownership-as-product.md`: **the match ratio does not enter the profit
  calculation; a match wins iff cash collected exceeds the voluntary baseline of
  12.6¢ per $1 face.** Encode the baseline as a named, documented constant, not a
  magic number.

**`core/portfolio.test.ts`** — the repo has zero tests in its web app and 215 in
the v1 backend. Follow the v1 precedent. Cover at minimum:
- The worked example from `h3-ownership-as-product.md`: $4,237 face at 5¢ →
  break-even $441.07, and at 4:1 the consumer clears for $1,059.25. Assert on
  integer cents.
- Cancellation caps at face — a consumer overpaying is not credited below zero.
- Ratio invariance: `netPerDollarFace` is unchanged by ratio at fixed collections.
- Rounding: assert no floats leak. Every boundary rounds deterministically.

Run the tests. **If they fail, say so in the final report — do not adjust the
test to match the code.**

---

### Block 4 — Synthesis (15:30–17:30)

1. **Update `docs/research/notes.md`** — now, and only now. Add only claims that
   passed verification with a primary-source link. Follow the file's existing
   table format exactly. If Block 2 refuted anything already in that file, **add
   a numbered entry to the corrections log** (it is at #7; you would be adding
   #8). Do not silently amend — the log is the point.
2. **Write `docs/decisions/h3-gate-result.md`.** State the verdict in the first
   sentence, before any reasoning:
   - **H3 PROMOTED** — U7 shows a discount and the other gates are passable. Then:
     what rev. 3 should say, and the first three things to do.
   - **H3 KILLED** — a kill criterion fired. Then: which one, on what evidence,
     and what that implies for H1.
   - **H3 UNRESOLVED** — the likely outcome, and an honest one. Then: exactly what
     is missing, who can get it, and what it costs. Do not dress this up as
     progress and do not dress it up as failure.

   Include the U7/U8 findings, the licensing critical path with its calendar
   implication, the tax and copy verdicts, and every kill criterion from
   `h3-ownership-as-product.md` marked fired / not fired / cannot yet evaluate.
3. **Finish `docs/QUESTIONS-FOR-RYAN.md`** — everything requiring a human:
   credential rotation, EIN reconciliation, broker calls, the lawyer review list
   from Agent D, and any decision the research surfaced but cannot make.

---

### Block 5 — Repo cleanup (17:30–17:50)

**Read this whole block before deleting anything.**

This repo carries a full set of documentation for a **consumer debt-payoff card
and web app** — the business ClearSlate was building until the August 2026 pivot
to debt buying. Under H1/H3 most of it is inert. But **the pivot is not settled**,
and if H3 is killed, that material is the fallback. So the default action here is
**archive, not delete.** Git preserves history either way; an explicit archive
directory preserves *intent*, which git history does not.

v1 lost ~800 lines of CSS to a too-greedy scripted edit
(`docs/decisions/lessons-from-v1.md`). **No globs. No `find -delete`. No scripted
bulk removal.** Move files one at a time, by name.

#### The gate verdict governs what you may touch

Check `docs/decisions/h3-gate-result.md`, which you wrote in Block 4:

- **H3 UNRESOLVED** (the likely outcome) → **Tier 1 only.** The consumer-app
  material is the live hedge. Do not archive it. Write the Tier 2 proposal and stop.
- **H3 KILLED** → **Tier 1 only**, and note in your report that consumer-app
  material may now be the *primary* path, not the fallback. Archiving it would be
  exactly backwards.
- **H3 PROMOTED** → Tier 1, plus Tier 2 archiving, plus the `README.md` fix.

#### Tier 1 — delete, unconditional

- **`docs/PASTE_HERE.md`** (172 lines). A scratch intake file. Its own header
  reads: *"Paste your project text below the marker. Once you do, I'll split it
  into relevant md files."* That split happened — its content is the Google Doc
  **ClearSlate — Consolidated**, which is the source of record and is linked from
  `CLAUDE.md` → History. This is a stale third copy. Delete it.

Before deleting: `grep -rn "PASTE_HERE" . --include='*.md'` and fix any inbound
link. **An unreachable page isn't shipped; a dangling link isn't cleanup.**

#### Tier 2 — archive to `docs/v1-archive/`, only if H3 was PROMOTED

`git mv` each of these, one command per file:

| File | What it is |
| --- | --- |
| `docs/TODO.md` | v1 card tasks — `UNIT_TOKEN`, Marqeta ranges, ACH. Dead under a debt-buying thesis. |
| `docs/roadmap.md` | v1 card roadmap. **Links to `../backend/...` files that do not exist in this repo.** |
| `docs/research/v1-ui-slides.md` | v1 UI slides |
| `docs/decisions/plan-found-money.md` | v1 four-agent feature build plan |
| `docs/main_UI.md`, `docs/onboarding.md`, `docs/features.md`, `docs/tech-stack.md`, `docs/behavioral-categories.md` | consumer-app product docs |

Add `docs/v1-archive/README.md` stating in two sentences what this is, why it was
archived, and the date — so a future reader knows it is deliberate, not abandoned.

Then update the `CLAUDE.md` → *Where things came from* table to point at the new
paths. **A moved file with a stale pointer is worse than an unmoved file.**

#### `core/` — propose only. Do not touch it in any scenario.

All eleven modules are consumer-payoff logic: `negotiate.ts` (rate-cut call
scripts), `transfer.ts` (balance transfers), `fees.ts`, `categorize.ts` (Plaid),
`steps.ts`, `framing.ts`, `payoffDate.ts`, `apr.ts`, `defaultApr.ts`, `config.ts`,
`format.ts`. Under a debt-buying thesis almost none of it applies.

But `CLAUDE.md` calls this "the genuinely valuable code," it is verified and
exercised, and `apr.ts` and `format.ts` are plausibly reusable for portfolio
modelling. **Deleting the only working code in the repo on the strength of an
unresolved strategic fork is not a call an agent makes.** Write the analysis into
the proposal file; leave every file in place.

#### Deliverable and safety

Write `docs/decisions/cleanup-proposal.md`: what you deleted and why; what you
archived and why; a per-module `core/` recommendation with reasoning; and
anything you judged bloat but did not touch, so a human can decide.

Commit cleanup as its **own commit**, separate from research and separate from
code, so it can be reverted alone. Suggested message: `chore: archive v1
consumer-app docs (see cleanup-proposal.md)`.

Then verify: `npx tsc --noEmit` if a TS config exists, and re-run
`core/portfolio.test.ts`. **If anything you moved broke anything, revert the
cleanup commit and say so in the report.** Cleanup is the lowest-value work in
this sprint; it does not get to break the highest-value work.

---

### Block 6 — Report (17:50–18:00)

1. `git add` and commit to the branch with a clear message. **Do not push. Do not
   merge to `main`.**
2. Write a plain summary to the terminal covering:
   - The H3 verdict, in one sentence.
   - The three most important things found.
   - **Everything that failed, was skipped, or came back unresolved.** Name the
     questions you could not answer.
   - Test results as they actually are.
   - What the human must do next.

---

## 4. Definition of done

- [ ] All four research deliverables exist, each opening with *Confidence and gaps*
- [ ] `verification-log.md` complete, including failed `ask` outputs
- [ ] Karlan & List verified or refuted, with the transfer question addressed
- [ ] `core/portfolio.ts` + tests written, tests actually run, results reported honestly
- [ ] `notes.md` updated with verified claims only; corrections log extended if needed
- [ ] `h3-gate-result.md` opens with the verdict
- [ ] `QUESTIONS-FOR-RYAN.md` complete
- [ ] `cleanup-proposal.md` written; cleanup scoped to what the gate verdict allows
- [ ] Cleanup is its own revertable commit; tests and typecheck still pass after it
- [ ] No dangling links introduced (`grep` for anything you moved or deleted)
- [ ] Committed to `h3-gate-sprint`, not pushed, `main` untouched
- [ ] No credential appears in any file you wrote

## 5. How this sprint fails

Read this list once more before Block 4.

- **A confident number with no source.** The worst outcome, because it survives
  into decisions. Every one of the seven corrections in `notes.md` started here.
- **Quoting `ask` as a source.** It generates plausible statute numbers and fee
  figures that do not exist.
- **Filling U7's gap with an estimate.** "Insufficient public data" is the honest
  answer and it is genuinely useful — it converts U7 into a phone call, which is
  a next step. A fabricated discount converts it into a purchase.
- **Research with no synthesis.** Four documents and no verdict is a failed sprint.
- **Reporting success you did not verify.** If tests fail, if a block was cut, if
  an agent returned little — say so plainly. This project's rules require it and
  its history shows why.
- **Over-deleting in Block 5.** The consumer-app material is the hedge against H3
  failing, and H3 will most likely come back unresolved. Tier 1 is one file. If
  you find yourself reaching for a glob, stop and write a proposal instead.
