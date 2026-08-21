# Roadmap & Timeline

Operating principle: **Build, ship code, talk to users.** Status notes carried over from the brief.

## Phase 0 — Infrastructure & legal (Weeks 1–6)
> Apply costs, live per-unit pricing, and the partner status table live in [business-and-legal.md](business-and-legal.md).

- ✅ **Register LLC** — *ClearSlate LLC*, Texas (see [business-and-legal.md](business-and-legal.md)).
- ✅ **Get EIN from IRS** — complete.
- ⬜ **Open business bank account** — Mercury or Relay (startup-friendly, no minimums, free ACH). Needed before BaaS apps.
- ✅ **Apply to Unit (BaaS)** — sandbox complete. *Gates everything — apply week 1.*
- ⬜ **Apply to Marqeta (card issuing)** — apply alongside Unit; list Unit as intended BaaS partner.
- ✅ **Apply to Plaid** — done.
- ✅ **Draft Privacy Policy & Terms** — done (must cover Plaid data use, storage, deletion rights).
- ✅ **Set up Reg E dispute flow** — done (Unit template, customized & documented).
- ✅ **Run sandbox KYC test** — done (create customer → identity verification → compliant account).
- ⬜ **Run sandbox card + ACH test** — issue virtual card in Marqeta sandbox, simulate txn, run test ACH via Unit. Confirm full money flow end-to-end. *Issuance code is built; blocked on Marqeta account config (card range + write-capable token) and a valid `UNIT_TOKEN` — see Phase 2.*

## Phase 1 — Onboarding & data (Weeks 4–10)
- ✅ **Set up backend stack** — Node + TypeScript (Fastify) + Postgres + Redis in [backend/](../backend/). Drizzle ORM/migrations, zod env validation, `/health` + `/ready`, Docker Compose for local infra, graceful shutdown. Boots & typechecks clean.
- ✅ **Integrate Plaid Link SDK (server-side)** — `POST /plaid/link-token` + `POST /plaid/exchange` in [../backend/src/routes/plaid.ts](../backend/src/routes/plaid.ts). access_token encrypted at rest (AES-256-GCM), stored in `plaid_items`, never returned to client. Needs Plaid keys + `APP_ENCRYPTION_KEY` to go live.
- ✅ **Build account connection screen** — Expo/RN app in [../mobile/](../mobile/): [ConnectScreen](../mobile/src/screens/ConnectScreen.tsx) (bank grid + CTA + loading/success), Plaid native SDK wrapper, backend wiring. **Running on the iOS simulator** (dev build via Xcode 26.2).
- ✅ **Build parallel questionnaire UI** — backend `POST /onboarding/answers` (incremental upsert, money as integer cents) + `GET /onboarding/answers/:userId` in [../backend/src/routes/onboarding.ts](../backend/src/routes/onboarding.ts), **verified live**. Mobile [QuestionnaireScreen](../mobile/src/screens/QuestionnaireScreen.tsx) (debt → budget → goal, saves each immediately), wired after connect.
- ✅ **Fetch transactions via Plaid** — `transactionsSync` (cursor-based) in [../backend/src/plaid/transactions.ts](../backend/src/plaid/transactions.ts), stored in `transactions` table; fired in background on `/plaid/exchange` with retry; `GET /transactions/:userId/status` to poll. **Verified live (sandbox).**
- ✅ **Build transaction categorization layer** — Plaid PFC → internal buckets in [../backend/src/insights/categorize.ts](../backend/src/insights/categorize.ts); non-spend flows (transfers/loan payments/income) excluded from budget math.
- ✅ **Build APR cost calculator** — [../backend/src/insights/apr.ts](../backend/src/insights/apr.ts): monthly interest, realistic minimum payment (interest + 1% principal), two-scenario payoff projection. Default APR 24.99%.
- ✅ **Build real-world framing engine** — [../backend/src/insights/framing.ts](../backend/src/insights/framing.ts): "tanks of gas / months of Netflix / burritos" framing.
- ✅ **Build insight card UI** — [../mobile/src/screens/InsightsScreen.tsx](../mobile/src/screens/InsightsScreen.tsx): 3 cards (interest cost, biggest overspend vs budget, excess-interest framing) via `GET /onboarding/insights/:userId`.
- ✅ **Build payoff timeline chart** — [../mobile/src/components/PayoffChart.tsx](../mobile/src/components/PayoffChart.tsx): two-line current vs ClearSlate (react-native-gifted-charts; Recharts/Chart.js are web-only).
- ✅ **QA full onboarding end-to-end** — backend flow verified live in sandbox; mobile verified on simulator (connect → questionnaire → insights).

## Phase 2 — Rules engine & card (Weeks 8–16)

**Enforcement spine (backend): ✅ COMPLETE** — built & tested in [../backend/src/cards/](../backend/src/cards/), [../backend/src/money/](../backend/src/money/), [../backend/src/push/](../backend/src/push/). 15 vitest tests + k6 load test green; 5 new tables (auth_events, roundup_ledger, roundup_balances, roundup_transfers, device_tokens; migration 0005).

