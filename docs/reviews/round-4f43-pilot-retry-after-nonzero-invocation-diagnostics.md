# Round 4F.43: Pilot Retry After Nonzero Invocation Diagnostics

## GSD Spec

Goal: run one controlled CLI-only read-only retry after 4F.42 added the invocation-contract health handshake and nonzero-exit readback classification.

Scope:
- Fresh Supervisor health verification for the 4F.42 invocation contract.
- Gate refresh for prerequisite readiness, approval authority, config, policy, and isolated worktree metadata.
- Exactly one read-only adapter attempt through the approved CLI path.
- Attempt get/latest/list/timeline readback and metadata-only leakage scan.
- This review document.

Non-scope:
- No production code, contract, Supervisor, CLI, store, Dashboard, tool, or config changes.
- No second retry in this round.
- No prompt body, raw command body, raw stdout/stderr body, argv, executable path, env value, agent body, reasoning body, or raw worktree path persistence.
- No Dashboard trigger, `workspace_write`, `danger_full_access`, browser/CDP/Profile/Workspace/account automation, or broader autonomous use approval.

Acceptance criteria:
- Fresh Supervisor health exposes `codex_cli_invocation_v2_json_read_only_ephemeral_no_stdin_body`.
- Latest prerequisite readiness is `ready_for_pilot_retry`, persisted, non-degraded, and non-fallback.
- Approval authority trace is `aligned` and the selected approval is approved, unused, not expired, not revoked, and hash-matched.
- Config remains explicitly enabled for `read_only` only.
- Main repo and isolated worktree are clean before the retry, with persisted worktree label/hash/status only.
- Exactly one attempt is run and read back through get/latest/list/timeline.
- Focused and full verification pass before commit.

Hard boundaries:
- CLI-only, local, read-only, operator-supervised execution remains enforced.
- Process launch remains isolated to the approved process-boundary module.
- Fallback/degraded output is never authority.

Affected apps/packages:
- `docs/reviews`

Risk level: medium. This round invokes the already-gated local read-only attempt path once, but does not expand capability or persist raw data.

## Workflow Skills Used And Why

- `gsd-spec-driver`: defined the objective, scope, non-scope, acceptance criteria, hard boundaries, affected files, and risk.
- `gstack-delivery-workflow`: followed preflight, gate refresh, one retry, readback, verification, and commit checkpoint.
- `superpowers-engineering-discipline`: kept the round evidence-first, single-attempt, and within clean git checkpoints.

## Project Skills Used And Why

- `codexhub-codex-exec-adapter`: the round exercised the Codex exec adapter attempt path.
- `codexhub-workflow-policy-reviewer`: approval, policy, evidence, audit, and metadata-only guarantees were checked.
- `codexhub-architecture-planner`: package boundaries and process-boundary isolation were preserved.
- `codexhub-release-auditor`: verification and commit readiness were part of closeout.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contract or shared schema was changed in 4F.43.
- Dashboard and Playwright skills: Dashboard stayed out of scope.
- Electron/CDP and browser profile skills: no browser, account, profile, or CDP automation was touched.

## Gate Refresh

Starting commit: `d14ff8e chore: close read-only adapter nonzero invocation diagnostics`.

Supervisor health was refreshed before the retry and exposed the expected 4F.42 invocation contract:

- invocation contract version: `codex_cli_invocation_v2_json_read_only_ephemeral_no_stdin_body`
- argv count: `5`
- argv hash: `sha256:e3c461837374387a99300b2515d691d0112d9d24044b4cccca28ed1de4847acb`
- stdin closed without body: `true`
- argv stored: `false`

Gate result:

- prerequisite status: `ready_for_pilot_retry`
- prerequisite record id: `codex_real_read_only_adapter_pilot_prerequisite_a0f05ece-5913-4cdd-8547-ed3d983fd42f`
- source-preparation record id: `codex_real_read_only_adapter_pilot_source_preparation_e29fb9b8-908f-486f-99bc-63c8c4eef7b7`
- policy source id: `codex_real_read_only_adapter_policy_source_f8010e16-c4ff-44a1-9946-431be50f45df`
- approval authority trace id before retry: `codex_real_read_only_adapter_approval_authority_trace_b9eac541-c475-47de-9e68-26b63af8a1cc`
- approval artifact id: `codex_approval_artifact_a8bbb728-3301-4893-993e-7cb721ecbc7b`
- degraded: `false`
- notPersisted: `false`
- fallbackUsedAsAuthority: `false`
- configExplicitlyEnabled: `true`
- read-only only: `true`
- validUnusedApprovalPresent: `true`
- approval trace status: `aligned`
- approval trace preflight would accept: `true`
- authoritative policy source present: `true`
- authoritative source preparation present: `true`
- evidenceAuditReady: `true`
- isolated worktree label: `round-4f-pilot-c0fc119`
- isolated worktree status: `clean`
- isolated worktree path hash: `sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441`

