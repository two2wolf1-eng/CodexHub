# M48-D7 Contract Schema Fuzz

## Summary

M48-D7 deepened the post-GA contract fuzz net across late-stage governance schemas. The round adds tests and registration only; it does not add product capability, providers, routes, store repositories, live boundaries, or runtime behavior.

## GSD Spec

- Goal: prove representative M0-M48 contracts reject adversarial raw public metadata before later projection/store/debug rounds build on them.
- Scope: `packages/contracts`, D7 release/review docs, scaffold health registration, and orchestration registration.
- Non-scope: no Supervisor route, provider, store repository, adapter boundary, live smoke, remote write, push, or pull request.
- Acceptance: `contracts:test` passes, D7 docs are scaffold-registered, and closeout gates pass.
- Risk: critical because contracts are the shared public language for GA, recovery, runtime, controlled-write, external-agent, and platform-operation summaries.

## Debug Work

- Added a table-driven adversarial metadata test for representative late-stage schemas:
  - production workflow recovery run
  - Browser action plan
  - Electron main inspector plan
  - MCP write tool plan
  - runtime job plan
  - external agent patch plan
  - platform backup plan
  - Production GA E2E rehearsal run
- The fixture injects raw prompt, stdout, stderr, diff, path, URL, token, env value, release body, deploy payload, log, patch, DB row, and audit body examples through `metadata`.
- The test first proves each clean metadata-only fixture parses, then proves the same contract rejects the adversarial metadata payload.

## Verification

- `pnpm nx run contracts:test --skip-nx-cache`

## Residual Risk

D7 verifies contract schemas only. D8 should move the same adversarial pressure into kernel and public projection summaries.

## Skills

- Workflow Skills Used and Why: `gsd-spec-driver` for bounded D7 scope, `gstack-delivery-workflow` for Plan/Build/Review/QA/Ship sequencing, `superpowers-engineering-discipline` for tests-first hardening without capability expansion.
- Project Skills Used and Why: `codexhub-contract-designer` for schema fuzz coverage, `codexhub-architecture-planner` for package boundary scope, `codexhub-workflow-policy-reviewer` for metadata-only governance invariants, `codexhub-release-auditor` for closeout.
- Skills Not Used and Why: Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, deployment runtime, external agent runtime, and Codex exec runtime were not used because D7 is contract-only.
