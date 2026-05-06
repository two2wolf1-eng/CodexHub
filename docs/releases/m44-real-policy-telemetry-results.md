# M44 Real Policy And Telemetry Results

## Summary

M44 adds governed real policy backend and telemetry export integration while keeping CodexHub governance authoritative.

- OPA and Cedar are registered as advisory policy backends in `local-cli` and `loopback-http` modes.
- `security-kernel` remains the final authority; backend allow/deny results cannot grant or revoke execution authority.
- Telemetry supports local in-memory summaries and an OTLP HTTP exporter path behind an explicit runtime gate.
- Telemetry is evidence-adjacent only; it does not replace Evidence or Audit records.

## Delivered Surface

- Contracts: real policy backend readiness, plans, approvals, runs, advisory summaries, telemetry manifests, export plans, runs, and rehearsals.
- Runtime boundaries: fixed policy CLI/loopback HTTP boundary and fixed telemetry exporter boundary.
- Supervisor: `/api/policy-backends/evaluations/*` and `/api/telemetry/exports/*`.
- Dashboard: `#/policy-telemetry` with guided, allowlisted POST operations and memory-only local-control token handling.
- CLI: read-only list/show commands for policy evaluations and telemetry exports.

## Verification

- Focused contracts, adapter, Supervisor, Dashboard, CLI, and store builds/tests were run during the round.
- `pnpm audit:no-live-automation` was updated and passed with the reviewed M44 boundaries.
- Full foundation gates are required before the M44/M45 closeout commit.

## Residual Risk

- Live policy and network telemetry execution remain disabled by default.
- Loopback HTTP policy and telemetry exporters must remain hash-bound and cannot accept arbitrary endpoints.
- Policy backend decisions remain advisory and must not be treated as authority by future work.

