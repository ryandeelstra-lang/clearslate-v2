# ClearSlate User Journey

**Mission-aligned design**: Help people take control of their money and get out of debt. No reselling, no litigation, no escalation.

## Core Principles

1. **Framing**: "Time to take control" (empowerment, not threat)
2. **Personalization**: Match ratio per account (R=1 to R=5)
3. **Choice**: One-time payment or 3-month plan
4. **No dead ends**: Dispute = auto-verify + forgive if unclear, Non-response = write off after 3 touches
5. **Binding constraint**: We only profit when principal goes down

---

## Journey Map

```
PORTFOLIO PURCHASE
        ↓
    TRIAGE (Day 0)
        ↓
    ┌───────────────────────────────┐
    │  Personalized Match Assignment │
    │  (ML model or rules-based)     │
    └───────────────────────────────┘
        ↓
┌───────────────────────────────────────┐
│         CONTACT SEQUENCE              │
│                                       │
│  Day 0:  Email #1 (Offer)            │
│  Day 7:  Email #2 (Reminder)         │
│  Day 14: Email #3 (Final Notice)     │
│  Day 21: Write Off (forgive)         │
└───────────────────────────────────────┘
        ↓
    RESPONSE?
        │
    ┌───┴───┐
    │       │
   NO      YES
    │       │
    │       ├─→ DISPUTE? ──→ Auto-verify (7 days) ──→ Clear or Offer Stands
    │       │
    │       └─→ ACCEPT OFFER
    │               │
    │           PAYMENT CHOICE
    │               │
    │           ┌───┴───┐
    │           │       │
    │      ONE-TIME   PLAN (3mo)
    │           │       │
    │           ├───────┤
    │           │       │
    │       PAYMENT  PAYMENT
    │       SUCCESS  SUCCESS
    │           │       │
    │           └───┬───┘
    │               │
    │         ACCOUNT CLEARED
    │         Balance → $0
    │         Report to bureaus
    │         Confirmation email
    │               │
    └───────────────┴────→ DONE
```

---

## Stage 1: Triage & Personalization (Day 0)

### Input: Tape from seller
- 1,000 accounts, $660k face value (avg $660/account)
- 65% have creditor-used email
- All within SOL, fintech/BNPL origin

### Process: Assign match ratio per account

**MVP (Rules-based, before we have ML training data):**

| Account Characteristic | Match Ratio | Rationale |
|------------------------|-------------|-----------|
| Balance < $300 | R=3 | Small balance → clearing is cheap ($75 payment) |
| Balance $300-$800 | R=2 | Mid-range → cash optimum |
| Balance > $800 | R=2 | Large balance → need strong cash recovery |
| Last payment < 6mo ago | R=1 | Recently active → likely to pay without deep match |
| Last payment > 18mo ago | R=3 | Long dormant → need incentive to re-engage |

**Future (ML-based, after 1st portfolio):**
- Train on actual response data (who paid at which ratio)
- Predict P(pay | ratio, balance, vintage, state, debt_type)
- Optimize: max(accounts_cleared) subject to cash ≥ break-even

### Output: Personalized offer per account
```typescript
{
  account_id: "ACCT00000042",
  balance_cents: 65000,      // $650 owed
  match_ratio: 2,            // Pay $1, we cancel $2
  clearing_amount_cents: 21667, // $650 / (2+1) = $216.67
  offer_expires: "2026-09-18" // 21 days from Day 0
}
```

---

## Stage 2: Contact Sequence

### Email #1: Initial Offer (Day 0)

**From:** ClearSlate (help@clearslatedebit.com)  
**Subject:** Take control: Clear your [Creditor] account for $217  
**Preview:** You can close this account today. Here's how.

