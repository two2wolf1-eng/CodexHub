# Round 4F.10 Boundary Failure Diagnosis / Remediation

Status: implemented for 4F.10 diagnostics only.

Outcome: boundary_failure_diagnostics_added.

This round does not run a pilot, does not invoke the real adapter attempt from CLI, and does not approve MVP use. It adds metadata-only diagnostics so the next controlled retry can be reviewed without raw process output or raw local paths.

## Phase Lock

- Round: 4F.10
- Allowed scope: contracts, codex-kernel, Supervisor tests, CLI formatting/tests, this review document.
- Forbidden scope: Dashboard trigger, workspace_write, danger_full_access, browser/CDP/Profile/Workspace/account automation, raw prompt/command/stdout/stderr/agent/reasoning/worktree path persistence, broader autonomous use.
- Expected output: one diagnostics/remediation commit, then 4F.11 may be considered.

## GSD Spec

Goal: explain boundary-invoked adapter failures using safe metadata, then expose that metadata through attempt records, summaries, and timelines.

Scope:
- `packages/contracts`
- `packages/codex-kernel`
- `apps/supervisor` focused tests
- `apps/cli` readback formatting/tests
- `docs/reviews/round-4f10-boundary-failure-remediation.md`

Non-scope:
- No pilot retry in 4F.10.
- No Dashboard changes.
- No new process-boundary module.
- No raw process output or raw worktree path storage.
- No permission expansion.

Acceptance criteria:
- Boundary diagnostics include status, normalized failure code, exit code, signal, timeout/cancel flags, duration, output hashes, byte counts, line counts, and truncation flags.
- Failed and aborted boundary results set stable result error codes.
- Supervisor and CLI readback remain metadata-only.
- Focused tests for contracts, codex-kernel, Supervisor, CLI, and the process-boundary audit pass.
- Full verification passes before commit.

Hard boundaries:
- Dashboard trigger remains forbidden.
- `workspace_write` remains forbidden.
- `danger_full_access` remains forbidden.
- Raw prompt, command, stdout, stderr, agent, reasoning, argv, executable path, env plan, and raw absolute worktree path remain unpersisted.
- The only approved process-boundary module remains `packages/codex-kernel/src/real-read-only-adapter-process.ts`.

Risk level: high, because this touches the real read-only adapter evidence path after a boundary-invoked failure.

## Current State Assessment

4F.9 produced an authoritative failed attempt with `processBoundaryInvoked=true`, but the attempt record did not expose enough metadata to distinguish nonzero exit, start failure, timeout, cancellation, signal, or output parsing symptoms. Evidence internals had output hashes, but operator-facing readback lacked a normalized boundary failure code and compact diagnostics.

4G.4 and 4H.3 correctly treated the missing completed attempt and skipped post-run verification as release blockers. 4F.10 addresses diagnosis only; it does not claim the failure is fixed.

## Changes

- Added `CodexExecRealReadOnlyAdapterBoundaryDiagnostics` contracts and optional diagnostics fields on attempt records, summaries, and timeline entries.
- Added stable boundary error codes: `boundary_failed` and `boundary_aborted`.
- Added kernel classification for:
  - `process_exit_nonzero`
  - `process_start_failed`
  - `process_timed_out`
  - `process_cancelled`
  - `process_signaled`
  - unknown failed/aborted classes
- Included diagnostics in evidence metadata hashes and audit metadata.
- Exposed safe diagnostics in CLI human-readable attempt/list/timeline output.
- Added focused fake-runner tests for nonzero exit, start failure, timeout, cancel, malformed/empty completed output, completed boundary plus post-run verification, and Supervisor readback.

## Evidence Table

| Check | Evidence source | Result | Decision |
|---|---|---|---|
| Round preflight clean state | `git status --short` before editing | No unexpected changes reported | Continue 4F.10 |
| Skills audit | `pnpm audit:skills` preflight | Passed | Continue |
| No-live audit | `pnpm audit:no-live-automation` preflight | Passed | Continue |
| Boundary isolation audit | `pnpm tsx tools/audit-real-adapter-boundary.ts` preflight | Passed; boundary isolated to approved module | Continue |
| Foundation verification | `pnpm verify:foundation` preflight | Passed | Continue |
| Contracts focused tests | `pnpm nx test contracts` | Passed: 24 tests | Continue |
| Kernel focused tests | `pnpm nx test codex-kernel` | Passed: 76 tests | Continue |
| Supervisor focused tests | `pnpm nx test supervisor` | Passed: 9 tests | Continue |
| CLI focused tests | `pnpm nx test cli` | Passed: 23 tests | Continue |
| Process-boundary audit after changes | `pnpm tsx tools/audit-real-adapter-boundary.ts` | Passed; no new boundary module | Continue |

## Boundary Confirmation

- No Dashboard trigger was added.
- No workspace_write capability was added.
- No danger_full_access capability was added.
- No Browser/CDP/Profile/Workspace/account automation was added.
- No raw stdout/stderr body, raw prompt, raw command, raw agent message, raw reasoning, argv, executable path, env plan, or raw worktree path is persisted by the new diagnostics.
- 4F.10 did not run a pilot and did not invoke the real adapter attempt from CLI.

## Next Round

Round 4F.11 may be considered after this round is fully verified, committed, and clean. 4F.11 is the next round that may run exactly one controlled CLI-only retry.
