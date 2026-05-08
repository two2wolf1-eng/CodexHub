# M65 Business Quota Canary And Hardening

## GSD Spec

- Goal: make Business quota automation production-gated by account, quota, login, workspace, Business page DOM, Electron renderer, selector drift, redaction drift, App Server, and Desktop health canaries.
- Scope: production readiness canary/drift normalization, Supervisor tests, scaffold docs, and final verification.
- Non-scope: no live GitHub write, no credential/session/storage read, no raw DOM/network body persistence, no automatic login/MFA/switch-account execution.
- Acceptance: focused Supervisor and production readiness tests pass, static audits pass, and `pnpm verify:foundation` passes.
- Hard boundaries: canary failure, selector drift, desktop drift, App Server drift, or redaction failure blocks high-risk live dispatch.
- Affected projects: `apps/supervisor`, `packages/contracts`, `packages/production-ga-kernel`, `tools`, `docs`.
- Risk: high, because this gate controls live-dispatch eligibility.

## Changes

- Added production readiness recognition for `workspace`, `business-page-dom`, and `electron-renderer` canaries.
- Added production readiness recognition for `selector` and `redaction` drift gates.
- Added Supervisor coverage proving Business DOM and Electron renderer canaries feed the same metadata-only production gate.
- Preserved audit export as manifest/hash/count/status/evidence/audit metadata only.

## Verification

- `pnpm nx test supervisor`
- `pnpm nx test production-ga-kernel`
- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
