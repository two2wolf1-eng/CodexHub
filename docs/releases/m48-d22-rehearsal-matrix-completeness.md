# M48-D22 Rehearsal Matrix Completeness

## GSD Spec

- Goal: deepen rehearsal matrix coverage so late-stage and GA acceptance scenarios keep success, blocked, approval, failure, timeout, hash-mismatch, and resume archetypes visible.
- Scope: `packages/contracts` tests, D22 release/review docs, scaffold health registration, and orchestration registration.
- Non-scope: no new schema, route, provider, store repository, live boundary, runtime behavior, real live smoke, remote write, push, or PR.
- Acceptance criteria: contracts focused tests pass; changed-project lint/build and closeout gates pass before commit.
- Hard boundaries: rehearsal coverage is fixture/metadata-only and must not add execution capability or live automation.
- Affected apps/packages: `packages/contracts`, `.codexhub/orchestration.yaml`, `tools/scaffold-health.ts`, release/review docs.
- Risk level: high, because rehearsal matrices are release safety evidence for high and critical control planes.

## GStack Plan

- Plan: read D21 residual risk and inspect existing scenario matrix tests.
- Build: extend matrix drift tests to include M48 GA and archetype-level coverage.
- Review: confirm no public schema or runtime behavior changed.
- QA: run contracts focused tests, lint/build, and foundation gates.
- Ship: register D22 docs and commit after clean verification.
- Retro: D23 should continue into degraded-state Dashboard UX smoke.

## Superpowers Checklist

- Keep D22 test-only and docs-only.
- Do not change scenario schemas unless a real schema defect is found.
- Prefer explicit coverage expectations over broad text scanning.
- Verify with focused and foundation gates.

## Changes

- Added M48 Production GA E2E scenarios to the late-stage matrix drift guard.
- Added an archetype-level regression checking representative M40-M48 rehearsal matrices for success, blocked, approval, failure, timeout, hash-mismatch, and resume coverage where applicable.
- Corrected the D22 test expectation to match the existing schema spelling `pr-blocked`.

## Verification

- `pnpm nx run contracts:test --skip-nx-cache` failed first on the test expectation spelling mismatch.
- `pnpm nx run contracts:test --skip-nx-cache` passed after aligning the test with the existing schema.

## Workflow Skills Used And Why

- `gsd-spec-driver`: framed D22 goal, scope, non-scope, acceptance, and rehearsal boundaries.
- `gstack-delivery-workflow`: kept the round in Plan/Build/Review/QA/Ship order.
- `superpowers-engineering-discipline`: kept the change focused on regression coverage.

## Project Skills Used And Why

- `codexhub-architecture-planner`: confirmed no runtime or route surface was introduced.
- `codexhub-contract-designer`: reviewed the contracts test change and confirmed no schema/API change was needed.
- `codexhub-workflow-policy-reviewer`: reviewed rehearsal coverage for approval, blocked, failure, timeout, and metadata-only safety evidence.
- `codexhub-release-auditor`: used for closeout evidence and next-risk framing.

## Skills Not Used And Why

- `codexhub-playwright-qa`: no Dashboard/browser QA behavior changed.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, Codex exec runtime, deployment runtime, and external agent runtime skills were not used because D22 stayed in contracts tests and docs.
