# M0-M24 Governance Fuzz Hardening Review

## Scope

M24.10 reviewed the remaining trust seams in the M0-M24 baseline:

- cross-layer public projection serialization
- late-stage approval and authority handling
- audit-script false-negative coverage
- Dashboard, CLI, and MCP read-only drift
- custom workflow child-capability isolation

No route, provider, store repository, live boundary, remote write path, Browser act, Electron main inspector, MCP write tool, policy runtime, or telemetry exporter was added.

## Findings And Fixes

- Custom workflow JSON template `name`, `description`, step `name`, and step `summary` could carry caller-provided text into public metadata projections. The loader now emits deterministic metadata-only template and step summaries; raw template prose is represented only by hashes/counts.
- Custom workflow approval `reasonSummary` now uses a fixed hash-only summary when a reason is supplied, preventing raw operator text from becoming public output.
- A shared adversarial public-output fixture was added for representative projection tests across governance, readiness, GitHub, review packages, release candidates, approval history, workflows, Dashboard, and CLI.
- `audit:no-live-automation` now includes stronger in-memory negative sentinels for indirect adapter execute imports, browser token persistence aliases, MCP dynamic env reads, indirect fetch usage, and forbidden GitHub mutation payloads/endpoints.

## Invariants Rechecked

- Public outputs remain metadata-only: ids, hashes, counts, statuses, summaries, evidence refs, audit ids, and boundary booleans.
- Request-body approval artifacts and execution authority objects remain untrusted.
- Dashboard and CLI read-only surfaces do not persist local-control tokens or directly call adapter execute helpers.
- MCP production source remains read-only and free of process/network/provider-token boundaries.
- Existing live-boundary allowlists were not expanded.

## Residual Risk

This round improves regression resistance, but it does not prove every possible serializer path with generated fuzz data. Future M25+ production automation should keep adding representative adversarial fixtures whenever a new public projection or control plane is introduced.
