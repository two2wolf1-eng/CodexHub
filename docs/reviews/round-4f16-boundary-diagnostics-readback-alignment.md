# Round 4F.16 Boundary Diagnostics Readback Alignment

## Round

Round 4F.16: Boundary Diagnostics Readback Alignment.

## GSD Spec

Goal: make failed or aborted real read-only adapter boundary attempts expose metadata-only diagnostic completeness through attempt get, latest, list, and timeline readback.

Scope:
- `packages/contracts`
- `packages/codex-kernel`
- `packages/store-sqlite` tests
- `apps/supervisor`
- `apps/cli`
- this review document

Non-scope:
- no pilot retry
- no real adapter attempt invocation
- no Dashboard change
- no Dashboard trigger
- no `workspace_write`
- no `danger_full_access`
- no browser, CDP, profile, workspace, account, token, session, cookie, MFA, or credential automation
- no raw prompt, command, stdout, stderr, argv, executable path, env plan, agent body, reasoning body, or raw worktree path persistence
- no process-boundary audit relaxation

Acceptance criteria:
- contracts parse diagnostic completeness fields for attempts, summaries, and timeline entries
- kernel creates complete diagnostic readback for new failed or aborted boundary results
- legacy persisted boundary-invoked records without diagnostics are explicitly marked incomplete
- Supervisor readbacks return aligned diagnostic completeness metadata
- CLI output surfaces diagnostic completeness without raw output or path leakage
- focused tests pass for contracts, codex-kernel, supervisor, cli, and store-sqlite
- full verification passes before commit

Hard boundaries:
- Dashboard trigger remains forbidden
- `workspace_write` remains forbidden
- `danger_full_access` remains forbidden
- raw body and raw local worktree path persistence remain forbidden
- process launch remains isolated to the single approved process-boundary module

Affected apps/packages:
- `packages/contracts`
- `packages/codex-kernel`
- `packages/store-sqlite`
- `apps/supervisor`
- `apps/cli`
- `docs/reviews`

Risk level: medium. The change is readback and metadata alignment, but it affects shared contracts and the operator evidence path for boundary failures.

## Skills Used

Workflow skills:
- `gsd-spec-driver`: used to restate the round goal, scope, non-scope, acceptance criteria, boundaries, affected packages, and risk.
- `gstack-delivery-workflow`: used to keep the round in inspect, build, focused verify, full verify, commit, and checkpoint order.
- `superpowers-engineering-discipline`: used to keep the fix small, metadata-only, tested, and gated.

Project skills:
- `codexhub-architecture-planner`: used because the change crosses contracts, kernel, Supervisor, CLI, and store fixtures.
- `codexhub-contract-designer`: used because shared DTO schemas and inferred types changed.
- `codexhub-workflow-policy-reviewer`: used because the evidence, audit, and approval-adjacent attempt readback path remains safety gated.
- `codexhub-codex-exec-adapter`: used because the round touches the real read-only adapter attempt model and control-plane readback.
- `codexhub-release-auditor`: used for boundary review, full verification, commit, and checkpoint evidence.

Skills not used:
- `codexhub-playwright-qa`: not used because no Dashboard UI or browser smoke-test behavior changed.
- `codexhub-electron-cdp-observer`: not used because Electron/CDP remains out of scope.
- `codexhub-browser-profile-observer`: not used because Browser Profile, Chrome Profile, and ChatGPT Workspace automation remain out of scope.

## Inspection Summary

4F.15 attempt `codex_real_read_only_adapter_attempt_b77e7190-6d19-48df-9fac-7c0c2bd6795b` is authoritative, persisted, and boundary-invoked, but persisted attempt readback does not include `boundaryDiagnostics`.

Local metadata inspection found:
- attempt status: `failed`
- `processBoundaryInvoked=true`
- `resultStatus=failed`
- `postRunVerificationStatus=skipped`
- `workspaceMutationDetected=false`
- no persisted attempt-level `boundaryDiagnostics`

