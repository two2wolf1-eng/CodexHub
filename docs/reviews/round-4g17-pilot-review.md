# Round 4G.17 Pilot Review After Deferred Readback Fix

## Outcome

Outcome: `pilot_review_complete_with_process_start_release_blocker`

Round 4G.17 reviewed the authoritative Round 4F.35 retry result. The retry was Supervisor-backed, persisted, non-degraded, non-fallback, and metadata-only. It passed preflight and invoked the approved process boundary, so the Round 4F.34 deferred-readback propagation fix is no longer the active blocker.

The attempt still failed inside process startup with `process_start_failed` / `enoent`, and post-run verification was skipped because the attempt did not complete. This remains a release blocker for MVP.

## GSD Spec Phase

Goal: review the 4F.35 controlled retry result and decide whether it can support the 4H.12 MVP gate.

Scope: review the 4F.35 attempt, latest attempt, list/timeline readback, evidence refs, audit refs, post-run verification metadata, workspace mutation result, and release blocker status.

Non-scope: no pilot retry, no adapter attempt invocation, no production code change, no approval creation or consumption, no config change, no Dashboard change, no MVP approval, no browser/CDP/Profile/Workspace/account automation, no `workspace_write`, and no `danger_full_access`.

Acceptance criteria:

- The 4F.35 attempt authority and persistence are reviewed.
- Deferred-readback propagation status is reviewed.
- Boundary/process-start diagnostics are reviewed.
- Evidence/audit/timeline refs are recorded.
- Release blocker status is recorded before 4H.12.
- Verification passes before commit.

Hard boundaries:

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Fallback/degraded/local-only output is never authority.
- No raw prompt, command, stdout/stderr body, argv, executable path, env values, agent/reasoning body, or raw local worktree path is persisted or documented.

Affected apps/packages: `docs/reviews` only.

Risk level: medium. This is a docs-only governance review of a high-risk control-plane pilot result.

## Skills Used

Workflow Skills Used and Why:

- `gsd-spec-driver`: used to frame the round objective, scope, non-scope, acceptance criteria, boundaries, affected files, and risk.
- `gstack-delivery-workflow`: used to keep the round in preflight, review, docs, verification, commit, and clean checkpoint order.
- `superpowers-engineering-discipline`: used to keep the round evidence-first, docs-only, and free of scope expansion.

Project Skills Used and Why:

- `codexhub-architecture-planner`: used to confirm no package or app boundary changed.
- `codexhub-codex-exec-adapter`: used to review attempt status, boundary invocation, and diagnostic metadata.
- `codexhub-workflow-policy-reviewer`: used to review approval, policy, evidence, audit, fallback, and metadata-only guarantees.
- `codexhub-release-auditor`: used for release-blocker classification and verification closeout.

Skills Not Used and Why:

- `codexhub-contract-designer`: no contracts changed in 4G.17.
- `codexhub-playwright-qa`: Dashboard UI and browser smoke behavior were not touched.
- `codexhub-electron-cdp-observer` and `codexhub-browser-profile-observer`: Electron, CDP, browser profile, workspace, and account automation stayed out of scope.

## Preflight

Starting commit:

- `03e69e8 docs: add pilot retry after deferred readback fix`

Preflight passed:

- `git status --short`: clean
- `git log --oneline -1`: `03e69e8 docs: add pilot retry after deferred readback fix`
- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed

## Reviewed Attempt

Attempt:

- Attempt id: `codex_real_read_only_adapter_attempt_50c6f46a-f653-407c-9d07-e8dd74acfdcf`
- Dry-run id: `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`
- Status: `failed`
- Authoritative: `true`
- Supervisor-backed: `true`
- Persisted: `true`
- Degraded: `false`
- Not persisted: `false`
- Fallback used as authority: `false`

Attempt state:

- Preflight status: `passed`
- Process boundary invoked: `true`
- Result status: `failed`
- Result error code: `boundary_failed`
- Failed check codes: none
- Blocked check codes: none
- Boundary deferred reason codes: none
- Post-run verification status: `skipped`
- Post-run verification skip reason: `attempt_not_completed`
- Workspace mutation detected: `false`

