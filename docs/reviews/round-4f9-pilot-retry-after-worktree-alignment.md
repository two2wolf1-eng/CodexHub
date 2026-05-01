# Round 4F.9 Pilot Retry After Worktree Source Alignment

## Status

Round 4F.9 refreshed the authoritative source-preparation and prerequisite
records with the canonical worktree hash introduced in Round 4F.8, then ran
exactly one controlled CLI-only read-only pilot retry.

Outcome: `pilot_retry_boundary_exercised_with_failure`

This outcome means the pre-boundary worktree blocker was cleared and the
approved process boundary was exercised, but the attempt did not complete. It
does not approve local MVP use, broader autonomous use, Dashboard triggering,
`workspace_write`, or `danger_full_access`.

## GSD Spec

- Goal: Refresh prerequisite records with the canonical worktree source hash
  and perform one controlled read-only pilot retry.
- Scope: Supervisor-backed source-preparation/prerequisite records, one
  CLI-only attempt, readback of attempt/latest/timeline evidence, this review
  document, and verification.
- Non-scope: No Dashboard work, no retry loop, no workspace write mode, no
  danger-full-access mode, no browser/CDP/Profile/Workspace/account
  automation, and no MVP approval.
- Acceptance criteria: Refreshed prerequisite is persisted and
  `ready_for_pilot_retry`; the attempt result is authoritative, persisted,
  metadata-only, non-fallback; evidence/audit/timeline readbacks exist; no raw
  local worktree path is persisted or recorded in this document.
- Hard boundaries: Dashboard trigger, `workspace_write`, `danger_full_access`,
  raw prompt/command/stdout/stderr/agent/reasoning/worktree path persistence,
  and broader autonomous use remain forbidden.
- Affected apps/packages: existing CLI/Supervisor control-plane commands were
  used; docs only are changed in this round.
- Risk level: high, because this round performs one controlled process-boundary
  pilot retry under the approved read-only gates.

## GStack Plan

- Plan: Reconfirm clean repo state, current config, policy source, approval,
  worktree metadata, audits, and foundation verification.
- Build: Refresh source-preparation and prerequisite records using CLI-derived
  worktree hash metadata only.
- Review: Confirm refreshed records are persisted, non-degraded, and
  non-fallback.
- QA: Run exactly one CLI-only attempt and read back attempt/latest/timeline.
- Ship: Commit this docs-only result after focused and full verification.
- Retro: Route to 4G.4 for pilot retry review before any MVP gate retry.

## Refreshed Prerequisite Evidence

| Field | Result |
|---|---|
| dryRunId | `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7` |
| approvalArtifactId | `codex_approval_artifact_fce8988c-b37b-45ae-a5cb-93c426d733bc` |
| sourcePreparationRecordId | `codex_real_read_only_adapter_pilot_source_preparation_e7a9c3c0-fb29-4d20-86cb-bead612cb4a5` |
| prerequisiteRecordId | `codex_real_read_only_adapter_pilot_prerequisite_6c942614-d33c-405b-af31-9b2536688b01` |
| prerequisite status | `ready_for_pilot_retry` |
| source status | `prepared` |
| worktreeLabel | `round-4f-pilot-c0fc119` |
| worktreeStatus | `clean` |
| worktreePathHash | `sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441` |
| degraded | `false` |
| notPersisted | `false` |
| fallbackUsedAsAuthority | `false` |
| pilotExecuted before retry | `false` |
| adapterAttemptInvoked before retry | `false` |

The raw local worktree path was used only as CLI runtime input and is not stored
or recorded here.

## Pilot Retry Result

| Field | Result |
|---|---|
| attemptId | `codex_real_read_only_adapter_attempt_240df5c2-750c-4f05-a8db-0a98f8b0f6c4` |
| status | `failed` |
| preflightStatus | `passed` |
| resultStatus | `failed` |
| processBoundaryInvoked | `true` |
| failedCheckCodes | none |
| blockedCheckCodes | none |
| postRunVerificationStatus | `skipped` |
| workspaceMutationDetected | `false` |
| evidenceRefCount | `2` |
| auditEventCount | `2` |
| outputHashCount | `2` |
| metadataHash | `sha256:e81b9be4b628feac3195a9c9861a846737569b5a9f89de161fd2c534665976e0` |
| degraded | `false` |
| notPersisted | `false` |
| authoritative | `true` |
| supervisorBacked | `true` |
| persisted | `true` |

Timeline readback returned the latest entry for
`codex_real_read_only_adapter_attempt_240df5c2-750c-4f05-a8db-0a98f8b0f6c4`
with `status=failed`, `processBoundaryInvoked=true`,
`postRunVerificationStatus=skipped`, and `workspaceMutationDetected=false`.
Timeline readback included evidence/audit metadata and did not include the raw
local worktree path.

## Safety Boundary Confirmation

- `liveExecution=false`
- `externalProcessStarted=false`
- `executionDisabled=true`
- `processAdapterApproved=false`
- `implementationApproved=false`
- `recommendationGrantsExecution=false`
- `workspaceWriteAllowed=false`
- `dangerFullAccessAllowed=false`
- `dashboardTriggerAllowed=false`
- raw prompt body stored: `false`
- raw command body stored: `false`
- raw stdout body stored: `false`
- raw stderr body stored: `false`
- raw agent message body stored: `false`
- raw reasoning body stored: `false`
- raw local worktree path persisted: `false`

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Clean start | `git status --short` | Empty output | Continue |
| Skills audit | `pnpm audit:skills` | Passed | Continue |
| No-live audit | `pnpm audit:no-live-automation` | Passed | Continue |
| Boundary audit | `pnpm tsx tools/audit-real-adapter-boundary.ts` | Passed | Continue |
| Foundation verify | `pnpm verify:foundation` | Passed | Continue |
| Pilot worktree HEAD | `git -C <pilot-worktree> rev-parse HEAD` | `c0fc119f10b1b4ba2597662ab8230fdff8974f8e` | Continue |
| Pilot worktree clean | `git -C <pilot-worktree> status --porcelain=v1` | Empty output | Continue |
| Source refresh | `pilot-prerequisite-sources prepare` | `prepared`, non-degraded, persisted, canonical hash | Continue |
| Prerequisite refresh | `pilot-prerequisites check` | `ready_for_pilot_retry`, non-degraded, persisted | Continue |
| Single retry | CLI-only attempt command | one attempt recorded as `failed` | Continue to review |
| Attempt readback | `attempts latest/get` | authoritative, persisted, boundary invoked | Continue |
| Timeline readback | `attempts timeline --include-evidence --include-audit` | timeline entry present, no raw path found | Continue |

## Next Round

Round 4G.4 may review this pilot retry result. Round 4H.3 must not be run until
4G.4 has reviewed whether the boundary failure is a release blocker.
