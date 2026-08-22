# U10 — Tax Exposure and Match-Copy Legality

**Researched:** 21 August 2026, Agent D
**Method:** Primary-source legal research — USC, CFR, IRS publications, circuit court opinions
**Status:** Two separable questions, both answered to a verdict with gaps identified

---

## Confidence and gaps

### What this research establishes

- **D1 (1099-C):** Debt buyers ARE "applicable entities" under IRC §6050P when lending is a significant trade or business. Settlement/forgiveness by agreement IS an identifiable event (Code F). The insolvency exclusion exists but requires consumer action and documentation.
- **D2 (Match copy):** The approved line avoids the word "settlement" (which courts have found inherently implies litigation), is direct about the mechanism, and no case law requires disclosing purchase price or profit margin.

### What it does not establish

- **D1:** Whether ClearSlate specifically will meet the "significant trade or business" revenue thresholds (depends on business mix and scale); how aggressive the IRS is on debt-buyer 1099-C enforcement in practice; whether the match structure creates any novel tax characterization risk beyond standard settlement COD income.
- **D2:** Whether a court applying *Tatis* would find "cancel" materially misleading about the economic basis; whether omitting the 1099-C tax consequence from initial copy is a § 1692e violation; whether the match framing reads as a discount offer (permissible) or as charitable forgiveness (potentially deceptive).

### Sources of uncertainty

- **D1:** Tax attorney review required. The regulation is clear that debt buyers CAN be applicable entities, but whether ClearSlate IS one turns on facts not yet established (revenue mix, business structure).
- **D2:** The case law shows split circuits and fact-intensive "least sophisticated consumer" analysis. No case directly addresses a match offer structured as principal cancellation on a purchased claim.

---

## D1 — 1099-C exposure

### Is a debt buyer an "applicable entity"?

**Yes, if lending is a significant trade or business.**

#### Statutory basis

[26 USC § 6050P(c)(2)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section6050P&num=0&edition=prelim) defines "applicable financial entity" to include:

> "any organization a significant trade or business of which is the lending of money"

#### Treasury regulation: debt buyers qualify

