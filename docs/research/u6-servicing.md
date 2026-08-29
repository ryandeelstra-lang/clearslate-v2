# U6 — Servicing Cost, Bottom-Up

**Date:** 28 Aug 2026
**Verdict: `SERVICING_BPS = 541` was wrong by 2.3–8.3× *and* expressed in the wrong unit. Correcting it makes H3 clear at R=3–4 — but moves the binding constraint to scale, and the scale required is far above any pilot this business can fund.**

This **partly retracts** the same-day conclusion in [`u9-stress.md`](u9-stress.md) that "0% clears at every ratio." That result used the 541bps placeholder. See "What this does to U9" below.

---

## The two errors

### Error 1 — the wrong basis

`portfolio.ts:14` labelled `SERVICING_BPS = 541` as *"a PLACEHOLDER pending U6. It is not an observed figure."* It derives from Encore's cost-to-collect of 44.1% of collections — a buyer that runs call centres, mails at volume, and litigates.

On the H3 baseline tape, 541bps implies **$37.49 per account**.

TrueAccord — digital-first, our actual comparison class — puts fully-loaded cost per account at **$4.50 to $16**, covering *"collection staff wages and fringe benefits, software licensing, management overhead, communication costs (letter and postage, telephony, SMS), equipment, supplies, scrubs and skip tracing information, and premises."*

The placeholder was **2.3–8.3× too high** for the operation we intend to run.

### Error 2 — the wrong unit

Servicing was modelled as **bps of face**. Almost none of it is. Mail, scrubs, software seats, dispute labour and licensing are per **account** or per **year**; only payment processing scales with money collected.

`segment.ts:1–8` already makes this exact point about the *up-front* component — *"any model that expresses servicing purely as bps of face hides this, and hides it in the direction that flatters the thesis"* — but the main stack still used bps of face. Modelling per-account costs as bps of face understates them on small balances, which is the entire H3 buy box.

---

## The regulatory finding that removes an option

**There is no email-only path for first contact.** Two distinct provisions, frequently conflated:

- **§1006.42(b)** — a validation notice sent electronically must comply with **E-SIGN §101(c)**, requiring affirmative consumer consent demonstrating they can access electronic records. That consent cannot exist before first contact.
- **§1006.6(d)(4)** — the email safe harbor. Permits *communications about the debt*, not electronic delivery of the validation notice. It additionally requires the **creditor** to have sent a compliant pre-transfer notice naming the email address, disclosing that others with access may see it, with opt-out instructions and a **35-day** opt-out window.

That second point matters for the buy box. U13 states the gate as *"≥60% with creditor-used email."* **Creditor-*used* email is not the same as §1006.6(d)(4) safe harbor.** The safe harbor requires a specific notice the creditor had to have sent. Most have not. The buy-box gate should be restated in terms of the safe harbor, and diligence should ask sellers for evidence the notice was sent — not merely for email fill rate.

Consequence: every account carries a physical mail cost, and the "email-only, heavily automated, 150bps" scenario from `what-would-it-take.ts` is not available.

---

## The model

### Per account, charged whether they pay or not

| Component | Low | High | Source |
|---|---|---|---|
| Validation notice: postage (presorted first-class) | $0.55 | $0.68 | USPS commercial rates |
| Validation notice: print, insert, fulfilment | $0.10 | $0.25 | Letter-shop pricing at volume |
| Scrubs: deceased, bankruptcy, litigious, NCOA | $0.10 | $0.50 | Standard pre-contact scrub set |
| Email hygiene / validation | $0.005 | $0.02 | Bulk verification vendors |
| **Total** | **$0.76** | **$1.45** | |

The existing `UPFRONT_CENTS_PER_ACCOUNT = 175` ($1.75) sits just above this range — it was roughly right, and is the one parameter in the stack that survives.

### Per payer

Debt collection is a high-risk merchant category: card at **3.49–3.95% + $0.25**, ACH far cheaper, industry running **60–80%** of collections through ACH.

### Annual fixed — the term nobody had priced

