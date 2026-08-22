# ClearSlate Multi-Agent Specialist System

This directory contains 11 specialist agents and 1 orchestrator agent for ClearSlate v2, a debt acquisition and payoff business.

## Binding Constraint

**ClearSlate only profits when principal goes down, never when it stays flat or grows.**

This constraint shapes every specialist's recommendations and is enforced by the orchestrator.

## The Specialist Roster

### 1. debt-acquisition
**Portfolio buying, valuation, pricing**
- Evaluates debt portfolio opportunities
- Calculates debt-per-dollar pricing
- Assesses portfolio risk (delinquency, charge-offs)
- Determines profitable purchase prices under binding constraint
- **Triggers:** "should we buy", "portfolio valuation", "pricing analysis"

### 1b. debt-buyer-intel
**How the incumbent debt buyers actually operate**
- Market intelligence on Encore/Midland, PRA Group, and peers
- Forward flow vs. spot sale mechanics, media quality, paper stages
- Verified benchmarks from SEC filings (multiples, ERC, deployment)
- Converts multiples to cents-per-dollar-of-face with explicit horizons
- **Triggers:** "how does Encore buy debt", "forward flow pricing", "collection multiple", "what media comes with a portfolio"

### 2. financial-domain
**Payoff strategies, debt counseling, payment plans**
- Recommends payoff strategies (avalanche, snowball, hybrid, personalized)
- Evaluates balance transfers using `core/transfer.ts`
- Calculates interest savings using `core/apr.ts`
- Designs sustainable payment plans
- **Triggers:** "payoff strategy", "which debt first", "balance transfer", "payment plan"

### 3. collections-operations
**Payment processing, account servicing, compliance workflows**
- Designs humane payment processing workflows
- Account servicing procedures
- Dispute handling
- State-specific compliance workflows
- **Triggers:** "payment processing", "dispute", "account servicing", "collection workflow"

### 4. behavioral-psychology
**Psychological interventions, engagement mechanisms**
- Applies 83+ documented behavioral mechanisms
- Recommends framing using `core/framing.ts`
- Identifies psychological barriers
- Designs opt-in commitment devices
- **Stance:** No shame, no fake urgency, no breakable streaks
- **Triggers:** "behavioral intervention", "user psychology", "engagement strategy"

### 5. customer-profiler
**User archetype matching, personalization**
- Matches users to 15 behavioral profiles
- Recommends profile-specific strategies
- Predicts engagement and dropout risk
- Enables ML personalization
- **Triggers:** "customer profile", "user segment", "which persona", "personalization"

### 6. ml-specialist
**Personalization models, optimization, A/B testing**
- Designs ML models for personalization
- Defines optimization targets (maximize principal reduction rate)
- Engineers features from financial + behavioral data
- Designs statistically rigorous A/B tests
- **Triggers:** "personalization model", "ML approach", "optimization", "A/B test"

### 7. legal-specialist
**FDCPA, state collection laws, consumer protection**
- FDCPA compliance evaluation
- State-specific collection law guidance
- Consumer protection regulations
- Communication rules and restrictions
- **Triggers:** "legal compliance", "FDCPA", "can we legally", "collection law"

### 8. security-compliance
**PCI-DSS, data protection, privacy compliance**
- PCI-DSS compliance (payment card data)
- Financial data protection (encryption, access control)
- Privacy regulations (CCPA, GLBA, state laws)
- Breach response planning
- **Triggers:** "security", "PCI", "data protection", "privacy", "breach"

### 9. finance-economics
**APR calculations, amortization, risk modeling**
- APR and interest calculations using verified `core/apr.ts`
- Amortization schedules
- Time-value calculations (NPV, IRR)
- Payment optimization
- **Triggers:** "APR calculation", "amortization", "interest math", "payment schedule"

### 10. product-ux
**Engagement, retention, onboarding optimization**
- Analyzes engagement (payment-linked, not vanity metrics)
- Reduces 30-day dropout (industry ~90%)
- Optimizes onboarding and activation
- Diagnoses drop-off patterns
- **Triggers:** "engagement", "retention", "drop-off", "onboarding", "user testing"

### 11. coder-implementation
**Feature building, integration, bug fixes**
- Implements features from specialist recommendations
- Integrates `core/` financial logic
- Follows project rules (integer cents, screenshots required)
- Avoids v1 mistakes documented in `lessons-from-v1.md`
- **Triggers:** "implement", "build", "code this", "integrate"

## The Orchestrator

### clearslate-orchestrator
**Multi-domain coordination and synthesis**
- Dispatches specialists in parallel or sequence
- Synthesizes cross-domain recommendations
- Resolves conflicts between specialists
- Enforces binding constraint across all recommendations
- **Model:** Opus (most capable)
- **Triggers:** Multi-domain questions, portfolio evaluation, complex strategy design

## How Agents Reference Project Knowledge

Agents don't duplicate documentation — they reference it:

**Financial logic:**
- All agents use `core/*.ts` modules (verified, pure functions)
- Never reimplement financial calculations

**Research:**
- `docs/research/behavioral-psychology-audit.md` — 83+ behavioral mechanisms
- `docs/user-profiles.md` — 15 behavioral archetypes
- `docs/research/findings.md` — Key research (90% dropout, shame vs. empathy)

