# M48-D21 MCP Boundary Surface

## GSD Spec

- Goal: deepen MCP read-only boundary coverage so MCP tools cannot grow process, network, token, runtime, platform, GA, or controlled-write mutation bypasses.
- Scope: `apps/codexhub-mcp-server` tests, D21 release/review docs, scaffold health registration, and orchestration registration.
- Non-scope: no new MCP tool, MCP write path, route, provider, store repository, live boundary, network call, process spawn, workspace mutation, remote write, push, or PR.
- Acceptance criteria: MCP focused tests pass; changed-project lint/build and closeout gates pass before commit.
- Hard boundaries: MCP tool execution remains read-only, store/audit-backed, metadata-only, and free of process/network/env token reads or direct adapter execution.
- Affected apps/packages: `apps/codexhub-mcp-server`, `.codexhub/orchestration.yaml`, `tools/scaffold-health.ts`, release/review docs.
- Risk level: critical, because MCP tools can be invoked by external clients and must not bypass CodexHub governance.

## GStack Plan

- Plan: read D20 residual risk and inspect MCP production source guards.
- Build: add a focused static regression for MCP tool execution source.
- Review: confirm no tool behavior or MCP route behavior changed.
- QA: run MCP focused tests, lint/build, and foundation gates.
- Ship: register D21 docs and commit after clean verification.
- Retro: D22 should continue into rehearsal matrix completeness.

## Superpowers Checklist

- Keep D21 test-only and docs-only.
- Do not add MCP write tools or external process/network calls.
- Preserve existing MCP HTTP security behavior.
- Verify with focused tests and full closeout gates.

## Changes

- Added a static MCP regression proving `tools.ts` and `tool-outputs.ts` remain free of process/env access, token reads, network APIs, dynamic imports, runtime/platform/GA mutation routes, and controlled-write route passthrough.
- Preserved existing MCP HTTP bootstrap/security tests and read-only evidence/audit behavior.

## Verification

- `pnpm nx run codexhub-mcp-server:test --skip-nx-cache` passed.

## Workflow Skills Used And Why

- `gsd-spec-driver`: framed D21 goal, scope, non-scope, acceptance, and MCP boundaries.
- `gstack-delivery-workflow`: kept the round in Plan/Build/Review/QA/Ship order.
- `superpowers-engineering-discipline`: kept the change scoped to static guard hardening.

## Project Skills Used And Why

- `codexhub-architecture-planner`: confirmed MCP stays an app/tool surface and does not introduce package or adapter boundary changes.
- `codexhub-workflow-policy-reviewer`: reviewed no direct adapter execute, no write tool, metadata-only, and audit/evidence boundaries.
- `codexhub-release-auditor`: used for closeout evidence and next-risk framing.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contracts or shared schemas changed.
- `codexhub-playwright-qa`: no Dashboard/browser QA behavior changed.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, Codex exec runtime, deployment runtime, and external agent runtime skills were not used because D21 did not execute MCP runtime or add write tools.
