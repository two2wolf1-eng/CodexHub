# M47-D17 Rehearsal Matrix Debug

## Summary

M47-D17 hardened late-stage rehearsal scenario coverage for M40-M47. The
round added no product capability, routes, providers, store repositories, live
boundaries, remote writes, pushes, or pull requests.

## Scope

- `packages/contracts`
- `.codexhub/orchestration.yaml`
- `tools/scaffold-health.ts`
- M47-D17 release/review documentation

## Findings

- The existing M40-M47 rehearsal scenario enums already contained the planned
  all-pass, blocked, failed, timeout, hash-mismatch, approval-blocked, and
  raw-output rejection scenarios.
- No contract value had to be added or changed.
- No runtime rehearsal runner, provider adapter, or Supervisor route was
  modified.

## Fixes And Hardening

- Added a table-driven contracts regression test that pins required rehearsal
  scenario matrices for release lifecycle, deployment observation, deployment
  operations, secrets governance, policy backend, telemetry, controlled write,
  runtime scheduler, external agents, and platform operations.
- Registered D17 in orchestration and scaffold health.

## Verification

- `pnpm nx run contracts:test --skip-nx-cache`

## Residual Risk

- D17 proves scenario registration coverage. D18 should continue into
  Dashboard and operator degraded-state smoke coverage.