**Rules and constraints:**
- `CLAUDE.md` — Binding constraint and v2 thesis
- `docs/rules.md` — Coding standards
- `docs/decisions/lessons-from-v1.md` — Bugs to avoid

## Example Workflows

### Workflow 1: Portfolio Acquisition Decision

**Question:** "Should we buy this $100k portfolio at $15k?"

**Orchestrator dispatches (parallel):**
1. **debt-acquisition:** Evaluate pricing and risk
2. **legal-specialist:** Assess legal compliance and risk
3. **finance-economics:** Calculate NPV and ROI

**Synthesis:**
- **Decision:** Buy at $12k max (or negotiate/walk)
- **Rationale:** Maximum price enabling profitable humane collection
- **Conditions:** Licensing in 3 states, verify chain-of-ownership
- **Binding constraint:** ✓ Verified (no fees, profit from principal reduction)

### Workflow 2: Personalized Payoff Strategy

**Question:** "User has 3 cards, which to pay first?"

**Orchestrator dispatches (sequence):**
1. **customer-profiler:** Match to behavioral archetype → "Anxious Avoider"
2. **financial-domain:** Recommend payoff math → "Snowball for this profile"
3. **behavioral-psychology:** Design interventions → "Low-pressure, quick wins"

**Synthesis:**
- **Strategy:** Snowball (smallest balance first)
- **Rationale:** Anxious Avoider needs psychological wins > optimal math
- **Interventions:** Simplify choices, celebrate early milestone
- **Payment plan:** Payday-aligned, sustainable amounts

### Workflow 3: Building an Engagement Feature

**Question:** "Build a progress visualization feature"

**Orchestrator dispatches (sequence):**
1. **product-ux:** Define meaningful engagement metrics
2. **behavioral-psychology:** Design psychological mechanisms
3. **coder-implementation:** Build feature using `core/` logic

**Synthesis:**
- **Feature spec:** Progress bar showing principal reduced, not days active
- **Mechanism:** Goal gradient effect (visual progress motivates)
- **Implementation:** Uses `core/apr.ts` for accurate projections
- **Binding constraint:** ✓ Verified (optimizes principal reduction, not engagement theater)

### Workflow 4: Compliance Review

**Question:** "Can we send payment reminders via text?"

**Orchestrator dispatches (parallel):**
1. **legal-specialist:** FDCPA and TCPA compliance
2. **behavioral-psychology:** Ensure supportive framing (no pressure)
3. **collections-operations:** Implement in workflow

**Synthesis:**
- **Legal:** Yes, if user consents (TCPA) and can opt-out
- **Psychological:** Frame as helpful reminder, not demand
- **Operational:** Integrate with payment system, respect opt-out immediately
- **Binding constraint:** ✓ Verified (supports payoff, doesn't extract)

## Testing the Agent System

To verify agents are working correctly:

### Test 1: Single-Domain Triggers

**Test:** "Calculate interest savings for avalanche vs. snowball"
- **Expected:** `financial-domain` agent activates
- **Verify:** Uses `core/apr.ts` logic

**Test:** "Is this FDCPA compliant?"
- **Expected:** `legal-specialist` agent activates
- **Verify:** References FDCPA regulations

### Test 2: Multi-Domain Orchestration

**Test:** "Should we buy this portfolio?" (with portfolio details)
- **Expected:** `clearslate-orchestrator` activates
- **Verify:** Dispatches debt-acquisition, legal-specialist, finance-economics

**Test:** "Design a payment plan for an anxious user"
- **Expected:** `clearslate-orchestrator` activates
- **Verify:** Dispatches customer-profiler, financial-domain, behavioral-psychology

### Test 3: Binding Constraint Enforcement

**Test:** Propose a feature that profits from late fees
- **Expected:** Orchestrator flags violation
- **Verify:** Recommendation is vetoed

**Test:** Recommend extending loan terms to increase interest
- **Expected:** Orchestrator flags violation
- **Verify:** Recommendation is vetoed

## Agent Design Principles

1. **Least privilege:** Most agents are read-only or limited tools
2. **Reference, don't duplicate:** Agents link to docs, don't copy them
3. **Binding constraint enforcement:** Orchestrator verifies all recommendations
4. **Specialist focus:** Each agent has a narrow, deep domain
5. **Multi-agent coordination:** Orchestrator dispatches specialists as needed

## File Structure

```
.claude/agents/
├── README.md (this file)
├── debt-acquisition.md
├── financial-domain.md
├── collections-operations.md
├── behavioral-psychology.md
├── customer-profiler.md
├── ml-specialist.md
├── legal-specialist.md
├── security-compliance.md
├── finance-economics.md
├── product-ux.md
├── coder-implementation.md
└── clearslate-orchestrator.md
```

## Adding New Specialists

To add a new specialist:

1. Create `[name].md` in `.claude/agents/`
2. Add frontmatter (name, description with triggers, model, color, tools)
3. Write system prompt (role, responsibilities, process, resources)
4. Reference existing project docs (don't duplicate)
5. Add to this README
6. Update orchestrator's "Available Specialists" list
7. Test triggering with example queries

## Notes

- Agents use `model: inherit` (except orchestrator uses `model: opus`)
- Only coder-implementation and ml-specialist can write code
- All agents enforce binding constraint within their domain
- Orchestrator has final say on cross-domain conflicts
- Security and legal specialists can veto unsafe/illegal recommendations