The runtime worktree path was used only as CLI input. It is not written here and was not persisted in readback.

## Retry Result

Exactly one controlled retry was executed.

- dryRunId: `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`
- attempt id: `codex_real_read_only_adapter_attempt_6f5c3a95-c017-45c4-a899-1cabd1765385`
- request id: `codex_real_read_only_adapter_request_0cb88057-ec96-48bd-91f0-6cf20d8bfa93`
- preflight id: `codex_real_read_only_adapter_preflight_785b841d-0c19-4161-95c2-6bbfbb6dc45d`
- result id: `codex_real_read_only_adapter_result_ef847225-bd35-4213-85a1-408ca7e8b255`
- status: `failed`
- authoritative: `true`
- supervisorBacked: `true`
- persisted: `true`
- degraded: `false`
- notPersisted: `false`
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
- diagnosticsComplete: `true`
- diagnostics missing fields: none
- stdout hash: `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- stderr hash: `sha256:26d2eca3250a63e4eb08ad2afcc7b09fc2f5976a2ed7a09875d7d6079b6363a3`
- stdout byte length / line count: `0` / `0`
- stderr byte length / line count: `59` / `3`
- stdout/stderr truncated: `false` / `false`
- postRunVerificationStatus: `skipped`
- postRunVerificationSkipReason: `attempt_not_completed`
- workspaceMutationDetected: `false`
- evidence refs: `evidence_4045234f-97d3-4f38-93b4-ef1b5ecd1260`, `evidence_3cb623d6-aff4-467b-8320-a6e11d8eded8`
- audit refs: `audit_f836ee80-0579-4fed-938e-cf6c799c1644`, `audit_b80daf2e-fc88-45d8-8f68-da494ccaa060`
- metadata hash: `sha256:4dc09cb3453997d4d0789d7c7441b928f75005b01fae9947850c7c31bc87da78`

Readback was checked through attempt get, latest, list, and timeline. The current attempt's diagnostics propagated through all required readback paths.

Readback leakage scan passed across attempt get/latest/list/timeline:

- no raw runtime worktree path
- no raw prompt, command, stdout, stderr, agent, or reasoning body
- no raw executable path
- no raw argv
- no env plan or env values
- no internal governance ids in subprocess argv readback
- no unsupported `--jsonl`, `--dry-run-id`, or `--approval-artifact-id` subprocess flag readback

## Decision

Decision label: `pilot_retry_boundary_exercised_with_failure`.

4F.43 confirms the 4F.42 invocation remediation changed the failure mode:

- previous invocation blocker: `process_exit_nonzero`, `exitCode=2`, usage-error classification
- current blocker: `process_exit_nonzero`, `exitCode=1`, `codex_cli_input_missing_suspected`

This is no longer the same CLI invocation/nonzero usage-error class that authorized the optional 4F.42 remediation loop. The approved boundary is invoked, process-start diagnostics are clean, and the failure now points at input-governance design: the subprocess receives no prompt body by policy, and Codex exits without enough input.

This is not MVP-ready. The attempt did not complete, post-run verification was skipped, and 4H.16 cannot approve local MVP use unless a later review somehow removes the release blocker, which this record does not support.

Recommended next review route:

- 4G.21: review the 4F.43 input-governance blocker.
- 4H.16: record No-Go unless 4G.21 finds no release blocker.
- Future remediation should be a new bounded input-governance design round, not another invocation/ENOENT/process-start loop.

## Verification Evidence

Preflight checks passed before retry:

- `pnpm audit:skills`
- `pnpm audit:no-live-automation`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm tsx tools/audit-real-adapter-boundary.ts`
- `pnpm verify:foundation`

Focused and final verification are recorded in the round closeout before commit.

## Outcome

4F.43 produced an authoritative persisted attempt result but did not complete the pilot. The next allowed round is 4G.21 pilot review after the second invocation remediation.

Dashboard trigger remains forbidden. `workspace_write` remains forbidden. `danger_full_access` remains forbidden. Browser/CDP/Profile/Workspace/account automation remains forbidden. `shell=true`, arbitrary executable paths, and arbitrary argv remain forbidden. Broader autonomous use remains blocked.