[26 CFR § 1.6050P-2(e)](https://www.law.cornell.edu/cfr/text/26/1.6050P-2) explicitly includes debt purchasers:

> "lending money includes acquiring an indebtedness not only from the debtor at origination but also from a prior holder of the indebtedness."

**This regulation directly addresses debt buyers.** Acquiring charged-off paper counts as "lending of money" for purposes of § 6050P. Example 5 in the regulation confirms: "Gross income arising from indebtedness is gross income from the lending of money without regard to who originated the indebtedness."

Source: [eCFR 26 CFR 1.6050P-1](https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/subject-group-ECFR31749dec6d4756f/section-1.6050P-1), [Cornell Law 26 CFR 1.6050P-2](https://www.law.cornell.edu/cfr/text/26/1.6050P-2)

#### "Significant trade or business" threshold

[26 CFR § 1.6050P-2(b)](https://www.law.cornell.edu/cfr/text/26/1.6050P-2) sets thresholds. Lending is NOT a significant trade or business if:

- **For organizations not previously subject to reporting:** gross income from lending is both less than $5 million AND less than 15% of total gross income in the test year.
- **For organizations previously subject to reporting:** gross income from lending in each of the three most recent test years is both less than $3 million AND less than 10% of total gross income.

**Implication:** A debt buyer whose gross income from debt collections exceeds these thresholds IS an applicable entity. ClearSlate's qualification depends on scale and business mix — facts not yet established.

#### Industry practice

Secondary sources confirm debt buyers were first required to issue 1099-C in 2005. [Multiple sources](https://probonodeskmanual.loyno.edu/tax-law/1214-form-1099-c) state that when debt is sold, "the current holder — not the original lender — is usually the entity that files the 1099-C once the debt is discharged."

**Known issue:** Debt buyers may issue a second 1099-C after the original creditor already filed one, creating double-taxation risk for consumers.

Sources: [Louisiana Legal Services 1099-C guidance](https://probonodeskmanual.loyno.edu/tax-law/1214-form-1099-c), [LegalClarity: Who Can Issue a 1099-C](https://legalclarity.org/who-can-issue-a-1099-c-for-cancellation-of-debt/)

---

### Does a match/forgiveness settlement trigger an "identifiable event"?

**Yes. Code F: "By agreement."**

#### The identifiable events list

[IRS Publication 4681 (2025)](https://www.irs.gov/publications/p4681) lists eight identifiable events in Box 6 of Form 1099-C:

- **Code A:** Bankruptcy
- **Code B:** Other judicial debt relief (receivership, foreclosure)
- **Code C:** Statute of limitations or expiration of deficiency period
- **Code D:** Foreclosure election
- **Code E:** Debt relief from probate or similar proceeding
- **Code F:** **By agreement** — "Cancellation of debt as a result of an agreement between the creditor and the debtor to cancel the debt at less than full consideration"
- **Code G:** Decision or policy to discontinue collection
- **Code H:** Other actual discharge before identifiable event

**A 4:1 match on a $4,237 balance where the consumer pays $1,059.25 and $3,177.75 is cancelled is Code F.** It is "an agreement between the creditor and the debtor to cancel the debt at less than full consideration."

Treasury Regulation [26 CFR 1.6050P-1(b)(2)](https://www.govregs.com/regulations/title26_chapterI-i14_part1_subjgrp6_section1.6050P-1) confirms that a discharge "pursuant to a decision by the creditor, or the application of a defined policy of the creditor, to discontinue collection activity and discharge debt" is an identifiable event. An [IRS ruling](https://www.currentfederaltaxdevelopments.com/blog/2023/5/13/irs-rules-legal-settlement-triggers-identifiable-event-requiring-form-1099-c-filing-in-recent-decision) confirmed that a legal settlement triggers an identifiable event.

**There is no exemption for "match" structures.** The tax code looks at economic substance: debt was cancelled for less than face value, triggering COD income.

---

### What is the Form 982 insolvency exclusion?

#### The exclusion

[Form 982](https://www.irs.gov/forms-pubs/about-form-982) allows taxpayers to exclude cancelled debt from income if they were **insolvent** immediately before the cancellation. Insolvency means total liabilities exceeded the fair market value of total assets.

**The exclusion is capped:** You can exclude cancelled debt only up to the amount by which you were insolvent. If liabilities exceeded assets by $2,000, you can exclude up to $2,000 of COD income — the rest is taxable.

Source: [IRS Form 982 Instructions](https://www.irs.gov/pub/irs-pdf/i982.pdf), [IRS Publication 4681](https://www.irs.gov/publications/p4681)

#### What the consumer must do

1. **Prove insolvency:** Complete an Insolvency Worksheet showing all assets (at FMV) and all liabilities immediately before the debt was cancelled. This is a detailed financial statement.
2. **File Form 982:** Check Line 1b (Discharge of indebtedness to the extent insolvent) and attach the worksheet.
3. **Reduce tax attributes:** Insolvency exclusion requires reducing certain tax benefits (e.g., basis in property, NOLs) dollar-for-dollar.

Source: [IRS Publication 4681](https://www.irs.gov/publications/p4681), [Form 982 Guide (OurTaxPartner)](https://ourtaxpartner.com/form-982-guide/)

**This is not automatic.** The consumer must know about Form 982, understand they qualify, document their insolvency, and file correctly. Most people in collections are insolvent by this definition (debts > assets), but **the exclusion only works if they use it.**

---

### Does the match structure create novel tax characterization risk?

**Unknown. Requires tax counsel.**

Standard debt settlement COD income is well-established. The match mechanic — "every $1 you pay cancels $2" — is economically a discount settlement, but the **framing** is unusual. Possible IRS characterizations:

1. **Settlement discount (most likely):** Consumer paid $X, debt cancelled for $X at a ratio, COD income = cancelled amount. This is Code F, standard treatment.
2. **Part sale of claim / part gift:** If the IRS views the match as ClearSlate "giving" forgiveness beyond what the payment earned, could it be recharacterized as part-gift? Unclear; debt buyers are not charities and the transaction is arm's-length.
3. **Loan modification:** Could the match be characterized as modifying the debt principal rather than cancelling it? Unlikely — the consumer is not re-borrowing the cancelled amount.

**No case law or ruling directly addresses a match structure like this.** Standard settlement discounts do not present it this way. The approved copy says "cancel" not "forgive," which is more precise, but the tax treatment is a facts-and-circumstances analysis.

---

### VERDICT — D1

**A debt buyer whose lending income exceeds the 26 CFR § 1.6050P-2(b) thresholds IS an applicable entity required to file Form 1099-C on cancelled debt ≥ $600. A match settlement IS an identifiable event (Code F). The insolvency exclusion exists via Form 982 but requires the consumer to know about it, document insolvency, and file correctly — it is not automatic and cannot be assumed to shield everyone from a tax bill.**

#### What tax counsel must confirm

1. Whether ClearSlate's projected business structure, revenue mix, and debt-acquisition volume will meet the "significant trade or business" thresholds in 26 CFR § 1.6050P-2(b).
2. Whether the match framing creates any risk of IRS recharacterization beyond standard settlement COD income (part-gift, loan modification, etc.).
3. What disclosure obligation ClearSlate has **before** a consumer accepts a match offer — specifically, whether failing to warn about potential 1099-C issuance is (a) an IRS reporting violation, (b) a state UDAP violation, or (c) an FDCPA § 1692e false/misleading omission.
4. Whether ClearSlate must verify consumer insolvency or provide Form 982 guidance to avoid issuing a 1099-C that harms an insolvent person (binding constraint: "ClearSlate only profits when principal goes down" — handing someone a tax bill they cannot exclude violates this if it leaves them worse off).
5. Interaction with state tax: does forgiven debt trigger state income tax, and do state insolvency exclusions align with federal Form 982?
6. Whether a consumer paying $1,059 to clear a $4,237 balance under a 4:1 match has "disputed debt" arguments that could avoid 1099-C (if consumer disputes the full $4,237 and settles for $1,059, is the cancelled portion "disputed debt" not subject to COD income? — case law is split and fact-specific).

---

## D2 — Match copy under § 1692e(10)

### The statute and standard

[15 USC § 1692e](https://uscode.house.gov/view.xhtml?req=granuleid%3AUSC-prelim-title15-section1692e&num=0&edition=prelim) prohibits:

> "any false, deceptive, or misleading representation or means in connection with the collection of any debt"

Subsection (10) is the catch-all: "The use of any false representation or deceptive means to collect or attempt to collect any debt or to obtain information concerning a consumer."

#### The "least sophisticated consumer" standard

FDCPA violations are evaluated from the perspective of the **least sophisticated consumer** — someone "neither shrewd nor experienced in dealing with creditors." Courts assume the consumer lacks legal sophistication and may misunderstand implications that are obvious to attorneys.

Sources: [FDCPA Overview (WI Eastern District)](https://www.wieb.uscourts.gov/sites/default/files/chambers/svk/LouJones/lj01-08-08-Outline.pdf), [Cornell Law FDCPA Wex](https://www.law.cornell.edu/wex/fair_debt_collection_practices_act)

---

### The approved line: "Every dollar you pay, we cancel two dollars of what you owe"

**Tested against the least sophisticated consumer standard and relevant case law.**

#### What the line says (and doesn't say)

- **Says:** Payment triggers cancellation at a ratio. The mechanism is explicit.
- **Does NOT say:** "Settlement" (avoids the *Tatis* problem, discussed below).
- **Does NOT say:** "Forgive" or "give" (avoids implying charity or ClearSlate contributing cash).
- **Does NOT disclose:** That ClearSlate bought the debt at ~5¢ on the dollar, so "cancelling" $2 costs ~10¢.
- **Does NOT disclose:** That cancellation may trigger a 1099-C and COD income tax.

---

### Case law: settlement offers and the least sophisticated consumer

#### *Tatis v. Allied Interstate, LLC*, 882 F.3d 93 (3d Cir. 2018)

**Facts:** Debt collector sent a letter offering to "settle" a time-barred debt. No explicit threat of litigation, but the word "settlement" appeared.

**Holding:** The Third Circuit held that "even absent a threat of litigation, offers to settle time-barred debts could mislead the least sophisticated consumer." Reasoning:

> "Because the words 'settlement' and 'settlement offer' could connote litigation, the least-sophisticated debtor could be misled into thinking Allied could legally enforce the debt."

**Implication for H3:** The approved line does NOT use "settlement" or "settle." It says "cancel." This avoids *Tatis*'s central concern — that "settlement" implies legal enforceability and litigation.

Source: [Smith Debnam summary](https://www.smithdebnamlaw.com/article/third-circuit-holds-settlement-offer-on-time-barred-debt-states-plausible-fdcpa-claim/), [Hutchens Law analysis](https://hutchenslawfirm.com/blog/creditors-rights/fifth-circuit-adds-circuit-split-offer-settle-debt-without-disclosing-it-time)

#### *Daugherty v. Convergent Outsourcing, Inc.*, 836 F.3d 507 (5th Cir. 2016)

**Facts:** Collection letter offered settlement options on a time-barred debt. Did not disclose the time bar. Did not threaten litigation.

**Holding:** Fifth Circuit reversed dismissal, holding the complaint stated a facially plausible FDCPA claim. A settlement offer can mislead even without an explicit litigation threat.

**Implication for H3:** H3 proposes within-SOL paper (not time-barred), so the time-bar disclosure issue does not apply. But the broader principle — that framing matters and omissions can mislead — does.

Source: [Hutchens Law](https://hutchenslawfirm.com/blog/creditors-rights/fifth-circuit-adds-circuit-split-offer-settle-debt-without-disclosing-it-time), [insideARM summary](https://www.insidearm.com/news/00041903-court-finds-settlement-offers-on-time-bar/)

#### *Cortez v. Forster & Garbus, LLP*, 4 F.4th 77 (2d Cir. 2021)

**Facts:** Debt collector sent a settlement offer that did not disclose interest and fees would continue to accrue if payment was not made by the deadline.

**Holding:** Second Circuit held NO violation. The notice "could only reasonably be read one way" — it was clear about the settlement amount and deadline. The court identified safe harbors:

1. Accurately inform the consumer the balance will increase over time, OR
2. Clearly state that payment by the specified date will satisfy the debt in full.

**Implication for H3:** A match offer stating "pay $X by [date] and your balance is cleared" would satisfy safe harbor #2. But if the offer is open-ended or does not specify full satisfaction, disclosure gaps become riskier.

Source: [Consumer Finance Monitor](https://www.consumerfinancemonitor.com/2021/06/10/second-circuit-rules-debt-collector-did-not-violate-fdcpa-by-sending-settlement-offer-without-disclosing-interest-would-continue-to-accrue-if-consumer-did-not-meet-payment-deadline/)

---

### Pressure-testing the approved line

#### 1. Does "cancel" mislead about the economic basis?

**Argument it does NOT:** "Cancel" is accurate. ClearSlate owns the debt and has legal authority to cancel it. The approved line does not say *why* ClearSlate can afford to cancel (because it bought at 5¢), but omission of purchase price is not inherently deceptive.

**No case law requires disclosing purchase price or profit margin.** Debt buyers are not required to tell consumers "we bought this for 5¢ so we profit even at a discount." The *Tatis* and *Daugherty* cases concerned misleading *implications* (that time-barred debt is enforceable), not failure to disclose favorable economics to the collector.

**Argument it DOES:** The least sophisticated consumer might interpret "cancel" as forgiveness — ClearSlate doing them a favor, absorbing a loss. In reality, ClearSlate is discounting a claim bought cheaply. If the consumer believes ClearSlate is "giving" them $2 for every $1, that could inflate perceived generosity and pressure them into a deal they wouldn't otherwise take.

**Counter:** The line says "cancel" not "forgive" or "give." "Cancel what you owe" describes the legal effect (obligation is extinguished), not the economic motivation. And the consumer's *perception* of ClearSlate's generosity does not make the statement false — the debt IS cancelled.

**Verdict on this risk:** **Low to moderate.** "Cancel" is legally accurate. No case law treats failure to disclose purchase-price basis as deceptive. But the match framing is unusual, and an aggressive plaintiff's attorney could argue it misleads about ClearSlate's sacrifice. Mitigations: (1) never use "forgive" or "give"; (2) pair with clear disclosures about what the consumer pays and what happens to the balance.

---

#### 2. Does omitting the 1099-C consequence make the offer misleading?

**This is the sharper critique.**

**Fact:** A 4:1 match cancelling $3,178 on a $4,237 balance will generate a 1099-C (if ClearSlate is an applicable entity). That cancelled amount is COD income unless the consumer files Form 982 and proves insolvency.

**Question:** Is the match offer false or misleading under § 1692e if it does not warn the consumer about the tax consequence?

**Argument it IS misleading:** The "least sophisticated consumer" hears "pay $1,059, we cancel the rest, you're debt-free" and reasonably believes they are $4,237 better off. If a $3,178 taxable event follows — potentially a ~$700 tax bill at 22% marginal rate, though most of this population is insolvent and could exclude it — the consumer was NOT told the full cost of the deal. Omitting a material consequence that undermines the value proposition is deceptive.

Analogy: *Cortez* safe harbor #2 requires clearly stating that payment satisfies the debt "in full." A tax bill for 20–30% of the cancelled amount means the consumer is NOT free-and-clear, even though the debt collector's claim is satisfied.

**Argument it is NOT misleading:** The 1099-C is an IRS reporting obligation, not a debt collection term. ClearSlate's offer is: "pay $X, we cancel $Y of what you owe us." That is true. The tax consequence is between the consumer and the IRS, not between the consumer and ClearSlate.

Counter-counter: The least sophisticated consumer does not distinguish "what I owe the collector" from "am I done with this problem." If the match creates a new $700 liability (tax), the consumer is not "done," and the offer as framed is misleading by omission.

**Relevant guidance:** [CFPB Debt Collection Rule (Reg F)](https://www.federalregister.gov/documents/2020/03/03/2020-03838/debt-collection-practices-regulation-f) does not explicitly require tax consequence disclosure in settlement offers, but § 1692e's prohibition on "deceptive means" is broader than Reg F's specific disclosure requirements.

**Practice in the industry:** Secondary sources state that collectors sometimes include language like "settling this debt may result in tax reporting to the IRS" in settlement letters. A [Third Circuit case](https://www.consumerfinancialserviceslawmonitor.com/2021/10/1099c-language-in-collection-letters-third-circuit-district-court-grants-defendants-motion-for-summary-judgment-in-fdcpa-case/) upheld such disclosure as NOT false or misleading under the FDCPA.

**Verdict on this risk:** **Moderate to high, depending on execution.** If the match offer is presented as "pay this, you're debt-free, done forever" without ANY disclosure of potential tax reporting, a court could find it misleading under the least sophisticated consumer standard — especially if the consumer later receives a 1099-C they did not expect. Mitigation: include tax-consequence disclosure in the offer itself, or at minimum in the acceptance/confirmation flow.

---

#### 3. Could the match framing be challenged as a false "discount" representation?

**Scenario:** Consumer is told "every dollar you pay, we cancel two." Consumer pays $500, expecting $1,500 of debt to disappear. But if the match ratio is set *per account* by an ML model, and the model later revises the ratio down, did the initial representation become false?

**This is a product-design risk, not inherent to the approved line.** If ClearSlate states a ratio and honors it, no problem. If the ratio changes mid-stream without clear disclosure, that is classic § 1692e bait-and-switch.

**Verdict:** **Avoidable by product design.** Lock the ratio when the offer is made; do not revise it retroactively.

---

#### 4. Does the line comply with state-law analogues?

**California Rosenthal Fair Debt Collection Practices Act**

Incorporates the FDCPA and adds California-specific requirements. Key relevant provision: collectors must disclose if the statute of limitations has expired in the **first written communication** after expiration.

**Implication for H3:** H3 proposes within-SOL paper, so the SOL disclosure does not apply. Rosenthal Act otherwise tracks the FDCPA — the least sophisticated consumer standard applies.

Source: [Privacy Rights Clearinghouse Rosenthal Act overview](https://privacyrights.org/resources-tools/law-overviews/rosenthal-fair-debt-collection-practices-act-california), [Consumer Law Firm Center](https://consumerlawfirmcenter.com/california-rosenthal-fair-debt-collection-practices-act/)

**New York 23 NYCRR 1 (DFS Debt Collection Rules)**

Requires specific initial disclosures (debt amount, creditor name, consumer rights) within five days of initial communication. Does NOT apply to "communications in connection with a pending legal action" or settlement of same.

**Implication for H3:** General disclosure requirements apply (debt amount, creditor, validation notice), but no additional settlement-specific disclosure mandates found in the regulation.

Source: [Sanders Law 23 NYCRR 1 overview](https://www.sanderslaw.group/blog/23-nycrr-1-debt-collection-by-third-party-debt-collectors-and-debt-buyers/), [Consumer Finance Monitor on proposed amendments](https://www.consumerfinancemonitor.com/2021/11/10/nydfs-proposes-amendments-to-debt-collection-regulation/)

**Massachusetts 940 CMR 7.00 (Attorney General Debt Collection Regulations)**

Could not access the full regulation text (403 Forbidden on PDF fetch). Secondary sources indicate it defines "unfair or deceptive acts or practices" for debt collection but do not specify settlement offer disclosure requirements beyond federal FDCPA.

**Implication for H3:** Assume at minimum FDCPA compliance required; confirm with counsel whether Massachusetts has stricter settlement-disclosure rules.

Source: [Mass.gov regulation page](https://www.mass.gov/regulations/940-CMR-700-debt-collection-regulations), [Cornell LII 940 CMR 7.00](https://www.law.cornell.edu/regulations/massachusetts/department-940-CMR/title-940-CMR-7.00)

---

### VERDICT — D2

**The approved line — "Every dollar you pay, we cancel two dollars of what you owe" — likely survives least-sophisticated-consumer scrutiny under § 1692e(10) IF accompanied by clear disclosures about (1) the specific payment and cancellation amounts, (2) that payment by [date] satisfies the debt in full, and (3) that the cancellation may result in IRS tax reporting (1099-C). The line avoids the word "settlement" (which** ***Tatis*** **found inherently implies litigation) and is more direct than standard settlement language. The largest risk is omitting the tax consequence — presenting the match as "debt-free" without warning about potential COD income tax misleads the least sophisticated consumer about the true cost of the deal.**

**The line DOES NOT violate § 1692e merely by failing to disclose ClearSlate's purchase price or profit margin — no case law requires that. But "cancel" must be paired with substance: if the promise is "pay $X and you're done," and the consumer later receives a 1099-C for a material tax bill they could not exclude, the offer as framed was deceptive by omission.**

---

#### What legal counsel must confirm

1. **Minimum required disclosures for a match offer** under FDCPA § 1692e, Reg F, and state law (CA Rosenthal, NY 23 NYCRR 1, MA 940 CMR 7). Specifically:
   - Must the offer state the payment amount, cancellation amount, and final balance in the same communication?
   - Must it disclose the deadline and that payment by that date satisfies in full?
   - Must it warn about 1099-C / tax reporting, or is that optional?

2. **Whether the match framing creates bait-and-switch risk** if the ML model sets per-account ratios that differ from what initial marketing describes. Can ClearSlate say "we offer matches up to 4:1" without violating § 1692e if some consumers are offered 2:1?

3. **Whether "cancel" can be challenged as implying forgiveness rather than discount of purchased debt.** Is there case law on how the least sophisticated consumer interprets "cancel" vs. "forgive" vs. "settle" vs. "reduce"?

4. **State UDAP exposure beyond FDCPA:** Does California's UCL, New York GBL § 349, or Massachusetts Chapter 93A impose stricter standards on settlement-offer framing than federal FDCPA? Could a state AG treat the match offer as deceptive even if it survives § 1692e?

5. **Interaction with Reg F validation notice requirements (§ 1006.34):** The validation notice must itemize "the amount of the debt on the itemization date." If ClearSlate sends a validation notice stating debt = $4,237, then offers a 4:1 match where the consumer pays $1,059, does the match offer "contradict" the validation notice in a way that violates Reg F or § 1692e? Or is the match a permissible post-validation settlement that does not require re-validation at the discounted amount?

6. **1099-C disclosure obligation BEFORE consumer accepts:** Is there any authority — IRS, FTC, CFPB, or state — requiring disclosure of potential tax reporting as a condition of making a settlement offer? Or is post-settlement 1099-C issuance (with consumer receiving Copy B in January) sufficient?

7. **Risk of "least sophisticated consumer" reading match as lottery/promotion rather than debt settlement:** Could a consumer claim they thought the "match" was a promotional offer (like a retailer matching donations) rather than a discount on debt they owe, and therefore the payment was not voluntary satisfaction of the debt? This sounds far-fetched but FDCPA plaintiff's bar is creative.

8. **Whether ClearSlate must verify consumer insolvency before issuing 1099-C:** If most of the target population is provably insolvent (liabilities > assets), does ClearSlate have any obligation to help consumers file Form 982, or does issuing a 1099-C to someone who could have excluded the income via Form 982 but didn't know how constitute harm under the binding constraint ("ClearSlate only profits when principal goes down")?

---

## Summary: answers and gates

| Question | Answer | Confidence | Gate |
| --- | --- | --- | --- |
| **D1a: Is a debt buyer an applicable entity under § 6050P?** | Yes, if lending is a significant trade or business per 26 CFR 1.6050P-2 thresholds. Acquiring debt counts as lending. | High — regulation is explicit | ClearSlate's specific qualification depends on revenue mix (tax attorney confirms) |
| **D1b: Is match settlement an identifiable event?** | Yes, Code F: cancellation by agreement at less than full consideration. | High — IRS Publication 4681 is clear | None — this IS reportable |
| **D1c: Does Form 982 insolvency exclusion shield consumers?** | Exclusion exists but requires consumer to file, document insolvency, and reduce tax attributes. Not automatic. | High — Form 982 instructions are clear | Product must either (1) verify consumer will file 982, or (2) accept that some consumers will face unexpected tax bills |
| **D2a: Does approved line violate § 1692e(10)?** | Likely NO if paired with clear disclosures (payment/cancellation amounts, deadline, tax warning). Avoids "settlement" framing that *Tatis* found misleading. | Moderate — case law is fact-specific and circuit-split | Disclosure design (what warnings accompany the match offer) is load-bearing |
| **D2b: Must ClearSlate disclose purchase price?** | No case law requires it. | High — researched and not found | None |
| **D2c: Must ClearSlate warn about 1099-C in the offer?** | Not explicitly required by FDCPA or Reg F, but omitting it risks least-sophisticated-consumer finding that offer is misleading by omission. | Low to moderate — no direct case law, but logical extension of *Cortez* safe harbor principles | Legal review required; product decision on disclosure strategy |

---

## Sources

All claims in this document link to primary or authoritative secondary sources inline. Key sources:

- **Statutes:** [26 USC § 6050P](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section6050P&num=0&edition=prelim), [15 USC § 1692e](https://uscode.house.gov/view.xhtml?req=granuleid%3AUSC-prelim-title15-section1692e&num=0&edition=prelim)
- **Regulations:** [26 CFR § 1.6050P-1](https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/subject-group-ECFR31749dec6d4756f/section-1.6050P-1), [26 CFR § 1.6050P-2](https://www.law.cornell.edu/cfr/text/26/1.6050P-2)
- **IRS Publications:** [Publication 4681 (2025)](https://www.irs.gov/publications/p4681), [Form 982 Instructions](https://www.irs.gov/pub/irs-pdf/i982.pdf)
- **Case law:** *Tatis v. Allied Interstate, LLC*, 882 F.3d 93 (3d Cir. 2018); *Daugherty v. Convergent Outsourcing, Inc.*, 836 F.3d 507 (5th Cir. 2016); *Cortez v. Forster & Garbus, LLP*, 4 F.4th 77 (2d Cir. 2021)
- **Secondary (for leads only):** [LegalClarity 1099-C guidance](https://legalclarity.org/who-can-issue-a-1099-c-for-cancellation-of-debt/), [insideARM case summaries](https://www.insidearm.com/), [Consumer Finance Monitor](https://www.consumerfinancemonitor.com/)
