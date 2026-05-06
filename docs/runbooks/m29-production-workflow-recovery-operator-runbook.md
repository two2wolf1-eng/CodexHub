# M29 Production Workflow Recovery Operator Runbook

## Before Running

1. Confirm `CODEXHUB_PRODUCTION_WORKFLOW_RECOVERY_ENABLED=true`.
2. Confirm `CODEXHUB_PRODUCTION_WORKFLOW_CHILD_ORCHESTRATION_ENABLED=true`.
3. Confirm the workflow template id and hash match the catalog.
4. Create a recovery dry-run through Supervisor.
5. Request and approve the workflow recovery approval.

## Recovery Behavior

The recovery coordinator may create child dry-runs and child approval requests,
but it never approves child actions. Each child control plane remains responsible
for its own approval, evidence, audit, and execution authority.

## Failure Handling

- Missing workflow approval: recovery waits before child action planning.
- Missing child approval: recovery waits at `waiting_for_child_approval`.
- Failed Nx verification: review package export and later steps stay blocked.
- Any child failure: later dependent steps remain blocked or skipped.

## Rollback

Do not delete worktrees or remote resources from the recovery coordinator. Use the
existing governed cleanup control planes and their separate approvals.

