# Round 4F.23: Pilot Retry After Spawn Compatibility Remediation

## Summary

Round 4F.23 executed exactly one controlled CLI-only read-only adapter retry after Round 4F.22 (`86bebb9`) added process-start and spawn compatibility diagnostics.

Outcome: `pilot_retry_boundary_exercised_with_failure`.

The retry produced an authoritative, Supervisor-backed, persisted attempt record. The approval, config, policy, worktree, source-prep, prerequisite, and approval authority gates passed. The attempt reached the approved process boundary, but failed during process start with complete metadata-only diagnostics.

This round does not approve MVP use. The next allowed round is 4G.11 pilot review. 4H.7 remains blocked until review completes and release blockers are resolved.

## Development Workflow Protocol

### GSD Spec Phase

Goal: run one controlled read-only adapter retry to validate whether the 4F.22 spawn compatibility remediation changed the boundary failure result or diagnostics.

Scope:
- Create this review document.
- Refresh control-plane source records, prerequisite readiness, and approval authority through existing Supervisor-backed workflows.
- Run one CLI-only read-only attempt.
- Read back attempt, latest attempt, and timeline evidence.

Non-scope:
- No production code changes.
- No Dashboard changes or trigger.
- No workspace write or danger full access.
- No browser, CDP, profile, workspace, account, session, token, cookie, or MFA automation.
- No retry beyond the single attempt in this round.
- No raw prompt, command, stdout, stderr, argv, executable path, env plan, agent body, reasoning body, or raw worktree path persistence.

Acceptance criteria:
- Latest commit before retry was `86bebb9`.
- Preflight audits passed.
- Latest prerequisite readiness was refreshed to `ready_for_pilot_retry`.
- Approval authority trace was `aligned`.
- Main repo and isolated pilot worktree were clean before and after the retry.
- Exactly one attempt was run.
- Attempt/readback/timeline stayed metadata-only.
- Focused and final verification passed before commit.

Hard boundaries:
- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Broader autonomous use remains blocked.

Affected apps/packages:
- Docs only in this commit.
- Runtime validation used existing CLI, Supervisor, store, and codex-kernel paths.

Risk level: high, because the round exercises the approved process boundary, but all outputs remained read-only and metadata-only.

### GStack Delivery Phase

Plan: refresh authority sources, run one attempt, read back evidence, document the result, verify, and commit.

Build: no code changes were made. This document records the run.

Review: readback was checked for raw local path/body/output leakage and none was found in the attempt or timeline readback.

QA: focused tests and full verification were run after the document was written.

Ship: commit this document only after verification passes and git is clean.

Retro: 4F.22 made diagnostics actionable. The next risk is process start remediation for `process_start_failed` / `eperm`.

## Skills Used

Workflow Skills Used and Why:
- `gsd-spec-driver`: required to restate the objective, scope, non-scope, acceptance criteria, and hard boundaries before the round.
- `gstack-delivery-workflow`: required to execute the plan-build-review-QA-ship-retro delivery sequence.
- `superpowers-engineering-discipline`: required to keep the round small, evidence-driven, and bounded to one retry.

Project Skills Used and Why:
- `codexhub-architecture-planner`: used for cross-plane sequencing across CLI, Supervisor, kernel, store, evidence, and audit authority.
- `codexhub-codex-exec-adapter`: used because the round validates the read-only adapter control plane and process-boundary path.
- `codexhub-workflow-policy-reviewer`: used because approvals, policy hashes, evidence, audit, and readiness gates are central to the retry.
- `codexhub-release-auditor`: used for verification, release blocker framing, and commit closeout.

Skills Not Used and Why:
- `codexhub-contract-designer`: not used because no contracts or schemas changed in this round.
- `codexhub-playwright-qa`: not used because Dashboard was not changed.
- `codexhub-electron-cdp-observer`: not used because Electron/CDP modules remain out of scope.
- `codexhub-browser-profile-observer`: not used because browser profile and account automation remain out of scope.

## Preflight Evidence

- `git status --short`: clean.
- `git log --oneline -1`: `86bebb9 chore: remediate read-only adapter spawn compatibility diagnostics`.
- `pnpm audit:skills`: passed.
- `pnpm audit:no-live-automation`: passed.
- `pnpm audit:boundaries`: passed.
- `pnpm audit:sqlite-isolation`: passed.
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed.
- `pnpm verify:foundation`: passed.

## Gate Refresh Evidence

Dry run:
- `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`

Policy source:
- `codex_real_read_only_adapter_policy_source_35a9f5de-a23e-4340-a358-9d95c40452a0`
- Status: `aligned`
- `dryRunPlanHash`: `sha256:fae77dec23facbffaf8b5803e79ac23cbc4ffbd42a2d0f4b92da5f4584e528e7`
- `policyDecisionHash`: `sha256:c86aba085a8a627c82de42abd6964a13e5d25e275b2e595e7f33daea4ae77a00`

Approval:
- Previous approval was expired, so one replacement was created through the Supervisor-backed approval request and manual approval flow.
- Approval request: `codex_approval_request_dedce28f-54f9-49a3-b24d-8a216305bd2f`
- Approval artifact: `codex_approval_artifact_ed68a1a5-25ac-4f2e-bab4-c7d5425570ea`
- Approval record: `codex_approval_record_16546009-7aa4-4d71-97d1-9e2d9bba055e`
- Approval status: approved, unused, not revoked, not expired.
- Dry-run hash match: true.
- Policy hash match: true.

Source preparation:
- Record: `codex_real_read_only_adapter_pilot_source_preparation_ac5242ef-58f3-4ace-9f67-6de765725d84`
- Status: `prepared`
- Hard gates: 7
- Passed gates: 7
- Blocked gates: 0
- `degraded=false`
- `notPersisted=false`

