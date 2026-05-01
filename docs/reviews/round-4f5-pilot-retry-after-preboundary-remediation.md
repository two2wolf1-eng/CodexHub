# Round 4F.5 Pilot Retry After Pre-Boundary Remediation

## Status

Round 4F.5 performed one controlled CLI-only read-only adapter pilot retry
after Round 4F.4 remediated the pre-boundary disabled-default attempt path.

Outcome: `pilot_retry_blocked_before_boundary`

The retry produced an authoritative, Supervisor-backed, persisted,
non-degraded attempt record. It remained blocked before the process boundary:
`processBoundaryInvoked=false`.

The blocked reason changed from the previous pre-boundary blocker. Config was
loaded and explicitly enabled, the runtime worktree hash matched the refreshed
persisted source metadata, and the attempt failed the `policy_decision_exists`
hard gate because the policy decision outcome was `deny`.

This round does not count as MVP success. It does not approve Dashboard
triggering, `workspace_write`, `danger_full_access`, browser/CDP/Profile
/ Workspace/account automation, or broader autonomous use.

## Source Records

Original known source records at round start:

- prerequisiteRecordId:
  `codex_real_read_only_adapter_pilot_prerequisite_2697399e-5c4c-4e9f-82ff-9fefe0e24633`
- sourcePreparationRecordId:
  `codex_real_read_only_adapter_pilot_source_preparation_296b9230-c57b-4e10-8f09-0a937fec6985`
- original approvalArtifactId:
  `codex_approval_artifact_f0603925-9c75-406a-bc97-55f1d655a19c`

Gate refresh found the original approval had expired. Round 4F.5 created one
replacement approval through the existing Supervisor-backed governance flow:

- approvalRequestId:
  `codex_approval_request_623ae43f-c51d-4185-9acb-7c5c087a81a6`
- approvalArtifactId:
  `codex_approval_artifact_4addc921-d46f-4a0d-811d-173694a650c6`
- dryRunPlanHash:
  `sha256:fae77dec23facbffaf8b5803e79ac23cbc4ffbd42a2d0f4b92da5f4584e528e7`
- policyDecisionHash:
  `sha256:52c57c4d6a44da7a5be6d1338561514a7da1b37d50485700cfc4882af3a39f36`

Round 4F.5 also recorded refreshed metadata-only source inputs so the persisted
worktree hash used the same normalized absolute-path hashing rule as the
Supervisor attempt path:

- refreshed sourcePreparationRecordId:
  `codex_real_read_only_adapter_pilot_source_preparation_f4a7db8d-05fa-49c6-b208-e239dc9a0932`
- refreshed prerequisiteRecordId:
  `codex_real_read_only_adapter_pilot_prerequisite_6eaa5125-2efd-4c85-9f8a-b75be0d33ca6`
- dryRunId:
  `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`
- worktreeLabel: `round-4f-pilot-c0fc119`
- worktreeStatus: `clean`
- worktreePathHash:
  `sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441`

The raw local worktree path was used only as runtime CLI input. It is not
persisted or recorded here.

## Pre-Pilot Gate Evidence

Latest refreshed prerequisite check before the attempt:

- status: `ready_for_pilot_retry`
- degraded: `false`
- notPersisted: `false`
- hardGateCount: `8`
- passedGateCount: `9`
- blockedGateCount: `0`
- requiresReviewFindingCount: `0`
- missingPrerequisites: none
- configExplicitlyEnabled: `true`
- validUnusedApprovalPresent: `true`
- isolatedCleanWorktreeMetadataPresent: `true`
- authoritativeSourcePreparationPresent: `true`
- authoritativeAttemptEvidencePresent: `true`
- evidenceAuditReady: `true`
- fallbackUsedAsAuthority: `false`
- pilotExecuted: `false`
- adapterAttemptInvoked: `false`

Main repository and dedicated pilot worktree were clean immediately before the
attempt.

## Pilot Attempt Summary

The pilot retry used the existing CLI-only real read-only adapter attempt path
with the known dry-run id, the refreshed approval artifact id, and isolated
worktree runtime input. The raw command body and raw local worktree path are
intentionally not stored in this report.

Attempt result:

- attemptId:
  `codex_real_read_only_adapter_attempt_702efb4a-2b92-435c-b357-e80b92760492`
- requestId:
  `codex_real_read_only_adapter_request_7ca36415-4e63-4606-9ea8-eb759b358679`
- preflightId:
  `codex_real_read_only_adapter_preflight_8697cfb9-0699-4a88-bf64-8dc1c39ef793`
- resultId:
  `codex_real_read_only_adapter_result_b1774ad5-b0cb-4155-ad6a-8f374cebe538`
- status: `blocked`
- authoritative: `true`
- supervisorBacked: `true`
- persisted: `true`
- degraded: `false`
- notPersisted: `false`
- processBoundaryInvoked: `false`
- preflightStatus: `failed`
- resultStatus: `blocked`
- resultErrorCode: `preflight_failed`
- failedCheckCodes:
  - `policy_decision_exists`
