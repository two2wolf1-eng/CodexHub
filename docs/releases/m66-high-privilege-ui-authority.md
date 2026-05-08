# M66 High-Privilege UI Authority

## Summary

M66 adds the governance shell for high-privilege Business admin UI actions. It introduces metadata-only contracts, store records, kernel planning helpers, and Supervisor routes for admin UI dry-runs, approval requests, authority resolution, run projections, and post-write verification placeholders.

This round does not execute real browser/CDP actions. All M66 run projections keep `processBoundaryInvoked=false`, `externalProcessStarted=false`, and `executionDisabled=true`.

## GSD Spec

- Goal: prepare a governed authority model for future Business admin writes such as invites, removals, role changes, seat changes, credit changes, and usage alerts.
- Scope: `packages/contracts`, `packages/ui-automation-kernel`, `packages/store-core`, `packages/store-sqlite`, `apps/supervisor`, scaffold registration, orchestration/integrations, release docs.
- Non-scope: real CDP execution, generic click/type automation, credential entry, cookie/session/token/storage reads, privileged business cleartext storage, and live admin writes.
- Risk: critical, because this is the control-plane shape for future admin writes.
- Acceptance: focused contracts/kernel/store/supervisor tests plus foundation audits pass.

## Changes

- Added `AdminUiActionKind`, `AdminWriteIntent`, `AdminWriteDryRunPlan`, `AdminWriteAuthority`, `AdminWriteRun`, and `UiTargetFingerprint`.
- Extended UI action classes with `read_click`, `guided_prepare_write`, `approved_admin_write`, and `critical_payment_write`.
- Added metadata-only SQLite repositories for UI target fingerprints and admin write records.
- Added `/api/business-quota/admin-ui/*` Supervisor route family for governed projections.
- Registered M66 docs and contracts in scaffold health.

## Boundaries

- Request-body approval artifacts and authorities remain untrusted.
- Raw selector, DOM, script, payload, patch, path, token, cookie, session, storage, and credential material are rejected.
- No real browser, Chrome profile, Electron, CDP, network, or external process boundary is invoked in M66.

## Verification

Run before closeout:

- `pnpm nx run contracts:test --skip-nx-cache`
- `pnpm nx run ui-automation-kernel:test --skip-nx-cache`
- `pnpm nx run store-sqlite:test --skip-nx-cache`
- `pnpm nx run supervisor:test --skip-nx-cache`
- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`
