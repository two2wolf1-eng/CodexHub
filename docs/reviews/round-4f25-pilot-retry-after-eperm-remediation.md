# Round 4F.25 Pilot Retry After EPERM Remediation

## Round

Round 4F.25: Pilot Retry After EPERM Remediation.

## Status

Outcome: `pilot_retry_blocked_before_boundary`

Round 4F.25 ran exactly one controlled CLI-only read-only retry after 4F.24 remediated the Windows EPERM process-start class. The retry was authoritative, Supervisor-backed, persisted, non-degraded, and metadata-only, but it did not reach the process boundary because executable resolution blocked with `executable_inaccessible`.

This is not MVP approval and not broader autonomous-use approval.

## GSD Spec

Goal: verify whether the 4F.24 Windows EPERM process-start remediation allows the read-only adapter pilot path to proceed past process-start setup.

Scope:

- Refresh authoritative prerequisite, source-preparation, approval, policy, config, and worktree gates.
- Create one replacement approval through the Supervisor-backed governance flow because the prior approval was expired.
- Run exactly one CLI-only read-only adapter retry.
- Read back attempt/latest/timeline metadata.
- Document the 4F.25 result.

Non-scope:

- No production code changes.
- No second retry.
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

- `8c957f0 chore: remediate read-only adapter windows eperm process start`

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

- Policy source: `codex_real_read_only_adapter_policy_source_35a9f5de-a23e-4340-a358-9d95c40452a0`
- Approval artifact: `codex_approval_artifact_d1125c45-3e87-4984-a9ef-59cbb7cfde53`
- Source-preparation record: `codex_real_read_only_adapter_pilot_source_preparation_eb3ee282-983f-412f-8886-66ecddbb2902`
- Prerequisite record: `codex_real_read_only_adapter_pilot_prerequisite_225a52d1-4aa7-472f-9a9e-8441734685f6`
- Approval authority trace: `codex_real_read_only_adapter_approval_authority_trace_f81e9e11-b3c6-4e46-b5d8-c5299c368783`

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

- Attempt id: `codex_real_read_only_adapter_attempt_5d7bf134-bb9f-4f4b-87cc-43d1176818b4`
- Status: `blocked`
- Authoritative: `true`
- Supervisor-backed: `true`
- Persisted: `true`
- Degraded: `false`
- Not persisted: `false`
- Preflight status: `passed`
- Result status: `not_started`
- Result error code: `boundary_deferred`
- Process boundary invoked: `false`
- Failed check codes: none
- Blocked check codes: none

Executable resolution metadata:

- Resolution status: `blocked`
- Resolution reason code: `executable_inaccessible`
- Resolved executable kind: `native_exe`
- Executable exists: `true`
- Executable accessible: `false`
- Executable path stored: `false`
- Env plan stored: `false`
- Argv stored: `false`

Evidence/audit/timeline:

- Evidence refs: `evidence_181be576-2417-4557-9599-dec08f1f3569`
- Audit refs: `audit_363a2338-6cb2-447c-abf5-de0e85387d33`, `audit_9f9f81d7-4405-458f-adeb-f201c9a2f4e5`
- Timeline id: `codex_real_read_only_adapter_attempt_timeline_09feac47-6132-4374-83de-f89eb986233b`
- Timeline entry count: 13

Post-run verification and workspace mutation:

- Post-run verification status: `not_required`
- Workspace mutation detected: not applicable because the boundary was not invoked
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

`stdoutBodyStored=false` and `stderrBodyStored=false` markers remain visible as safety flags; no raw stream field was present.

## Decision

Decision label: `pilot_retry_blocked_before_boundary`

4F.24 changed the failure class from a boundary-invoked `EPERM` start failure to a pre-boundary resolver block. The current blocker is now `executable_inaccessible` for the native executable selected by the trusted-shim resolver. This is safer than invoking an inaccessible runtime target, but it remains a release blocker.

4G.12 may review the 4F.25 result. 4H.7 must remain conservative unless 4G.12 records no release blocker, which this result does not currently support.

## Verification

Focused checks after the retry and doc passed:

- `pnpm nx test codex-kernel`
- `pnpm nx test supervisor`
- `pnpm nx test cli`
- `pnpm tsx tools/audit-real-adapter-boundary.ts`
- `pnpm audit:no-live-automation`
- `pnpm verify:foundation`
- `git diff --check`

Final verification before commit passed:

- `pnpm audit:skills`
- `pnpm audit:no-live-automation`
- `pnpm audit:boundaries`
- `pnpm audit:sqlite-isolation`
- `pnpm tsx tools/audit-real-adapter-boundary.ts`
- `pnpm verify:foundation`
- `cmd /c pnpm nx run-many -t lint,test,build`
- `git diff --check`

## Safety Boundary Confirmation

- Exactly one retry was run.
- No second retry was run.
- No production code was changed in 4F.25.
- No Dashboard code or trigger was added.
- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- Broader autonomous use remains forbidden.
- Raw prompt, command, stdout, stderr, agent message, reasoning, argv, executable path, env plan, and raw absolute worktree path persistence remain forbidden.
