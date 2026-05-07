# M48-D12 Approval Consumption Semantics Debug

## GSD Spec

- Goal: tighten M0-M48 approval consumption regression coverage so boundary-started runs preserve truthful boundary, evidence, and audit metadata.
- Scope: Supervisor approval/boundary tests, M44/M45 metadata-only evidence helpers, scaffold health registration, and orchestration registration.
- Non-scope: no product capability, provider, route, store repository, live boundary, remote write, push, pull request, or generalized Browser/Electron/MCP/Policy/Telemetry execution.
- Acceptance criteria: focused Supervisor tests pass; scaffold health, governance audits, foundation verification, and diff checks pass before commit.
- Hard boundaries: request-body authority remains untrusted, approvals are store-resolved, pre-boundary blocks do not consume approval, boundary-started runs consume once, and public output remains metadata-only.
- Affected apps/packages: `apps/supervisor`, `.codexhub/orchestration.yaml`, `tools/scaffold-health.ts`, release/review docs.
- Risk level: critical, because this round verifies approval consumption around high-risk live boundaries.

## GStack Plan

- Plan: strengthen existing table-driven Supervisor tests instead of adding routes or behavior surface.
- Build: add evidence/audit assertions for PR management, deployment operation, and M44/M45 controlled surfaces.
- Review: inspect failure results for real gaps before changing implementation.
- QA: run focused Supervisor tests first, then full foundation gates.
- Ship: register D12 release/review docs and commit after clean verification.
- Retro: D13 should continue into GitHub fixed endpoint boundaries.

## Superpowers Checklist

- Small scoped test-first change.
- No unrelated refactor.
- Evidence over claims: completion requires recorded command results.
- No unreviewed live automation.
- Clean git state required before and after commit.

## Changes

- Added a reusable Supervisor test assertion that boundary-started runs expose metadata-only evidence plus audit ids.
- Extended PR management and deployment operation failure-path tests to assert boundary booleans stay truthful and reused approvals do not trigger another boundary.
- Extended M44/M45 policy, telemetry, Browser, Electron, and MCP write tests to assert completed runs carry evidence/audit traces and approval reuse stays blocked.
- Fixed a real gap where completed M44/M45 runs had audit ids but empty evidence refs by adding hash-only evidence refs for the completed run summaries.

## Verification

- `pnpm nx run supervisor:test --skip-nx-cache` passed.

## Workflow Skills Used And Why

- `gsd-spec-driver`: framed D12 goal, scope, non-scope, acceptance, and critical boundaries.
- `gstack-delivery-workflow`: kept the round in Plan/Build/Review/QA/Ship order.
- `superpowers-engineering-discipline`: kept the change test-first, scoped, and evidence-based.

## Project Skills Used And Why

- `codexhub-architecture-planner`: confirmed no new package, route, provider, or boundary was needed.
- `codexhub-workflow-policy-reviewer`: guided approval consumption, evidence, audit, and request-body authority invariants.
- `codexhub-release-auditor`: used for closeout verification and release documentation.

## Skills Not Used And Why

- `codexhub-contract-designer`: contracts were not changed.
- `codexhub-playwright-qa`: Dashboard UI was not changed.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, Codex exec runtime, deployment runtime, and external agent runtime skills were not used because this round stayed in Supervisor tests and metadata-only helpers.
