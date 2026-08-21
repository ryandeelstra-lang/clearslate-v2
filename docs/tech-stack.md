# Tech Stack & Architecture

## Backend (decided)
- **Node + TypeScript (Fastify)** + **Postgres** (persistent data) + **Redis** (cache user rules, velocity counters). **Drizzle ORM** for schema/migrations, **zod** for env validation. Local infra via **Docker Compose**.
- Chosen over Python (FastAPI) for first-class Plaid/Unit/Marqeta SDKs and a single language shared with the React Native frontend.
- Deploy on **Railway or Render** to keep ops overhead near zero early. (~$0 free tier → $5–20/mo live.)

## Integrations (all gate on Phase 0)
> Live per-unit costs and sandbox/apply status are tracked in [business-and-legal.md](business-and-legal.md) — not repeated here.

- **Plaid** — account connection, 12-month transaction history, balances. Use Plaid **Link SDK** in frontend → `public_token` → exchange server-side for `access_token`. Use `/transactions/get` with 12-month lookback; store raw transactions in Postgres.
- **Unit** — Banking-as-a-Service (BaaS): KYC, account creation, ACH transfers, Reg E dispute templates.
- **Marqeta** — card issuing + JIT funding authorization webhook.

## Performance-critical path: card authorization
**Marqeta JIT funding webhook** — receives auth request, must respond in **< 150ms**:
1. Get user rules from **Redis** (not Postgres).
2. Check MCC block list.
3. Check velocity vs cap.
4. Return approve/decline JSON.

- **MCC block checker**: MCC → boolean in **< 5ms**; load blocked MCCs into Redis on rule creation; read only from Redis in the webhook path.
- **Velocity tracker**: Redis counter per `(user, bucket, YYYYMM)`; atomic Lua check-and-increment on each approved txn; compare to cap. The month lives **in the key** with a 63-day TTL, so rollover needs no reset job.
- **Load test** with k6 — confirm **p99 < 150ms**. *Met and exceeded:* **p99=35ms @ 2000 auth/s** (see [roadmap.md](roadmap.md) Phase 2). Bottleneck is almost always a DB call that should be a Redis read.

## Data models (initial)
- **rules**: `user_id, rule_type (cap/block/roundup), mcc_codes[], limit_amount, spent_amount, reset_date, is_active`. Index on `(user_id, is_active)` for fast webhook lookups.
  - **As built (deliberate divergence):** the `enforcement_rules` table stores only the *intent* — `type`, `category` (internal bucket), `cap_cents`, `enabled`. It intentionally **omits `spent_amount` and `reset_date`**: spend-to-date and the billing-month reset live in Redis velocity counters keyed by `(user, bucket, YYYYMM)` with a 63-day TTL, because the auth hot path reads only from Redis (never Postgres) to hit the <150ms budget. Persisting spend in Postgres too would create a second source of truth to keep consistent with the counters. `mcc_codes[]` is also not stored per-rule — MCC→bucket mapping is centralized in `backend/src/cards/mcc.ts`, and rules target the resulting `category`.
- **steps**: `step_id, name, description, criteria_type, criteria_value`.
- **user_steps**: `user_id, step_id, completed_at`.
- Plus: raw Plaid transactions, round-up pending balances, categorization buckets.

## Background services
- **Round-up accumulator**: accrues at **settlement** (the settled amount, not auth), `ceil(amount) - amount` → user's pending balance; logs each contribution (`roundup_ledger` audit trail + `roundup_balances`).
- **ACH batch job**: transfer of accumulated round-ups via Unit. ⚠️ Per-transfer ACH fee (~$0.25–1.00) can exceed the round-up amount, so nightly is uneconomical — **decided + built as one end-of-month batch per user** (`achSweep.ts`, `npm run job:ach-sweep`, idempotent). Status/details in [roadmap.md](roadmap.md).
- **Step evaluation engine**: runs on meaningful events (rule saved, Plaid data synced); marks steps complete + triggers celebration.

## Other tooling
- Charts: **react-native-gifted-charts** (mobile). Chart.js/Recharts are web-only — not used in the RN app.
- Push: **Expo** (push notifications).
- Analytics: **Mixpanel or PostHog** (choice still open).
- Categorization: Plaid categories augmented with custom MCC mappings.

## Secrets
All API keys live in an **env folder / env vars** — never in code or git. See [business-and-legal.md](business-and-legal.md) for sensitive entity data handling.
