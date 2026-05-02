# Round 4F.41: Pilot Retry After Invocation Remediation

## GSD Spec

Goal: run one controlled CLI-only read-only pilot retry after 4F.40 remediated the Codex CLI invocation contract.

Scope:
- Gate refresh through Supervisor-backed prerequisite, source-prep, policy, approval, and worktree metadata.
- Exactly one read-only adapter attempt using the approved CLI path.
- Attempt get/latest/list/timeline readback and metadata-only leakage scan.
- This review document.

Non-scope:
- No production code, contract, Supervisor, CLI, store, Dashboard, tool, or config changes.
- No second retry in this round.
- No prompt body, raw command body, raw stdout/stderr body, argv, executable path, env value, agent body, reasoning body, or raw worktree path persistence.
- No Dashboard trigger, `workspace_write`, `danger_full_access`, browser/CDP/Profile/Workspace/account automation, or broader autonomous use approval.

Acceptance criteria:
- Latest prerequisite readiness is `ready_for_pilot_retry`, persisted, non-degraded, and non-fallback.
- Approval authority trace is `aligned` and the approval is approved, unused, not expired, not revoked, and hash-matched.
- Config remains explicitly enabled for `read_only` only.
- Main repo and isolated worktree are clean before the retry, with persisted worktree label/hash/status only.
- Exactly one attempt is run and then read back through get/latest/list/timeline.
- Focused and full verification pass before commit.

Hard boundaries:
- CLI-only, local, read-only, operator-supervised execution remains enforced.
- Process launch remains isolated to the approved process-boundary module.
- Fallback/degraded output is never authority.

Affected apps/packages:
- `docs/reviews`

Risk level: medium. This round invokes the already-gated local read-only attempt path once, but does not expand capability or persist raw data.

## Workflow Skills Used And Why

- `gsd-spec-driver`: defined objective, scope, non-scope, acceptance criteria, hard boundaries, affected files, and risk.
- `gstack-delivery-workflow`: followed preflight, gate refresh, one retry, readback, verification, and commit checkpoint.
- `superpowers-engineering-discipline`: kept the round evidence-first, single-attempt, and within clean git checkpoints.

## Project Skills Used And Why

- `codexhub-codex-exec-adapter`: the round exercised the Codex exec adapter attempt path.
- `codexhub-workflow-policy-reviewer`: approval, policy, evidence, audit, and metadata-only guarantees were checked.
- `codexhub-architecture-planner`: package boundaries and process-boundary isolation were preserved.
- `codexhub-release-auditor`: verification and commit readiness were part of closeout.

## Skills Not Used And Why

- `codexhub-contract-designer`: no contract or shared schema was changed in 4F.41.
- Dashboard and Playwright skills: Dashboard stayed out of scope.
- Electron/CDP and browser profile skills: no browser, account, profile, or CDP automation was touched.

## Gate Refresh

Starting commit: `52934fd chore: remediate read-only adapter codex cli invocation`.

The previous approval artifact had expired before the retry. A single replacement approval was created through the Supervisor-backed approval request and manual approval flow:

- approval request id: `codex_approval_request_f31a19c9-9102-4d66-aee8-4d3e498e6251`
- approval record id: `codex_approval_record_378f7ce5-2d48-4f1b-a882-96a62f5a0220`
- approval artifact id: `codex_approval_artifact_a8bbb728-3301-4893-993e-7cb721ecbc7b`

Refreshed authoritative records:

- source-preparation record id: `codex_real_read_only_adapter_pilot_source_preparation_e29fb9b8-908f-486f-99bc-63c8c4eef7b7`
- prerequisite record id: `codex_real_read_only_adapter_pilot_prerequisite_a0f05ece-5913-4cdd-8547-ed3d983fd42f`
- approval authority trace id: `codex_real_read_only_adapter_approval_authority_trace_051b00de-61a1-42eb-b257-14269032ede5`
- policy source id: `codex_real_read_only_adapter_policy_source_f8010e16-c4ff-44a1-9946-431be50f45df`

Gate result:

- prerequisite status: `ready_for_pilot_retry`
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
- attempt id: `codex_real_read_only_adapter_attempt_6ff16386-b97a-4527-af41-ebdd57c187bb`
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
- exitCode: `2`
- nonzeroExitKind: not present in persisted readback
- diagnosticsComplete: `true`
- diagnostics missing fields: none reported by the current schema
- postRunVerificationStatus: `skipped`
- postRunVerificationSkipReason: `attempt_not_completed`
- workspaceMutationDetected: `false`
- evidence refs: `evidence_825d6dae-672e-4d85-8d4a-6920d7323c41`, `evidence_13381909-0ee6-4365-9cae-84eccfe9555a`
- audit refs: `audit_4e71b1c5-a975-416f-abed-10fd55327c26`, `audit_d77162f4-3131-4580-85b8-f94b6054f0fa`
- metadata hash: `sha256:f310119215b02d0f4829ebd3359652072561273c80377d5603835664dcdf24b5`

Readback leakage scan passed across attempt get/latest/list/timeline:

- no raw runtime worktree path
- no raw prompt, command, stdout, stderr, agent, or reasoning body
- no raw executable path
- no argv
- no env plan or env values
- no `*Stored=true` raw body/path/output markers

## Decision

Decision label: `pilot_retry_boundary_exercised_with_failure`.

4F.40 removed the unsupported process argv from the Codex subprocess plan, and 4F.41 reached the approved process boundary. The remaining blocker is still a boundary nonzero exit:

- `process_exit_nonzero`
- `exitCode=2`
- `postRunVerificationStatus=skipped`

This is not MVP-ready. 4G.20 may review the authoritative failed attempt. 4H.15 must remain conservative unless 4G.20 can prove no release blocker, which this record does not currently support.

The missing `nonzeroExitKind` in persisted readback should be reviewed in 4G.20. If 4H.15 records No-Go and the blocker is still CLI invocation/nonzero usage-error, the optional 4F.42 remediation loop may be considered under the existing bounded route.

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

4F.41 produced an authoritative persisted attempt result but did not complete the pilot. The next allowed round is 4G.20 pilot review after invocation remediation.

Dashboard trigger remains forbidden. `workspace_write` remains forbidden. `danger_full_access` remains forbidden. Browser/CDP/Profile/Workspace/account automation remains forbidden. Broader autonomous use remains blocked.
