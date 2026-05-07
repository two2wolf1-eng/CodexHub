# M48-D23 Operator Degraded-State Smoke

## GSD Spec

- Goal: make the GA operator Dashboard degraded-state smoke matrix explicit for core M0-M48 operational views.
- Scope: Dashboard degraded-state regression tests, D23 release/review docs, scaffold health registration, and orchestration registration.
- Non-scope: no new UI capability, route, provider, store repository, live boundary, runtime behavior, real browser automation, remote write, push, or PR.
- Acceptance criteria: Dashboard focused tests pass; changed-project lint/build and full closeout gates pass before commit.
- Hard boundaries: this round is test/docs/config hardening only. It must not add Dashboard write paths, browser click/type automation, or live smoke execution.
- Affected apps/packages: `apps/dashboard`, `.codexhub/orchestration.yaml`, `tools/scaffold-health.ts`, release/review docs.
- Risk level: high, because degraded operator views are the release surface operators use when Supervisor data is unavailable.

## GStack Plan

- Plan: read D22 residual risk and inspect Dashboard route/degraded-state coverage.
- Build: add an explicit D23 smoke matrix covering governance, readiness, GitHub, workflows, deployments, secrets, policy-telemetry, runtime, operations, and Production GA.
- Review: confirm the test locks metadata-only output, memory-only token behavior, and no adapter execute signal.
- QA: run Dashboard focused tests, changed-project lint/build, and foundation gates.
- Ship: register D23 docs and commit after clean verification.
- Retro: D24 should deepen static audit negative fixtures.

## Superpowers Checklist

- Keep the round test/docs/config only.
- Do not introduce route or runtime behavior changes.
- Prefer explicit route/panel expectations over broad snapshot churn.
- Verify with focused and foundation gates.

## Changes

- Added a D23 Dashboard regression that treats the core GA operator routes as an explicit degraded-state matrix.
- The matrix now asserts each route is hash-registered, has a concrete first panel, serializes a metadata-only degraded summary, does not persist local-control token state, and does not expose adapter execution signals.
- Registered D23 release/review docs in scaffold health and orchestration.

## Verification

- `pnpm nx run dashboard:test --skip-nx-cache` passed.

## Workflow Skills Used And Why

- `gsd-spec-driver`: framed D23 goal, scope, non-scope, acceptance, and hard degraded-state boundaries.
- `gstack-delivery-workflow`: kept the round in Plan/Build/Review/QA/Ship order.
- `superpowers-engineering-discipline`: kept the change focused and product-behavior-neutral.

## Project Skills Used And Why

- `codexhub-architecture-planner`: confirmed no new route, package boundary, or runtime surface was introduced.
- `codexhub-workflow-policy-reviewer`: checked the degraded smoke matrix for metadata-only and no authority bypass properties.
- `codexhub-playwright-qa`: guided Dashboard degraded-state and no-crash smoke expectations without adding browser click/input automation.
- `codexhub-release-auditor`: used for closeout evidence and next-risk framing.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contracts or schemas changed.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, Codex exec runtime, deployment runtime, and external agent runtime skills were not used because D23 stayed in Dashboard tests and docs.
