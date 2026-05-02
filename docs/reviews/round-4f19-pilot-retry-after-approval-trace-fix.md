# Round 4F.19: Pilot Retry After Approval Trace Fix

## Status

Outcome: `pilot_retry_boundary_exercised_with_failure`

Round 4F.19 executed exactly one controlled CLI-only read-only retry after Round 4F.18 aligned approval authority tracing. The retry produced an authoritative, Supervisor-backed, persisted attempt record. The attempt passed preflight, reached the approved process boundary, and failed at the boundary with complete metadata-only diagnostics.

This round does not approve MVP use. It does not enter Round 4G.9 or Round 4H.6.

## GSD Spec

Goal: verify whether the Round 4F.18 approval authority trace fix resolves the readiness versus attempt-preflight approval split.

Scope:

- Run one controlled CLI-only read-only adapter attempt.
- Refresh prerequisite, source-prep, approval trace, config, and worktree gates.
- Create this review document.

Non-scope:

- No production code changes.
- No Dashboard changes or triggers.
- No workspace_write or danger_full_access.
- No browser, CDP, profile, workspace, account, token, cookie, session, or MFA automation.
- No raw prompt, command, stdout, stderr, argv, executable path, env plan, agent body, reasoning body, or raw local worktree path persistence.
- No retry after the single attempt.

Acceptance criteria:

- Latest prerequisite is `ready_for_pilot_retry`.
- Approval authority trace is `aligned`.
- Config is enabled and read-only only.
- Main repo and isolated pilot worktree are clean before attempt.
- Exactly one CLI-only attempt is run.
- Attempt/latest/timeline readback is authoritative, persisted, non-degraded, and metadata-only.
- Focused and full verification pass before commit.

Risk level: high, because this round intentionally exercises the approved process boundary for the controlled read-only pilot path.

## Workflow Skills Used and Why

- `gsd-spec-driver`: used to keep the round goal, scope, non-scope, boundaries, and acceptance criteria explicit before recording the result.
- `gstack-delivery-workflow`: used to keep the work in gated preflight, gate refresh, single retry, readback, verification, commit, and stop phases.
- `superpowers-engineering-discipline`: used to preserve small steps, evidence over claims, clean git checkpoints, and no scope creep.

## Project Skills Used and Why

- `codexhub-architecture-planner`: used for cross-plane gate sequencing across CLI, Supervisor, store-backed records, and kernel attempt records.
- `codexhub-codex-exec-adapter`: used because the round exercises the real read-only adapter control-plane path.
- `codexhub-workflow-policy-reviewer`: used for approval, policy, worktree, evidence, audit, and no-live boundary checks.
- `codexhub-contract-designer`: used to validate the metadata-only contract surfaces read back from attempt, trace, and timeline records.
- `codexhub-release-auditor`: used for verification, boundary review, diff review, commit, and final summary.

## Skills Not Used and Why

- `codexhub-playwright-qa`: not used because Dashboard code and browser QA surfaces were not changed.
- `codexhub-electron-cdp-observer`: not used because Electron/CDP scope remains forbidden.
- `codexhub-browser-profile-observer`: not used because Browser Profile, Chrome Profile, ChatGPT Workspace, and account automation remain forbidden.

## Preflight

Starting commit: `4a79ebd chore: align read-only adapter approval readiness attempt authority`

Preflight passed:

- Git status was clean.
- `pnpm audit:skills` passed.
- `pnpm audit:no-live-automation` passed.
- `pnpm audit:boundaries` passed.
- `pnpm audit:sqlite-isolation` passed.
- `pnpm tsx tools/audit-real-adapter-boundary.ts` passed.
- `pnpm verify:foundation` passed.

Supervisor authority note:

- The already-running default Supervisor responded to health checks, but its approval-authority trace command produced display-only fallback for the new 4F.18 route.
- A current-workspace Supervisor was started on an isolated local validation port and used for 4F.19 control-plane operations.
- Fallback output was not used as authority.

## Gate Refresh

Dry run:

- `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`

Initial persisted prerequisite:

- Record: `codex_real_read_only_adapter_pilot_prerequisite_16b82eaa-e420-4980-8983-5d03825564e5`
- Status: `ready_for_pilot_retry`
- `degraded=false`
- `notPersisted=false`
- `fallbackUsedAsAuthority=false`

Initial persisted source-prep:

- Record: `codex_real_read_only_adapter_pilot_source_preparation_927df5e3-4ab9-441a-b3e3-ad0930a64fc9`
- Status: `prepared`
- `degraded=false`
- `notPersisted=false`

The previous approval artifact was expired and not acceptable to attempt preflight. One replacement approval was created through the Supervisor-backed approval-request and manual-approval flow.

Replacement approval:

- Approval request: `codex_approval_request_82246cfc-9d4c-4c42-8954-cb15a77aee80`
- Approval artifact: `codex_approval_artifact_20bcc2ea-9988-4bcd-ba65-a14af854a2b3`
- Dry-run plan hash matched.
- Policy decision hash matched.
- Approval was approved, unused, not revoked, and not expired at retry time.

Refreshed source-prep:

- Record: `codex_real_read_only_adapter_pilot_source_preparation_111a0c3e-546d-48d0-b7e6-118857faa4d3`
- Status: `prepared`
- `degraded=false`
- `notPersisted=false`

Refreshed prerequisite:

- Record: `codex_real_read_only_adapter_pilot_prerequisite_84dda024-03c5-45a2-9357-1e979c97da38`
- Status: `ready_for_pilot_retry`
- `degraded=false`
- `notPersisted=false`
- `fallbackUsedAsAuthority=false`

Approval authority trace:

- Record: `codex_real_read_only_adapter_approval_authority_trace_91828f2f-3093-41ed-b86e-b20f2d03e698`
- Status: `aligned`
- `exactLookupMatched=true`
- `sourcePreparationMatched=true`
- `prerequisiteMatched=true`
- `dryRunHashMatched=true`
- `policyHashMatched=true`
- `approvalApproved=true`
- `approvalUnused=true`
- `approvalNotRevoked=true`
- `approvalNotExpired=true`
- `attemptPreflightWouldAccept=true`
- `reasonCodes=[]`
- `degraded=false`
- `notPersisted=false`
- `fallbackUsedAsAuthority=false`

Config:

- `liveEnabled=true`
- `allowedSandboxModes=[read_only]`
- `workspace_write` forbidden
- `danger_full_access` forbidden

Worktree metadata:

- Label: `round-4f-pilot-c0fc119`
- Status: `clean`
- Path hash: `sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441`
- Raw local path was used only as CLI runtime input and is not documented here.
- The isolated worktree HEAD matched the expected detached commit.
- Main repo and isolated worktree were clean immediately before retry.

## Single Retry

Command summary: one CLI-only real-read-only-adapter attempt using the dry-run id, the aligned approval artifact, and the isolated runtime worktree path as input only.

No prompt body, command body, Dashboard input, browser/CDP/Profile/Workspace input, or fallback authority was passed.

No retry was performed.

## Attempt Result

Attempt:

- Attempt id: `codex_real_read_only_adapter_attempt_3e53f6bb-cefd-474c-b117-097833ffffad`
- Status: `failed`
- Authoritative: `true`
- Supervisor-backed: `true`
- Persisted: `true`
- `degraded=false`
- `notPersisted=false`
- `preflightStatus=passed`
- `processBoundaryInvoked=true`
- `resultStatus=failed`
- `resultErrorCode=boundary_failed`
- `failedCheckCodes=[]`
- `blockedCheckCodes=[]`

Boundary diagnostics:

- Boundary status: `failed`
- Normalized failure code: `process_start_failed`
- Timed out: `false`
- Cancelled: `false`
- Duration: `10ms`
- stdout hash: `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- stderr hash: `sha256:9a3d6f9e1de3f32ff898035b65e2d2149fcbf349adad7c2b74a1e1ee414df4d6`
- stdout byte count: `0`
- stderr byte count: `11`
- stdout line count: `0`
- stderr line count: `1`
- stdout truncated: `false`
- stderr truncated: `false`
- Diagnostics complete: `true`
- Missing diagnostic fields: `[]`

Post-run verification:

- Status: `skipped`
- Skip reason: `attempt_not_completed`

Workspace mutation:

- `workspaceMutationDetected=false`

Evidence and audit:

- Evidence refs:
  - `evidence_56eba78d-7f2e-4a4e-9dd5-063ff0a68fb5`
  - `evidence_0d26c350-226b-48ba-ae82-72925959f6fa`
- Audit events:
  - `audit_0229aa9a-e44b-4978-8951-ad41dce55e10`
  - `audit_73e9b376-04bd-4277-a9ca-8dc1c0c2b1c8`
- Timeline id: `codex_real_read_only_adapter_attempt_timeline_1e80af37-b898-4bd6-8e25-a3f6e833c72d`

Readback checks:

- Attempt get, latest, and timeline all referenced the same latest attempt id.
- The latest timeline entry included the same evidence and audit refs.
- No raw runtime worktree path was found in readback.
- No raw prompt body, command body, stdout body, stderr body, argv array, executable path, env plan, agent body, or reasoning body was found in readback.
- Stored `agentMessageBodyStored=false` and `reasoningBodyStored=false` flags are expected safety flags, not raw body storage.

## Decision

Decision label: `pilot_retry_boundary_exercised_with_failure`

Round 4F.19 verifies that the approval split identified before 4F.18 is resolved for this retry: the refreshed approval authority trace was aligned, attempt preflight passed, and the attempt reached the approved process boundary.

The remaining blocker is boundary execution failure:

- The process boundary was invoked.
- The boundary failed with `process_start_failed`.
- Post-run verification did not run because the attempt did not complete.

Round 4G.9 may review this authoritative result. Round 4H.6 remains blocked until 4G.9 completes and until a future retry can satisfy MVP gate requirements.

## Safety Boundary Confirmation

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Broader autonomous use remains forbidden unless future governance approves it.
- Raw prompt, command, stdout, stderr, agent, reasoning, argv, executable, env, and local worktree path persistence remains forbidden.
- Fallback/degraded output was not used as authority.
- The approved process boundary remains isolated to `packages/codex-kernel/src/real-read-only-adapter-process.ts`.

## Verification

Focused verification:

- `pnpm nx test codex-kernel`: passed
- `pnpm nx test cli`: passed
- `pnpm nx test supervisor`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm verify:foundation`: passed
- `git diff --check`: passed

Final verification:

- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed
- `cmd /c pnpm nx run-many -t lint,test,build`: passed
- `git diff --check`: passed
- `git status --short`: only the expected 4F.19 review doc was pending before commit