The related evidence and audit metadata include partial boundary metadata such as boundary status and output hashes, but not enough to reconstruct complete attempt-level diagnostics without inventing values. 4F.16 therefore does not backfill synthetic diagnostics into old records.

## Implementation Summary

4F.16 adds metadata-only diagnostic readback alignment:

- contracts now include `boundaryDiagnosticsComplete` and `boundaryDiagnosticsMissingFields` on attempt records, summaries, and timeline entries.
- kernel attempt creation marks new boundary-invoked records complete only when diagnostic metadata is present.
- kernel summary and timeline helpers align legacy records at readback time, marking missing diagnostics explicitly.
- Supervisor get, latest, list, and timeline responses return aligned records and summaries.
- CLI attempt, list, and timeline formatters show diagnostic completeness without raw output or local path data.

New attempts with complete fake-runner boundary failures now read back:
- `boundaryDiagnosticsComplete=true`
- `boundaryDiagnosticsMissingFields=[]`
- normalized failure code
- exit code or signal when required by the failure class
- duration
- timeout/cancel flags
- stdout/stderr hashes
- byte counts
- line counts
- truncation flags
- `postRunVerificationSkipReason` when verification is skipped

Older persisted records that invoked the boundary but lack diagnostics now read back with:
- `boundaryDiagnosticsComplete=false`
- missing-field metadata including `boundaryDiagnostics`
- no raw output, argv, executable path, env plan, or raw worktree path

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Contract schema parse for attempt diagnostics readback | `pnpm nx test contracts` | Passed, 24 tests | Accept |
| Kernel failed/aborted diagnostics and legacy readback alignment | `pnpm nx test codex-kernel` | Passed, 76 tests | Accept |
| Supervisor attempt get/latest/timeline diagnostic readback | `pnpm nx test supervisor` | Passed, 9 tests | Accept |
| CLI diagnostic output remains metadata-only | `pnpm nx test cli` | Passed, 23 tests | Accept |
| SQLite payload fixtures preserve metadata-only fields | `pnpm nx test store-sqlite` | Passed, 1 test | Accept |
| Raw body/path persistence | Focused tests and metadata assertions | No raw prompt, command, stdout, stderr, argv, executable path, env plan, or raw worktree path added | Accept |
| Process boundary scope | `pnpm tsx tools/audit-real-adapter-boundary.ts` | Passed | Accept |
| No-live automation boundary | `pnpm audit:no-live-automation` | Passed | Accept |
| Import boundaries | `pnpm audit:boundaries` | Passed | Accept |
| SQLite isolation | `pnpm audit:sqlite-isolation` | Passed | Accept |
| Skills audit | `pnpm audit:skills` | Passed | Accept |
| Foundation verification | `pnpm verify:foundation` | Passed | Accept |
| Full lint/test/build | `cmd /c pnpm nx run-many -t lint,test,build` | Passed | Accept |
| Diff whitespace | `git diff --check` | Passed | Accept |
| Working tree before commit | `git status --short` | Only 4F.16 scoped files changed | Accept |

## Boundary Confirmation

- No pilot was run in 4F.16.
- No real adapter attempt was invoked in 4F.16.
- No Dashboard code or trigger was added.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Browser/CDP/Profile/Workspace/account automation remains forbidden.
- No raw stdout/stderr body, prompt body, command body, argv, executable path, env plan, agent body, reasoning body, or raw worktree path is persisted.
- The process boundary remains isolated to `packages/codex-kernel/src/real-read-only-adapter-process.ts`.

## Recommendation

4F.16 closes the diagnostic readback alignment gap for new attempts and makes legacy gaps explicit. The next allowed round is 4F.17: one controlled CLI-only read-only pilot retry after diagnostics readback fix.

4H.5 remains blocked until a later retry is reviewed by 4G.8. Broader autonomous use remains blocked.
