# Round 4F.1A Pilot Prerequisite Source Preparation

## Status

Round 4F.1A prepares authoritative source metadata for the Round 4F.1 pilot
prerequisite readiness check.

This round does not run a pilot. It does not invoke the read-only adapter
attempt path. It does not consume approval artifacts. It does not add a
Dashboard trigger. It does not allow `workspace_write` or
`danger_full_access`.

Outcome is evidence-based:

- `prepared`
- `blocked`
- `requires_review`

`prepared` is only source-preparation status. It does not approve pilot success,
MVP release, broader use, Dashboard triggering, workspace writes, or
danger-full-access mode.

## Source Context

Round 4F was blocked because authoritative pilot prerequisites were missing or
degraded. Round 4F.1 added a fail-closed readiness workflow. Round 4F.1A adds a
separate source-preparation workflow so Round 4F.1 can distinguish two forms of
authority:

- actual persisted attempt evidence, when an attempt record exists
- persisted source-preparation metadata, before a pilot retry is considered

`authoritativeAttemptEvidencePresent` remains false unless an actual attempt
record exists. Source preparation uses
`authoritativeSourcePreparationPresent=true` only when the source-preparation
record is persisted, Supervisor-backed, non-degraded, and non-fallback.

## GSD Summary

Goal: prepare persisted metadata sources that the Round 4F.1 readiness workflow
can inspect before a future pilot retry.

Scope:

- `packages/contracts`: source-preparation schemas and types
- `packages/codex-kernel`: pure source-preparation classification and summary
  helpers
- `packages/store-core`: async repository interface
- `packages/store-sqlite`: JSON payload persistence
- `apps/supervisor`: authoritative source-preparation endpoints
- `apps/cli`: Supervisor-first source-preparation commands and degraded display
  fallback
- `.codexhub/codex-exec.yaml`: local explicit enablement flag only
- `docs/reviews`: this review

Non-scope:

- no pilot
- no adapter attempt invocation
- no Dashboard change
- no process-boundary expansion
- no approval renewal, revocation, consumption, or fallback approval
- no raw local worktree path persistence

Risk level: high. This round prepares inputs for the next pilot retry gate while
preserving fail-closed behavior.

## Decision Rules

`prepared` requires all hard source gates to pass:

- store available
- Supervisor-backed persisted source record
- dry-run record present
- explicit local config enablement observed
- valid unused approval artifact observed
- isolated clean worktree metadata present
- evidence and audit readiness present
- fallback not used as authority

`blocked` applies when any hard source is missing.

`requires_review` applies only when hard sources pass but non-critical source
metadata or handoff context is ambiguous.

A degraded CLI fallback, local-only summary, or non-persisted object must never
produce `prepared` or `ready_for_pilot_retry`.

If the store is unavailable, source preparation is blocked or degraded and
notPersisted. It is never prepared.

## Metadata-Only Persistence

Persisted records may contain:

- dry-run id
- approval artifact id and hashes
- worktree label
- worktree status
- worktree path hash
- timestamps
- gate, blocker, finding, and checklist metadata
- evidence ref ids
- audit event ids

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

Worktree evidence is label/hash/status only.

## API Summary

Authoritative Supervisor endpoints:

- `POST /api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources`
- `GET /api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources/:recordId`
- `GET /api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources?dryRunId=&status=&limit=`
- `GET /api/codex/exec/real-read-only-adapter/pilot-prerequisite-source/latest/:dryRunId`

The POST endpoint inspects existing metadata only. It rejects raw
`worktreePath` input and accepts only worktree label/status/hash metadata.

Store unavailable returns degraded/notPersisted and cannot claim authority.

## CLI Summary

Read-only source-preparation CLI commands:

- `pnpm codexhub codex exec real-read-only-adapter pilot-prerequisite-sources prepare <dryRunId> --json`
- `pnpm codexhub codex exec real-read-only-adapter pilot-prerequisite-sources get <recordId> --json`
- `pnpm codexhub codex exec real-read-only-adapter pilot-prerequisite-sources list --dry-run <dryRunId> --status <status> --json`
- `pnpm codexhub codex exec real-read-only-adapter pilot-prerequisite-sources latest <dryRunId> --json`

