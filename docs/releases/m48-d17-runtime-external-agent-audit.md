# M48-D17 Runtime External Agent Audit

## GSD Spec

- Goal: deepen runtime scheduler and external agent boundary coverage without adding runtime capability.
- Scope: `packages/runtime-operations-kernel`, `packages/external-agent-adapter`, D17 release/review docs, scaffold health registration, and orchestration registration.
- Non-scope: no new provider, route, store repository, live boundary, process runner, generic argv passthrough, direct multi-agent spawn, or repo-root mutation.
- Acceptance criteria: focused runtime/external-agent tests pass; closeout gates pass before commit.
- Hard boundaries: external agent runs require readiness, fixed argv, controlled sibling worktree, hash-bound plan, persisted approval, evidence, and audit metadata; runtime coordination remains metadata-only and workflow-kernel mediated.
- Affected apps/packages: `packages/runtime-operations-kernel`, `packages/external-agent-adapter`, `.codexhub/orchestration.yaml`, `tools/scaffold-health.ts`, release/review docs.
- Risk level: critical, because external agents can write patches when runtime gates and approvals are enabled.

## GStack Plan

- Plan: review D16 residual risks, then test readiness and approval binding around external agent boundaries.
- Build: add a failing regression for readiness-blocked and stale-approval runs, then fix the narrow boundary predicate.
- Review: confirm runtime scheduler remains free of process/network/direct adapter bypass and external agents remain fixed argv.
- QA: run focused tests first, then full foundation gates.
- Ship: register D17 docs and commit after clean verification.
- Retro: D18 should continue into platform operations boundaries.

## Superpowers Checklist

- Test first for the suspected boundary gap.
- Minimal implementation fix in the external agent boundary predicate.
- No scheduler behavior expansion.
- No external CLI invocation.
- Evidence over claims: completion requires recorded command results.

## Changes

- Added an external agent regression proving blocked readiness and stale approvals do not invoke the runner.
- Fixed external agent run gating to require provider/readiness gates, resolved worktree hash, approved status, dry-run id, dry-run record id, and expected plan hash match before boundary entry.
- Rechecked runtime queue/lease/lock/checkpoint tests for metadata-only behavior and no direct process or adapter execution.

## Verification

- `pnpm nx run external-agent-adapter:test --skip-nx-cache` failed before the fix, proving the gap.
- `pnpm nx run external-agent-adapter:test --skip-nx-cache` passed after the fix.

## Workflow Skills Used And Why

- `gsd-spec-driver`: framed D17 goal, scope, non-scope, acceptance, and critical boundaries.
- `gstack-delivery-workflow`: kept the round in Plan/Build/Review/QA/Ship order.
- `superpowers-engineering-discipline`: kept the fix narrow and evidence-first.

## Project Skills Used And Why

- `codexhub-architecture-planner`: confirmed no new runtime package, route, store, or live boundary was needed.
- `codexhub-workflow-policy-reviewer`: guided readiness, approval, and hash-binding invariants before boundary entry.
- `codexhub-release-auditor`: used for closeout verification and next-risk framing.

## Skills Not Used And Why

- `codexhub-contract-designer`: contracts were not changed.
- `codexhub-playwright-qa`: Dashboard UI was not changed.
- `codexhub-codex-exec-adapter`: Codex runtime execution was not modified.
- Browser Profile, Electron/CDP runtime, MCP runtime, policy backend runtime, telemetry exporter runtime, deployment runtime, and external agent runtime skills were not used because this round stayed in tests and metadata-only boundary predicates.