Authority refreshed in 4F.35:

- Approval record: `codex_approval_record_56ca6dab-d296-4662-8446-740057424900`
- Approval artifact: `codex_approval_artifact_02ccb461-4c11-49f1-bd43-082e31404531`
- Source-preparation record: `codex_real_read_only_adapter_pilot_source_preparation_ce36aae9-6b09-49f7-91a3-52631a7bb89e`
- Prerequisite record: `codex_real_read_only_adapter_pilot_prerequisite_595aaf71-0fd2-4b23-ad78-85810a26501f`
- Prerequisite status: `ready_for_pilot_retry`
- Approval trace status: `aligned`
- Worktree label: `round-4f-pilot-c0fc119`
- Worktree status: `clean`
- Worktree path hash: `sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441`

Evidence/audit/timeline:

- Evidence refs: `evidence_5f31f201-917b-4915-a4d0-5c821d814554`, `evidence_ff37768c-2a2d-43ca-8113-95897d270e73`
- Audit refs: `audit_5d776941-951a-4bac-bde2-1153e3fd7c08`, `audit_ed77ee0e-0596-46ae-9ec0-7267efa7917c`
- Timeline readback found the attempt and included evidence/audit refs.

## Boundary Diagnostics

The 4F.35 attempt did not stop at `boundary_deferred`. It invoked the approved process boundary and exposed complete metadata-only boundary diagnostics for the failure:

- Boundary diagnostics complete: `true`
- Boundary failure code: `process_start_failed`
- Start failure kind: `enoent`
- ENOENT kind: `dependency_or_spawn_target_enoent`
- Platform: `win32`
- Resolved executable kind: `native_exe`
- Spawn target kind: `trusted_shell_shim_target`
- CWD exists: `true`
- CWD is directory: `true`
- CWD hash: `sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441`
- Executable exists: `true`
- Executable accessible: `true`
- Executable hash: `sha256:8cb0c0556d38701486221a902cb61aeba5ba9c3b2897fc4af2d0dea8166ae885`
- Dependency resolution status: `dependency_missing_suspected`
- Env allowlist key count: `6`
- Env allowlist key hash: `sha256:e967ffcd0f47d40b5312f30b6f25c0e7a103a4dcd1cc8022415dc17adc413962`
- Timed out: `false`
- Cancelled: `false`
- Duration ms: `2`
- Stdout hash: `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- Stderr hash: `sha256:7dacd894739ca235e5642ac13b3517b4a17f1c486160a06091c7990d31ef4b00`
- Stdout byte length: `0`
- Stderr byte length: `37`
- Stdout line count: `0`
- Stderr line count: `1`
- Stdout truncated: `false`
- Stderr truncated: `false`

The active blocker is therefore Windows process-start ENOENT/dependency resolution, not deferred-readback propagation.

## Metadata-Only Review

Attempt get/latest/list/timeline readback did not expose:

- raw runtime worktree path
- raw prompt body
- raw command body
- raw stdout/stderr body
- argv field
- executable path field
- env field or env value
- agent body
- reasoning body

Visible safety boundaries confirm:

- Fallback was not used as authority.
- The attempt remained Supervisor-backed and persisted.
- Dashboard trigger remained forbidden.
- `workspace_write` remained forbidden.
- `danger_full_access` remained forbidden.

## Release Decision Input

Decision: `pilot_review_complete_with_process_start_release_blocker`

4H.12 must record `no_go_for_mvp` because:

- The 4F.35 attempt did not complete.
- Post-run verification was skipped with `attempt_not_completed`.
- The process-start ENOENT/dependency-resolution failure remains unresolved.
- 4G.17 records a release blocker.

## Verification

Preflight verification:

- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed

Final verification before commit:

- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed
- `cmd /c pnpm nx run-many -t lint,test,build`: passed
- `git diff --check`: passed
- `git status --short`: only 4G.17 review docs changed before commit
