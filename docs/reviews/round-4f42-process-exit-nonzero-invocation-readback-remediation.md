# Round 4F.42: Process Exit Nonzero Invocation Readback Remediation

## Workflow Skills Used And Why

- `gsd-spec-driver`: defined this round as a narrow remediation for `process_exit_nonzero` / `exitCode=2`.
- `gstack-delivery-workflow`: kept the change small, tested focused areas, and prepared a clean checkpoint.
- `superpowers-engineering-discipline`: preserved metadata-only evidence and avoided live automation scope creep.

## Project Skills Used And Why

- `codexhub-codex-exec-adapter`: changed the real read-only adapter process invocation contract and CLI/Supervisor control-plane handshake.
- `codexhub-workflow-policy-reviewer`: preserved approval, policy, config, worktree, evidence, and audit gates.
- `codexhub-architecture-planner`: kept the process launch boundary isolated to `packages/codex-kernel/src/real-read-only-adapter-process.ts`.
- `codexhub-release-auditor`: ran focused verification and prepared the route for the next retry gate.
- `codexhub-contract-designer`: used because existing metadata-only diagnostic fields were checked, but no shared contract field change was needed.

## Skills Not Used And Why

- Dashboard and Playwright skills were not used because no Dashboard panel, trigger, or browser QA changed.
- Electron/CDP and browser profile observer skills were not used because this round does not touch browser, profile, workspace, account, or session automation.

## GSD Spec

Goal: close the current `process_exit_nonzero` / `exitCode=2` diagnostic gap enough to support one fresh retry.

Scope:
- `packages/codex-kernel`
- `apps/supervisor`
- `apps/cli`
- focused tests
- this review document

Non-scope:
- no pilot retry in 4F.42
- no real adapter attempt
- no Dashboard trigger
- no `workspace_write`
- no `danger_full_access`
- no raw prompt, command, stdout/stderr, argv, executable path, env values, agent body, reasoning body, or raw worktree path persistence

Acceptance criteria:
- fixed Codex CLI invocation contract remains metadata-only and fixed-argv
- CLI refuses stale Supervisor instances before posting a real attempt
- legacy/readback records with `process_exit_nonzero` and `exitCode=2` expose `nonzeroExitKind`
- focused `codex-kernel`, `supervisor`, and `cli` tests pass
- process-boundary audit remains clean

Risk level: high. The work touches the controlled process-boundary path, but does not broaden execution permissions.

## Root Cause Class

The 4F.41 retry record reached the approved boundary and failed with `process_exit_nonzero`, `exitCode=2`, but persisted readback did not expose `nonzeroExitKind`. The likely operational cause is Supervisor/CLI contract drift: an already-running Supervisor can accept the CLI request while serving an older real-adapter implementation.

4F.42 adds an explicit invocation-contract health handshake so the CLI refuses stale Supervisor instances instead of creating new records through an older control-plane path.

## Fix Summary

- Added a fixed Codex CLI invocation contract version in `codex-kernel`.
- Centralized the approved subprocess argv shape as metadata-only policy data.
- Added Supervisor health metadata for invocation contract version, argv count/hash, and stdin policy.
- Added CLI pre-attempt validation so stale or unavailable invocation contract health blocks before any attempt POST.
- Added readback alignment so legacy `process_exit_nonzero` / `exitCode=2` records expose `nonzeroExitKind=codex_cli_usage_error_suspected` without raw output persistence.
- Kept `shell=false`, fixed policy label `codex_cli`, fixed argv, no arbitrary executable path, no arbitrary argv, and no prompt body.

## Evidence

- No real pilot was run in 4F.42.
- Tests use fake/injected data only.
- Existing 4F.41 attempt remains the latest real retry before this remediation:
  - attempt id: `codex_real_read_only_adapter_attempt_6ff16386-b97a-4527-af41-ebdd57c187bb`
  - status: `failed`
  - result error: `boundary_failed`
  - boundary failure: `process_exit_nonzero`
  - exit code: `2`
  - workspace mutation: `false`
  - post-run verification: `skipped`, reason `attempt_not_completed`

## Next Route

4F.43 may run exactly one controlled retry, but only after a fresh Supervisor health check exposes the 4F.42 invocation contract. If the retry changes the blocker to prompt/input governance, auth/config, approval, policy, worktree, permission, raw-data persistence, or workspace mutation, the optional invocation loop must stop after review/gate and route to the new blocker.
