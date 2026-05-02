# Round 4F.29 Pilot Retry After Executable Selection Remediation

## Round

Round 4F.29: Pilot Retry After Executable Selection Remediation.

## Status

Outcome: `pilot_retry_boundary_exercised_with_failure`

Round 4F.29 ran exactly one controlled CLI-only read-only retry after 4F.28 changed executable selection to prefer a probe-passed native executable candidate before falling back to Windows compatibility bypass. The retry was authoritative, Supervisor-backed, persisted, non-degraded, non-fallback, and metadata-only. It passed governance/readiness preflight and invoked the approved process boundary, but the process start still failed with complete metadata-only diagnostics.

This is not MVP approval and not broader autonomous-use approval.

## GSD Spec

Goal: verify whether the 4F.28 executable selection remediation allows the read-only adapter pilot path to complete or produce clearer process-start diagnostics.

Scope:

- Refresh authoritative source-preparation and prerequisite records.
- Confirm approval, policy, config, and worktree gates.
- Run exactly one CLI-only read-only adapter retry.
- Read back attempt/latest/timeline metadata.
- Document the 4F.29 result.

Non-scope:

- No production code changes.
- No second retry.
- No third remediation loop.
- No Dashboard change or trigger.
- No config change.
- No `workspace_write`.
- No `danger_full_access`.
- No browser/CDP/Profile/Workspace/account automation.
- No raw prompt, command, stdout/stderr, argv, executable path, env plan, agent/reasoning body, or raw local worktree path persistence.
- No MVP approval and no broader autonomous-use approval.

Acceptance criteria:

- Preflight audits and foundation verification pass.
- Latest prerequisite is `ready_for_pilot_retry`, persisted, non-degraded, and non-fallback.
- Approval authority trace is `aligned` for the selected approval artifact.
- Config remains explicitly enabled and read-only only.
- Main repo and isolated pilot worktree are clean before and after retry.
- One attempt record is persisted and read back with evidence/audit/timeline references.
- Readback contains no raw runtime worktree path, raw body, argv, executable path, or env plan fields.

Hard boundaries:

- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Process launch remains isolated to the approved process-boundary module.
- Fallback/degraded/local-only output is never authority.

Affected apps/packages:

- `docs/reviews`

Risk level: high. This round runs one controlled local read-only adapter attempt, but it remains CLI-only, metadata-only, and bounded by existing approval/evidence/audit gates.

## Workflow Skills Used and Why

- `gsd-spec-driver`: used to restate the bounded retry objective, scope, non-scope, acceptance criteria, boundaries, affected files, and risk.
- `gstack-delivery-workflow`: used to keep the retry in preflight, gate refresh, single execution, readback, focused verification, full verification, commit, and checkpoint order.
- `superpowers-engineering-discipline`: used to keep the round to one retry, avoid scope creep, and rely on verification evidence.

## Project Skills Used and Why

- `codexhub-architecture-planner`: used to preserve package/app boundaries and avoid new surfaces.
- `codexhub-codex-exec-adapter`: used because the round exercised the Codex exec read-only adapter path.
- `codexhub-workflow-policy-reviewer`: used to preserve approval, policy, evidence, audit, and metadata-only boundaries.
- `codexhub-release-auditor`: used for closeout verification and release-blocker classification.

## Skills Not Used and Why

- `codexhub-contract-designer`: not used because no contracts changed.
- `codexhub-playwright-qa`: not used because Dashboard UI and browser smoke behavior were not touched.
- `codexhub-electron-cdp-observer`: not used because Electron/CDP remains out of scope.
- `codexhub-browser-profile-observer`: not used because Browser Profile, Chrome Profile, ChatGPT Workspace, and account automation remain forbidden and out of scope.

## Preflight

Starting commit:

- `cc835e8 chore: remediate read-only adapter executable selection`

Preflight passed before the retry:

- `git status --short`: clean
- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed

## Gate Refresh

Known dry-run:

- `codex_dry_run_5c31acdd-0f82-4007-b933-e51e35deb9e7`

Refreshed authority:

- Source-preparation record: `codex_real_read_only_adapter_pilot_source_preparation_4420a020-ec7f-41f0-aeef-eef9b1a0441a`
- Prerequisite record: `codex_real_read_only_adapter_pilot_prerequisite_89e4c96c-39b2-42bc-ab21-d041933c4341`
- Approval artifact: `codex_approval_artifact_e3df489f-dee3-466e-8315-b4606c704290`
- Approval authority trace during source preparation: `codex_real_read_only_adapter_approval_authority_trace_57a9cae1-a3c0-4397-8c33-f51f1f9736b2`
- Approval authority trace during prerequisite check: `codex_real_read_only_adapter_approval_authority_trace_1c2aff48-e4d8-4951-bf03-cef7ee4969cb`

Gate state:

- Prerequisite status: `ready_for_pilot_retry`
- Approval trace status: `aligned`
- Config: explicitly enabled, read-only only
- Worktree label: `round-4f-pilot-c0fc119`
- Worktree status: `clean`
- Worktree path hash matched persisted metadata: yes
- `degraded=false`
- `notPersisted=false`
- `fallbackUsedAsAuthority=false`