| Component | Low | High | |
|---|---|---|---|
| Collection platform / software | $4,788 | $59,988 | Finvi $399–1,999/mo; Tratta $500–10k/mo; Katabat $4,999+/mo |
| State licensing: fees + bonds (~30 states) | $21,000 | $75,000 | Bond premium 1–5% of $10–50k + $200–750/state fees |
| Compliance + legal counsel (fractional) | $25,000 | $120,000 | ⚠️ **UNSOURCED ESTIMATE** |
| Operations staff | $45,000 | $180,000 | ⚠️ **UNSOURCED ESTIMATE** |
| **Total / year** | **$95,788** | **$434,988** | |

---

## Cost per account vs annual volume

| Annual accounts | Low: $/acct | Low: bps face | High: $/acct | High: bps face |
|---|---|---|---|---|
| 1,000 | $96.99 | **14.68¢** | $437.18 | **66.18¢** |
| 5,000 | $20.36 | 3.08¢ | $89.19 | 13.50¢ |
| 25,000 | $5.04 | 0.76¢ | $19.59 | 2.97¢ |
| 100,000 | $2.16 | 0.33¢ | $6.54 | 0.99¢ |
| 500,000 | $1.40 | 0.21¢ | $3.06 | 0.46¢ |

**Same business, same hypothesis, 200× difference in unit economics from scale alone.**

---

## What this does to U9

Re-running the U9 Monte Carlo — honest, untuned parameter ranges — against a bar of `5.40¢ purchase + bottom-up servicing`:

| Annual accounts | Servicing | Bar | Median clears | P90 clears |
|---|---|---|---|---|
| 1,000 (low) | 14.68¢ | 20.08¢ | — | — |
| 5,000 (low) | 3.08¢ | 8.48¢ | — | — |
| 25,000 (low) | 0.76¢ | 6.16¢ | **R=3, R=4** | R=2,3,4 |
| 25,000 (high) | 2.97¢ | 8.37¢ | — | — |
| 100,000 (low) | 0.33¢ | 5.73¢ | **R=3, R=4** | R=2,3,4 |
| 100,000 (high) | 0.99¢ | 6.39¢ | **R=4** | R=2,3,4 |
| 500,000 (high) | 0.46¢ | 5.86¢ | **R=3, R=4** | R=2,3,4 |

**H3 does not fail on behaviour.** It failed on a cost placeholder inherited from a litigating call-centre operator and expressed in the wrong unit. Under honest behavioural ranges, at adequate scale, the **median** clears at R=3–4.

That is a genuine reversal of the U9 headline, and it should be stated as plainly as the original finding was.

---

## But the constraint only moved

It is now **scale**:

- At **1,000 accounts/year**, servicing is 14.68–66.18¢ against a bar of ~11¢. Hopeless at any match ratio.
- It needs roughly **25,000–100,000 accounts/year** before fixed costs amortise.
- 100,000 accounts at $661 average is **~$66M of face per year**, ~$3.6M of purchase capital at 5.4¢.

**The pilot that would answer U9 empirically is precisely the thing the economics cannot support.** A 1,000-account test costs ~$36k to buy and carries ~$96k–$437k of annual fixed cost. You cannot buy your way to the answer cheaply, and you cannot reach scale without the answer.

That is the real finding, and it is a strategic problem rather than a modelling one.

### Ways out, in rough order of cost

1. **Service someone else's paper first.** Contingency servicing carries no purchase cost and builds the operating history that makes licensing and capital cheaper. It also generates the response data that answers U9 without owning anything.
2. **Buy into an existing licensed operator** rather than standing up 30 state licences.
3. **Start in the minimum-viable state set** (U4) rather than 30 states — cuts the largest sourced fixed cost, at the price of a much smaller addressable book.
4. **Forward-flow at scale from day one** — requires capital and a counterparty willing to sell to an unproven buyer.

---

## Confidence

**Sourced:** postage, print, scrubs, payment processing, software pricing, bond and licence fees, TrueAccord's per-account range, Reg F requirements.

**Unsourced (⚠️):** compliance/legal and operations staffing, together spanning **$70k–$300k/year**. They drive the scale threshold more than anything sourced does. **Close these before trusting any threshold in this document.**

The behavioural model remains unvalidated — see [`u9-stress.md`](u9-stress.md). Nothing here changes that; it changes only the bar the behaviour has to clear.

---

## Reproducing

```bash
node core/simulation/stress/u6-report.ts        # cost model and scale curve
node core/simulation/stress/combined-report.ts  # U6 + U9 together
```
