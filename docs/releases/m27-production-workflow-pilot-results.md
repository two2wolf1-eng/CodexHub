# M27 Production Workflow Pilot Results

## Scope

M27 adds a production workflow pilot layer for catalog-backed templates. The pilot remains metadata-only: it coordinates existing child control-plane records by id/hash and never creates child approvals, calls child adapters, or widens a live boundary.

## Implemented

- Added production workflow pilot contracts for plan, readiness, step, run, and evidence summary.
- Added local pilot support for `local-patch-review`.
- Added remote pilot support for `github-draft-pr-chain`.
- Added read-only CLI and Dashboard summaries for pilot list/show/rehearsal.
- Registered M27 governance docs, orchestration metadata, and scaffold health requirements.

## Safety Outcome

- Dashboard and CLI remain read-only for pilot execution.
- Production workflow approval does not grant child authority.
- Missing, failed, stale, or hash-mismatched child records block later steps.
- No push, merge, update-ref, force, labels, reviewers, comments, Browser act, Electron main inspector, MCP write tool, policy runtime, or telemetry exporter was added.

## Verification

- `pnpm nx run contracts:test --skip-nx-cache`
- `pnpm nx run workflow-kernel:test --skip-nx-cache`
- `pnpm nx run cli:test --skip-nx-cache`
- `pnpm nx run dashboard:test --skip-nx-cache`
- Focused lint/build for contracts, workflow-kernel, CLI, and Dashboard.

## Residual Risk

M27 proves operator-facing pilot coordination, not live production enablement. Real custom workflow runs continue to use the existing Supervisor custom workflow control plane and require persisted workflow approval plus independently governed child records.
