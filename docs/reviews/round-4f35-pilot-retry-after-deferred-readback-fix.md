# Round 4F.35 Pilot Retry After Deferred Readback Fix

## Outcome

Status: `pilot_retry_boundary_exercised_with_failure`

Round 4F.35 executed exactly one controlled CLI-only read-only retry after Round 4F.34. The retry did not stop at `boundary_deferred`; it passed preflight, invoked the approved process boundary, and failed inside boundary startup with complete metadata-only diagnostics.

4G.17 may review this result. 4H.12 remains blocked until 4G.17 completes and, unless the attempt later completes with post-run verification, the MVP outcome should remain conservative.

## GSD Spec Phase

Goal: verify whether the Round 4F.34 deferred-readback propagation fix produces reliable attempt readback during one controlled pilot retry.

Scope: one CLI-only read-only adapter retry, metadata-only attempt readback, evidence/audit/timeline readback, and this review document.

Non-scope: no production code changes, no Dashboard changes, no additional retry, no MVP approval, no browser/CDP/Profile/Workspace/account automation, no `workspace_write`, and no `danger_full_access`.

Acceptance criteria:

- Latest prerequisite readiness is `ready_for_pilot_retry`, persisted, non-degraded, and non-fallback.
- Approval authority is aligned before the retry.
- Main repo and isolated worktree are clean before the retry.
- Exactly one adapter attempt is executed.
- Attempt get/latest/list/timeline are read back.
- Raw prompt, command, stdout/stderr body, argv, executable path, env values, agent/reasoning body, and raw local worktree path are not persisted or documented.

Hard boundaries:

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Fallback/degraded/local-only output is never authority.
- Runtime worktree path was used only as CLI input and is not written here.

Affected packages/apps: CLI and Supervisor were used as control-plane surfaces only; no package source code was changed in this round.

Risk level: high, because this round executes the guarded local read-only process boundary once.

## Skills Used

Workflow Skills Used and Why:

- `gsd-spec-driver`: framed this round as one bounded retry with explicit non-scope and acceptance criteria.
- `gstack-delivery-workflow`: kept the sequence to preflight, gate refresh, one retry, readback, verification, and commit.
- `superpowers-engineering-discipline`: enforced evidence-first review, no retry loop, and clean-git checkpoints.

Project Skills Used and Why:

- `codexhub-codex-exec-adapter`: used for the adapter attempt path, process-boundary status, and metadata-only readback.
- `codexhub-architecture-planner`: used to keep the work limited to established CLI/Supervisor/control-plane boundaries.
- `codexhub-workflow-policy-reviewer`: used for approval, policy, evidence, audit, fallback, and metadata-only constraints.
- `codexhub-release-auditor`: used for verification, release-blocker recording, and commit readiness.

Skills Not Used and Why:

- `codexhub-contract-designer`: no contract changes were made.
- `codexhub-playwright-qa`: Dashboard was not touched.
- `codexhub-electron-cdp-observer` and `codexhub-browser-profile-observer`: Electron, browser profile, account, and workspace automation stayed out of scope.

## Gate Refresh

- Latest 4F.34 commit before retry: `de07dcc`.
- Dry run: `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`.
- Refreshed source-preparation record: `codex_real_read_only_adapter_pilot_source_preparation_ce36aae9-6b09-49f7-91a3-52631a7bb89e`.
- Refreshed prerequisite record: `codex_real_read_only_adapter_pilot_prerequisite_595aaf71-0fd2-4b23-ad78-85810a26501f`.
- Prerequisite status: `ready_for_pilot_retry`.
- Prerequisite degraded: `false`.
- Prerequisite notPersisted: `false`.
- Fallback used as authority: `false`.
- Config explicitly enabled: `true`.
- Sandbox mode: `read_only` only.
- `workspace_write` allowed: `false`.
- `danger_full_access` allowed: `false`.
- Dashboard trigger allowed: `false`.
- Worktree label: `round-4f-pilot-c0fc119`.
- Worktree status: `clean`.
- Worktree path hash: `sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441`.
- Pilot worktree HEAD: `c0fc119f10b1b4ba2597662ab8230fdff8974f8e`.
- Main repo clean before retry: yes.

