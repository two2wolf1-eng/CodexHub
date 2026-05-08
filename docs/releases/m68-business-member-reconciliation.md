# M68 Business Member Reconciliation

## Summary

M68 adds metadata-only Business member reconciliation between owner roster snapshots and profile workspace observations. It blocks Codex dispatch when a profile is in a personal workspace, not in the Business roster, logged out, mismatched, or unknown.

Workspace switch handling is recorded only as approval-gated dry-run metadata. This round does not connect to Chrome, click the UI, read credentials, or execute Codex dispatch.

## GSD Spec

- Goal: make Business membership and workspace readiness explicit before real Codex task dispatch.
- Scope: contracts, business-quota-kernel, store repositories, Supervisor projections, scaffold registration, docs.
- Non-scope: real browser profile observation, real workspace switching, generic click/type/CDP execution, privileged cleartext store, and admin writes.
- Risk: high.
- Acceptance: focused tests, scaffold health, audits, and foundation verification pass.

## Changes

- Added profile workspace observation, workspace switch dry-run/run, and member reconciliation report contracts.
- Added `createBusinessMemberReconciliationBundle` for hash-only reconciliation from owner roster metadata.
- Added SQLite repositories for profile workspace observations, workspace switch dry-runs/runs, and reconciliation reports.
- Added Supervisor projections under `/api/business-quota/reconciliations` and `/api/business-quota/workspace-switches`.

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
