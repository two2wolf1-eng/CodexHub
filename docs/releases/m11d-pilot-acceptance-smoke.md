# M11d Pilot Acceptance Smoke

## Summary

M11d adds a fixture-only acceptance smoke for the M11 narrow-path pilot operator flow. The smoke
lets an operator rehearse status, failure classification, recovery action, cleanup handoff, and PR
draft outcomes without invoking Supervisor mutations or live Git/Codex/Nx boundaries.

## Scope

- Added M11 acceptance smoke contracts for scenarios, steps, and run summary.
- Added an orchestrator-kernel fixture helper for `all-pass`, `readiness-blocked`,
  `worktree-approval-blocked`, `worktree-boundary-failed`, `codex-failed`, and `nx-failed`.
- Added `codexhub pilot m11 rehearse --fixture --scenario <name>` as a read-only CLI command.
- Added a Dashboard `#/pilot` M11 Acceptance Smoke section.
- Updated orchestration/integration metadata, scaffold health, and the M11 runbook.

## Safety

- Fixture-only: no Supervisor route, no adapter execute, no process boundary, and no network boundary.
- Codex remains read-only/dry-run in the modeled flow.
- PR status is only `not_ready_no_patch` or `blocked`; no patch, push, or pull request is produced.
- Public output is metadata-only: ids, counts, statuses, summaries, evidence ids, audit ids, and
  boundary booleans.

## Verification

Expected verification for this round:

- `pnpm nx run-many --target=test "--projects=contracts,orchestrator-kernel,dashboard,cli" --skip-nx-cache`
- focused lint/build for changed projects
- `pnpm scaffold:health`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm audit:no-live-automation`
- `pnpm audit:skills`
- `pnpm verify:foundation`
- `git diff --check`

## Rollback

Revert the M11d commit. No persisted state or live integration state is created by this round.
