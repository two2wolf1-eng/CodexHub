# Round 4F.37: Pilot Retry After Dependency ENOENT Remediation

## GSD Spec

- Goal: run one controlled CLI-only read-only retry after Round 4F.36 remediated the dependency/spawn-target ENOENT class.
- Scope: gate refresh, one read-only adapter attempt, attempt/latest/timeline readback, metadata-only leakage review, and this review doc.
- Non-scope: no production code changes, no Dashboard changes, no permission expansion, no second retry, and no raw runtime path or output-body persistence.
- Acceptance criteria: prerequisite readiness is ready, approval authority is aligned, the attempt is authoritative and persisted, readback is metadata-only, and focused/full verification passes before commit.
- Hard boundaries: Dashboard trigger, `workspace_write`, `danger_full_access`, browser/CDP/Profile/Workspace/account automation, arbitrary executable paths, arbitrary argv, `shell=true`, fallback authority, and raw body/path/output persistence remain forbidden.
- Affected apps/packages/docs: `docs/reviews` only for this round.
- Risk level: medium, because one controlled local read-only process-boundary attempt is allowed by the current governance chain.

## Workflow Skills Used and Why

- `gsd-spec-driver`: defined the round objective, scope, non-scope, acceptance criteria, hard boundaries, affected files, and risk.
- `gstack-delivery-workflow`: kept the round to gate refresh, one retry, readback, verification, doc, and commit.
- `superpowers-engineering-discipline`: enforced one attempt only, clean git checkpoints, metadata-only evidence, and no scope creep.

## Project Skills Used and Why

- `codexhub-codex-exec-adapter`: used for the read-only adapter control-plane retry and process-boundary readback.
- `codexhub-workflow-policy-reviewer`: used for approval, policy, prerequisite, evidence, audit, and fallback-authority checks.
- `codexhub-architecture-planner`: used to confirm no package boundary or Dashboard change was needed.
- `codexhub-release-auditor`: used for verification, commit readiness, and follow-up classification.

## Skills Not Used and Why

- `codexhub-contract-designer`: not used because no shared contracts or DTOs changed in 4F.37.
- `codexhub-playwright-qa`: not used because Dashboard UI was not touched.
- `codexhub-electron-cdp-observer` and `codexhub-browser-profile-observer`: not used because Electron/CDP, browser profile, workspace, and account automation remain out of scope.

## Gate Refresh

- Latest remediation commit before the retry: `93eb377 chore: remediate read-only adapter dependency enoent`.
- Dry-run id: `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`.
- Replacement approval request: `codex_approval_request_8b538fca-fb4c-4016-9e0c-a522887f053f`.
- Replacement approval artifact: `codex_approval_artifact_1705f268-63f5-4663-bae5-b29d229d2d2e`.
- Source-preparation record: `codex_real_read_only_adapter_pilot_source_preparation_cf8283ec-fb97-4d9a-a4dd-35f713f67bd8`.
- Prerequisite record: `codex_real_read_only_adapter_pilot_prerequisite_a8f330a3-154b-4029-b605-fa983b89d9fd`.
- Approval authority trace: `codex_real_read_only_adapter_approval_authority_trace_f6fa9e44-3a0e-4e6a-8ced-822f53168b79`.
- Worktree label/status/hash: `round-4f-pilot-c0fc119`, `clean`, `sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441`.
- Config: explicitly enabled with `read_only` only; `workspace_write` and `danger_full_access` remain forbidden.
- Store and readback state: `degraded=false`, `notPersisted=false`, `fallbackUsedAsAuthority=false`.

The prior approval was expired, so exactly one replacement approval was created through the Supervisor-backed approval-request and manual-approval flow. No fallback/local-only approval output was used as authority.

## Retry Result

- Attempt id: `codex_real_read_only_adapter_attempt_36471a3a-8f9b-4b90-9c01-1d10373accb7`.
- Decision label: `pilot_retry_boundary_exercised_with_failure`.
- Status: `failed`.
- Preflight status: `passed`.
- Result status: `failed`.
- Result error code: `boundary_failed`.
- Process boundary invoked: `true`.
- Boundary diagnostics complete: `true`.
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
- Stdout metadata: hash `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, bytes `0`, lines `0`, truncated `false`.
- Stderr metadata: hash `sha256:181d15f49d2055fca7604693e035283c4a9200a2ff661b4a141298b97a598b44`, bytes `207`, lines `9`, truncated `false`.
- Post-run verification: `skipped`, reason `attempt_not_completed`.
- Workspace mutation detected: `false`.

## Evidence, Audit, Timeline

- Evidence refs: `evidence_a45e10a6-5cd8-4088-97a4-053fc33237fb`, `evidence_f37d4404-1c90-4fb0-a957-174d02d1608e`.
- Audit refs: `audit_7209943e-393c-47fb-a6c2-c9dee92391a3`, `audit_b831912c-bf79-418a-a335-c21f62dae19f`.
- Timeline readback included the 4F.37 attempt with status `failed`, process boundary invoked, metadata-only evidence refs, and metadata-only audit refs.

## Metadata-Only Review

- Raw runtime worktree path persisted: no.
- Raw executable path persisted: no.
- Raw argv persisted: no.
- Raw env values persisted: no.
- Raw prompt or command body persisted: no.
- Raw stdout or stderr body persisted: no.
- Raw agent or reasoning body persisted: no.
- Dashboard trigger allowed: false.
- `workspace_write` allowed: false.
- `danger_full_access` allowed: false.

## Outcome

4F.37 closed the prior ENOENT/process-start blocker for this attempt: the process boundary was invoked, the resolved executable kind was `native_exe`, and the attempt failed after process start with `process_exit_nonzero`.

This is still a release blocker because the attempt did not complete and post-run verification was skipped. The remaining blocker is no longer the ENOENT/process-start class, so the optional ENOENT remediation loop should not be entered before review.

Next allowed round: Round 4G.18 Pilot Review.
