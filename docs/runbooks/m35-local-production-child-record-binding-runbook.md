# M35 Local Production Child Record Binding Runbook

## Purpose

Use this runbook when validating or operating the `local-patch-review` production workflow recovery path after M35.

## Required State

- `CODEXHUB_LOCAL_PRODUCTION_WORKFLOW_PILOT_ENABLED=true` when running a real local pilot.
- Production workflow recovery and child orchestration runtime gates enabled only for the operator session.
- A persisted workflow recovery dry-run and workflow recovery approval.
- Store-resolved child record refs for:
  - worktree create
  - Codex patch
  - Nx verification
  - review package export

## Operator Rules

- Do not send child status in the recovery run body.
- Do not send approval artifacts, execution authority, child artifacts, raw paths, raw bodies, or child approval decisions in the recovery run body.
- Approve child actions only through their governed child control planes.
- Use CLI approval decision only for the existing approval decision path; do not add workflow execution commands.

## Expected Blocking Behavior

- Missing child ref: recovery run blocks before coordinator start.
- Expected hash mismatch: recovery run blocks before coordinator start.
- Missing child approval: recovery enters or remains in a child approval wait state.
- Codex patch failed or aborted: recovery fails.
- Nx verification failed or aborted: recovery fails and review package export must not proceed.

## Recovery Notes

M35 does not perform cleanup, retry, remote writes, push, pull request creation, or direct adapter execution. Cleanup and retry remain governed handoffs through existing control planes.