Prerequisite readiness:
- Record: `codex_real_read_only_adapter_pilot_prerequisite_0dce1ebb-f768-4575-a3c5-7882bbdf2e38`
- Status: `ready_for_pilot_retry`
- Hard gates: 9
- Passed gates: 10
- Blocked gates: 0
- `degraded=false`
- `notPersisted=false`
- `fallbackUsedAsAuthority=false`
- `pilotExecuted=false`
- `adapterAttemptInvoked=false`

Approval authority trace:
- Record: `codex_real_read_only_adapter_approval_authority_trace_d74265a8-ac5f-4fbc-a7f0-0ec6ec5bb6d2`
- Status: `aligned`
- Exact lookup matched: true.
- Source-prep matched: true.
- Prerequisite matched: true.
- Attempt preflight would accept: true.
- Reason codes: none.

Worktree metadata:
- Label: `round-4f-pilot-c0fc119`
- Status: `clean`
- Path hash: `sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441`
- Raw worktree path stored: false.
- Main repo clean before retry: true.
- Pilot worktree clean before retry: true.

## Pilot Retry

Command shape:

```text
pnpm codexhub codex exec real-read-only-adapter attempt <dryRunId> --approval <approvalArtifactId> --worktree <runtimePilotWorktreePath> --json
```

The runtime worktree path was used only as CLI input. It is not recorded in this document.

Exactly one attempt was run.

## Attempt Result

Attempt:
- `codex_real_read_only_adapter_attempt_664d33c4-926f-4d3b-bc84-89753c1de8b5`

Authority:
- `authoritative=true`
- `supervisorBacked=true`
- `persisted=true`
- `degraded=false`
- `notPersisted=false`

Status:
- `status=failed`
- `preflightStatus=passed`
- `processBoundaryInvoked=true`
- `resultStatus=failed`
- `resultErrorCode=boundary_failed`
- `failedCheckCodes=[]`
- `blockedCheckCodes=[]`

Boundary diagnostics:
- `boundaryDiagnosticsComplete=true`
- `boundaryDiagnosticsMissingFields=[]`
- `failureCode=process_start_failed`
- `startFailureKind=eperm`
- `platform=win32`
- `resolvedExecutableKind=native_exe`
- `cwdHash=sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441`
- `cwdExists=true`
- `cwdIsDirectory=true`
- `executableExists=true`
- `executableAccessible=true`
- `envAllowlistKeyCount=6`
- `envAllowlistKeyHash=sha256:e967ffcd0f47d40b5312f30b6f25c0e7a103a4dcd1cc8022415dc17adc413962`
- `timedOut=false`
- `cancelled=false`
- `durationMs=9`
- `stdoutHash=sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- `stderrHash=sha256:ded3024594fdb1763bef6d3d8b1cea9d319c280c929d2127a6218bd28eb1c24b`
- `stdoutByteLength=0`
- `stderrByteLength=36`
- `stdoutLineCount=0`
- `stderrLineCount=1`
- `stdoutTruncated=false`
- `stderrTruncated=false`

Post-run verification:
- `postRunVerificationStatus=skipped`
- `postRunVerificationSkipReason=attempt_not_completed`

Workspace mutation:
- `workspaceMutationDetected=false`
- Main repo clean after retry: true.
- Pilot worktree clean after retry: true.

Evidence and audit:
- Evidence refs:
  - `evidence_354ddf96-bbf0-4359-8d25-61a3690dc145`
  - `evidence_f38bdc5a-dafd-4c07-aaff-0fcfca9c2b93`
- Audit events:
  - `audit_b630fbe5-60aa-4f38-a15b-5102774a628d`
  - `audit_8b5e5176-3b69-457c-b97f-3fa0533e3a54`
- Evidence ref count: 2.
- Audit event count: 2.
- Output hash count: 2.

Timeline:
- Timeline id: `codex_real_read_only_adapter_attempt_timeline_691ce2e2-39f6-4175-9356-ba25c673abff`
- Latest entry for this round: `codex_real_read_only_adapter_attempt_timeline_entry_06a72500-7f39-465b-8004-00b890b8de8c`
- Timeline status: `failed`

## Metadata-Only Check

Readback checks for the attempt and timeline did not expose:
- raw runtime worktree path
- raw prompt body
- raw command body
- raw stdout or stderr body
- argv array
- executable path
- env plan
- agent body
- reasoning body

Persisted summaries report:
- `metadataOnly=true`
- `bodyStored=false`
- `promptBodyStored=false`
- `commandBodyStored=false`
- `stdoutBodyStored=false`
- `stderrBodyStored=false`
- `agentMessageBodyStored=false`
- `reasoningBodyStored=false`
- `worktreePathStored=false`
- `executablePathStored=false`
- `envPlanStored=false`
- `argvStored=false`
- `outputBodyStored=false`

## Decision

Decision label: `pilot_retry_boundary_exercised_with_failure`.

4F.23 proves the process boundary is reached and the 4F.22 diagnostics are visible in authoritative attempt/latest/timeline readback. The remaining blocker is still process start failure, now classified as `process_start_failed` with `startFailureKind=eperm`.

4G.11 may be considered for review of this authoritative result.

4H.7 remains blocked because:
- the attempt did not complete,
- post-run verification was skipped,
- a process start release blocker remains.

## Recommended Next Round

Round 4G.11: Pilot Review After Spawn Compatibility Remediation.

Expected focus:
- confirm authority and metadata-only evidence,
- review `process_start_failed` / `eperm`,
- decide whether the next remediation is a narrower Windows process-start permission or executable launch compatibility fix,
- keep 4H.7 blocked unless 4G.11 records no release blocker.

## Boundaries Maintained

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Broader autonomous use remains blocked.
