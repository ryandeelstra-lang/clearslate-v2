# ClearSlate — Build TODO (gaps vs. design docs)

Everything in the design docs not yet shipped, labeled by **Size** (Small: hours · Medium: a day or few ·
Big: multi-day / new subsystem) and **Priority** (High · Medium · Low). Derived from
[product-vision.md](product-vision.md), [onboarding.md](onboarding.md), [features.md](features.md),
[tech-stack.md](tech-stack.md), [roadmap.md](roadmap.md). Last refreshed **2026-06-20**.

**Where things stand:** Phases 1–3 are code-complete and tested (54 vitest green; JIT hot path
p99=35ms @ 2000 auth/s). Onboarding, the rules/enforcement spine, round-ups, the step engine,
real auth, Plaid webhooks, subscriptions, debt mirror, and the accountability partner are all
**built**. What remains is (A) the real money/card rails — **blocked on external accounts/credentials,
not code**, (B) a short list of **buildable-now** items, (C) the **feature backlog** from the vision
doc, and (D) **non-engineering** decisions/launch work.

---

## A. Blocked on external setup / credentials (not code)
These are the critical-path items to make money actually move. Code is built where noted; each is
gated on an account, dashboard toggle, token, or tunnel.

- [ ] **Open business bank account** (Mercury or Relay) — non-eng / **High** — required before BaaS go-live.
- [ ] **Apply to Marqeta** (production card issuing) — non-eng / **High** — list Unit as BaaS partner.
- [ ] **Regenerate `UNIT_TOKEN`** — Small / **High** — the sandbox token in `.env` 401s; **blocks** Unit KYC,
  ACH destination plumbing, and the sandbox card+ACH test below.
- [ ] **Enable Marqeta card range + write-capable token** — non-eng / **High** — sandbox card product has no
  provisioned range (`issue` returns `500002`) and the access token 403s on writes. Unblocks real issuance.
- [ ] **Enable Marqeta gateway funding source** (`always_fund:false`) + expose backend on a public tunnel —
  non-eng / **High** — unblocks the *true* end-to-end JIT auth (code complete behind `MARQETA_WEBHOOK_*`).
- [ ] **Plaid multi-account selection** — Small / **High** — Plaid Dashboard → Link → Account Select →
  "enabled for multiple accounts" (dashboard toggle, your action).
- [ ] **Sandbox card + ACH end-to-end test** (Phase 0) — Medium / **High** — issue virtual card → simulate txn →
  test ACH via Unit. *Blocked by the Marqeta + `UNIT_TOKEN` items above.*
- [ ] **`PLAID_WEBHOOK_URL` public tunnel** — Small / Medium — webhook code is live; delivery needs a public URL.
- [ ] **`TWILIO_*` credentials** — Small / Medium — accountability-partner SMS is stub-safe; live texts need creds.

## B. Buildable now (code-actionable, unblocked)
- [ ] **5-step plan presentation screen** (onboarding step 5: jump to current step, scroll the ladder) —
  Medium / **Medium** — step model exists (`StepLadder`); onboarding flow doesn't yet show it as its own beat.
- [ ] **Unit KYC gating** on card issuance — Medium / Medium — block issuance until KYC passes *(also needs a
  valid `UNIT_TOKEN`, but the gating logic can be written + tested against a stub now)*.
- [ ] **ACH destination plumbing** (`unit_accounts` / counterparty) so the sweep moves real money — Medium /
  Medium — schema + wiring can land now; live transfer waits on `UNIT_TOKEN`.
- [ ] **Decline push end-to-end** — Medium / Medium — backend send + `POST /devices/register` exist; mobile must
  register an Expo push token (`expo-notifications`) on a dev build. Shared gate with step pushes.
- [ ] **Evening-timing push scheduling** — Small / Medium — step progress (50/80%) + level-up pushes are built
  and deduped but fire immediately; schedule for evenings (higher open rates) per [features.md](features.md).
- [ ] **Pre-onboarding data fetch** to shorten the Plaid wait — Medium / Low.

## C. Feature backlog (net-new, from the vision)
Behavioral / accountability:
- [x] ~~**Card vault** — "lock" other cards; unlocking requires deliberate in-app friction~~ — **shipped**
  (PAN-free by design: nickname + last four only, no photo/PAN stored). `vaulted_cards` (migration 0015) +
  `vault/config.ts` friction model + `routes/vault.ts`; mobile `CardVault`/`VaultCard` on the Card tab.
  Unlock = retype the last four → 10-min auto-relock + accountability-partner SMS. *(Optional later: real
  device-local card photos via `expo-image-picker`, never uploaded.)*
- [ ] **Accountability circles + challenges** — friend circles, group/individual challenges — Big / Medium.
- [ ] **Anti–other-card detection** + accountability options on off-platform purchases (via Plaid) — Medium / Low
  — *options still TBD (see D).*

Gamification:
- [ ] **Prizes / gift-card partnership** (per-level-up reward) — Big / Low.
- [ ] **Modes** (Monk, Debt Attack) — Medium / Low.
- [ ] **Leagues** (debt-paid / saved leaderboards) — Medium / Low.

Categorization (enforcement accuracy):
- [ ] **Cannabis detection** — no reliable MCC/PFC; needs merchant-name / Plaid-enrich heuristics before the
  cannabis rule actually enforces — Medium / Low.
- [ ] **Impulse / luxury detection** via merchant-name + time-of-day heuristics (Amazon/DoorDash/Target) —
  Medium / Medium.

## D. Non-engineering / decisions / launch
- [ ] **Recruit beta users + soft launch** (~50 via UT Austin finance club, r/personalfinance, Twitter;
  instrument Mixpanel/PostHog — step completion, 7-day retention, card usage, rules/user) — Phase 3 / High.
- [ ] **Analyze beta data & iterate** (where users stall, which rules set most, do declines churn or engage) —
  Phase 3 / High.
- [ ] **Validate the low-impulse-control persona** via user interviews — non-eng / Medium.
- [ ] **Define accountability options** triggered by off-platform purchases — Small (decision) / Low.

## E. Follow-ups from the 2026-06-19 UI/onboarding pass
- [x] ~~Re-expose or remove manual debt entry~~ — **resolved**: manual entry is wired into `ConnectScreen`
  ("Enter my debt manually" sets `manual=true`).
- [x] ~~Align Progress tab with the new payoff model~~ — **resolved**: `ProgressScreen` now derives its path
  text from the same real-payment-vs-freed-cash model as the chart (no more goal-based "{N}-month plan").

---

### Recently shipped (for context, not a checklist)
Phase 1 onboarding (connect → questionnaire → insights → payoff chart) · Phase 2 enforcement spine
(MCC/cap/velocity, round-up ledger, end-of-month ACH sweep, decline push) + Marqeta issuance/JIT *code* ·
Phase 3 step engine + ladder UI + level-up celebration + advice · real auth (JWT, IDOR closed) ·
Plaid webhooks · subscriptions tab · debt mirror · accountability partner · save-X rule ·
behavioral-categories taxonomy · 5-step count resolved · payoff-goal persistence ·
onboarding/insights UI polish (ripple intro, trimmed Connect trust copy, 1mo–20yr slider, cap-input
keyboard fix, payoff math reworked to real-payment vs freed-cash) · **Name your debt** (captured in
onboarding, shown in the insight reveal, now surfaced across the Home/Payoff/Progress tabs as a named
"enemy" — `{name} — gone in N months`).
