# H3 Gate Result

# VERDICT: H3 UNRESOLVED — leaning negative

**The decisive question (U7) could not be answered from public sources, and the
mechanism H3 relies on to justify its buy box (U8) was contradicted rather than
confirmed.** H3 is not dead. It is weaker than when it was written, and the two
things that would settle it are a broker conversation and a dataset nobody has
published.

**Date:** 21 August 2026 · **Branch:** `h3-gate-sprint`
**Inputs:** `u4-licensing-map.md`, `u7-pricing.md`, `u8-litigation-economics.md`,
`u10-tax-and-copy.md`, `verification-log.md`

---

## The one-paragraph version

H3 proposed buying **small-balance within-SOL paper** on the theory that
litigation there is *economically* unavailable to everyone, so the discount is
real and ClearSlate surrenders nothing by declining to sue. Research found the
opposite of a clean answer: **about half of all debt collection lawsuits are for
balances under $2,000** (Pew, verified), so small balances are litigated —
routinely. The transition is a **gradient at roughly $500–$1,500**, not a floor.
Meanwhile **no public source prices paper by balance band at all**, so whether
the discount exists is simply unknown. Separately, licensing turns out to be
**far cheaper and faster than rev. 2 assumed** — good news that belongs to every
hypothesis, not just this one — and **1099-C exposure is real** and will require
a tax disclosure that measurably weakens the match pitch.

---

## Findings by unknown

### U7 — small-balance pricing · **INSUFFICIENT PUBLIC DATA**

**Zero public data points** compare pricing for sub-$1,000 versus $2,500–5,000
paper at comparable vintage. Marketplace listings do not disclose face value,
account count, average balance and price together. FTC, PRA and Encore materials
were either inaccessible or break pricing out by **age**, never by balance.

This is the honest outcome, it was anticipated in the plan, and it is useful: it
converts U7 from a research question into **three emails**. Draft is at
`docs/outreach/broker-inquiry-draft.md`.

**Two errors were caught in this agent's own output during verification** — an
unsourced figure attributed to a page that does not contain it, and 17-year-old
FTC pricing presented without vintage. Both are logged (R3, R4). The second would
have defused a kill criterion on stale data.

### U8 — litigation economics · **H3's PREMISE NOT SUPPORTED**

The load-bearing finding of the sprint.

| | |
| --- | --- |
| Cost-model break-even (no fee shifting) | **$1,000–$1,600**, median ~$1,418 |
| Empirical reality | **~half of all collection cases are under $2,000** (Pew, verified) |
| Industry practice | Large buyers reportedly avoid suing below ~$1,000; **smaller collectors file at $500–$750 in batches** |
| Filing-rate differential by balance | **Does not exist in the public record** |

The cost model and the empirical data disagree, and the empirical data wins. The
gap is probably explained by attorney-fee shifting, small-claims filing (CA small
claims break-even is **$373**), and portfolio-level cross-subsidy — buyers file
on a subset and absorb the rest.

**What this does to H3:** the claim that small balances are *de facto*
non-litigable is **not supported as stated**. Litigation there is *cheaper and
less common*, not absent. So the litigation option retains value inside H3's
proposed buy box, and sellers will price it. H3's answer to the SOL collision —
"buy where litigation is already gone economically" — does not hold in the clean
form it was written.

**What it does not do:** kill H3. The industry-practice sources genuinely do
support large buyers stepping back below $1,000. A *partial* differential may
well exist. But **nobody has quantified it**, and the differential is precisely
what determines the discount. Without it, H3's entry-price edge is a conjecture.

### U4 — licensing · **MUCH BETTER THAN ASSUMED**

| Coverage | Cost | Time |
| --- | --- | --- |
| Minimum viable — 5 states, 21% of US | **~$16,000** | **3–4 months** |
| Meaningful — 7 states, 36% of US | ~$70,000 | ~6 months |
| Strong — 10 states, 52% of US | ~$183,000 | 8–12 months |

**Ohio, Georgia and Virginia require no state collection-agency licence**
(corroborated; municipal requirements unverified). Five states file through NMLS,
enabling parallel processing.

**This corrects rev. 2 and corrects me.** `v2-plan.md` called licensing
"~30 states, 6–18 months… the long pole," and I repeated that to Ryan as grounds
for a sequencing recommendation — that nothing in the debt-buying thesis could be
tested for a year. That conflated *30-state coverage* with *time to first legal
purchase*. They are not the same number. Logged as R5; the advice is retracted.

**This finding belongs to every hypothesis, not just H3.** It is the most
actionable result of the sprint and it survives whatever happens to H3.

