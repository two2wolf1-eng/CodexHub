# M48-D8 Kernel Projection Fuzz

## Summary

M48-D8 moved the post-GA debug pass from schema rejection into kernel-generated public projections. The round adds focused tests and registration only; it does not add product capability, routes, providers, store repositories, live boundaries, or runtime execution.

## GSD Spec

- Goal: prove representative GA, governance projection, and operator readiness kernel summaries hash adversarial upstream data before public output.
- Scope: `production-ga-kernel`, `governance-projection-kernel`, `operator-readiness-kernel`, D8 docs, scaffold health, and orchestration registration.
- Non-scope: no Supervisor route, adapter call, store repository, live smoke, remote write, push, or pull request.
- Acceptance: focused kernel tests pass and closeout gates remain green.
- Risk: critical because these kernels aggregate signals from high-risk late-stage surfaces into operator-facing summaries.

## Debug Work

- Added a Production GA kernel test that feeds adversarial governance, readiness, workflow, runtime, and platform seeds into matrix, threat model, rehearsal, and evidence bundle creators, then verifies only hashes are exposed.
- Added a governance projection test that maps GitHub, workflow, policy, telemetry, and verification inputs containing adversarial ids/titles into hash-only projections.
- Added an operator readiness test that summarizes runtime/external-agent and platform-operation blockers while hashing config and local-control values.
- Confirmed the existing hash convention in `production-ga-kernel` is 64-character SHA-256 hex without a `sha256:` display prefix.

## Verification

- `pnpm nx run-many --target=test "--projects=production-ga-kernel,governance-projection-kernel,operator-readiness-kernel" --skip-nx-cache`

## Residual Risk

D8 does not exercise SQLite persistence or Supervisor serialization. D9 should move the same adversarial round-trip checks into store save/list/get paths.

## Skills

- Workflow Skills Used and Why: `gsd-spec-driver` for bounded D8 scope, `gstack-delivery-workflow` for Plan/Build/Review/QA/Ship sequencing, `superpowers-engineering-discipline` for tests-first hardening without scope creep.
- Project Skills Used and Why: `codexhub-architecture-planner` for kernel boundary scope, `codexhub-workflow-policy-reviewer` for metadata-only projection invariants, `codexhub-release-auditor` for verification closeout.
- Skills Not Used and Why: Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, deployment runtime, external agent runtime, Codex exec runtime, and `codexhub-contract-designer` were not used because D8 does not change runtime surfaces or schemas.