Fallback behavior:

- degraded=true
- notPersisted=true
- fallbackUsedAsAuthority=false
- pilotExecuted=false
- adapterAttemptInvoked=false
- status=blocked

Fallback output is display-only and must not be used as authority.

## Config Preparation

Round 4F.1A changes the tracked local config flag from `liveEnabled: false` to
`liveEnabled: true` so the controlled pilot route can be inspected by the
source-preparation workflow.

The config still keeps:

- `allowedSandboxModes: [read_only]`
- `workspace_write` forbidden
- `danger_full_access` forbidden
- approval required
- single-use approvals required

No Dashboard config control is added.

## Worktree Metadata Status

Pre-edit inspection used read-only worktree listing. The local workspace showed
only the current worktree. No existing isolated clean worktree was discovered.

Round 4F.1A must not fabricate isolated worktree metadata. If no existing
isolated clean worktree label/hash/status is supplied by the authoritative
source-preparation record, Round 4F.1 readiness remains blocked.

## Recorded Source Preparation Result

The authoritative local Supervisor was available and the store was non-degraded.
Round 4F.1A created a valid unused approval artifact through the existing
approval-request and manual-approval workflow, then recorded a persisted
source-preparation record.

- dryRunId:
  `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`
- approvalArtifactId:
  `codex_approval_artifact_f0603925-9c75-406a-bc97-55f1d655a19c`
- sourcePreparationRecordId:
  `codex_real_read_only_adapter_pilot_source_preparation_e522956c-2840-46f4-bea2-20768d4da333`
- sourcePreparationStatus: `blocked`
- sourcePreparationMissingSources: `isolated_clean_worktree_metadata`
- prerequisiteRecordId:
  `codex_real_read_only_adapter_pilot_prerequisite_1c879842-216d-40f3-af46-6c5643cff516`
- prerequisiteStatus: `blocked`
- prerequisiteMissingSources:
  `isolated_clean_worktree_metadata`, `authoritative_pilot_source_evidence`,
  `evidence_audit_ready`

The blocked result is expected because no existing isolated clean worktree was
available. The record is persisted and non-degraded, but it is not treated as a
ready source. No adapter attempt was invoked and no pilot was run.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| 4F.1 workflow exists | `docs/reviews/round-4f1-pilot-prerequisite-closure.md` | Existing readiness workflow inspected | Continue |
| Local config was disabled before this round | `.codexhub/codex-exec.yaml` | `liveEnabled: false` before 4F.1A edit | Continue |
| Existing isolated worktree discovery | `git worktree list --porcelain` | Only current worktree was listed | Block readiness until isolated metadata exists |
| Source-preparation contracts | `pnpm nx test contracts` | 23 tests passed | Continue |
| Source-preparation kernel helpers | `pnpm nx test codex-kernel` | 72 tests passed | Continue |
| SQLite source-preparation repository | `pnpm nx test store-sqlite` | 1 test passed | Continue |
| Supervisor source-preparation API | `pnpm nx test supervisor` | 7 tests passed | Continue |
| CLI fallback cannot create authority | `pnpm nx test cli` | 21 tests passed | Continue |
| Process boundary isolation | `pnpm tsx tools/audit-real-adapter-boundary.ts` | Process boundary remains isolated to the approved module | Continue |
| Source-preparation record | Supervisor API latest source-preparation lookup | Persisted, non-degraded, blocked on missing isolated worktree metadata | Stop before pilot retry |
| Final prerequisite record | CLI `pilot-prerequisites check ... --json` | Persisted, non-degraded, blocked with `pilotExecuted=false` and `adapterAttemptInvoked=false` | Stop; 4F.2 is not allowed yet |

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

Round 4F.1A does not grant broader use. Round 4F.2 may be considered only if a
persisted Round 4F.1 readiness record reports `ready_for_pilot_retry`.

## Stop Rule

Round 4F.1A stops after source preparation and readiness evidence are recorded.

It does not execute Round 4F.2 automatically.

Round 4G and Round 4H remain blocked until a real Round 4F.2 pilot result
exists.