### U10 — tax and copy · **EXPOSURE CONFIRMED, MANAGEABLE, PITCH WEAKENED**

**D1 — 1099-C.** Verified directly at the regulation:
[26 CFR § 1.6050P-2(e)](https://www.law.cornell.edu/cfr/text/26/1.6050P-2) —
*"lending money includes acquiring an indebtedness not only from the debtor at
origination but also from a prior holder."* **Debt buyers are applicable
entities.** A match cancelling ≥$600 is a reportable discharge under identifiable
event Code F.

**But note the de minimis threshold, and note that it expires.** A new entity is
outside the regime if lending income is *both* under $5M *and* under 15% of gross
income. **Early ClearSlate would likely fall outside it — and then cross into it
as it scales.** That is a trap worth naming: the mechanic would be clean at
launch and generate exposure exactly when volume makes it expensive to unwind.
Do not build on the safe harbour.

Form 982 insolvency exclusion exists, fits this population, and is **not
automatic** — the consumer must file it and complete the worksheet.

**D2 — match copy.** The approved line survives the least-sophisticated-consumer
standard, and notably avoids "settlement," which *Tatis v. Allied Interstate*
(3d Cir.) treats as implying litigation. But Agent D found a real flaw, which is
what it was asked to do:

> A consumer told they are **debt-free** who then receives a 1099-C and owes tax
> is not, in the ordinary sense, done. Omitting the tax consequence is arguably
> deceptive by omission.

So the approved line needs a companion disclosure. That is honest — and it
**measurably weakens the offer**, which is the point of the *Accuracy, not
modesty* rule. It is better to learn the pitch is weaker than advertised now than
after buying a portfolio on the strength of it.

---

## Kill criteria — status

From `h3-ownership-as-product.md`:

| Criterion | Status |
| --- | --- |
| U7 shows no small-balance discount | **NOT FIRED** — unresolved, not refuted. Needs brokers |
| U9 shows C ≤ 12.6¢ | **CANNOT EVALUATE** — requires owning accounts |
| U9 shows match increases disengagement | **CANNOT EVALUATE** — same |
| U10 unavoidable 1099-C with no clean disclosure path | **NOT FIRED** — exposure real, disclosure path exists, pitch weakened |
| Match copy cannot be written accurately | **NOT FIRED** — line survives, needs a tax disclosure appended |

**A criterion that was not on the list partially fired:** *H3's paper-selection
premise.* The document asserted small-balance paper is where "litigation is
unavailable economically." U8 shows that is a gradient, not a fact. This should
have been a listed kill criterion and was not — an omission worth recording,
because the hypothesis was written so that its most load-bearing assumption sat
outside its own test list.

---

## What I would do next, in order

1. **Send the broker inquiry.** Three emails, `docs/outreach/broker-inquiry-draft.md`.
   It is the only thing that settles U7, and U7 settles H3. Nothing else in this
   sprint substitutes for it.
2. **Open the FTC PDF by hand.**
   [debtbuyingreport.pdf](https://www.ftc.gov/sites/default/files/documents/reports/structure-and-practices-debt-buying-industry/debtbuyingreport.pdf)
   403s to automated fetching but loads in a browser. Check whether it breaks out
   price or recovery **by balance band**. Cheapest remaining shot at U7 from
   public data.
3. **Ask the brokers the U8 question too** — observed filing rates by balance
   band. It is operational knowledge brokers and buyers have and nobody
   publishes. Same conversation, no extra cost.
4. **Do not buy anything.** The entry-price edge is unproven and its stated
   mechanism is contradicted.

## What this sprint did not do

- Did not answer U7, the decisive question. Public data does not exist.
- Did not evaluate U9 at all. It needs a portfolio; that was known going in.
- Did not resolve H1 vs. H3. **Both remain open**, and H1's ethics gate is still
  unrun.
- Did not verify municipal licensing inside the no-licence states, net-worth
  requirements, most processing times, or the RMAI certification cost and
  timeline.
- Did not reach primary-source filing fees for TX, FL, IL, or NY small claims.

## Honest assessment

The most valuable outputs of this sprint were **not** the answer to the question
it was built around. They were: a licensing map that says the runway is months
rather than years, a verified finding that contradicts a premise the plan had
already committed to, and **four corrections — three of them to this project's
own prior work, one of them to my own advice.** Two of the four errors were
caught in the research agents' own output during verification, which is the
argument for keeping that block.

U7 remains open and is now a phone call. That is a better position than believing
a number nobody checked.
