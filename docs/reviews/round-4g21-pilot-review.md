# Round 4G.21: Pilot Review After Second Invocation Remediation

## GSD Spec

Goal: review the authoritative 4F.43 retry result and decide whether it removes the MVP release blocker after the optional second invocation remediation.

Scope:
- Review attempt `codex_real_read_only_adapter_attempt_6f5c3a95-c017-45c4-a899-1cabd1765385`.
- Review evidence/audit/timeline completeness, boundary diagnostics, post-run verification, and workspace mutation status.
- Decide whether 4H.16 can consider local MVP approval.
- This review document and the paired 4G.21 safety-corrections document.

Non-scope:
- No pilot retry, no real adapter attempt, and no approval creation or consumption.
- No code, contract, Supervisor, CLI, store, Dashboard, config, or tool changes.
- No Dashboard trigger, `workspace_write`, `danger_full_access`, browser/CDP/Profile/Workspace/account automation, or broader autonomous use approval.

Acceptance criteria:
- Attempt authority and persistence are confirmed.
- 4F.43 result is classified with release-blocker status.
- Evidence/audit/timeline and metadata-only guarantees are reviewed.
- Full verification passes before commit.

Hard boundaries:
- Review-only governance round.
- Fallback/degraded output is not treated as authority.
- Raw prompt, command, stdout/stderr, argv, executable path, env values, agent/reasoning body, and raw worktree path remain absent from review docs.

Affected apps/packages:
- `docs/reviews`

Risk level: low. Docs-only governance review; no executable path or production behavior changes.

## Workflow Skills Used And Why

- `gsd-spec-driver`: defined 4G.21 goal, scope, non-scope, acceptance criteria, boundaries, affected docs, and risk.
- `gstack-delivery-workflow`: structured review, verification, commit, and checkpoint.
- `superpowers-engineering-discipline`: kept this as review-only and evidence-driven.

## Project Skills Used And Why

- `codexhub-codex-exec-adapter`: reviewed the adapter attempt result and process-boundary metadata.
- `codexhub-workflow-policy-reviewer`: checked evidence, audit, approval, metadata-only, and boundary guarantees.
- `codexhub-architecture-planner`: confirmed no package or process-boundary expansion was introduced.
- `codexhub-release-auditor`: verified the release-blocker assessment and closeout.

## Skills Not Used And Why

- `codexhub-contract-designer`: no schema changes were made.
- Dashboard and Playwright skills: Dashboard remained untouched.
- Electron/CDP and browser profile skills: no browser, profile, account, or CDP automation was used.

## Attempt Reviewed

- Source round: 4F.43
- Source commit: `024419c docs: add pilot retry after nonzero invocation diagnostics`
- dryRunId: `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`
- attempt id: `codex_real_read_only_adapter_attempt_6f5c3a95-c017-45c4-a899-1cabd1765385`
- approval artifact id: `codex_approval_artifact_a8bbb728-3301-4893-993e-7cb721ecbc7b`
- prerequisite record id: `codex_real_read_only_adapter_pilot_prerequisite_a0f05ece-5913-4cdd-8547-ed3d983fd42f`
- source-preparation record id: `codex_real_read_only_adapter_pilot_source_preparation_e29fb9b8-908f-486f-99bc-63c8c4eef7b7`
- approval authority trace id before retry: `codex_real_read_only_adapter_approval_authority_trace_b9eac541-c475-47de-9e68-26b63af8a1cc`
- approval authority trace id used by attempt: `codex_real_read_only_adapter_approval_authority_trace_2ae2e299-df30-4266-8da1-6793ed6aef81`

Authority:

- authoritative: `true`
- supervisorBacked: `true`
- persisted: `true`
- degraded: `false`
- notPersisted: `false`
- fallbackUsedAsAuthority: `false`

## Result Review

4F.43 successfully passed the governance/readiness gates and reached the approved process boundary:

- preflightStatus: `passed`
- processBoundaryInvoked: `true`
- resultStatus: `failed`
- resultErrorCode: `boundary_failed`
- boundary failure code: `process_exit_nonzero`
- exitCode: `1`
- nonzeroExitKind: `codex_cli_input_missing_suspected`
- startFailureKind: `none`
- enoentKind: `none`
- resolvedExecutableKind: `native_exe`
- spawnTargetKind: `native_exe`
- executableResolutionSource: `trusted_shell_shim_target`
- dependencyResolutionStatus: `not_applicable`
- boundary diagnostics complete: `true`
- boundary diagnostics missing fields: none
- stdout hash: `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- stderr hash: `sha256:26d2eca3250a63e4eb08ad2afcc7b09fc2f5976a2ed7a09875d7d6079b6363a3`
- stdout byte length / line count: `0` / `0`
- stderr byte length / line count: `59` / `3`
- stdout/stderr truncated: `false` / `false`
- postRunVerificationStatus: `skipped`
- postRunVerificationSkipReason: `attempt_not_completed`
- workspaceMutationDetected: `false`

The retry did not complete, so post-run verification did not run. This blocks MVP approval.

The important blocker shift is that 4F.43 no longer shows the 4F.41 `exitCode=2` usage-error shape. The subprocess invocation contract is now fresh and the persisted diagnostics classify the nonzero exit as `codex_cli_input_missing_suspected`. That means the bounded invocation remediation loop has reached its stop condition: the remaining issue is input-governance design, not another invocation/ENOENT/process-start remediation.

## Evidence, Audit, And Timeline

Evidence refs:

- `evidence_4045234f-97d3-4f38-93b4-ef1b5ecd1260`
- `evidence_3cb623d6-aff4-467b-8320-a6e11d8eded8`

Audit refs:

- `audit_f836ee80-0579-4fed-938e-cf6c799c1644`
- `audit_b80daf2e-fc88-45d8-8f68-da494ccaa060`

Timeline readback was available and included the 4F.43 attempt with the same boundary diagnostics and `nonzeroExitKind`.

Readback leakage scan from 4F.43 passed:

- no raw runtime worktree path
- no raw prompt, command, stdout, stderr, agent, or reasoning body
- no raw executable path
- no raw argv
- no env plan or env values
- no unsupported internal governance subprocess argv flags

## Release Decision For This Review

Outcome: `pilot_review_complete_with_input_governance_release_blocker`.

Release blocker:

- `process_exit_nonzero`
- `exitCode=1`
- `nonzeroExitKind=codex_cli_input_missing_suspected`
- attempt did not complete
- post-run verification skipped

4H.16 may proceed only as a governance gate, and the supported outcome is `no_go_for_mvp`. The optional invocation/nonzero remediation train must stop after 4H.16. The next route should be a new input-governance design/remediation round that decides how a read-only, metadata-only adapter can supply permitted input without persisting raw prompt or command bodies.

Dashboard trigger remains forbidden. `workspace_write` remains forbidden. `danger_full_access` remains forbidden. Browser/CDP/Profile/Workspace/account automation remains forbidden. Broader autonomous use remains blocked.