**Body:**
```
Hi [First Name],

It's time to take control of your money.

We're ClearSlate — a company that buys debt and helps people get out of it. 
We now own your [Original Creditor] account (balance: $650.00).

Here's your offer:

  Pay $216.67 → We cancel the full $650.00
  Your account balance becomes $0.00

This isn't a settlement where you still owe something. When you pay $216.67, 
the entire account is cleared. Closed. Done.

You can pay in full today, or split it into 3 monthly payments of $72.22.

[View Your Offer →]

Why are we doing this? Because clearing whole accounts is what gets people 
out of debt — not just reducing balances. Each account you close restores 
your financial capacity and reduces anxiety.

This offer expires in 21 days (September 18, 2026).

Questions? Reply to this email.

— The ClearSlate Team

---
This is an attempt to collect a debt. Any information obtained will be used 
for that purpose. You have the right to dispute this debt. See your full 
rights at [link to validation notice].
```

**Technical:**
- Personalized: `clearing_amount_cents`, `balance_cents`, `match_ratio`, `offer_expires`
- CTA → Hosted offer page (more below)
- Reg F compliant: validation notice link, clear debt collection disclosure
- Track: Email open, link click

---

### Email #2: Reminder (Day 7)

**Subject:** Your $217 offer expires in 14 days  
**Preview:** Still available: clear your $650 account.

**Body:**
```
Hi [First Name],

Just checking in — your offer to clear your [Original Creditor] account 
is still available.

  Pay $216.67 → Account balance becomes $0.00
  14 days left (expires September 18)

[View Your Offer →]

If you have questions or need help, just reply to this email.

— The ClearSlate Team
```

**Technical:**
- Shorter, direct
- Same CTA to offer page
- Track: Reminder open, click

---

### Email #3: Final Notice (Day 14)

**Subject:** Final reminder: Offer expires in 7 days  
**Preview:** Last chance to clear your account for $217.

**Body:**
```
Hi [First Name],

This is your final reminder — your offer to clear your [Original Creditor] 
account for $216.67 expires in 7 days.

After September 18, this offer will no longer be available.

[View Your Offer →]

If you're unable to pay right now, reply and let us know. We want to help.

— The ClearSlate Team
```

**Technical:**
- Urgency without threat
- Invites dialogue (reply)
- Track: Final notice open, click

---

### Day 21: Write Off

**No further contact.** Account marked as uncollectible.

**Process:**
```typescript
{
  status: "written_off",
  reason: "non_responsive_after_3_touches",
  final_balance_cents: 65000,  // Still owed, but forgiven
  forgiven_date: "2026-09-18",
  forgiven_amount_cents: 65000
}
```

**No 1099-C** (yet): ClearSlate bought at 5.4¢, account value is ~$35. Forgiving $650 face doesn't trigger $600 threshold if actual value < $600. (Legal review required on this, but likely safe.)

**Cost to ClearSlate:**
- Purchase: $650 × 5.4% = $35.10
- Upfront servicing: $1.75
- Total loss: $36.85 per non-responder

At 38.4% non-response rate (from simulation): 384 accounts × $36.85 = **$14,150 loss**

**But**: The 616 who *do* respond generate $19,453 net profit (from simulation at R=3), so portfolio is still profitable overall.

---

## Stage 3: Offer Page

User clicks email CTA → lands on hosted page.

### URL structure
```
https://clearslatedebit.com/offer/[secure_token]
```

**Secure token** = HMAC of account_id + offer_expires, prevents:
- Guessing other people's offers
- Tampering with clearing amount
- Accessing expired offers

### Page Content

**Header:**
```
Your ClearSlate Offer
Account: [Last 4 of original account]
```

**Hero:**
```
┌─────────────────────────────────────────┐
│  Pay $216.67                            │
│  Clear $650.00                          │
│                                         │
│  Your balance becomes $0.00             │
│  Offer expires: September 18, 2026      │
└─────────────────────────────────────────┘
```

**Payment Options:**

```
○ Pay $216.67 in full today
   [Continue to Payment →]

○ Pay in 3 monthly payments of $72.22
   [Set Up Payment Plan →]
```