The raw runtime worktree path was used only as CLI input and is not written here.

## Retry

Command shape:

```text
pnpm codexhub codex exec real-read-only-adapter attempt <dryRunId> --approval <approvalArtifactId> --worktree <runtimePilotWorktreePath> --json
```

This was executed once.

No prompt body, raw command body, Dashboard input, browser/CDP/Profile/Workspace input, fallback authority, `workspace_write`, or `danger_full_access` was used.

## Attempt Result

Attempt:

- Attempt id: `codex_real_read_only_adapter_attempt_dc3fec94-be99-4ad4-9bd6-7dec96e648e9`
- Status: `failed`
- Authoritative: `true`
- Supervisor-backed: `true`
- Persisted: `true`
- Degraded: `false`
- Not persisted: `false`
- Preflight status: `passed`
- Result status: `failed`
- Result error code: `boundary_failed`
- Process boundary invoked: `true`
- Failed check codes: none
- Blocked check codes: none

Boundary diagnostics:

- Diagnostics complete: `true`
- Diagnostics missing fields: none
- Failure code: `process_start_failed`
- Start failure kind: `enoent`
- Platform: `win32`
- Resolved executable kind: `native_exe`
- CWD exists: `true`
- CWD is directory: `true`
- Executable exists: `true`
- Executable accessible: `true`
- Timeout: `false`
- Cancelled: `false`
- Duration: `2ms`
- Stdout byte length: `0`
- Stderr byte length: `37`
- Stdout line count: `0`
- Stderr line count: `1`
- Stdout truncated: `false`
- Stderr truncated: `false`
- Output hash count: `2`

Executable/process metadata:

- Executable policy label: `codex_cli`
- Executable resolution status: `resolved`
- Resolved executable kind: `native_exe`
- Executable access probe passed: `false`
- Windows native executable access probe bypassed: `true`
- Executable path stored: `false`
- Env plan stored: `false`
- Argv stored: `false`
- Env allowlist key count: `6`
- CWD self-check status: `passed`
- CWD path stored: `false`
- Worktree path stored: `false`

Evidence/audit/timeline:

- Evidence refs: `evidence_47fe3445-1476-4bed-afc2-3dc81fabe263`, `evidence_f4ea9f59-b846-4e38-81b5-7114facdb991`
- Audit refs: `audit_63badfc5-5c67-4c81-b683-9b0a4f236ed0`, `audit_6f4fb30a-8840-4401-850a-3e28e4170d17`
- Timeline id: `codex_real_read_only_adapter_attempt_timeline_c92ee73c-7b8c-4ade-823f-2cb286c0f788`

Post-run verification and workspace mutation:

- Post-run verification status: `skipped`
- Post-run verification skip reason: `attempt_not_completed`
- Workspace mutation detected: `false`
- Main repo clean after retry: yes
- Pilot worktree clean after retry: yes

## Readback Scan

Attempt/latest/timeline readback did not expose:

- raw runtime worktree path
- raw prompt body
- raw command body
- raw stdout/stderr body
- argv field
- executable path field
- env field or env plan field
- agent body
- reasoning body

Visible safety flags confirm:

- `stdoutBodyStored=false`
- `stderrBodyStored=false`
- `executablePathStored=false`
- `envPlanStored=false`
- `argvStored=false`
- `workspaceWriteAllowed=false`
- `dangerFullAccessAllowed=false`
- `dashboardTriggerAllowed=false`

## Decision

Decision label: `pilot_retry_boundary_exercised_with_failure`

4F.28 moved the path past the previous `executable_inaccessible` pre-boundary block. The approved process boundary was invoked, but process start still failed with `process_start_failed` and `startFailureKind=enoent`. Diagnostics are complete and metadata-only, but the attempt did not complete and post-run verification was skipped. This remains a release blocker.

Because this was the second and final remediation+retry loop allowed by Aggressive Remediation Mode, the next steps are 4G.14 review and 4H.9 final gate. No third loop is allowed in this route.

## Verification

Focused checks after the retry and doc:

- `pnpm nx test codex-kernel`: passed
- `pnpm nx test supervisor`: passed
- `pnpm nx test cli`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm verify:foundation`: passed
- `git diff --check`: passed

Final verification before commit:

- `pnpm audit:skills`: passed
- `pnpm audit:no-live-automation`: passed
- `pnpm audit:boundaries`: passed
- `pnpm audit:sqlite-isolation`: passed
- `pnpm tsx tools/audit-real-adapter-boundary.ts`: passed
- `pnpm verify:foundation`: passed
- `cmd /c pnpm nx run-many -t lint,test,build`: passed
- `git diff --check`: passed
- `git status --short`: only this 4F.29 review doc was pending commit

## Safety Boundary Confirmation

- Exactly one retry was run.
- No second retry was run.
- No production code was changed in 4F.29.
- No Dashboard code or trigger was added.
- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Broader autonomous use remains forbidden.
- Raw prompt, command, stdout, stderr, agent message, reasoning, argv, executable path, env plan, and raw absolute worktree path persistence remain forbidden.
