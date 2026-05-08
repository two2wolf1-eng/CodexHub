# M63 Real Read-Only And Governed UI Automation

## GSD Spec

- Goal: enable stronger automation paths inside the compliance baseline for Business quota observation and Codex Desktop renderer control metadata.
- Scope: `@codexhub/ui-automation-kernel`, `chatgpt-business-adapter`, `electron-cdp-adapter`, scaffold/audit registration, and focused tests.
- Non-scope: no credential, session, cookie, storage, MFA, password, raw DOM/body/path/account/email/diff/prompt persistence; no login bypass; no unreviewed live UI execution.
- Acceptance: focused tests/build/lint pass for the new kernel and touched adapters; foundation audits continue to pass.
- Hard boundaries: adapters do not grant authority. UI actions require dry-run, policy/approval where required, evidence, and audit. Forbidden credential actions remain blocked even with an approval seed.
- Affected projects: `packages/ui-automation-kernel`, `packages/chatgpt-business-adapter`, `packages/electron-cdp-adapter`, `packages/contracts`, `tools`.
- Risk: high, because this expands automation language and action planning.

## Changes

- Added `@codexhub/ui-automation-kernel` with intent planning, action risk classification, dry-run creation, authority application, and run summarization.
- Extended Business quota adapter with governed read-only quota source plans, DOM/AX metadata observation, and pre-redacted export parsing.
- Extended Electron CDP adapter with Codex Desktop renderer observation and renderer-only UI automation boundary projections.
- Kept execution disabled by default at the adapter layer: all outputs are metadata-only hashes, counts, statuses, evidence refs, and audit ids.

## Verification

- `pnpm nx test ui-automation-kernel`
- `pnpm nx build ui-automation-kernel`
- `pnpm nx lint ui-automation-kernel`
- `pnpm nx test chatgpt-business-adapter`
- `pnpm nx build chatgpt-business-adapter`
- `pnpm nx lint chatgpt-business-adapter`
- `pnpm nx test electron-cdp-adapter`
- `pnpm nx build electron-cdp-adapter`
- `pnpm nx lint electron-cdp-adapter`