- ✅ **Rules data model** — reused `enforcement_rules`; compact per-user snapshot mirrored to Redis (`cs:v1:rules:{userId}`), write-through on rule save.
- ✅ **MCC block checker** — [../backend/src/cards/mcc.ts](../backend/src/cards/mcc.ts) MCC→bucket (shares the `Bucket` vocabulary, added `gambling`); block is a free in-process check on the snapshot, no Redis set needed.
- ✅ **Velocity tracker** — [../backend/src/cards/velocity.ts](../backend/src/cards/velocity.ts): atomic Lua check-and-increment, counter per `(user, bucket, YYYYMM)`, month-in-key + 63-day TTL so rollover needs no reset job. Proven no-overshoot under 50-way concurrency.
- ✅ **Marqeta JIT funding webhook (simulated)** — [../backend/src/routes/cards.ts](../backend/src/routes/cards.ts) `POST /cards/jit`: block → cap/velocity → approve/decline, Redis-only, **fail-open on Redis outage (signed off)**. `authorize()` engine in [../backend/src/cards/engine.ts](../backend/src/cards/engine.ts); idempotent on the JIT token. auth_events written via a batched queue, off the hot path.
- ✅ **Load test** — [../backend/loadtest/jit.k6.js](../backend/loadtest/jit.k6.js): **p99=35ms @ 2000 auth/s** (constant-arrival-rate; SLA <150ms). Open-loop ceiling ≈4700 rps/process (p99 tails at saturation — scale horizontally).
- ✅ **Round-up accumulator** — [../backend/src/money/roundup.ts](../backend/src/money/roundup.ts): accrues on the **settlement** sim (`POST /cards/clearing`, settled amount), audit-logged ledger + per-user pending balance, idempotent on settled txn id.
- ✅ **ACH batch job (end-of-month)** — [../backend/src/money/achSweep.ts](../backend/src/money/achSweep.ts) + `npm run job:ach-sweep`: one idempotent Unit ACH transfer per user/month (`sweep:{userId}:{YYYYMM}`). ⚠️ Per user red flag: monthly, not nightly.
- ✅ **Decline push** — [../backend/src/push/expo.ts](../backend/src/push/expo.ts) Expo send + `POST /devices/register`; stub-safe (no device → no-op) until the mobile registers tokens.

**Remaining (mobile + real card path):**
- ✅ Rules UI — onboarding [RulesScreen](../mobile/src/screens/RulesScreen.tsx) (activate) + post-onboarding [ManageRulesScreen](../mobile/src/screens/ManageRulesScreen.tsx) (view/edit cap, toggle block & round-up, save in place; reachable from Done). Shared [RuleCard](../mobile/src/components/RuleCard.tsx).
- ✅ Rules builder UI — spend cap / hard block / round-up via the shared [RulesEditor](../mobile/src/components/RulesEditor.tsx) Allow/Cap/Block matrix (round-up on by default).
- ✅ Rules builder UI — save X — `save_daily` rule + object scroller in `RulesEditor`, **Step-1 gated** (server-enforced); daily accrual via `npm run job:save-daily` into the round-up balance.
- ✅ Build budget bar UI — `BudgetBar` fed by month-to-date `GET /budget` (updates as Plaid webhooks land), refetched on Rules-tab focus.
- ✅ Real auth/users table — `users` + email/password + JWT access/refresh (`backend/src/auth/`, `routes/auth.ts`); `app.authenticate` guard; **user routes derive userId from the token (IDOR closed)**; mobile login/signup + secure-store tokens; `demo-user` removed. The `card_accounts` mapping also decouples our userId from Marqeta tokens.
- ⬜ ACH destination plumbing (`unit_accounts`/counterparty) so the sweep moves real money.
- 🟡 Swap simulated JIT for the real Marqeta webhook — **code complete**: inbound Basic-auth verify ([routes/cards.ts](../backend/src/routes/cards.ts) `verifyJitAuth`) + userId resolved from the cardholder token via `card_accounts` mapping (Redis-cached, cold-rebuild) in [cards/cardUserCache.ts](../backend/src/cards/cardUserCache.ts). Gated by `MARQETA_WEBHOOK_USER/SECRET` so the sim path + load profile are unchanged. **Blocked on**: enabling the program *gateway* funding source (`always_fund:false`) on the card product + exposing the backend on a public URL (tunnel) for the true end-to-end JIT test.
- 🟡 Build real card issuance flow — **code complete + auth verified**: [marqeta/client.ts](../backend/src/marqeta/client.ts) + [cards/issue.ts](../backend/src/cards/issue.ts) (cardholder + virtual card, mapping persisted to `card_accounts` + cached) → `POST /cards/issue`. **Blocked on**: the Marqeta sandbox account — the card product has no provisioned card range (issue returns `500002`) and the access token 403s on write endpoints; needs card-issuing enabled + a write-capable token. Unit KYC gating still to add (see below). Marqeta auth + cardholder reads confirmed live.
- ❌ Unit KYC + ACH (sandbox card+ACH test, ACH destination plumbing) — **blocked: the `UNIT_TOKEN` in `.env` returns 401 (invalid/expired)**. Regenerate a Unit sandbox API token to proceed.
- 🟡 QA full card enforcement flow — **backend verified** (set rule → declined txn → counter/audit, idempotency, concurrency, push stubbed; + card→user mapping resolution tested); pending the two external unblocks above + mobile for true end-to-end.

