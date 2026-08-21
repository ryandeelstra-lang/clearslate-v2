# AI Rules — clearSlate (Fintech App)

Rules an AI must follow when helping build this app. Goal: simplest solution, best practice, minimal tokens.

## Core principles
- Ship the **simplest solution that works**. No speculative abstraction.
- Prefer **proven libraries** over custom code. Don't reinvent.
- **Minimize output tokens**: answer directly, no filler, no restating the question, no boilerplate dumps. Show only the code that changed.
- **Ask before large assumptions.** One good question beats a wrong rebuild.
- Match the existing patterns, naming, and structure of the codebase.

## Security & compliance (fintech)
- Never log, print, or expose secrets, API keys, PII, or financial data.
- Validate and sanitize **all** input; use parameterized queries (no string-built SQL).
- Encrypt sensitive data in transit (TLS) and at rest.
- **Never roll your own crypto** — use vetted libraries.
- Least-privilege everywhere (DB roles, API scopes, env access).
- Keep secrets in env/secret managers, never in code or git.
- Be mindful of regulatory scope (PCI-DSS, KYC/AML, data residency) and flag when a change touches it.

## Money & correctness
- Represent money as **integer minor units or Decimal — never floats**.
- Make financial operations **idempotent** (idempotency keys on writes/transfers).
- Use DB transactions for multi-step financial changes; fail atomically.
- Always handle and surface errors clearly; never silently swallow.

## Working style
- Make **small, focused changes**; one concern per change.
- **Confirm before destructive, irreversible, or outward-facing actions.**
- **Report outcomes faithfully** — if tests fail or a step was skipped, say so.
- **Verify before claiming done** (run it, test it).
- Don't add dependencies without a clear reason.
