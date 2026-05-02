# Round 4G.11 Pilot Review EPERM Process Start Blocker

## Round

Round 4G.11: Pilot Review After Spawn Compatibility Remediation.

## Status

Outcome: `pilot_review_complete_with_eperm_process_start_release_blocker`

Round 4G.11 reviewed the authoritative 4F.23 retry result. This review is docs-only. It did not run another pilot, invoke the adapter attempt path, create or consume approvals, modify config, change Dashboard, or approve MVP use.

The 4F.23 retry passed governance/readiness preflight and invoked the approved process boundary, but it failed during process start with `process_start_failed` and `startFailureKind=eperm`. Post-run verification was skipped because the attempt did not complete. This remains a release blocker.

## GSD Spec

Goal: review whether the 4F.23 retry result supports a later MVP gate, and classify the remaining Windows process-start blocker.

Scope:

- Review the 4F.23 review doc and authoritative attempt/latest/timeline readback.
- Confirm authority, evidence, audit, timeline, workspace mutation, diagnostic, and release-blocker status.
- Create this 4G.11 review document and the paired safety-corrections assessment.

Non-scope:

- No pilot retry.
- No adapter attempt invocation.
- No production code, contract, store, Supervisor, CLI, Dashboard, config, approval-state, or runtime worktree change.
- No approval creation, renewal, revocation, consumption, or mark-used operation.
- No `workspace_write`.
- No `danger_full_access`.
- No browser/CDP/Profile/Workspace/account automation.
- No MVP approval and no broader autonomous-use approval.

Acceptance criteria:

- 4F.23 attempt authority and persistence are reviewed.
- Boundary invocation and EPERM process-start diagnostics are recorded.
- Evidence, audit, timeline, post-run verification, and workspace mutation status are reviewed.
- Metadata-only and no-raw-path/body/output boundaries are confirmed.
- Release blocker and next allowed remediation round are clearly stated.
- Focused docs-only checks and full verification pass before commit.

Hard boundaries:

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Raw prompt, command, stdout, stderr, argv, executable path, env plan, agent body, reasoning body, and raw local worktree path persistence remain forbidden.
- A failed boundary-invoked attempt must not be treated as MVP success.

Affected apps/packages:

- `docs/reviews` only.

Risk level: medium. This is a docs-only governance review, but it gates whether future MVP release decisions can safely proceed.

## Workflow Skills Used and Why

- `gsd-spec-driver`: used to restate the review goal, scope, non-scope, boundaries, acceptance criteria, affected files, and risk.
- `gstack-delivery-workflow`: used to keep the review in preflight, evidence readback, docs, verification, commit, and checkpoint order.
- `superpowers-engineering-discipline`: used to keep the round docs-only, evidence-based, and scoped to one review decision.

## Project Skills Used and Why

- `codexhub-architecture-planner`: used to confirm the review does not alter package or app boundaries.
- `codexhub-codex-exec-adapter`: used to evaluate the adapter attempt result, preflight state, and process-boundary invocation state.
- `codexhub-workflow-policy-reviewer`: used to review approval, policy, evidence, audit, and release-blocker semantics.
- `codexhub-release-auditor`: used for verification, boundary review, commit evidence, and next-round recommendation.

## Skills Not Used and Why

- `codexhub-contract-designer`: not used because contracts were not changed in this review.
- `codexhub-playwright-qa`: not used because Dashboard UI and browser smoke behavior were not touched.
- `codexhub-electron-cdp-observer`: not used because Electron/CDP remains out of scope.
- `codexhub-browser-profile-observer`: not used because Browser Profile, Chrome Profile, ChatGPT Workspace, and account automation remain forbidden and out of scope.

## Preflight

Starting commit:

- `a1bf8be docs: add pilot retry after spawn compatibility remediation`

Preflight passed before docs changes:

- `git status --short`: clean
- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed

## 4F.23 Attempt Reviewed

- Attempt id: `codex_real_read_only_adapter_attempt_664d33c4-926f-4d3b-bc84-89753c1de8b5`
- Dry-run id: `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`
- Status: `failed`
- Authoritative / Supervisor-backed / persisted: `true` / `true` / `true`
- Degraded / notPersisted: `false` / `false`
- Preflight status: `passed`
- Result status: `failed`
- Result error code: `boundary_failed`
- Failed check codes: none
- Blocked check codes: none
- Process boundary invoked: `true`
- Process boundary module: `packages/codex-kernel/src/real-read-only-adapter-process.ts`
- Executable policy label: `codex_cli`
- Resolved executable kind: `native_exe`
- Post-run verification status: `skipped`
- Post-run verification skip reason: `attempt_not_completed`
- Workspace mutation detected: `false`
- Evidence refs: `evidence_354ddf96-bbf0-4359-8d25-61a3690dc145`, `evidence_f38bdc5a-dafd-4c07-aaff-0fcfca9c2b93`
- Audit refs: `audit_b630fbe5-60aa-4f38-a15b-5102774a628d`, `audit_8b5e5176-3b69-457c-b97f-3fa0533e3a54`
- Timeline id: `codex_real_read_only_adapter_attempt_timeline_691ce2e2-39f6-4175-9356-ba25c673abff`
- Latest timeline entry: `codex_real_read_only_adapter_attempt_timeline_entry_06a72500-7f39-465b-8004-00b890b8de8c`

