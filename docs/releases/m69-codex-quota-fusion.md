# M69 Codex Quota Fusion

## Summary

M69 adds metadata-only Codex quota fusion across owner admin billing, Business member reconciliation, App Server quota snapshots, quota source health, and canary state. The result is a workspace-level and account-level dispatch readiness projection that blocks real Codex dispatch on quota exhaustion, quota limits, missing Codex seats, workspace mismatch, source conflict, and canary failure.

This round does not connect to Chrome, call the Codex App Server, click the UI, or execute dispatch. It only fuses existing governed metadata and request-provided hashable fixture metadata.

## GSD Spec

- Goal: make Codex dispatch eligibility depend on fused Business seat, workspace, quota, and canary metadata.
- Scope: contracts, business-quota-kernel, store repositories, Supervisor projections, scaffold registration, docs.
- Non-scope: live Codex dispatch, real App Server calls, browser/CDP execution, privileged cleartext store, and admin writes.
- Risk: high.
- Acceptance: focused tests, scaffold health, audits, and foundation verification pass.

## Changes

- Added workspace readiness, account readiness, and quota fusion report contracts.
- Added `createCodexQuotaFusionBundle` for hash-only quota fusion.
- Added SQLite repositories for workspace readiness, account readiness, and fusion reports.
- Added Supervisor projections under `/api/business-quota/quota-fusion` and `/api/business-quota/quota-fusions`.

## Verification

Run before closeout:

- `pnpm nx run contracts:test --skip-nx-cache`
- `pnpm nx run business-quota-kernel:test --skip-nx-cache`
- `pnpm nx run store-sqlite:test --skip-nx-cache`
- `pnpm nx run supervisor:test --skip-nx-cache`
- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