**What happens next:**
1. You make your payment (secure checkout)
2. We process it within 1 business day
3. Your account balance becomes $0.00
4. We report the account as "paid, $0 balance" to credit bureaus
5. You get a confirmation email with proof

**Frequently Asked Questions:**

<details>
<summary>Why is this different from a settlement?</summary>

A settlement reduces what you owe but leaves a remaining balance. With 
ClearSlate, when you pay $216.67, the entire $650 account is cleared. 
Balance goes to zero. Account is closed. No remaining debt.
</details>

<details>
<summary>What if I can't afford $216.67 right now?</summary>

You can split it into 3 monthly payments of $72.22. Or reply to our email 
and let us know your situation — we want to help.
</details>

<details>
<summary>Is this a scam?</summary>

No. ClearSlate LLC (EIN 42-2819082) purchased your debt from [Original Creditor]. 
You can verify this by requesting validation (your legal right). We're required 
to provide proof within 5 days.
</details>

<details>
<summary>What if I don't think I owe this?</summary>

You have the right to dispute this debt. [Click here to dispute →]. We'll 
investigate and respond within 30 days.
</details>

**Technical:**
- Mobile-first design (most emails opened on mobile)
- No login/registration (friction kills conversion)
- Stripe Checkout for payment (PCI-compliant, no card handling)
- Payment plan = 3 Stripe invoices scheduled monthly

---

## Stage 4: Payment Processing

### One-Time Payment Flow

1. User clicks "Continue to Payment"
2. Redirect to Stripe Checkout
   ```typescript
   {
     mode: "payment",
     amount: 21667, // $216.67 in cents
     metadata: {
       account_id: "ACCT00000042",
       original_balance_cents: 65000,
       match_ratio: 2,
       clearing: true
     }
   }
   ```
3. User completes payment
4. Stripe webhook → ClearSlate backend
5. Backend updates account:
   ```typescript
   {
     status: "cleared",
     balance_cents: 0,
     paid_cents: 21667,
     cleared_date: "2026-08-29",
     payment_method: "one_time"
   }
   ```
6. Send confirmation email
7. Report to credit bureaus (MetroNet API):
   ```typescript
   {
     account_status: "paid",
     balance: 0,
     date_closed: "2026-08-29"
   }
   ```

**Timing:** Same-day clearing (payment → confirmation within 24 hours)

---

### Payment Plan Flow

1. User clicks "Set Up Payment Plan"
2. Redirect to Stripe Checkout (subscription mode)
   ```typescript
   {
     mode: "subscription",
     line_items: [{
       price: 7222, // $72.22 per month
       quantity: 1
     }],
     subscription_data: {
       metadata: {
         account_id: "ACCT00000042",
         total_payments: 3,
         clearing_on_completion: true
       }
     }
   }
   ```
3. User completes setup (enters card, authorizes recurring)
4. Stripe charges monthly automatically
5. After 3rd payment:
   - Backend clears account
   - Cancels subscription
   - Sends confirmation email
   - Reports to bureaus

**Timing:** 3-month clearing (payment plan completes → then clear)

**Risk:** User cancels plan after 1-2 payments
- **Mitigation:** Keep account as "in plan" status, send reminders
- **If canceled:** Offer to restart plan, or accept partial as settlement
- **Cost:** Re-engagement expense (~$5 per restart attempt)

---

## Stage 5: Dispute Handling

### Trigger: User clicks "dispute" on offer page

**Step 1: Capture dispute details (simple form)**
```
Why are you disputing this debt?

○ I don't recognize this account
○ The balance is wrong
○ I already paid this
○ This debt is not mine
○ Other: [text field]

[Submit Dispute]
```

**Step 2: Auto-verify (within 1 business day)**

Run automated checks:
```typescript
{
  account_match: checkAccountExists(account_id, seller_tape),
  balance_match: checkBalanceReconciles(account_id, claimed_balance),
  date_match: checkLastPaymentBeforeChargeoff(account_id),
  duplicate_check: checkNotAlreadyPaid(account_id)
}
```