## Boundary Diagnostics

4F.23 proves the process boundary is reached and diagnostics are complete enough to target a Windows EPERM process-start remediation.

Boundary diagnostics:

- Boundary status: `failed`
- Normalized failure code: `process_start_failed`
- Start failure kind: `eperm`
- Platform: `win32`
- Resolved executable kind: `native_exe`
- CWD hash: `sha256:b4f0c22ac1487844cc719af53cf1d89ec110b6c3f4b4b3d21e3dcde76a5da441`
- CWD exists / is directory: `true` / `true`
- Executable exists / accessible: `true` / `true`
- Env allowlist key count: `6`
- Env allowlist key hash: `sha256:e967ffcd0f47d40b5312f30b6f25c0e7a103a4dcd1cc8022415dc17adc413962`
- Timed out / cancelled: `false` / `false`
- Duration: `9ms`
- stdout hash: `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- stderr hash: `sha256:ded3024594fdb1763bef6d3d8b1cea9d319c280c929d2127a6218bd28eb1c24b`
- stdout/stderr byte counts: `0` / `36`
- stdout/stderr line counts: `0` / `1`
- stdout/stderr truncated: `false` / `false`
- Diagnostics complete: `true`
- Missing diagnostic fields: `[]`

## Review Findings

4F.23 is a valid authoritative pilot retry result for review, but it is not MVP success evidence.

Findings:

- Prerequisite, approval, config, policy, and worktree gates were aligned for this retry.
- Attempt preflight passed.
- The approved process boundary module was invoked.
- The attempt failed during process start with `startFailureKind=eperm`.
- Post-run verification was skipped because the attempt did not complete.
- Workspace mutation was not detected.
- Evidence, audit, and timeline refs exist and are metadata-only.
- The current release blocker is Windows process-boundary startup permission or launch compatibility, not governance readiness.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Latest source | `git log --oneline -1` | `a1bf8be docs: add pilot retry after spawn compatibility remediation` | 4G.11 allowed |
| Preflight | skills/no-live/boundaries/SQLite/process-boundary/foundation checks | Passed before docs changes | Review gate open |
| Attempt authority | 4F.23 attempt readback | Authoritative, Supervisor-backed, persisted, non-degraded, not fallback authority | Record accepted for review |
| Preflight state | 4F.23 attempt readback | `preflightStatus=passed` | Readiness gates passed for this retry |
| Boundary invocation | 4F.23 attempt readback | `processBoundaryInvoked=true`; approved module ref present | Boundary was exercised |
| Attempt result | 4F.23 attempt readback | `status=failed`, `resultErrorCode=boundary_failed` | Release blocker remains |
| Boundary diagnostics | 4F.23 attempt readback | `process_start_failed`, `startFailureKind=eperm`, complete metadata-only diagnostics | Next remediation can target Windows EPERM process start |
| Post-run verification | 4F.23 attempt readback | `skipped`, `attempt_not_completed` | MVP gate cannot be Go |
| Workspace mutation | 4F.23 attempt readback | `workspaceMutationDetected=false` | No mutation detected |
| Evidence/audit | 4F.23 attempt/timeline readback | 2 evidence refs and 2 audit refs | Metadata evidence exists |
| Metadata-only scan | 4F.23 review | No raw runtime worktree path, prompt body, command body, stdout/stderr body, argv, executable path, env plan, agent body, or reasoning body found | Boundary held |

## Release Blocker

Release blocker: `process_start_failed` / `eperm`

Rationale:

- The pilot retry did not complete.
- Post-run verification did not complete.
- The process boundary failed at startup even though executable resolution reported a native executable that exists and is accessible.
- MVP release criteria require a completed attempt, clean workspace mutation check, completed post-run verification, complete evidence/audit/timeline records, and no release blocker.

This blocker should be remediated in `Round 4F.24: Windows EPERM Process Start Remediation`.

## Whether 4H.7 Can Proceed

4H.7 remains blocked for any Go outcome.

A future 4H.7 MVP gate can only be considered after:

- 4F.24 diagnoses and remediates Windows EPERM process start without widening scope.
- 4F.25 runs exactly one controlled retry after remediation.
- 4G.12 reviews that retry and records no release blocker.

## Outcome

Outcome: `pilot_review_complete_with_eperm_process_start_release_blocker`

Next recommended route:

`4F.24 Windows EPERM Process Start Remediation -> 4F.25 Pilot Retry After EPERM Remediation -> 4G.12 Pilot Review -> 4H.7 MVP Gate Retry`

## Safety Boundary Confirmation

- No pilot retry was run in 4G.11.
- No adapter attempt path was invoked in 4G.11.
- No approval was created, renewed, revoked, consumed, or marked used.
- No config was changed.
- No Dashboard code or trigger was added.
- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Broader autonomous use remains forbidden.
- Raw prompt, command, stdout, stderr, agent message, reasoning, argv, executable path, env plan, and raw absolute worktree path persistence remain forbidden.