- blockedCheckCodes: none
- postRunVerificationStatus: `not_required`
- outputHashCount: `0`
- metadataHash:
  `sha256:9eb56d3ca83a5f37fae53cdf6ef10e92369b711ee3d8a71b6da9bacaa16e44f0`

The attempt stopped before process boundary invocation. No real Codex process
was launched during the attempt because the preflight hard gate failed.

## Evidence, Audit, And Timeline

Evidence:

- evidenceRefId: `evidence_9c59f2a7-c72d-40e8-b5b5-619bcdddbdfe`
- evidence summary id:
  `codex_real_read_only_adapter_evidence_summary_b868c747-c8a0-40fa-abcc-0b838ffa81fd`
- evidenceRefCount: `1`
- outputHashCount: `0`
- metadata-only: `true`
- redacted: `true`

Audit:

- auditSummaryId:
  `codex_real_read_only_adapter_audit_summary_59563d0b-dbfa-44a7-9c80-366f0bbfdc2c`
- auditEventIds:
  - `audit_06b7667e-0ab9-45f7-beb3-2305579e425b`
  - `audit_ba889838-7f6a-4f46-9553-81d460110bd7`
- actionKinds:
  - `codex.exec.real_read_only_adapter.before_boundary`
  - `codex.exec.real_read_only_adapter.abort`
- auditEventCount: `2`

Timeline:

- timeline latest attempt id:
  `codex_real_read_only_adapter_attempt_702efb4a-2b92-435c-b357-e80b92760492`
- latest timeline status: `blocked`
- timeline entry count in readback: `3`
- latest entry evidenceRefCount: `1`
- latest entry auditEventCount: `2`
- processBoundaryInvokedCount for the latest retry: `0`
- verification result: `not_required`, because boundary execution did not start
- workspace mutation result: main repository and pilot worktree remained clean

Readback checks confirmed no raw local worktree path, raw argv, executable
path, env plan, prompt body, command body, stdout/stderr body, agent message
body, or reasoning body was returned.

## Operator Observations

- Round 4F.4's config/pre-boundary remediation changed the blocker: this retry
  did not fail with `config_disabled`, and the runtime worktree hash matched
  the refreshed source metadata.
- The attempt remained authoritative, persisted, non-degraded, and
  metadata-only.
- The process boundary was not invoked.
- The current release blocker is `policy_decision_exists`: the policy decision
  available to the attempt path has outcome `deny`.
- This is not a docs-only release issue. A later round should diagnose the
  policy decision source and decide whether a new policy decision, updated
  governance record, or policy remediating change is required before another
  pilot retry.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Clean start | `git status --short` | Empty output | Continue |
| Required remediation commit | `git log --oneline -5` | `63f52db` present | Continue |
| Skills audit | `pnpm audit:skills` | Passed | Continue |
| No-live audit | `pnpm audit:no-live-automation` | Passed | Continue |
| Boundary audit | `pnpm tsx tools/audit-real-adapter-boundary.ts` | Passed | Continue |
| Foundation verification | `pnpm verify:foundation` | Passed before attempt | Continue |
| Original approval state | `pnpm codexhub codex exec approvals` | Original approval expired | Create exactly one replacement approval |
| Replacement approval | Supervisor-backed approval request/manual approval | New approval artifact persisted and non-degraded | Continue |
| Refreshed source prep | `pilot-prerequisite-sources prepare` | `prepared`, persisted, non-degraded | Continue |
| Refreshed prerequisite readiness | `pilot-prerequisites check` | `ready_for_pilot_retry`, persisted, non-degraded | Continue |
| Pilot attempt | CLI-only attempt path | Authoritative `blocked` attempt record | Continue to review |
| Process boundary | Attempt readback | `processBoundaryInvoked=false` | Release blocker |
| Failed gate | Attempt readback | `policy_decision_exists` | Requires later remediation/review |
| Raw path/body persistence | Attempt/latest/timeline readback search | No raw local path, argv, executable, env, or body content returned | Continue |
| Post-attempt workspace state | Main and pilot worktree git status | Clean | Continue |

## Verification Results

Focused verification after the retry and this document:

- `pnpm nx test codex-kernel`: passed, 73 tests.
- `pnpm nx test cli`: passed, 22 tests.
- `pnpm nx test supervisor`: passed, 8 tests.
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed.
- `pnpm audit:no-live-automation`: passed.
- `pnpm verify:foundation`: passed.
- `git diff --check`: passed.
- `git status --short`: only this new 4F.5 review document was untracked at
  the focused checkpoint.

## Safety Boundary

Fixed boundary flags remained:

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

Round 4F.5 did not add a Dashboard trigger, did not allow `workspace_write`,
did not allow `danger_full_access`, did not use browser/CDP/Profile/Workspace
automation, and did not approve broader autonomous use.

## Next Round

Round 4G.2 can be considered to review this authoritative blocked retry result.

If the project chooses remediation before review, the likely remediation line is
Round 4F.6: policy decision source alignment before the next pilot retry.

Round 4F.5 does not approve MVP use.
