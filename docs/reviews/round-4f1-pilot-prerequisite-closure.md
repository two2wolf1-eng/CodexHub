# Round 4F.1: Pilot Prerequisite Closure

## Status

Round 4F.1 adds an authoritative, persisted, metadata-only readiness workflow for the blocked Round 4F pilot prerequisites.

This round does not run a pilot. It does not invoke the read-only adapter attempt path. It does not create, renew, approve, revoke, or use approval artifacts. It does not enable configuration. It does not add a Dashboard trigger. It does not allow `workspace_write` or `danger_full_access`.

Outcome: `pilot_prerequisite_readiness_workflow_added`

Actual pilot retry status must come from a persisted readiness record:

- `ready_for_pilot_retry`
- `blocked`
- `requires_review`

`ready_for_pilot_retry` is only a signal that Round 4F.2 may be considered. It is not pilot success, MVP approval, broader use approval, Dashboard trigger permission, workspace write permission, or danger-full-access permission.

## Source Context

Round 4F was blocked because pilot prerequisites were not authoritative or complete:

- attempt/latest and timeline output could not be treated as authoritative pilot evidence
- config remained disabled or degraded
- no valid approval artifact was present
- no isolated clean worktree metadata was present

Round 4F.1 closes the workflow gap by making those prerequisites explicit, persisted, queryable, and fail-closed.

## GSD Summary

Goal: record whether a future limited local pilot retry is ready, blocked, or requires review using persisted metadata only.

Scope:

- `packages/contracts`: prerequisite readiness schemas and types
- `packages/codex-kernel`: pure prerequisite classification and summary helpers
- `packages/store-core`: async repository interface
- `packages/store-sqlite`: JSON payload persistence
- `apps/supervisor`: authoritative read-only governance endpoints
- `apps/cli`: Supervisor-first read-only commands and degraded display fallback
- `docs/reviews`: this review

Non-scope:

- no pilot execution
- no adapter attempt invocation
- no approval creation or mutation
- no config enablement
- no Dashboard change or trigger
- no process-boundary expansion

Risk level: medium. This round gates the next pilot attempt but intentionally avoids changing runtime permission.

## Decision Rules

`ready_for_pilot_retry` requires all hard gates to pass from persisted authoritative sources:

- store available
- Supervisor-backed persisted source
- dry-run record present
- explicit config enablement observed
- valid unused approval artifact observed
- isolated clean worktree metadata present
- authoritative attempt evidence present
- evidence and audit readiness present
- fallback not used as authority

`blocked` applies when any hard prerequisite is missing.

`requires_review` applies only when hard prerequisites pass but non-critical metadata or handoff context is incomplete.

A degraded CLI fallback, local-only summary, or non-persisted object must never produce `ready_for_pilot_retry`.

If the store is unavailable, the readiness response is blocked or degraded/notPersisted. It is never ready.

## Metadata-Only Persistence

Persisted records may contain:

- document and record ids
- timestamps
- status
- gate, blocker, finding, and checklist metadata
- evidence ref ids
- audit event ids
- worktree label
- worktree status
- worktree path hash

Persisted records must not contain:

- raw prompt body
- raw command body
- raw stdout or stderr body
- raw agent message or reasoning body
- raw local absolute worktree path
- argv arrays
- executable paths
- shell snippets
- env plans

Worktree evidence is stored as label/hash/status only.

## API Summary

Authoritative Supervisor endpoints:

- `POST /api/codex/exec/real-read-only-adapter/pilot-prerequisites`
- `GET /api/codex/exec/real-read-only-adapter/pilot-prerequisites/:recordId`
- `GET /api/codex/exec/real-read-only-adapter/pilot-prerequisites?dryRunId=&status=&limit=`
- `GET /api/codex/exec/real-read-only-adapter/pilot-prerequisite/latest/:dryRunId`

The POST endpoint inspects existing metadata only. It rejects raw `worktreePath` input and accepts only worktree label/status/hash metadata.

Store unavailable returns degraded/notPersisted and cannot claim authority.

## CLI Summary

Read-only CLI commands:

- `pnpm codexhub codex exec real-read-only-adapter pilot-prerequisites check <dryRunId> --json`
- `pnpm codexhub codex exec real-read-only-adapter pilot-prerequisites get <recordId> --json`
- `pnpm codexhub codex exec real-read-only-adapter pilot-prerequisites list --dry-run <dryRunId> --status <status> --json`
- `pnpm codexhub codex exec real-read-only-adapter pilot-prerequisites latest <dryRunId> --json`

Fallback behavior:

- degraded=true
- notPersisted=true
- fallbackUsedAsAuthority=false
- pilotExecuted=false
- adapterAttemptInvoked=false
- status=blocked

Fallback output is display-only and must not be used as authority for `ready_for_pilot_retry`.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Contracts parse prerequisite records and summaries | `pnpm nx test contracts` | Added schema parse and degraded-ready rejection coverage | Continue |
| Kernel classifies blocked/requires_review/ready | `pnpm nx test codex-kernel` | Added pure helper coverage; degraded/notPersisted sources never ready | Continue |
| SQLite persists metadata-only records | `pnpm nx test store-sqlite` | Added idempotent repository coverage and no raw path/body assertions | Continue |
| Supervisor creates authoritative records | `pnpm nx test supervisor` | Added blocked and ready prerequisite API coverage with store-backed records | Continue |
| CLI fallback cannot create authority | `pnpm nx test cli` | Added degraded fallback coverage with `fallbackUsedAsAuthority=false` | Continue |

## No-Live Boundary

Fixed flags remain:

- `workspaceWriteAllowed=false`
- `dangerFullAccessAllowed=false`
- `dashboardTriggerAllowed=false`
- `pilotExecuted=false`
- `adapterAttemptInvoked=false`
- `implementationApproved=false`
- `processAdapterApproved=false`
- `recommendationGrantsExecution=false`

Round 4F.1 does not grant broader use. Round 4F.2 may be considered only if a persisted record reports `ready_for_pilot_retry`.

## Stop Rule

Round 4F.1 stops after adding and verifying the readiness workflow.

It does not execute Round 4F.2 automatically.

Round 4G and Round 4H remain blocked until a real Round 4F.2 pilot result exists.
