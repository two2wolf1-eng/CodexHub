# M47-D8 Approval Consumption Semantics Debug

## Summary

M47-D8 deepened approval consumption coverage for representative remote write
control planes. The round did not add product capability, routes, providers,
store repositories, live boundaries, or remote writes.

## Scope

- `apps/supervisor`
- `.codexhub/orchestration.yaml`
- `tools/scaffold-health.ts`
- M47-D8 release/review documentation

## Findings

- No early approval consumption defect was found.
- Existing deployment, M44 policy/telemetry, M45 controlled write, and production
  recovery tests already covered several approval and boundary cases.
- GitHub PR management had fixed-endpoint success coverage; D8 added an explicit
  failed-boundary approval consumption regression for that family.

## Fixes And Hardening

- Added a GitHub PR labels failure-injection test that proves:
  - hash mismatch blocks before network boundary and preserves approved state
  - no network request is made before the boundary block is resolved
  - a failed GitHub write boundary records `networkBoundaryInvoked=true`
  - the approval is consumed exactly once after the boundary attempt
  - reused approval attempts are blocked before another network boundary
- Registered D8 in orchestration and scaffold health.

## Verification

- `pnpm nx run supervisor:test --skip-nx-cache`

## Residual Risk

- D8 exercises representative approval semantics for late-stage families. D9
  should continue into fixed GitHub boundary drift and arbitrary endpoint
  passthrough checks.