**Platform & growth pass: ✅ COMPLETE (code + tests; 54 vitest green).**
- ✅ **Plaid webhooks** — `POST /plaid/webhook` ([routes/plaidWebhook.ts](../backend/src/routes/plaidWebhook.ts)), JWT-verified ([plaid/webhookVerify.ts](../backend/src/plaid/webhookVerify.ts)); drives transactions/liabilities/recurring refresh + step re-eval. Webhook URL set on link-token from `PLAID_WEBHOOK_URL`. *(live delivery needs a public tunnel.)*
- ✅ **Subscriptions** — Plaid Recurring ([plaid/recurring.ts](../backend/src/plaid/recurring.ts)) → `recurring_subscriptions` + `GET /subscriptions`; mobile **Subs tab** with monthly total + guide-to-cancel.
- ✅ **Debt mirror** — per-account `debt_account_snapshots` → `GET /debt-mirror` deltas ([insights/debtMirror.ts](../backend/src/insights/debtMirror.ts)); mobile `DebtMirror` card on Progress.
- ✅ **Accountability partner (SMS)** — `accountability_partners` + stub-safe [sms/twilio.ts](../backend/src/sms/twilio.ts); texts the partner on declines + step completions; mobile `PartnerCard` in the Rules tab. *(live texts need `TWILIO_*`.)*

## Phase 3 — Gamification & progress (Weeks 14–20)

**Step engine (backend): ✅ COMPLETE** — [../backend/src/steps/](../backend/src/steps/) (catalog, metrics, engine, notify, advice) + [../backend/src/routes/steps.ts](../backend/src/routes/steps.ts). Tables `user_steps` + `debt_profiles` (migrations 0006/0007). Step *definitions* live in code (logic-bearing config); only per-user completion is persisted. (Suite now at 54 vitest tests, green.)

- ✅ Design step data model — `user_steps` (per-user completion; composite PK = idempotent) + step defs in `steps/catalog.ts` (5 canonical steps + criteria: `auto_budget` / `auto_debt` / `manual`).
- ✅ Build step evaluation engine — [../backend/src/steps/engine.ts](../backend/src/steps/engine.ts): cascading prefix-completion + read-repair, manual self-attest with ordering guards, idempotent. Fires on meaningful events: rule save ([rules.ts](../backend/src/routes/rules.ts)) + Plaid data sync ([plaid.ts](../backend/src/routes/plaid.ts)), off the response path.
- ✅ Build step ladder UI (5 steps vertical; done/current/locked) — mobile [StepLadder](../mobile/src/components/StepLadder.tsx), rendered in the Progress tab; current-step progress bar + tip; manual-step self-attest button.
- ✅ Build level-up celebration — in-app [CelebrationModal](../mobile/src/components/StepLadder.tsx) on attest completion (no confetti dep). Backend also pushes a level-up on background completion.
- ✅ Build step progress push notifications (50% & 80%) + level-up push — [../backend/src/push/expo.ts](../backend/src/push/expo.ts) `sendStepProgressPush` / `sendStepCompletePush`, deduped per milestone (Redis NX); orchestrated in [steps/notify.ts](../backend/src/steps/notify.ts). *(Evening-timing scheduling still TODO; delivery still needs real device tokens — same gate as decline push.)*
- ✅ Build loading-screen advice surface — [../backend/src/steps/advice.ts](../backend/src/steps/advice.ts) (tips + success story per step) via `GET /steps/:userId/advice`; surfaced as the current-step tip in `StepLadder`.
- ⬜ Recruit beta users + soft launch (~50 via UT Austin personal finance club, r/personalfinance, Twitter; instrument with Mixpanel/PostHog — step completion, 7-day retention, card usage, rules/user). (~$15–25 Plaid for 50 accounts.)
- ⬜ Analyze beta data & iterate (where do users stall? which rules most set? do declines churn or engage?).

> **Resolved (2026-06-18): canonical step count is 5** (matches the brief's plan in [product-vision.md](product-vision.md#L33-L38)). The data model's earlier "6" is superseded. The 5 steps: (1) Stop the bleeding — +$200/mo income, (2) $500 emergency fund, (3) Debt Snowball, (4) 3–6 months of expenses, (5) Invest.
