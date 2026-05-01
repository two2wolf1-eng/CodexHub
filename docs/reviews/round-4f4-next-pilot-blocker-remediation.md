# Round 4F.4 Next Pilot Blocker Remediation

## Status

Round 4F.4 remediates the blocker found after Round 4F.3 and reviewed in
Round 4G.1.

Outcome: `pilot_blocker_remediated_for_fake_runner_validation`

This round does not run a pilot. It does not invoke a real CLI adapter attempt,
does not consume the real pilot approval artifact, does not add a Dashboard
trigger, and does not allow `workspace_write` or `danger_full_access`.

Round 4F.5, not Round 4H.2, is the next allowed round if verification remains
clean. Round 4F.5 must perform the next controlled pilot retry as a separate
round.

## Root Cause

Round 4F.3 showed that config authority was loaded, but the authoritative
attempt still ended as `blocked` with `processBoundaryInvoked=false`.

The implementation issue was that the Supervisor attempt route still followed
the disabled-default preflight/result path for actual attempt creation. It could
record a conservative blocked attempt, but it did not evaluate the full
authoritative guard sources before boundary planning and therefore kept
returning a pre-boundary result such as `boundary_deferred`.

## Fix Summary

Round 4F.4 changes the authoritative attempt path so it now builds the real
guard preflight from Supervisor-backed sources before any boundary planning:

- existing dry-run record
- current policy decision hash
- valid unused approval artifact
- latest persisted source-preparation record
- latest persisted pilot prerequisite record
- sanitized worktree metadata
- evidence/audit readiness
- loaded explicit config

The route now accepts the raw worktree path only as runtime input. Supervisor
hashes the runtime path, compares it with the persisted worktree metadata hash,
and never stores or returns the raw absolute path.

When all hard gates pass, the route creates a process plan with a narrow
`codex_cli` policy label and calls the existing approved process-boundary helper.
Round 4F.4 tests that behavior only with injected fake runners. No real Codex
process is started by this round.

The attempt record, summary, and timeline now include stable metadata-only
diagnostic fields:

- `preflightStatus`
- `resultStatus`
- `resultErrorCode`
- `failedCheckCodes`
- `blockedCheckCodes`
- `processBoundaryInvoked`
- `postRunVerificationStatus`
- `workspaceMutationDetected`

Completed fake-runner attempts also wire the existing post-run verification
helper. Non-completed attempts keep verification metadata skipped or not
required.

## Files Changed

- `packages/contracts/src/index.ts`
- `packages/contracts/src/contracts.test.ts`
- `packages/codex-kernel/src/real-read-only-adapter.ts`
- `apps/supervisor/src/server.ts`
- `apps/supervisor/src/server.test.ts`
- `apps/cli/src/main.ts`
- `apps/cli/src/main.test.ts`
- `docs/reviews/round-4f4-next-pilot-blocker-remediation.md`

No Dashboard files are changed.

## Safety Boundary Confirmation

Round 4F.4 preserves these fixed boundaries:

- `liveExecution=false`
- `externalProcessStarted=false`
- `executionDisabled=true`
- `processAdapterStarted=false`
- `processAdapterApproved=false`
- `implementationApproved=false`
- `recommendationGrantsExecution=false`
- `workspaceWriteAllowed=false`
- `dangerFullAccessAllowed=false`
- `dashboardTriggerAllowed=false`
- raw prompt body persisted: no
- raw command body persisted: no
- raw stdout/stderr body persisted: no
- raw argv persisted: no
- raw executable path persisted: no
- raw env plan persisted: no
- raw absolute worktree path persisted: no

The only approved process-boundary implementation remains
`packages/codex-kernel/src/real-read-only-adapter-process.ts`.

Dashboard trigger, `workspace_write`, `danger_full_access`, browser/CDP/Profile
/ Workspace/account automation, and broader autonomous use remain forbidden.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Contracts parse updated metadata | `pnpm nx test contracts` | 23 tests passed | Continue |
| Kernel attempt metadata and guard behavior | `pnpm nx test codex-kernel` | 73 tests passed | Continue |
| Supervisor guarded fake-runner attempt | `pnpm nx test supervisor` | 8 tests passed | Continue |
| CLI runtime worktree input handling | `pnpm nx test cli` | 22 tests passed | Continue |
| Process-boundary isolation | `pnpm tsx tools/audit-real-adapter-boundary.ts` | Boundary audit passed; process boundary isolated to the approved module | Continue |
| Real pilot execution | Code/test review | No real pilot command is run in this round; tests use injected fake runners | Continue |
| Raw path persistence | Supervisor and CLI tests | Runtime worktree path is not present in response/output JSON | Continue |

## Remaining Work

Round 4F.4 validates the corrected path with fake runners only. It does not
prove a live controlled pilot retry.

Round 4F.5 may be considered only after this round is committed cleanly and
must perform the next controlled CLI-only, read-only, local pilot retry under the
existing prerequisite, approval, worktree, evidence, audit, and verification
gates.

Round 4H.2 remains blocked until a later pilot retry is reviewed.
