# Sensitive content in this repo

Scanned at repo creation. **No API keys, tokens, or credentials are committed.**

Two documents contain business identity details and should keep this repo
**private**, or be redacted before any public push:

- `docs/business-and-legal.md` — EIN, filing address, partner status
- `docs/PASTE_HERE.md` — the original founder brief, same details

The v1 project pasted a live Unit API token into a shared doc. That token is
**not** in this repo, and nothing like it should ever be committed. Secrets live
in `.env.local` (gitignored) or a secret manager — never in code, never in docs.

**Known discrepancy:** the EIN appears as `42-2819082` here, but the v1
consolidated doc also lists `42-2678974`. One is wrong. Reconcile before it is
used on anything official.
