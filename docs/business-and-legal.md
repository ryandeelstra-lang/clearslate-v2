# Business & Legal

> ⚠️ **Sensitive.** Contains entity identifiers (EIN, registered address). Do **not** commit this file to a public repo or paste its contents into external services. Keep in `.gitignore` if the repo is ever pushed publicly.

## Entity
- **Name:** ClearSlate LLC
- **State:** Texas
- **Registered address:** 13201 Coleto Creek Trail
- **Filed under:** Ryan Deelstra
- **EIN:** 42-2819082 (obtained from IRS — complete)

## Banking
- **Business bank account:** ⬜ to open — Mercury or Relay (startup-friendly, no minimums, free ACH). Required before BaaS goes live.

## Partner status & costs
| Partner | Purpose | Status | Cost (live) |
|---|---|---|---|
| **Plaid** | Account linking, transactions | ✅ Done (sandbox) | ~$0.30–0.50 / connected account / mo |
| **Unit** | BaaS — KYC, accounts, ACH | ✅ Sandbox complete | ~$0.25–0.50 / active account / mo |
| **Marqeta** | Card issuing + JIT auth | ⬜ Apply | ~$0.006–0.01 / auth + interchange share |

## Compliance (all ✅ done unless noted)
- ✅ **Privacy Policy & Terms** — covers Plaid data use, storage, and user data-deletion rights. (Termly base $0, or lawyer $500–2,000.)
- ✅ **Reg E dispute flow** — federally required; handle disputed card txns within set timeframes. Unit template customized & documented.
- ✅ **Sandbox KYC test** — create customer → identity verification → compliant account.
- ⬜ **Sandbox card + ACH test** — full money-flow validation before UI.
- **Physical cards** (later): ~$3–5 per card. Virtual cards: $0.

## Cost summary (early stage)
- Apps to Unit / Marqeta / Plaid: $0 each.
- Infra: ~$0 free tier → $5–20/mo once live.
- Beta (~50 users): ~$15–25 Plaid; analytics on free tiers.
