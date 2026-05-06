# M47-D13 Policy Telemetry Advisory Boundary Debug

## Summary

M47-D13 hardened real policy backend and telemetry exporter boundary
regression coverage. The round did not add product capability, routes,
providers, store repositories, live boundaries, remote writes, pushes, or pull
requests.

## Scope

- `packages/policy-backend-adapter`
- `packages/otel-adapter`
- `.codexhub/orchestration.yaml`
- `tools/scaffold-health.ts`
- M47-D13 release/review documentation

## Findings

- No policy authority transfer defect was found. OPA/Cedar outcomes remain
  advisory and `security-kernel` remains the final authority.
- No telemetry authority defect was found. Telemetry remains non-authoritative
  and does not replace Evidence or Audit.
- Real policy process/HTTP operations are isolated to the reviewed policy
  boundary file.
- Real telemetry network export is isolated to the reviewed telemetry boundary
  file and remains loopback/hash-bound.

## Fixes And Hardening

- Added policy source guards proving child-process, HTTP, and environment access
  stay out of non-boundary files.
- Added policy boundary guards for fixed OPA/Cedar CLI shapes, loopback HTTP,
  fixed endpoint paths, and advisory-only metadata.
- Added telemetry source guards proving network exporter and OpenTelemetry
  import drift stays out of non-boundary files.
- Added telemetry boundary tests for endpoint hash mismatch, non-loopback
  blocking, loopback network export, metadata-only output, and
  non-authoritative evidence/audit flags.
- Registered D13 in orchestration and scaffold health.

## Verification

- `pnpm nx run policy-backend-adapter:test --skip-nx-cache`
- `pnpm nx run otel-adapter:test --skip-nx-cache`

## Residual Risk

- D13 is package-level policy/telemetry boundary hardening. D14 should continue
  into Dashboard mutation surface allowlists and degraded-safe behavior.
