# Round 4G.18: Pilot Review After Dependency ENOENT Remediation

## GSD Spec

- Goal: review the Round 4F.37 controlled retry and decide whether the current blocker remains inside the dependency ENOENT/process-start remediation scope.
- Scope: governance review of the 4F.37 attempt, evidence/audit/timeline readback, release-blocker classification, and this docs-only review.
- Non-scope: no pilot retry, no adapter attempt invocation, no production code changes, no approval creation, no config changes, no Dashboard changes, and no permission expansion.
- Acceptance criteria: the 4F.37 attempt authority is confirmed, the blocker class is identified, release readiness is assessed, and verification passes before commit.
- Hard boundaries: Dashboard trigger, `workspace_write`, `danger_full_access`, browser/CDP/Profile/Workspace/account automation, arbitrary executable paths, arbitrary argv, `shell=true`, fallback authority, and raw body/path/output persistence remain forbidden.
- Affected apps/packages/docs: `docs/reviews` only.
- Risk level: low, because this round is review-only and does not execute the adapter path.

## Workflow Skills Used and Why

- `gsd-spec-driver`: defined the round objective, scope, non-scope, acceptance criteria, hard boundaries, affected files, and risk.
- `gstack-delivery-workflow`: kept the round to readback, review, documentation, verification, and commit.
- `superpowers-engineering-discipline`: enforced docs-only scope, evidence-over-claims, clean git checkpoints, and no scope creep.

## Project Skills Used and Why

- `codexhub-codex-exec-adapter`: used to review the read-only adapter attempt status, boundary state, and process diagnostics.
- `codexhub-workflow-policy-reviewer`: used to review approval, policy, evidence, audit, fallback, and metadata-only guarantees.
- `codexhub-architecture-planner`: used to confirm no package or app boundary changes were needed.
- `codexhub-release-auditor`: used for release-blocker classification, verification, and commit readiness.

## Skills Not Used and Why

- `codexhub-contract-designer`: not used because no contracts or shared DTOs changed in 4G.18.
- `codexhub-playwright-qa`: not used because Dashboard UI was not touched.
- `codexhub-electron-cdp-observer` and `codexhub-browser-profile-observer`: not used because Electron/CDP, browser profile, workspace, and account automation remain out of scope.

## Reviewed Attempt

- Source round: 4F.37.
- Attempt id: `codex_real_read_only_adapter_attempt_36471a3a-8f9b-4b90-9c01-1d10373accb7`.
- Dry-run id: `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`.
- Authority: `authoritative=true`, `supervisorBacked=true`, `persisted=true`.
- Degraded/readback flags: `degraded=false`, `notPersisted=false`.
- Fallback used as authority: false.
- Status: `failed`.
- Preflight status: `passed`.
- Result status: `failed`.
- Result error code: `boundary_failed`.
- Process boundary invoked: `true`.
- Process boundary module: `packages/codex-kernel/src/real-read-only-adapter-process.ts`.

## Boundary Diagnostics

- Boundary diagnostics complete: `true`.
- Boundary diagnostics missing fields: none.
- Boundary failure code: `process_exit_nonzero`.
- Start failure kind: `none`.
- ENOENT kind: `none`.
- Resolved executable kind: `native_exe`.
- Spawn target kind: `native_exe`.
- Executable resolution source: `trusted_shell_shim_target`.
- Dependency resolution status: `not_applicable`.
- Exit code: `2`.
- Timeout/cancel flags: `timedOut=false`, `cancelled=false`.
- Duration: `7177ms`.
- Stdout metadata: hash present, bytes `0`, lines `0`, truncated `false`.
- Stderr metadata: hash present, bytes `207`, lines `9`, truncated `false`.

4F.37 therefore changed the blocker from dependency/spawn-target ENOENT to a boundary-invoked nonzero process exit. The retry no longer failed as `process_start_failed`, `startFailureKind=enoent`, or `dependency_or_spawn_target_enoent`.

## Evidence, Audit, Timeline

- Evidence refs: `evidence_a45e10a6-5cd8-4088-97a4-053fc33237fb`, `evidence_f37d4404-1c90-4fb0-a957-174d02d1608e`.
- Audit refs: `audit_7209943e-393c-47fb-a6c2-c9dee92391a3`, `audit_b831912c-bf79-418a-a335-c21f62dae19f`.
- Timeline readback includes the 4F.37 attempt with `status=failed`, `processBoundaryInvoked=true`, `resultErrorCode=boundary_failed`, complete boundary diagnostics, evidence refs, and audit refs.

## Verification And Workspace State

- Post-run verification status: `skipped`.
- Post-run verification skip reason: `attempt_not_completed`.
- Workspace mutation detected: `false`.
- Raw runtime worktree path persisted: no.
- Raw executable path persisted: no.
- Raw argv persisted: no.
- Raw env values persisted: no.
- Raw prompt or command body persisted: no.
- Raw stdout or stderr body persisted: no.
- Raw agent or reasoning body persisted: no.

## Outcome

Outcome: `pilot_review_complete_with_release_blocker`.

Release blocker: the attempt did not complete and post-run verification did not run. The remaining blocker is `process_exit_nonzero`, not dependency ENOENT, executable resolution, cwd resolution, or process-start failure.

The optional ENOENT remediation loop is not entered under the aggressive bounded train, because the blocker changed outside the allowed ENOENT/process-start class.

4H.13 may proceed only as a governance gate and is expected to record `no_go_for_mvp` unless a completed attempt and completed post-run verification already exist, which they do not.