**If all checks pass:**
- Send verification email with account details (original creditor, dates, balance)
- Offer still stands
- Mark dispute as "verified, offer active"

**If any check fails:**
- Send to manual review queue
- ClearSlate team investigates (check seller data, request documentation)
- Respond within 7 days

**Step 3: Resolution**

**If verified:** Email response
```
We've verified your account details:

Original Creditor: [Name]
Charge-off Date: [Date]
Balance at Charge-off: $650.00

Your offer is still available: Pay $216.67 to clear this account.

If you still dispute this, reply and let us know why.
```

**If can't verify within 7 days:**
- Forgive debt
- Send confirmation email:
```
We were unable to verify your account within our 7-day commitment.

Your debt has been forgiven. Balance: $0.00.

You will not hear from us again about this account.
```

**Cost of forgiveness:**
- Purchase: $35.10
- Upfront: $1.75
- Dispute investigation: $125 (manual review)
- **Total: $161.85 per forgiven dispute**

At 3.4% dispute rate (from simulation): 34 disputes on 1,000 accounts
- If 50% auto-verify → 17 manual reviews → 17 × $125 = $2,125
- If 50% forgiven → 17 × $161.85 = $2,751
- **Total dispute cost: $4,876**

**But:** Prevents FDCPA violations (worth far more than $4,876 in avoided complaints/lawsuits)

---

## Stage 6: Confirmation & Follow-Up

### Successful Clearing

**Email:**
```
Subject: Your [Creditor] account is cleared ✓

Hi [First Name],

Congratulations — your account is officially cleared.

  Original balance: $650.00
  You paid: $216.67
  New balance: $0.00

We've reported this to the credit bureaus as "paid, $0 balance."

You should see this update on your credit report within 30 days.

You're done. No more contact from us about this account.

If you need proof for your records, download your clearance letter here: 
[Download PDF →]

— The ClearSlate Team
```

**PDF Clearance Letter:**
- Official letterhead
- Account details
- Payment confirmation
- Balance $0 statement
- "No further amounts owed" language
- Signature (DocuSign API)

**Credit Bureau Reporting:**
- Via Metro 2 format through data furnisher
- Status: "Paid, $0 balance"
- Date closed: [clearing_date]
- Reported within 30 days of clearing

---

## Economics Summary

### Per-Account Costs (1,000 account portfolio)

| Outcome | Count | Purchase | Upfront | Variable | Dispute | Total Cost | Revenue | Net |
|---------|-------|----------|---------|----------|---------|------------|---------|-----|
| **Cleared (one-time)** | 338 | $18,234 | $592 | $2,510 | $0 | $21,336 | $73,222 | +$51,886 |
| **Cleared (plan, 100% complete)** | 0 | $0 | $0 | $0 | $0 | $0 | $0 | $0 |
| **Non-response (written off)** | 384 | $20,678 | $672 | $0 | $0 | $21,350 | $0 | -$21,350 |
| **Disputed (forgiven)** | 17 | $917 | $30 | $0 | $2,751 | $3,698 | $0 | -$3,698 |
| **Disputed (verified, then paid)** | 17 | $917 | $30 | $115 | $2,125 | $3,187 | $3,678 | +$491 |

**Portfolio Total:**
- Revenue: $76,900
- Costs: $49,571
- **Net Profit: $27,329**
- **ROI: 76.6%**

**vs Simulation (R=3, no payment plans):**
- Simulation predicted: $19,453 net profit, 54.5% ROI
- Journey design adds: +$7,876 profit (+40% lift)

**Why the lift?**
- Dispute auto-verification converts 50% to payments (vs simulation writing all off)
- Mission-aligned framing may boost response rate above 61.6% baseline
- Payment plan option expands addressable (though not modeled yet)

---

## Open Questions / Next Steps

