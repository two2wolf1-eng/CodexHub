# M47-D18 Operator Degraded-State Debug

## Summary

M47-D18 hardened Dashboard operator smoke coverage for degraded-state routes.
The round added no product capability, routes, providers, store repositories,
live boundaries, remote writes, pushes, or pull requests.

## Scope

- `apps/dashboard`
- `.codexhub/orchestration.yaml`
- `tools/scaffold-health.ts`
- M47-D18 release/review documentation

## Findings

- The key operator hash routes were already registered.
- Existing degraded-state summaries were metadata-only.
- The missing regression net was a direct check that each smoke hash route is
  backed by a concrete Dashboard panel in `App.tsx`.

## Fixes And Hardening

- Added a Dashboard test that pins the degraded-safe operator smoke route set:
  governance, readiness, GitHub, workflows, deployments, secrets,
  policy-telemetry, runtime, and operations.
- The test verifies each route maps through hash routing, has a concrete first
  panel, records no POST attempt, records no adapter execution, and includes no
  persisted token state.
- Registered D18 in orchestration and scaffold health.

## Verification

- `pnpm nx run dashboard:test --skip-nx-cache`

## Residual Risk

- D18 is static Dashboard smoke hardening. D19 should deepen static audit
  negative fixtures so future unsafe helper patterns fail before review.
