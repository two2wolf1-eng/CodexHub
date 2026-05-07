# M48c Production GA Control Plane

## Summary

M48c adds the Production GA Supervisor control plane at `/api/production-ga/*`. The new surface is metadata-only and aggregates existing GA readiness, training, rehearsal, threat model, and signoff records. It does not call child adapters or introduce a new live boundary.

## Changes

- Added guarded POST/GET routes for GA dry-runs, approval requests, manual approvals, signoffs, rehearsals, and training completions.
- Added read-only latest endpoints for the generated GA capability matrix and threat model.
- Enforced local-control token and trusted loopback Origin on every GA POST route.
- Rejected request-body authority, approval artifacts, child artifacts, raw E2E payloads, raw docs, paths, tokens, env values, request bodies, and response bodies.
- Required two store-resolved approved GA approvals with distinct approver hashes before signoff can proceed.

## Verification

- `pnpm nx run supervisor:test --skip-nx-cache`

## Skills Used And Why

- `gsd-spec-driver`: scoped GA signoff as governance aggregation only.
- `gstack-delivery-workflow`: kept implementation to the contracts-to-Supervisor subround.
- `superpowers-engineering-discipline`: preserved disabled defaults and metadata-only outputs.
- `codexhub-architecture-planner`: checked route and package boundaries.
- `codexhub-workflow-policy-reviewer`: checked token/origin gates, authority rejection, and double approval semantics.
- `codexhub-release-auditor`: recorded verification evidence.

## Skills Not Used And Why

- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, deployment runtime, and external agent runtime were not used because M48c only adds GA governance aggregation.
