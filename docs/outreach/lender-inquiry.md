# Lender Inquiry — Contingency Placement

**DO NOT SEND WITHOUT RYAN'S REVIEW.** Draft for human sign-off. No lender contact
details are looked up or included here — recipient selection is Ryan's call.

This is the **primary** path in `locked-20k.md`. Purchase is the fallback.

---

## Why this is the primary path

Contingency placement costs **$0 to acquire** and answers the identical question. The $20k budget then supports ~16,000 accounts instead of ~1,400.

The lender's economics are genuinely good, which is what makes the ask reasonable rather than cheeky: they sell nothing, keep title, and net 60–70% of whatever is collected on paper they have already written off to zero. That is comparable to a 5.4¢ sale without the sale — and without the reputational exposure of their customers being sued by a stranger, since we do not litigate.

**The blocker is trust and settlement authority, not economics.** Two asks are unusual and must be made explicitly rather than buried:

1. **Pre-authorised settlement bands down to 20% of balance** (an 80% reduction). Deep, but on paper already fully written off, and it is the entire mechanism under test.
2. **Servicing under ClearSlate's own brand.** Not a preference — see below.

## The brand point matters and cuts against us

Collecting as *"on behalf of [known lender]"* gets better response than *"ClearSlate, who now handles this."* If we service under the lender's brand, the experiment **overstates** what we would achieve as an unknown buyer, and the result does not transfer to our actual business.

So we want the *harder* condition. That is worth saying out loud in the email — it signals we are running a real experiment rather than fishing for a collections contract.

---

## The email

**Subject:** Charged-off recovery pilot — no litigation, you keep title

Hello,

I run ClearSlate. We do voluntary recovery on charged-off consumer accounts, and I'd like to propose a small pilot on paper you've already written off.

**The structure:**

- **You keep title.** Nothing is sold. Straight contingency placement.
- **~1,500–3,000 charged-off accounts**, ideally small balances ($150–400), charged off within 18 months, Texas residents to start.
- **You net 60–70% of anything collected** on accounts currently valued at or near zero.
- **We never litigate.** Not "not yet" — we have no legal channel and won't build one. Your customers will not be sued by anyone downstream of us.

**Two unusual asks, stated plainly:**

**1. Pre-authorised settlement bands down to 20% of balance.** We're testing whether a substantially deeper reduction moves people who otherwise pay nothing. That means authority to settle at 50% and at 20% on defined sub-groups, set in advance so nothing is negotiated case by case.

**2. We service under our own brand, not yours.** This one usually goes the other way, so let me explain: collecting as *"on behalf of [your company]"* would get better response than an unfamiliar name. That would make our results look better than they are and tell us nothing we can use. We want the harder condition because we're running an actual experiment.

**What you get:** recovery on written-off paper at no cost and no risk, and a clean read on how your charged-off customers respond to a deep-reduction offer. We'll share the anonymised results either way, including if it doesn't work.

**What I'll tell you straight:** we're early. This is a deliberately small pilot to test a recovery approach, not a bid for your ongoing placement volume. If it works I'd want to talk about more; if it doesn't, you'll know that too.

Worth fifteen minutes?

Best,
Ryan Deelstra
ClearSlate LLC · Texas · EIN 42-2819082
deelstraryan@gmail.com · 512-623-9209

---

## Notes for Ryan before sending

**Who to approach.** Fintech/BNPL lenders' recovery or collections leadership — not general support. Smaller and mid-size lenders are far likelier to say yes than Affirm or Klarna, who have established recovery vendors and procurement processes we will not clear. Your own selection.

**What they'll ask, and the honest answers:**

| Their question | The answer |
|---|---|
| Are you licensed? | TX bond filed under Tex. Fin. Code §392.101; TX-only placement to start. Say nothing broader. |
| Insurance? | Not yet carried. **Budget $1,500–5,000 if a lender requires E&O/cyber** — it's on the deferred list in `locked-20k.md` and this is exactly the trigger that ends the deferral. |
| Track record? | None. Do not manufacture one. The pilot's small size is the honest answer to why that's acceptable. |
| Who else have you done this with? | Nobody yet. Say so. |

**Do not agree to:**
- Servicing under their brand — it destroys the result's transferability, which is the entire point.
- Case-by-case settlement approval — kills the randomisation and the experiment with it.
- Exclusivity or volume commitments on a first pilot.

**Trigger to watch.** If a lender demands RMAI certification or E&O cover, that ends the corresponding deferral in `locked-20k.md`. Both are affordable inside the $20k, but they come out of the reserve — re-run `node core/simulation/stress/locked-plan.ts` before committing.

**Run this in parallel with `broker-inquiry.md`, not after it.** They test different failure modes, and the answer to either one determines where the $20k goes.
