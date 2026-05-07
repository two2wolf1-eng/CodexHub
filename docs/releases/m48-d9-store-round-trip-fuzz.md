# M48-D9 Store Round-Trip Fuzz

## Summary

M48-D9 deepened the post-GA debug chain into SQLite save/list/get behavior. The round adds focused store tests and registration only; it does not add product capability, providers, routes, store repositories, live boundaries, or runtime execution.

## GSD Spec

- Goal: verify representative store repositories preserve metadata-only runtime and external-agent records across save, list, and direct get paths.
- Scope: `packages/store-sqlite`, D9 release/review docs, scaffold health, and orchestration registration.
- Non-scope: no schema, public API, route, provider, adapter, live smoke, remote write, push, or pull request.
- Acceptance: `store-sqlite:test` passes and closeout gates remain green.
- Risk: critical because SQLite is the durable governance record layer for approvals, evidence, audit, runtime queue state, and external-agent patch summaries.

## Debug Work

- Extended runtime/external-agent SQLite round-trip coverage so each saved record is also read through direct `get*` repository methods.
- Covered runtime job plans, queue entries, leases, locks, checkpoints, job runs, external-agent dry-runs, approvals, runs, and patch summaries.
- Confirmed direct `get*` records and `list*` records preserve status, hash-bound fields, boundary booleans, approval state, controlled worktree flags, and metadata-only raw flags.
- Retained the adversarial public-output fixture through the saved input path and verified it does not appear after store round-trip.

## Verification

- `pnpm nx run store-sqlite:test --skip-nx-cache`

## Residual Risk

D9 focuses on durable store round-trip semantics. D10-D12 should next validate Supervisor route coverage, authority gates, and approval consumption around those records.

## Skills

- Workflow Skills Used and Why: `gsd-spec-driver` for bounded D9 scope, `gstack-delivery-workflow` for Plan/Build/Review/QA/Ship sequencing, `superpowers-engineering-discipline` for small store-focused hardening.
- Project Skills Used and Why: `codexhub-architecture-planner` for repository boundary scope, `codexhub-workflow-policy-reviewer` for metadata/evidence/audit invariants, `codexhub-release-auditor` for verification closeout.
- Skills Not Used and Why: Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, deployment runtime, external agent runtime, Codex exec runtime, and `codexhub-contract-designer` were not used because D9 does not change schemas or runtime surfaces.
