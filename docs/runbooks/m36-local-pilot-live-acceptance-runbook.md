# M36 Local Pilot Live Acceptance Runbook

## Purpose

Use this runbook when an operator wants to validate the `local-patch-review` production template with a real local smoke.

## Required Runtime State

- `CODEXHUB_LOCAL_PRODUCTION_WORKFLOW_PILOT_ENABLED=true`
- `CODEXHUB_PRODUCTION_WORKFLOW_RECOVERY_ENABLED=true`
- `CODEXHUB_PRODUCTION_WORKFLOW_CHILD_ORCHESTRATION_ENABLED=true`
- Worktree, governed Codex patch, Nx verification, and review package child control planes enabled as needed.
- Persisted workflow recovery dry-run and workflow recovery approval.
- Store-resolved child record refs for worktree create, Codex patch, Nx verification, and review package export.
- Child approvals approved through their own control planes.

## Operator Flow

1. Run doctor/readiness and confirm no missing runtime gates.
2. Confirm child record ids and expected hashes are available.
3. Create or review the workflow recovery dry-run through the existing recovery control plane.
4. Approve only the workflow recovery approval through the governed approval path.
5. Approve child actions separately through their own child control planes.
6. Start or resume the recovery run.
7. If a child approval is missing, stop at the child approval wait state and approve the child action separately.

## Stop Conditions

- Missing or stale child record refs.
- Child hash mismatch.
- Used, expired, revoked, or missing approval.
- Codex patch failed or aborted.
- Nx verification failed or aborted.
- Review package export blocked.

## Rollback Notes

M36 does not auto-clean or force-delete local artifacts. Follow the existing governed cleanup handoff for worktrees and local artifacts. Do not send raw paths, raw prompt, raw diff, raw body, approval artifacts, execution authority, or child artifacts in recovery request bodies.
