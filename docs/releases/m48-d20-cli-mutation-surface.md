# M48-D20 CLI Mutation Surface

## GSD Spec

- Goal: deepen CLI mutation-surface coverage so future command changes cannot add generic POST helpers, token options, or unreviewed mutation owners.
- Scope: `apps/cli` static tests, D20 release/review docs, scaffold health registration, and orchestration registration.
- Non-scope: no new CLI command, route, provider, store repository, live boundary, remote write, push, PR, or generic mutation helper.
- Acceptance criteria: CLI focused tests pass; changed-project lint/build and closeout gates pass before commit.
- Hard boundaries: CLI mutation remains limited to existing reviewed exact commands; read-only command groups must not read the local-control token, call POST, persist tokens, or call adapters directly.
- Affected apps/packages: `apps/cli`, `.codexhub/orchestration.yaml`, `tools/scaffold-health.ts`, release/review docs.
- Risk level: critical, because CLI commands can reach governed Supervisor mutation routes.

## GStack Plan

- Plan: read D19 residual risk and inspect CLI POST/static allowlist tests.
- Build: add an owner-level regression proving every CLI POST call belongs to a reviewed exact helper.
- Review: confirm no CLI behavior changed and no new mutation command was added.
- QA: run CLI focused tests, lint/build, and foundation gates.
- Ship: register D20 docs and commit after clean verification.
- Retro: D21 should continue into MCP boundary surfaces.

## Superpowers Checklist

- Keep the round test-only and docs-only.
- Prefer explicit owner allowlist over broad route matching.
- Do not add token options or generic POST helpers.
- Use verification evidence before commit.

## Changes

- Added a CLI static regression that maps every `POST` call site to its owning function and compares that owner list to the reviewed exact mutation-helper allowlist.
- Added sentinels against generic `postJson`, `postSupervisor`, `genericPost`, mutation route prefix drift, and `route.startsWith` style route expansion.
- Kept existing read-only command families unchanged.

## Verification

- `pnpm nx run cli:test --skip-nx-cache` passed.

## Workflow Skills Used And Why

- `gsd-spec-driver`: framed D20 goal, scope, non-scope, acceptance, and CLI mutation boundaries.
- `gstack-delivery-workflow`: kept the round in Plan/Build/Review/QA/Ship order.
- `superpowers-engineering-discipline`: kept the change narrow and focused on防回归 testing.

## Project Skills Used And Why

- `codexhub-architecture-planner`: confirmed no new CLI-to-adapter path or route family was introduced.
- `codexhub-workflow-policy-reviewer`: reviewed local-control token, POST, approval, and adapter bypass boundaries.
- `codexhub-release-auditor`: used for closeout evidence and next-risk framing.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contracts or shared schemas changed.
- `codexhub-playwright-qa`: no Dashboard or browser QA behavior changed.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, Codex exec runtime, deployment runtime, and external agent runtime skills were not used because D20 stayed in CLI static tests and docs.
