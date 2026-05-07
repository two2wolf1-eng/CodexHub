# M48-D19 Dashboard Mutation Surface

## GSD Spec

- Goal: deepen Dashboard mutation-surface coverage so future UI changes cannot quietly add unreviewed write helpers, token persistence, or unsupported POST routes.
- Scope: `apps/dashboard` read-only UX tests, D19 release/review docs, scaffold health registration, and orchestration registration.
- Non-scope: no new product capability, route, store repository, provider, live boundary, Dashboard write panel, browser click/input automation, real remote write, push, or PR.
- Acceptance criteria: Dashboard focused tests pass; changed-project lint/build and closeout gates pass before commit.
- Hard boundaries: Dashboard mutation remains limited to the existing governed approval decision, recovery, merge, deployment, policy-telemetry, Production GA, and platform guided panels; local-control token remains React memory-only and header-only.
- Affected apps/packages: `apps/dashboard`, `.codexhub/orchestration.yaml`, `tools/scaffold-health.ts`, release/review docs.
- Risk level: critical, because Dashboard guided panels are operator-facing mutation surfaces.

## GStack Plan

- Plan: read D18 residual risk and inspect Dashboard static mutation guards.
- Build: add a targeted regression for exact governed POST helpers and forbidden write-helper drift.
- Review: confirm no product behavior changed and no new Dashboard mutation surface was added.
- QA: run Dashboard tests first, then changed-project and foundation gates.
- Ship: register D19 docs and commit after clean verification.
- Retro: D20 should continue into CLI mutation allowlists.

## Superpowers Checklist

- Keep the round test-only and docs-only unless a real UI boundary bug appears.
- Avoid unrelated Dashboard refactors.
- Do not add Browser automation or new Dashboard write panels.
- Use evidence from focused tests and foundation gates.

## Changes

- Added a Dashboard static regression proving governed local-control POST helpers use the local-control key only as a header and serialize only their caller-provided metadata body.
- Added sentinels against new Dashboard write helper drift for Browser, Electron, MCP, runtime, external agent, platform, secrets, GitHub Actions, and release helpers.
- Kept existing mutation allowlists unchanged.

## Verification

- `pnpm nx run dashboard:test --skip-nx-cache` failed once while refining the test to allow header-only `pageMemoryKey` usage.
- `pnpm nx run dashboard:test --skip-nx-cache` passed after the assertion was narrowed to the actual request-body risk.

## Workflow Skills Used And Why

- `gsd-spec-driver`: framed D19 goal, scope, non-scope, acceptance, and Dashboard mutation boundaries.
- `gstack-delivery-workflow`: kept the round in Plan/Build/Review/QA/Ship order.
- `superpowers-engineering-discipline`: kept the change narrow, test-first, and evidence-based.

## Project Skills Used And Why

- `codexhub-architecture-planner`: confirmed the Dashboard remains an app-level guided surface and does not call adapters directly.
- `codexhub-workflow-policy-reviewer`: reviewed token, authority, approval, and metadata-only request-body boundaries.
- `codexhub-playwright-qa`: applied Dashboard degraded/mutation-surface QA guidance without adding browser click/input automation.
- `codexhub-release-auditor`: used for closeout evidence and release note structure.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contracts or shared schemas changed.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, Codex exec runtime, deployment runtime, and external agent runtime skills were not used because D19 stayed in Dashboard static tests and docs.