The previously selected approval had expired. One replacement approval artifact was used for the retry:

- Approval record: `codex_approval_record_56ca6dab-d296-4662-8446-740057424900`.
- Approval artifact: `codex_approval_artifact_02ccb461-4c11-49f1-bd43-082e31404531`.
- Approval expires at: `2026-05-02T10:55:50.493Z`.
- Approval dry-run hash match: `true`.
- Approval policy hash match: `true`.
- Approval trace status after source/prequisite refresh: `aligned`.

Operator observation: an unused pending approval request remained from the refresh sequence and was not approved, consumed, or used for the attempt. The actual retry used only the approved artifact listed above.

## Attempt Result

- Attempt id: `codex_real_read_only_adapter_attempt_50c6f46a-f653-407c-9d07-e8dd74acfdcf`.
- Status: `failed`.
- Authoritative: `true`.
- Supervisor-backed: `true`.
- Persisted: `true`.
- Degraded: `false`.
- Not persisted: `false`.
- Preflight status: `passed`.
- Process boundary invoked: `true`.
- Result status: `failed`.
- Result error code: `boundary_failed`.
- Failed check codes: none.
- Blocked check codes: none.
- Boundary deferred reason codes: none.
- Post-run verification status: `skipped`.
- Post-run verification skip reason: `attempt_not_completed`.
- Workspace mutation detected: `false`.

Boundary diagnostics:

- Boundary diagnostics complete: `true`.
- Boundary failure code: `process_start_failed`.
- Start failure kind: `enoent`.
- ENOENT kind: `dependency_or_spawn_target_enoent`.
- Platform: `win32`.
- Resolved executable kind: `native_exe`.
- Spawn target kind: `trusted_shell_shim_target`.
- CWD exists: `true`.
- CWD is directory: `true`.
- CWD hash: `sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441`.
- Executable exists: `true`.
- Executable accessible: `true`.
- Executable hash: `sha256:8cb0c0556d38701486221a902cb61aeba5ba9c3b2897fc4af2d0dea8166ae885`.
- Dependency resolution status: `dependency_missing_suspected`.
- Env allowlist key count: `6`.
- Env allowlist key hash: `sha256:e967ffcd0f47d40b5312f30b6f25c0e7a103a4dcd1cc8022415dc17adc413962`.
- Timed out: `false`.
- Cancelled: `false`.
- Duration ms: `2`.
- Stdout hash: `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- Stderr hash: `sha256:7dacd894739ca235e5642ac13b3517b4a17f1c486160a06091c7990d31ef4b00`.
- Stdout byte length: `0`.
- Stderr byte length: `37`.
- Stdout line count: `0`.
- Stderr line count: `1`.
- Stdout truncated: `false`.
- Stderr truncated: `false`.

Evidence and audit:

- Evidence refs: `evidence_5f31f201-917b-4915-a4d0-5c821d814554`, `evidence_ff37768c-2a2d-43ca-8113-95897d270e73`.
- Audit refs: `audit_5d776941-951a-4bac-bde2-1153e3fd7c08`, `audit_ed77ee0e-0596-46ae-9ec0-7267efa7917c`.
- Timeline readback found the attempt and included evidence/audit refs.

## Readback Checks

Attempt get/latest/list/timeline readback did not contain the raw runtime worktree path.

The attempt was no longer `boundary_deferred`, so the deferred reason fields were correctly empty for this record:

- `boundaryDeferredReasonCode`: absent/empty.
- `boundaryDeferredReasonCodes`: `[]`.
- `boundaryDeferredDiagnostics`: not applicable.

Because the boundary was invoked, the release blocker shifted back to process-start execution rather than deferred-readback propagation.

## Decision

Decision label: `pilot_retry_boundary_exercised_with_failure`.

4G.17 should review this attempt as an authoritative boundary-invoked failed result. The likely release blocker is still Windows process-start ENOENT/dependency resolution, not deferred readback.

4H.12 should not record a conditional MVP Go unless 4G.17 finds no release blocker, which is unlikely because this attempt did not complete and post-run verification was skipped.