### 1. Payment Plan Completion Rate
**Unknown:** What % complete 3-month plan vs cancel early?

**Impact:** If 50% cancel after 1 payment:
- Revenue drops ~15% (partial payments don't clear accounts)
- Servicing cost increases (re-engagement attempts)

**Action:** Model conservatively (assume 70% completion), validate with real data

---

### 2. Personalized Match Ratio Impact
**Unknown:** Does personalized R=1-3 beat fixed R=2 or R=3?

**Impact:** 
- R=1 for early responders could lift cash 10-15%
- R=5 for avoiders could convert 5-10% who'd otherwise ignore

**Action:** A/B test fixed R=2 vs personalized in first portfolio

---

### 3. Mission-Aligned Framing Effectiveness
**Unknown:** Does "take control of your money" outperform standard collection copy?

**Impact:** If response rate lifts from 61.6% → 70%:
- +84 additional clearings
- +$18k revenue
- Potentially game-changing

**Action:** A/B test mission framing vs neutral framing (50/50 split)

---

### 4. Email Deliverability
**Unknown:** What % of emails land in inbox vs spam?

**Current assumption:** 90% deliverability
**Reality check needed:** Debt collection emails are high-risk for spam filters

**Impact:** If deliverability is 50%:
- Effective contact rate drops by half
- Need to invest in domain reputation, authentication (SPF/DKIM/DMARC)

**Action:** Start with cold email best practices, monitor bounce/spam rates closely

---

### 5. Reg B (Disparate Impact) Risk
**Unknown:** Does personalized match assignment create illegal discrimination?

**Risk:** If match ratio correlates with protected class (race, gender, age):
- Even unintentional = ECOA violation
- Could invalidate entire personalization approach

**Mitigation:**
- Never include protected class in model inputs
- Test for disparate impact (compare match distribution across demographics)
- Document business justification (maximize accounts cleared, not profit)

**Action:** Legal review before deploying ML-based personalization

---

## Implementation Phases

### Phase 0: MVP (No Personalization, Email Only)
**Goal:** Validate mission-aligned framing and write-off strategy

- Fixed R=2 for all accounts
- Email-only sequence (3 touches)
- One-time payment only (no plans)
- Manual dispute review (no auto-verify)
- Stripe Checkout for payments
- Manual credit bureau reporting

**Timeline:** 4-6 weeks to ship
**Capital needed:** $36k (1,000 accounts at 5.4¢ + upfront)

---

### Phase 1: Personalization + Payment Plans
**Goal:** Optimize clearing rate and cash recovery

- Rules-based match assignment (balance + vintage)
- Payment plan option (Stripe subscriptions)
- Auto-verify disputes (90% automated)
- A/B test: fixed R=2 vs personalized

**Timeline:** +6-8 weeks
**Unlocks:** Higher conversion, better economics

---

### Phase 2: ML-Based Personalization
**Goal:** True H3 vision (per-account optimization)

- Train ML model on Phase 1 response data
- Predict P(pay | ratio, account features)
- Optimize: max(accounts_cleared) subject to cash ≥ break-even
- Disparate impact testing

**Timeline:** +12 weeks (need training data first)
**Unlocks:** Maximum clearing rate, portfolio-level optimization

---

## Bottom Line

**This journey is mission-aligned:**
- No reselling (write off non-responders)
- No litigation (forgive disputes)
- Choice (one-time or plan)
- Empowerment framing ("take control")

**This journey is economically viable:**
- $27k net profit on $36k capital (76% ROI)
- Break-even at 45% response rate (vs 61.6% expected)
- Dispute forgiveness costs $4,876 but prevents FDCPA risk worth >> $4,876

**This journey is buildable:**
- MVP in 4-6 weeks (email + Stripe + manual review)
- Incremental optimization (personalization, plans, auto-verify)
- A/B testing built in (validate assumptions with real data)

**Next: Build it or refine it?**
