# M33 Local Production Pilot Operator Runbook

## Purpose

Use this runbook to prepare a local `local-patch-review` production workflow pilot without bypassing CodexHub governance.

## Enablement Checks

1. Confirm product defaults remain disabled in versioned config.
2. Set runtime flags only in the local operator environment when ready:
   - `CODEXHUB_LOCAL_PRODUCTION_WORKFLOW_PILOT_ENABLED=true`
   - `CODEXHUB_PRODUCTION_WORKFLOW_RECOVERY_ENABLED=true`
   - `CODEXHUB_PRODUCTION_WORKFLOW_CHILD_ORCHESTRATION_ENABLED=true`
3. Confirm child integrations are independently enabled and governed:
   - worktree create
   - Codex patch in isolated worktree
   - Nx verification
   - review package export
   - governance projection

## Approval Flow

1. Use the Dashboard recovery wizard only to create the workflow recovery dry-run, request workflow recovery approval, approve workflow recovery, and start or resume recovery.
2. Use the CLI approval decision command for child approvals.
3. Do not approve child actions from Dashboard; the wizard intentionally only shows child approval waits.

## Blocked States

- `local_production_workflow_pilot_disabled`: set the local pilot runtime flag only if the operator intends to run the governed local pilot.
- `production_workflow_recovery_disabled`: recovery runtime gate is missing.
- `production_workflow_child_orchestration_disabled`: child orchestration runtime gate is missing.
- `child_approval_required`: approve the child action through the governed approval decision path.

## Rollback

Unset the runtime flags. Existing dry-run, approval, run, evidence, and audit records remain as metadata for review.
